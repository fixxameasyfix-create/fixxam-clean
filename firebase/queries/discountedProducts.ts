import {
  getActiveProductDeals,
} from "@/firebase/queries/deals";

import {
  getActiveProducts,
} from "@/firebase/queries/products";

import {
  getPublicWorker,
  type WorkerPublicProfile,
} from "@/firebase/queries/workerPublicProfiles";

import {
  dealMapper,
} from "@/firebase/mappers/dealMapper";

import {
  calculateDistance,
} from "@/utils/location/calculateDistance";

import type {
  Product,
} from "@/types/product";

import type {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   TYPES
============================================================== */

export type DiscountedProduct = {
  product: Product;

  deal: ActiveProductDeal;

  distance: number;

  workerRating: number;
};

type CustomerLocation = {
  latitude: number;

  longitude: number;
};

/* ==============================================================
   CONFIG
============================================================== */

const DISCOUNTED_PRODUCT_LIMIT =
  20;

/* ==============================================================
   HELPERS
============================================================== */

function toFiniteNumber(
  value: unknown,
): number | null {
  const number =
    Number(value);

  return Number.isFinite(
    number,
  )
    ? number
    : null;
}

function normalizeWorkerRating(
  value: unknown,
): number {
  const rating =
    toFiniteNumber(
      value,
    );

  if (
    rating === null ||
    rating <= 0
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      rating,
    ),
  );
}

