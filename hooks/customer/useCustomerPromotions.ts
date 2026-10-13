import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getActiveProductDeals,
} from "@/firebase/queries/deals";

import {
  getActiveProducts,
} from "@/firebase/queries/products";

import {
  dealMapper,
} from "@/firebase/mappers/dealMapper";

import type {
  Product,
} from "@/types/product";

import type {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_PROMOTIONS = 20;

/* ============================================================
   TYPES
============================================================ */

export type CustomerPromotion = {
  id: string;

  product: Product;

  deal: ActiveProductDeal;

  createdAt: Date | null;
};

type Result = {
  promotions: CustomerPromotion[];

  loading: boolean;

  refreshing: boolean;

  error: string | null;

  refresh: () => Promise<void>;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function toFiniteNumber(
  value: unknown,
): number {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

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
      const result =
        (
          value as {
            toDate: () => unknown;
          }
        ).toDate();

      if (
        result instanceof Date &&
        !Number.isNaN(
          result.getTime(),
        )
      ) {
        return result;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function isCurrentlyActive(
  startsAt: Date | null,
  expiresAt: Date | null,
): boolean {
  const now =
    Date.now();

  if (
    startsAt &&
    startsAt.getTime() >
      now
  ) {
    return false;
  }

  if (
    expiresAt &&
    expiresAt.getTime() <=
      now
  ) {
    return false;
  }

  return true;
}

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerPromotions(): Result {
  const [
    promotions,
    setPromotions,
  ] =
    useState<
      CustomerPromotion[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const loadPromotions =
    useCallback(
      async (
        refreshRequest = false,
      ) => {
        if (refreshRequest) {
          setRefreshing(
            true,
          );
        } else {
          setLoading(
            true,
          );
        }

        setError(
          null,
        );

        try {
          const [
            dealsSnapshot,
            productsSnapshot,
          ] =
            await Promise.all([
              getActiveProductDeals(),
              getActiveProducts(),
            ]);

          /* ================================================
             PRODUCTS
          ================================================ */

          const products =
            productsSnapshot.docs
              .map(
                document =>
                  ({
                    id:
                      document.id,

                    ...document.data(),
                  } as Product),
              )
              .filter(
                product =>
                  product.status ===
                    "active" &&
                  toFiniteNumber(
                    product.stock,
                  ) > 0,
              );

          const productMap =
            new Map<
              string,
              Product
            >();

          for (
            const product of
              products
          ) {
            const productId =
              cleanString(
                product.id,
              );

            if (!productId) {
              continue;
            }

            productMap.set(
              productId,
              product,
            );
          }

          /* ================================================
             PROMOTIONS
          ================================================ */

          const nextPromotions =
            dealsSnapshot.docs
              .map(
                document => {
                  const deal =
                    dealMapper(
                      document,
                    );

                  const productId =
                    cleanString(
                      deal.productId,
                    );

                  if (
                    !productId ||
                    deal.type !==
                      "product" ||
                    deal.status !==
                      "active"
                  ) {
                    return null;
                  }

                  const product =
                    productMap.get(
                      productId,
                    );

                  if (!product) {
                    return null;
                  }

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
                    originalPrice <= 0 ||
                    discountedPrice <= 0 ||
                    discountedPrice >=
                      originalPrice ||
                    discountPercentage <=
                      0 ||
                    discountPercentage >=
                      100
                  ) {
                    return null;
                  }

                  const startsAt =
                    toDate(
                      deal.startsAt,
                    );

                  const expiresAt =
                    toDate(
                      deal.expiresAt,
                    );

                  if (
                    !isCurrentlyActive(
                      startsAt,
                      expiresAt,
                    )
                  ) {
                    return null;
                  }

                  const workerId =
                    cleanString(
                      product.workerId,
                    );

                  if (!workerId) {
                    return null;
                  }

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
                    id:
                      deal.id,

                    product,

                    deal:
                      activeDeal,

                    createdAt:
                      toDate(
                        deal.createdAt,
                      ),
                  } satisfies CustomerPromotion;
                },
              )
              .filter(
                (
                  item,
                ): item is CustomerPromotion =>
                  item !==
                  null,
              )
              .sort(
                (
                  a,
                  b,
                ) => {
                  const aTime =
                    a.createdAt?.getTime() ??
                    0;

                  const bTime =
                    b.createdAt?.getTime() ??
                    0;

                  return (
                    bTime -
                    aTime
                  );
                },
              )
              .slice(
                0,
                MAX_PROMOTIONS,
              );

          setPromotions(
            nextPromotions,
          );
        } catch (loadError) {
          if (__DEV__) {
            console.warn(
              "CUSTOMER_PROMOTIONS_LOAD_ERROR:",
              loadError,
            );
          }

          setPromotions(
            [],
          );

          setError(
            "Unable to load promotions. Please try again.",
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [],
    );

  useEffect(() => {
    void loadPromotions();
  }, [
    loadPromotions,
  ]);

  const refresh =
    useCallback(
      async () => {
        await loadPromotions(
          true,
        );
      },
      [
        loadPromotions,
      ],
    );

  return {
    promotions,
    loading,
    refreshing,
    error,
    refresh,
  };
}