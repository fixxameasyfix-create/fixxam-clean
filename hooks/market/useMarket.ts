import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  documentId,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type MarketProduct = {
  id: string;

  workerId: string;

  /*
   * Rating of the worker who owns
   * this product.
   */
  workerRating: number;

  storeId?: string;

  name: string;

  description: string;

  category: string;

  price: number;

  stock: number;

  thumbnail: string;

  images: string[];

  delivery: boolean;

  condition: "new" | "used";

  featured: boolean;

  status: string;

  /*
   * Existing product rating.
   * Kept for compatibility with
   * the rest of the market.
   */
  rating: number;

  sold: number;

  serviceIds: string[];
};

/* ============================================================
   INTERNAL TYPES
============================================================ */

type ProductData = Omit<
  MarketProduct,
  "workerRating"
>;

type WorkerRatingsMap =
  Record<string, number>;

/* ============================================================
   CONSTANTS
============================================================ */

/*
 * Firestore "in" queries are intentionally
 * chunked so we never depend on a very large
 * list of document IDs in one query.
 */
const WORKER_QUERY_BATCH_SIZE =
  30;

/* ============================================================
   SAFE NUMBER
============================================================ */

function toNumber(
  value: unknown,
  fallback = 0,
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}

/* ============================================================
   SAFE RATING
============================================================ */

