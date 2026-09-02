import {
  getDeals,
} from "@/firebase/queries/deals";

import {
  getProducts,
} from "@/firebase/queries/products";

import {
  getWorkers,
} from "@/firebase/queries/workers";

import {
  dealMapper,
} from "@/firebase/mappers/dealMapper";

import {
  workerMapper,
} from "@/firebase/mappers/workerMapper";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import type {
  Product,
} from "@/types/product";

import type {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type DiscountedProduct = {
  product: Product;
  deal: ActiveProductDeal;
  distance: number;
};

type CustomerLocation = {
  latitude: number;
  longitude: number;
};

/*
 * ============================================================
 * CONFIG
 * ============================================================
 */

const DISCOUNTED_PRODUCT_LIMIT = 20;

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function toFiniteNumber(
  value: unknown,
): number | null {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

/*
 * ------------------------------------------------------------
 * FIREBASE DATE NORMALIZER
 * ------------------------------------------------------------
 *
 * Supports:
 *
 * - Firestore Timestamp
 * - JavaScript Date
 * - null / undefined
 *
 * We intentionally accept unknown here because the mapper
 * currently exposes the date fields too broadly for TypeScript.
 */

function toDate(
  value: unknown,
): Date | null {
  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime(),
    )
      ? null
      : value;
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    try {
      const date = (
        value as {
          toDate: () => unknown;
        }
      ).toDate();

      if (
        date instanceof Date &&
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return date;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/*
 * ------------------------------------------------------------
 * VALID DISCOUNT
 * ------------------------------------------------------------
 */

function isValidDiscount(
  product: Product,
  deal: ReturnType<
    typeof dealMapper
  >,
): boolean {
  const originalPrice =
    toFiniteNumber(
      product.price,
    );

  const discountedPrice =
    toFiniteNumber(
      deal.discountedPrice,
    );

  const discountPercentage =
    toFiniteNumber(
      deal.discountPercentage,
    );

  return (
    originalPrice !== null &&
    originalPrice > 0 &&
    discountedPrice !== null &&
    discountedPrice > 0 &&
    discountedPrice <
      originalPrice &&
    discountPercentage !== null &&
    discountPercentage > 0 &&
    discountPercentage < 100
  );
}

/*
 * ============================================================
 * GET NEARBY DISCOUNTED PRODUCTS
 * ============================================================
 */

export async function getNearbyDiscountedProducts(
  customerLocation: CustomerLocation,
): Promise<DiscountedProduct[]> {
  /*
   * ----------------------------------------------------------
   * VALIDATE CUSTOMER LOCATION
   * ----------------------------------------------------------
   */

  if (
    !Number.isFinite(
      customerLocation.latitude,
    ) ||
    !Number.isFinite(
      customerLocation.longitude,
    )
  ) {
    throw new Error(
      "Invalid customer location.",
    );
  }

  try {
    /*
     * --------------------------------------------------------
     * LOAD DATA IN PARALLEL
     * --------------------------------------------------------
     */

    const [
      dealsSnapshot,
      productsSnapshot,
      workersSnapshot,
    ] = await Promise.all([
      getDeals(),
      getProducts(),
      getWorkers(),
    ]);

    /*
     * --------------------------------------------------------
     * ACTIVE PRODUCT DEALS
     * --------------------------------------------------------
     */

    const deals =
      dealsSnapshot.docs
        .map(dealMapper)
        .filter(
          (deal) => {
            if (
              deal.type !==
              "product"
            ) {
              return false;
            }

            if (
              deal.status !==
              "active"
            ) {
              return false;
            }

            if (
              !deal.productId
            ) {
              return false;
            }

            return isValidDiscount(
              {
                id:
                  deal.productId,
                name: "",
                price:
                  deal.originalPrice,
                thumbnail: "",
                stock: 1,
                status: "active",
                workerId:
                  deal.workerId,
              } as Product,
              deal,
            );
          },
        );

    /*
     * --------------------------------------------------------
     * PRODUCTS
     * --------------------------------------------------------
     */

    const products =
      productsSnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Product),
        )
        .filter(
          (product) =>
            product.status ===
              "active" &&
            Number(
              product.stock,
            ) > 0,
        );

    /*
     * --------------------------------------------------------
     * WORKERS
     * --------------------------------------------------------
     */

    const workers =
      workersSnapshot.docs.map(
        workerMapper,
      );

    /*
     * --------------------------------------------------------
     * LOOKUP MAPS
     * --------------------------------------------------------
     */

    const productMap =
      new Map(
        products.map(
          (product) => [
            product.id,
            product,
          ],
        ),
      );

    const workerMap =
      new Map(
        workers.map(
          (worker) => [
            worker.id,
            worker,
          ],
        ),
      );

    /*
     * --------------------------------------------------------
     * MATCH:
     *
     * DEAL → PRODUCT → WORKER
     * --------------------------------------------------------
     */

    const results =
      deals
        .map(
          (deal) => {
            const productId =
              deal.productId?.trim();

            if (!productId) {
              return null;
            }

            /*
             * ------------------------------------------------
             * PRODUCT
             * ------------------------------------------------
             */

            const product =
              productMap.get(
                productId,
              );

            if (!product) {
              return null;
            }

            /*
             * ------------------------------------------------
             * VALIDATE DISCOUNT AGAINST REAL PRODUCT
             * ------------------------------------------------
             */

            if (
              !isValidDiscount(
                product,
                deal,
              )
            ) {
              return null;
            }

            /*
             * ------------------------------------------------
             * WORKER
             * ------------------------------------------------
             */

            const workerId =
              product.workerId?.trim();

            if (!workerId) {
              return null;
            }

            const worker =
              workerMap.get(
                workerId,
              );

            if (!worker) {
              return null;
            }

            /*
             * ------------------------------------------------
             * WORKER LOCATION
             * ------------------------------------------------
             */

            const latitude =
              worker.workerProfile
                ?.latitude;

            const longitude =
              worker.workerProfile
                ?.longitude;

            if (
              typeof latitude !==
                "number" ||
              typeof longitude !==
                "number" ||
              !Number.isFinite(
                latitude,
              ) ||
              !Number.isFinite(
                longitude,
              )
            ) {
              return null;
            }

            /*
             * ------------------------------------------------
             * DISTANCE
             * ------------------------------------------------
             */

            const distance =
              calculateDistance(
                customerLocation.latitude,
                customerLocation.longitude,
                latitude,
                longitude,
              );

            if (
              !Number.isFinite(
                distance,
              )
            ) {
              return null;
            }

            /*
             * ------------------------------------------------
             * NORMALIZE FIREBASE DATES
             * ------------------------------------------------
             */

            const startsAt =
              toDate(
                deal.startsAt,
              );

            const expiresAt =
              toDate(
                deal.expiresAt,
              );

            /*
             * ------------------------------------------------
             * ACTIVE DEAL
             * ------------------------------------------------
             */

            const activeDeal: ActiveProductDeal =
              {
                id:
                  deal.id,

                productId,

                workerId,

                originalPrice:
                  Number(
                    deal.originalPrice,
                  ),

                discountedPrice:
                  Number(
                    deal.discountedPrice,
                  ),

                discountPercentage:
                  Number(
                    deal.discountPercentage,
                  ),

                status:
                  "active",

                startsAt,

                expiresAt,
              };

            return {
              product,

              deal:
                activeDeal,

              distance,
            };
          },
        )
        .filter(
          (
            item,
          ): item is DiscountedProduct =>
            item !== null,
        )
        .sort(
          (a, b) =>
            a.distance -
            b.distance,
        );

    /*
     * --------------------------------------------------------
     * LIMIT RESULTS
     * --------------------------------------------------------
     */

    return results.slice(
      0,
      DISCOUNTED_PRODUCT_LIMIT,
    );
  } catch (error) {
    console.error(
      "getNearbyDiscountedProducts ERROR:",
      error,
    );

    throw error;
  }
}