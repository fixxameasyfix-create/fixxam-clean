import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

export type Product = {
  id: string;

  workerId: string;
  workerName: string;

  name: string;
  category: string;
  description: string;

  /*
   * Original product price.
   */
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

  /*
   * Example:
   *
   * discountPercent: 20
   * discountedPrice: 8000
   */
  discountPercent?: number;

  discountedPrice?: number;

  dealId?: string;

  discountStartsAt?: unknown;

  discountExpiresAt?: unknown;

  createdAt: unknown;

  updatedAt: unknown;
};

/* ==============================================================
   ACTIVE DEAL TYPE
============================================================== */

type ActiveDeal = {
  id: string;

  discountPercentage: number;

  discountedPrice: number;

  startsAt: unknown;

  expiresAt: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

/**
 * Safely converts:
 *
 * - Firestore Timestamp
 * - Date
 *
 * to milliseconds.
 */
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
   SAFE NUMBER
============================================================== */

function getSafeNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return value;
}

/* ==============================================================
   SAFE STRING
============================================================== */

function getSafeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value
    : "";
}

/* ==============================================================
   SAFE IMAGES
============================================================== */

function getSafeImages(
  value: unknown,
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value.filter(
    (
      image: unknown,
    ): image is string =>
      typeof image ===
      "string" &&
      image.trim().length > 0,
  );
}

/* ==============================================================
   HOOK
============================================================== */