function toRating(
  value: unknown,
): number {
  const rating =
    toNumber(
      value,
      0,
    );

  if (
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

/* ============================================================
   SAFE STRING
============================================================ */

function toString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   SAFE STRING ARRAY
============================================================ */

function toStringArray(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
    .map(
      item =>
        item.trim(),
    );
}

/* ============================================================
   CHUNK ARRAY
============================================================ */

function chunkArray<T>(
  items: T[],
  size: number,
): T[][] {
  const chunks: T[][] =
    [];

  for (
    let index = 0;
    index < items.length;
    index += size
  ) {
    chunks.push(
      items.slice(
        index,
        index + size,
      ),
    );
  }

  return chunks;
}

/* ============================================================
   MARKET HOOK
============================================================ */

export default function useMarket() {
  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    rawProducts,
    setRawProducts,
  ] =
    useState<ProductData[]>(
      [],
    );

  const [
    workerRatings,
    setWorkerRatings,
  ] =
    useState<WorkerRatingsMap>(
      {},
    );

  /* ==========================================================
     LOAD ACTIVE PRODUCTS
  ========================================================== */

  useEffect(() => {
    const productsQuery =
      query(
        collection(
          db,
          "products",
        ),

        where(
          "status",
          "==",
          "active",
        ),

        /*
         * Newest products first.
         */
        orderBy(
          "createdAt",
          "desc",
        ),
      );

    const unsubscribe =
      onSnapshot(
        productsQuery,

        /* ====================================================
           SUCCESS
        ==================================================== */

        snapshot => {
          const list:
            ProductData[] =
            snapshot.docs.map(
              document => {
                const data =
                  document.data();

                return {
                  /* ==========================================
                     ID
                  ========================================== */

                  id:
                    document.id,

                  /* ==========================================
                     WORKER
                  ========================================== */

                  workerId:
                    toString(
                      data.workerId,
                    ),

                  /* ==========================================
                     STORE
                  ========================================== */

                  storeId:
                    toString(
                      data.storeId,
                    ) ||
                    undefined,

                  /* ==========================================
                     PRODUCT
                  ========================================== */

                  name:
                    toString(
                      data.name,
                    ),

                  description:
                    toString(
                      data.description,
                    ),

                  category:
                    toString(
                      data.category,
                    ),

                  /* ==========================================
                     PRICE
                  ========================================== */

                  price:
                    toNumber(
                      data.price,
                    ),

                  /* ==========================================
                     STOCK
                  ========================================== */

                  stock:
                    toNumber(
                      data.stock,
                    ),

                  /* ==========================================
                     IMAGES
                  ========================================== */

                  thumbnail:
                    toString(
                      data.thumbnail,
                    ),

                  images:
                    toStringArray(
                      data.images,
                    ),

                  /* ==========================================
                     DELIVERY
                  ========================================== */

                  delivery:
                    data.delivery ===
                    true,

                  /* ==========================================
                     CONDITION
                  ========================================== */

                  condition:
                    data.condition ===
                    "used"
                      ? "used"
                      : "new",

                  /* ==========================================
                     FEATURED
                  ========================================== */

                  featured:
                    data.featured ===
                    true,

                  /* ==========================================
                     STATUS
                  ========================================== */

                  status:
                    toString(
                      data.status,
                    ),

                  /* ==========================================
                     PRODUCT RATING

                     Existing product field is preserved.
                  ========================================== */

                  rating:
                    toRating(
                      data.rating,
                    ),

                  /* ==========================================
                     SOLD
                  ========================================== */

                  sold:
                    toNumber(
                      data.sold,
                    ),

                  /* ==========================================
                     SERVICES
                  ========================================== */

                  serviceIds:
                    toStringArray(
                      data.serviceIds,
                    ),
                };
              },
            );

          setRawProducts(
            list,
          );

          setLoading(
            false,
          );
        },

        /* ====================================================
           ERROR
        ==================================================== */

        error => {
          console.error(
            "useMarket: failed to load products",
            error,
          );

          setRawProducts(
            [],
          );

          setWorkerRatings(
            {},
          );

          setLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ==========================================================
     LOAD RATINGS OF PRODUCT OWNERS

     product.workerId
           ↓
     workerPublicProfiles/{workerId}
           ↓
     rating
  ========================================================== */

  useEffect(() => {
    const workerIds =
      Array.from(
        new Set(
          rawProducts
            .map(
              product =>
                toString(
                  product.workerId,
                ),
            )
            .filter(
              Boolean,
            ),
        ),
      );

    if (
      workerIds.length === 0
    ) {
      setWorkerRatings(
        {},
      );

      return;
    }

    const batches =
      chunkArray(
        workerIds,
        WORKER_QUERY_BATCH_SIZE,
      );

    /*
     * Each batch gets its own realtime listener.
     *
     * If a worker's rating changes,
     * the product cards update without
     * requiring the product documents
     * themselves to change.
     */
    const ratingsByBatch =
      new Map<
        number,
        WorkerRatingsMap
      >();

    const rebuildRatings =
      () => {
        const merged:
          WorkerRatingsMap =
          {};

        ratingsByBatch.forEach(
          batchRatings => {
            Object.assign(
              merged,
              batchRatings,
            );
          },
        );

        setWorkerRatings(
          merged,
        );
      };

    const unsubscribers =
      batches.map(
        (
          batch,
          batchIndex,
        ) => {
          const workersQuery =
            query(
              collection(
                db,
                "workerPublicProfiles",
              ),

              where(
                documentId(),
                "in",
                batch,
              ),
            );

          return onSnapshot(
            workersQuery,

            snapshot => {
              const batchRatings:
                WorkerRatingsMap =
                {};

              snapshot.docs.forEach(
                workerDocument => {
                  const data =
                    workerDocument.data();

                  batchRatings[
                    workerDocument.id
                  ] =
                    toRating(
                      data.rating,
                    );
                },
              );

              ratingsByBatch.set(
                batchIndex,
                batchRatings,
              );

              rebuildRatings();
            },

            error => {
              console.error(
                "useMarket: failed to load worker ratings",
                error,
              );

              /*
               * Product loading must not fail
               * because worker rating failed.
               *
               * Missing ratings fall back
               * to 0 -> "New" in the UI.
               */
              ratingsByBatch.set(
                batchIndex,
                {},
              );

              rebuildRatings();
            },
          );
        },
      );

    return () => {
      unsubscribers.forEach(
        unsubscribe => {
          unsubscribe();
        },
      );
    };
  }, [
    rawProducts,
  ]);

  /* ==========================================================
     MERGE PRODUCTS + WORKER RATINGS

     IMPORTANT:
     useMemo keeps the products array stable
     between renders unless rawProducts or
     workerRatings actually changes.
  ========================================================== */

  const products =
    useMemo<
      MarketProduct[]
    >(
      () =>
        rawProducts.map(
          product => ({
            ...product,

            workerRating:
              workerRatings[
                product.workerId
              ] ??
              0,
          }),
        ),
      [
        rawProducts,
        workerRatings,
      ],
    );

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,

    products,
  };
}