import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  getWorkerDeals,
} from "@/firebase/queries/deals";

import {
  dealMapper,
} from "@/firebase/mappers/dealMapper";

import {
  useAuth,
} from "@/hooks/useAuth";

import type {
  DealStatus,
  DealType,
} from "@/types/deal";

/* ============================================================
   TYPES
============================================================ */

export type WorkerPromotion = {
  id: string;

  type: DealType;

  itemId: string | null;

  itemName: string;

  title: string;

  originalPrice: number;

  discountedPrice: number;

  discountPercentage: number;

  status: DealStatus;

  startsAt: Date | null;

  expiresAt: Date | null;

  createdAt: Date | null;

  updatedAt: Date | null;

  durationDays: number | null;
};

type Result = {
  promotions: WorkerPromotion[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function toDate(
  value: unknown,
): Date | null {
  if (value instanceof Date) {
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
      const result = (
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

function getDurationDays(
  startsAt: Date | null,
  expiresAt: Date | null,
): number | null {
  if (
    !startsAt ||
    !expiresAt
  ) {
    return null;
  }

  const milliseconds =
    expiresAt.getTime() -
    startsAt.getTime();

  if (milliseconds < 0) {
    return null;
  }

  const dayMilliseconds =
    1000 * 60 * 60 * 24;

  return Math.max(
    1,
    Math.ceil(
      milliseconds /
        dayMilliseconds,
    ),
  );
}

/* ============================================================
   PRODUCT NAME
============================================================ */

async function getProductName(
  productId: string,
): Promise<string> {
  const normalizedProductId =
    productId.trim();

  if (!normalizedProductId) {
    return "Product";
  }

  try {
    const snapshot =
      await getDoc(
        doc(
          db,
          "products",
          normalizedProductId,
        ),
      );

    if (!snapshot.exists()) {
      return "Product";
    }

    const name =
      normalizeString(
        snapshot.data().name,
      );

    return name || "Product";
  } catch (error: unknown) {
    if (__DEV__) {
      console.warn(
        "WORKER_PROMOTION_PRODUCT_ERROR:",
        {
          productId:
            normalizedProductId,
          error,
        },
      );
    }

    return "Product";
  }
}

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerPromotions(): Result {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    promotions,
    setPromotions,
  ] = useState<
    WorkerPromotion[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /* ==========================================================
     LOAD
  ========================================================== */

  const loadPromotions =
    useCallback(
      async () => {
        if (!user?.uid) {
          setPromotions([]);
          setError(null);
          setLoading(false);

          return;
        }

        setLoading(true);
        setError(null);

        try {
          const snapshot =
            await getWorkerDeals(
              user.uid,
            );

          const deals =
            snapshot.docs.map(
              dealMapper,
            );

          const mapped =
            await Promise.all(
              deals.map(
                async (
                  deal,
                ): Promise<WorkerPromotion> => {
                  const productId =
                    normalizeString(
                      deal.productId,
                    );

                  const title =
                    normalizeString(
                      deal.title,
                    );

                  let itemName =
                    title ||
                    "Promotion";

                  /*
                   * Product deals use the
                   * real product name.
                   */
                  if (
                    deal.type ===
                      "product" &&
                    productId
                  ) {
                    itemName =
                      await getProductName(
                        productId,
                      );
                  }

                  const startsAt =
                    toDate(
                      deal.startsAt,
                    );

                  const expiresAt =
                    toDate(
                      deal.expiresAt,
                    );

                  const createdAt =
                    toDate(
                      deal.createdAt,
                    );

                  const updatedAt =
                    toDate(
                      deal.updatedAt,
                    );

                  return {
                    id:
                      deal.id,

                    type:
                      deal.type,

                    itemId:
                      productId ||
                      null,

                    itemName,

                    title,

                    originalPrice:
                      Number(
                        deal.originalPrice,
                      ) || 0,

                    discountedPrice:
                      Number(
                        deal.discountedPrice,
                      ) || 0,

                    discountPercentage:
                      Number(
                        deal.discountPercentage,
                      ) || 0,

                    status:
                      deal.status,

                    startsAt,

                    expiresAt,

                    createdAt,

                    updatedAt,

                    durationDays:
                      getDurationDays(
                        startsAt,
                        expiresAt,
                      ),
                  };
                },
              ),
            );

          /*
           * Latest promotions first.
           */
          mapped.sort(
            (
              a,
              b,
            ) => {
              const aTime =
                a.createdAt?.getTime() ??
                a.startsAt?.getTime() ??
                0;

              const bTime =
                b.createdAt?.getTime() ??
                b.startsAt?.getTime() ??
                0;

              return (
                bTime -
                aTime
              );
            },
          );

          setPromotions(
            mapped,
          );
        } catch (
          loadError: unknown
        ) {
          if (__DEV__) {
            console.error(
              "WORKER_PROMOTIONS_ERROR:",
              loadError,
            );
          }

          setPromotions([]);

          setError(
            "Unable to load promotions.",
          );
        } finally {
          setLoading(false);
        }
      },
      [user?.uid],
    );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void loadPromotions();
  }, [
    authLoading,
    loadPromotions,
  ]);

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    promotions,

    loading:
      authLoading ||
      loading,

    error,

    refresh:
      loadPromotions,
  };
}