export default function useWorkerProduct(
  id?: string,
) {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    product,
    setProduct,
  ] = useState<Product | null>(
    null,
  );

  /* ============================================================
     LOAD
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    /* ==========================================================
       NORMALIZE PRODUCT ID
    ========================================================== */

    const productId =
      typeof id === "string"
        ? id.trim()
        : "";

    /* ==========================================================
       NO PRODUCT ID
    ========================================================== */

    if (!productId) {
      setProduct(null);
      setLoading(false);

      return () => {
        mounted = false;
      };
    }

    /* ==========================================================
       RESET
    ========================================================== */

    setLoading(true);
    setProduct(null);

    /* ==========================================================
       LOAD PRODUCT
    ========================================================== */

    async function loadProduct() {
      try {
        /* ======================================================
           PRODUCT DOCUMENT
        ====================================================== */

        const productRef =
          doc(
            db,
            "products",
            productId,
          );

        const productSnapshot =
          await getDoc(
            productRef,
          );

        /* ======================================================
           UNMOUNT CHECK
        ====================================================== */

        if (!mounted) {
          return;
        }

        /* ======================================================
           PRODUCT NOT FOUND
        ====================================================== */

        if (
          !productSnapshot.exists()
        ) {
          setProduct(null);
          return;
        }

        /* ======================================================
           RAW PRODUCT DATA
        ====================================================== */

        const data =
          productSnapshot.data();

        /* ======================================================
           PRODUCT PRICE
        ====================================================== */

        const productPrice =
          Math.max(
            0,
            getSafeNumber(
              data.price,
            ),
          );

        /* ======================================================
           PRODUCT
        ====================================================== */

        const loadedProduct: Product =
          {
            id:
              productSnapshot.id,

            workerId:
              getSafeString(
                data.workerId,
              ),

            workerName:
              getSafeString(
                data.workerName,
              ),

            name:
              getSafeString(
                data.name,
              ),

            category:
              getSafeString(
                data.category,
              ),

            description:
              getSafeString(
                data.description,
              ),

            price:
              productPrice,

            stock:
              Math.max(
                0,
                getSafeNumber(
                  data.stock,
                ),
              ),

            thumbnail:
              getSafeString(
                data.thumbnail,
              ),

            images:
              getSafeImages(
                data.images,
              ),

            delivery:
              data.delivery ===
              true,

            condition:
              data.condition ===
              "used"
                ? "used"
                : "new",

            featured:
              data.featured ===
              true,

            status:
              data.status ===
              "out_of_stock"
                ? "out_of_stock"
                : "active",

            sold:
              Math.max(
                0,
                getSafeNumber(
                  data.sold,
                ),
              ),

            views:
              Math.max(
                0,
                getSafeNumber(
                  data.views,
                ),
              ),

            rating:
              Math.max(
                0,
                getSafeNumber(
                  data.rating,
                ),
              ),

            /*
             * Product-level values are kept only
             * as fallback.
             *
             * Active deal below has priority.
             */
            discountPercent:
              Math.min(
                99,
                Math.max(
                  0,
                  getSafeNumber(
                    data.discountPercent,
                  ),
                ),
              ),

            discountedPrice:
              getSafeNumber(
                data.discountedPrice,
              ) > 0
                ? getSafeNumber(
                    data.discountedPrice,
                  )
                : undefined,

            createdAt:
              data.createdAt ??
              null,

            updatedAt:
              data.updatedAt ??
              null,
          };

        /* ======================================================
           FIND ACTIVE DEALS
        ====================================================== */

        const dealsQuery =
          query(
            collection(
              db,
              "deals",
            ),

            where(
              "productId",
              "==",
              productId,
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

        const dealsSnapshot =
          await getDocs(
            dealsQuery,
          );

        /* ======================================================
           UNMOUNT CHECK
        ====================================================== */

        if (!mounted) {
          return;
        }

        /* ======================================================
           CURRENT TIME
        ====================================================== */

        const now =
          Date.now();

        /* ======================================================
           VALID ACTIVE DEALS
        ====================================================== */

        const activeDeals: ActiveDeal[] =
          [];

        dealsSnapshot.forEach(
          (
            dealSnapshot,
          ) => {
            const deal =
              dealSnapshot.data();

            /* ==================================================
               DISCOUNT PERCENTAGE
            ================================================== */

            const discountPercentage =
              getSafeNumber(
                deal.discountPercentage,
              );

            /* ==================================================
               DISCOUNTED PRICE
            ================================================== */

            const discountedPrice =
              getSafeNumber(
                deal.discountedPrice,
              );

            /* ==================================================
               DATES
            ================================================== */

            const startsAt =
              deal.startsAt;

            const expiresAt =
              deal.expiresAt;

            const startsAtMillis =
              getTimestampMillis(
                startsAt,
              );

            const expiresAtMillis =
              getTimestampMillis(
                expiresAt,
              );

            /* ==================================================
               VALID DISCOUNT
            ================================================== */

            const validDiscount =
              discountPercentage >
                0 &&
              discountPercentage <
                100;

            /* ==================================================
               VALID PRICE
            ================================================== */

            const validDiscountedPrice =
              discountedPrice >
                0 &&
              discountedPrice <
                productPrice;

            /* ==================================================
               STARTED
            ================================================== */

            const started =
              startsAtMillis > 0 &&
              startsAtMillis <=
                now;

            /* ==================================================
               NOT EXPIRED
            ================================================== */

            const notExpired =
              expiresAtMillis > 0 &&
              expiresAtMillis >
                now;

            /* ==================================================
               ACCEPT DEAL
            ================================================== */

            if (
              validDiscount &&
              validDiscountedPrice &&
              started &&
              notExpired
            ) {
              activeDeals.push({
                id:
                  dealSnapshot.id,

                discountPercentage,

                discountedPrice,

                startsAt,

                expiresAt,
              });
            }
          },
        );

        /* ======================================================
           SELECT ACTIVE DEAL
        ====================================================== */

        const activeDeal =
          activeDeals.length > 0
            ? activeDeals.reduce(
                (
                  current,
                  candidate,
                ) => {
                  const currentExpiry =
                    getTimestampMillis(
                      current.expiresAt,
                    );

                  const candidateExpiry =
                    getTimestampMillis(
                      candidate.expiresAt,
                    );

                  /*
                   * If multiple valid deals exist,
                   * select the one that expires latest.
                   */
                  return candidateExpiry >
                    currentExpiry
                    ? candidate
                    : current;
                },
              )
            : null;

        /* ======================================================
           APPLY ACTIVE DEAL
        ====================================================== */

        if (activeDeal) {
          /* ====================================================
             ACTIVE DISCOUNT
          ==================================================== */

          loadedProduct.discountPercent =
            activeDeal.discountPercentage;

          /* ====================================================
             DISCOUNTED PRICE
          ==================================================== */

          loadedProduct.discountedPrice =
            activeDeal.discountedPrice;

          /* ====================================================
             DEAL ID
          ==================================================== */

          loadedProduct.dealId =
            activeDeal.id;

          /* ====================================================
             START DATE
          ==================================================== */

          loadedProduct.discountStartsAt =
            activeDeal.startsAt;

          /* ====================================================
             EXPIRY DATE
          ==================================================== */

          loadedProduct.discountExpiresAt =
            activeDeal.expiresAt;
        } else {
          /* ====================================================
             NO ACTIVE DEAL
          ==================================================== */

          /*
           * IMPORTANT:
           *
           * Do not allow an old product-level discount
           * to remain visible after the deal expires.
           */

          loadedProduct.discountPercent =
            0;

          loadedProduct.discountedPrice =
            undefined;

          loadedProduct.dealId =
            undefined;

          loadedProduct.discountStartsAt =
            undefined;

          loadedProduct.discountExpiresAt =
            undefined;
        }

        /* ======================================================
           FINAL UNMOUNT CHECK
        ====================================================== */

        if (!mounted) {
          return;
        }

        /* ======================================================
           SET PRODUCT
        ====================================================== */

        setProduct(
          loadedProduct,
        );
      } catch (error) {
        /* ======================================================
           ERROR
        ====================================================== */

        if (!mounted) {
          return;
        }

        console.error(
          "FIXXAM_WORKER_PRODUCT_LOAD_ERROR:",
          error,
        );

        setProduct(null);
      } finally {
        /* ======================================================
           STOP LOADING
        ====================================================== */

        if (mounted) {
          setLoading(false);
        }
      }
    }

    /* ==========================================================
       EXECUTE
    ========================================================== */

    loadProduct();

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,
    product,
  };
}