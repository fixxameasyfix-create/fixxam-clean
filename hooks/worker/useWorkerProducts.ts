import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  getWorkerProducts,
} from "@/services/products";

/* ==============================================================
   TYPES
============================================================== */

export type WorkerProduct = {
  id: string;

  workerId: string;
  workerName: string;

  name: string;
  category: string;
  description: string;

  price: number;
  stock: number;

  thumbnail: string;
  images: string[];

  delivery: boolean;

  condition:
    | "new"
    | "used";

  featured: boolean;

  status:
    | "active"
    | "out_of_stock";

  sold: number;
  views: number;
  rating: number;

  /* ============================================================
     ACTIVE DEAL
  ============================================================ */

  discountPercent?: number;

  discountedPrice?: number;

  dealId?: string;

  discountStartsAt?: unknown;

  discountExpiresAt?: unknown;
};

/* ==============================================================
   DEAL
============================================================== */

type ProductDeal = {
  id: string;

  productId: string;

  discountPercentage: number;

  discountedPrice: number;

  startsAt: unknown;

  expiresAt: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

function getNumber(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return value;
}

/* ==============================================================
   TIMESTAMP
============================================================== */

function getTimestampMillis(
  value: unknown,
): number {
  if (
    value instanceof Date
  ) {
    return value.getTime();
  }

  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis === "function"
  ) {
    return (
      value as {
        toMillis: () => number;
      }
    ).toMillis();
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
    const date =
      (
        value as {
          toDate: () => Date;
        }
      ).toDate();

    return date.getTime();
  }

  return 0;
}

/* ==============================================================
   NORMALIZE DEAL
============================================================== */

function normalizeDeal(
  id: string,
  data: Record<string, unknown>,
): ProductDeal | null {
  const productId =
    typeof data.productId ===
    "string"
      ? data.productId.trim()
      : "";

  const discountPercentage =
    getNumber(
      data.discountPercentage,
    );

  const discountedPrice =
    getNumber(
      data.discountedPrice,
    );

  const startsAt =
    data.startsAt;

  const expiresAt =
    data.expiresAt;

  if (!productId) {
    return null;
  }

  if (
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    return null;
  }

  if (
    discountedPrice <= 0
  ) {
    return null;
  }

  if (
    getTimestampMillis(
      startsAt,
    ) <= 0
  ) {
    return null;
  }

  if (
    getTimestampMillis(
      expiresAt,
    ) <= 0
  ) {
    return null;
  }

  return {
    id,

    productId,

    discountPercentage,

    discountedPrice,

    startsAt,

    expiresAt,
  };
}

/* ==============================================================
   HOOK
============================================================== */