/* ==============================================================
   FIREBASE DATE NORMALIZER
============================================================== */

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
    typeof value ===
      "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate ===
      "function"
  ) {
    try {
      const date =
        (
          value as {
            toDate:
              () => unknown;
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

/* ==============================================================
   VALID DISCOUNT
============================================================== */

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
    originalPrice !==
      null &&
    originalPrice >
      0 &&
    discountedPrice !==
      null &&
    discountedPrice >
      0 &&
    discountedPrice <
      originalPrice &&
    discountPercentage !==
      null &&
    discountPercentage >
      0 &&
    discountPercentage <
      100
  );
}

/* ==============================================================
   VALID LOCATION
============================================================== */

function hasValidCoordinates(
  profile:
    WorkerPublicProfile | null,
): profile is WorkerPublicProfile {
  if (!profile) {
    return false;
  }

  const latitude =
    profile.workerProfile
      ?.latitude;

  const longitude =
    profile.workerProfile
      ?.longitude;

  return (
    typeof latitude ===
      "number" &&
    Number.isFinite(
      latitude,
    ) &&
    typeof longitude ===
      "number" &&
    Number.isFinite(
      longitude,
    )
  );
}

/* ==============================================================
   LOAD PUBLIC WORKER PROFILES
============================================================== */

async function loadPublicWorkers(
  workerIds: string[],
): Promise<
  Map<
    string,
    WorkerPublicProfile
  >
> {
  const uniqueWorkerIds =
    Array.from(
      new Set(
        workerIds
          .map(
            (workerId) =>
              workerId.trim(),
          )
          .filter(
            Boolean,
          ),
      ),
    );

  const workerMap =
    new Map<
      string,
      WorkerPublicProfile
    >();

  if (
    uniqueWorkerIds.length ===
    0
  ) {
    return workerMap;
  }

  /*
   * Public profiles are intentionally
   * used here instead of /users.
   *
   * /users contains private account
   * data and cannot be queried by
   * customers under Firestore rules.
   */

  const snapshots =
    await Promise.all(
      uniqueWorkerIds.map(
        async (
          workerId,
        ) => {
          try {
            const snapshot =
              await getPublicWorker(
                workerId,
              );

            return {
              workerId,
              snapshot,
            };
          } catch (
            error: unknown
          ) {
            if (__DEV__) {
              console.warn(
                "DISCOUNT_PUBLIC_WORKER_LOAD_ERROR:",
                {
                  workerId,
                  error,
                },
              );
            }

            return null;
          }
        },
      ),
    );

  for (
    const result of snapshots
  ) {
    if (
      !result ||
      !result.snapshot.exists()
    ) {
      continue;
    }

    const data =
      result.snapshot.data() as
        WorkerPublicProfile;

    workerMap.set(
      result.workerId,
      data,
    );
  }

  return workerMap;
}

/* ==============================================================
   GET NEARBY DISCOUNTED PRODUCTS
============================================================== */

export async function getNearbyDiscountedProducts(
  customerLocation:
    CustomerLocation,
): Promise<
  DiscountedProduct[]
> {
  /* ============================================================
     VALIDATE CUSTOMER LOCATION
  ============================================================ */

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
    /* ==========================================================
       LOAD PUBLIC PRODUCT DATA
    ========================================================== */

    const [
      dealsSnapshot,
      productsSnapshot,
    ] =
      await Promise.all([
        getActiveProductDeals(),
        getActiveProducts(),
      ]);

    /* ==========================================================
       ACTIVE PRODUCT DEALS
    ========================================================== */

    const deals =
      dealsSnapshot.docs
        .map(
          dealMapper,
        )
        .filter(
          (
            deal,
          ) => {
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

            const productId =
              deal.productId?.trim();

            if (
              !productId
            ) {
              return false;
            }

            return true;
          },
        );

    if (
      deals.length ===
      0
    ) {
      return [];
    }

    /* ==========================================================
       ACTIVE PRODUCTS
    ========================================================== */

    const products =
      productsSnapshot.docs
        .map(
          (
            document,
          ) =>
            ({
              id:
                document.id,

              ...document.data(),
            } as Product),
        )
        .filter(
          (
            product,
          ) =>
            product.status ===
              "active" &&
            Number(
              product.stock,
            ) >
              0 &&
            typeof product.workerId ===
              "string" &&
            product.workerId.trim()
              .length >
              0,
        );

    if (
      products.length ===
      0
    ) {
      return [];
    }

    /* ==========================================================
       PRODUCT LOOKUP
    ========================================================== */

    const productMap =
      new Map<
        string,
        Product
      >(
        products.map(
          (
            product,
          ) => [
            product.id,
            product,
          ],
        ),
      );

    /* ==========================================================
       REQUIRED WORKER IDS
    ========================================================== */

    const workerIds =
      deals
        .map(
          (
            deal,
          ) => {
            const productId =
              deal.productId?.trim();

            if (
              !productId
            ) {
              return "";
            }

            const product =
              productMap.get(
                productId,
              );

            return (
              product?.workerId?.trim() ??
              ""
            );
          },
        )
        .filter(
          Boolean,
        );

    /* ==========================================================
       PUBLIC WORKER PROFILES
    ========================================================== */

    const workerMap =
      await loadPublicWorkers(
        workerIds,
      );

    /* ==========================================================
       MATCH DEAL → PRODUCT → PUBLIC WORKER
    ========================================================== */

    const results =
      deals
        .map(
          (
            deal,
          ):
            DiscountedProduct | null => {
            /* --------------------------------------------------
               PRODUCT ID
            -------------------------------------------------- */

            const productId =
              deal.productId?.trim();

            if (
              !productId
            ) {
              return null;
            }

            /* --------------------------------------------------
               PRODUCT
            -------------------------------------------------- */

            const product =
              productMap.get(
                productId,
              );

            if (
              !product
            ) {
              return null;
            }

            /* --------------------------------------------------
               VALIDATE DISCOUNT
            -------------------------------------------------- */

            if (
              !isValidDiscount(
                product,
                deal,
              )
            ) {
              return null;
            }

            /* --------------------------------------------------
               WORKER ID
            -------------------------------------------------- */

            const workerId =
              product.workerId?.trim();

            if (
              !workerId
            ) {
              return null;
            }

            /* --------------------------------------------------
               PUBLIC WORKER
            -------------------------------------------------- */

            const worker =
              workerMap.get(
                workerId,
              ) ??
              null;

            if (
              !hasValidCoordinates(
                worker,
              )
            ) {
              return null;
            }

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
                "number"
            ) {
              return null;
            }

            /* --------------------------------------------------
               DISTANCE
            -------------------------------------------------- */

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

            /* --------------------------------------------------
               WORKER RATING
            -------------------------------------------------- */

            const workerRating =
              normalizeWorkerRating(
                worker.rating,
              );

            /* --------------------------------------------------
               PRICES
            -------------------------------------------------- */

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

            if (
              originalPrice ===
                null ||
              discountedPrice ===
                null ||
              discountPercentage ===
                null
            ) {
              return null;
            }

            /* --------------------------------------------------
               DATES
            -------------------------------------------------- */

            const startsAt =
              toDate(
                deal.startsAt,
              );

            const expiresAt =
              toDate(
                deal.expiresAt,
              );

            /* --------------------------------------------------
               ACTIVE DEAL
            -------------------------------------------------- */

            const activeDeal:
              ActiveProductDeal =
                {
                  id:
                    deal.id,

                  productId,

                  workerId,

                  originalPrice,

                  discountedPrice,

                  discountPercentage,

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

              workerRating,
            };
          },
        )
        .filter(
          (
            item,
          ): item is DiscountedProduct =>
            item !==
            null,
        )
        .sort(
          (
            a,
            b,
          ) =>
            a.distance -
            b.distance,
        );

    /* ==========================================================
       LIMIT RESULTS
    ========================================================== */

    return results.slice(
      0,
      DISCOUNTED_PRODUCT_LIMIT,
    );
  } catch (
    error: unknown
  ) {
    if (__DEV__) {
      console.warn(
        "getNearbyDiscountedProducts ERROR:",
        error,
      );
    }

    throw error;
  }
}