export default function useWorkerProducts() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    products,
    setProducts,
  ] = useState<WorkerProduct[]>(
    [],
  );

  useEffect(() => {
    let mounted = true;

    const user =
      auth.currentUser;

    /* ==========================================================
       NO USER
    ========================================================== */

    if (!user) {
      setProducts([]);
      setLoading(false);

      return () => {
        mounted = false;
      };
    }

    setLoading(true);

    /* ==========================================================
       PRODUCT STATE
    ========================================================== */

    let workerProducts:
      WorkerProduct[] = [];

    let activeDeals:
      ProductDeal[] = [];

    /* ==========================================================
       MERGE PRODUCTS + DEALS
    ========================================================== */

    const mergeProducts =
      () => {
        if (!mounted) {
          return;
        }

        const now =
          Date.now();

        const merged =
          workerProducts.map(
            (product) => {
              const productPrice =
                Math.max(
                  0,
                  getNumber(
                    product.price,
                  ),
                );

              /* ==================================================
                 FIND VALID DEALS
              ================================================== */

              const validDeals =
                activeDeals.filter(
                  (deal) => {
                    if (
                      deal.productId !==
                      product.id
                    ) {
                      return false;
                    }

                    const startsAt =
                      getTimestampMillis(
                        deal.startsAt,
                      );

                    const expiresAt =
                      getTimestampMillis(
                        deal.expiresAt,
                      );

                    if (
                      startsAt <= 0 ||
                      expiresAt <= 0
                    ) {
                      return false;
                    }

                    if (
                      startsAt > now
                    ) {
                      return false;
                    }

                    if (
                      expiresAt <= now
                    ) {
                      return false;
                    }

                    if (
                      deal.discountPercentage <=
                        0 ||
                      deal.discountPercentage >=
                        100
                    ) {
                      return false;
                    }

                    if (
                      deal.discountedPrice <=
                        0 ||
                      deal.discountedPrice >=
                        productPrice
                    ) {
                      return false;
                    }

                    return true;
                  },
                );

              /* ==================================================
                 SELECT DEAL
              ================================================== */

              const activeDeal =
                validDeals.length > 0
                  ? validDeals.reduce(
                      (
                        current,
                        candidate,
                      ) => {
                        return getTimestampMillis(
                          candidate.expiresAt,
                        ) >
                          getTimestampMillis(
                            current.expiresAt,
                          )
                          ? candidate
                          : current;
                      },
                    )
                  : null;

              /* ==================================================
                 NO DEAL
              ================================================== */

              if (!activeDeal) {
                return {
                  ...product,

                  discountPercent:
                    undefined,

                  discountedPrice:
                    undefined,

                  dealId:
                    undefined,

                  discountStartsAt:
                    undefined,

                  discountExpiresAt:
                    undefined,
                };
              }

              /* ==================================================
                 ACTIVE DEAL
              ================================================== */

              return {
                ...product,

                discountPercent:
                  activeDeal.discountPercentage,

                discountedPrice:
                  activeDeal.discountedPrice,

                dealId:
                  activeDeal.id,

                discountStartsAt:
                  activeDeal.startsAt,

                discountExpiresAt:
                  activeDeal.expiresAt,
              };
            },
          );

        setProducts(
          merged,
        );
      };

    /* ==========================================================
       PRODUCTS
    ========================================================== */

    const unsubscribeProducts =
      getWorkerProducts(
        user.uid,
        (
          data,
        ) => {
          if (!mounted) {
            return;
          }

          workerProducts =
            Array.isArray(data)
              ? data
                  .filter(
                    (
                      item: unknown,
                    ): item is WorkerProduct =>
                      Boolean(
                        item &&
                        typeof item ===
                          "object",
                      ),
                  )
                  .map(
                    (
                      item,
                    ) => ({
                      ...(item as WorkerProduct),

                      id:
                        String(
                          item.id ??
                            "",
                        ).trim(),

                      price:
                        Math.max(
                          0,
                          getNumber(
                            item.price,
                          ),
                        ),

                      stock:
                        Math.max(
                          0,
                          getNumber(
                            item.stock,
                          ),
                        ),
                    }),
                  )
                  .filter(
                    (
                      item,
                    ) =>
                      Boolean(
                        item.id,
                      ),
                  )
              : [];

          mergeProducts();

          setLoading(false);
        },
      );

    /* ==========================================================
       ACTIVE DEALS
    ========================================================== */

    const dealsQuery =
      query(
        collection(
          db,
          "deals",
        ),
        where(
          "type",
          "==",
          "product",
        ),
        where(
          "status",
          "==",
          "active",
        ),
      );

    const unsubscribeDeals =
      onSnapshot(
        dealsQuery,
        (
          snapshot,
        ) => {
          if (!mounted) {
            return;
          }

          activeDeals =
            snapshot.docs
              .map(
                (
                  dealSnapshot,
                ) =>
                  normalizeDeal(
                    dealSnapshot.id,
                    dealSnapshot.data() as Record<
                      string,
                      unknown
                    >,
                  ),
              )
              .filter(
                (
                  deal,
                ): deal is ProductDeal =>
                  deal !== null,
              );

          mergeProducts();
        },
        (
          error,
        ) => {
          console.error(
            "FIXXAM_PRODUCT_DEALS_LISTENER_ERROR:",
            error,
          );

          if (!mounted) {
            return;
          }

          activeDeals = [];

          mergeProducts();
        },
      );

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return () => {
      mounted = false;

      unsubscribeProducts();

      unsubscribeDeals();
    };
  }, []);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,
    products,
  };
}