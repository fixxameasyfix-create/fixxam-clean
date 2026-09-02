import {
  useEffect,
  useState,
} from "react";

import {
  collection,
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

  rating: number;

  sold: number;

  serviceIds: string[];
};

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
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is string =>
      typeof item === "string" &&
      item.trim().length > 0,
  );
}

/* ============================================================
   MARKET HOOK
============================================================ */

export default function useMarket() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    products,
    setProducts,
  ] = useState<MarketProduct[]>([]);

  /* ==========================================================
     LOAD ACTIVE PRODUCTS
  ========================================================== */

  useEffect(() => {
    const productsQuery = query(
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
       *
       * This makes the collection
       * suitable for "New Arrivals".
       */
      orderBy(
        "createdAt",
        "desc",
      ),
    );

    const unsubscribe =
      onSnapshot(
        productsQuery,

        /* ======================================================
           SUCCESS
        ====================================================== */

        (snapshot) => {
          const list: MarketProduct[] =
            snapshot.docs.map(
              (document) => {
                const data =
                  document.data();

                return {
                  /* ============================================
                     ID
                  ============================================ */

                  id:
                    document.id,

                  /* ============================================
                     WORKER
                  ============================================ */

                  workerId:
                    toString(
                      data.workerId,
                    ),

                  /* ============================================
                     STORE
                  ============================================ */

                  storeId:
                    toString(
                      data.storeId,
                    ) ||
                    undefined,

                  /* ============================================
                     PRODUCT
                  ============================================ */

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

                  /* ============================================
                     PRICE
                  ============================================ */

                  price:
                    toNumber(
                      data.price,
                    ),

                  /* ============================================
                     STOCK
                  ============================================ */

                  stock:
                    toNumber(
                      data.stock,
                    ),

                  /* ============================================
                     IMAGES
                  ============================================ */

                  thumbnail:
                    toString(
                      data.thumbnail,
                    ),

                  images:
                    toStringArray(
                      data.images,
                    ),

                  /* ============================================
                     DELIVERY
                  ============================================ */

                  delivery:
                    data.delivery ===
                    true,

                  /* ============================================
                     CONDITION
                  ============================================ */

                  condition:
                    data.condition ===
                    "used"
                      ? "used"
                      : "new",

                  /* ============================================
                     FEATURED
                  ============================================ */

                  featured:
                    data.featured ===
                    true,

                  /* ============================================
                     STATUS
                  ============================================ */

                  status:
                    toString(
                      data.status,
                    ),

                  /* ============================================
                     RATING
                  ============================================ */

                  rating:
                    toNumber(
                      data.rating,
                    ),

                  /* ============================================
                     SOLD
                  ============================================ */

                  sold:
                    toNumber(
                      data.sold,
                    ),

                  /* ============================================
                     SERVICES
                  ============================================ */

                  serviceIds:
                    toStringArray(
                      data.serviceIds,
                    ),
                };
              },
            );

          setProducts(list);

          setLoading(false);
        },

        /* ======================================================
           ERROR
        ====================================================== */

        (error) => {
          console.error(
            "useMarket: failed to load products",
            error,
          );

          setProducts([]);

          setLoading(false);
        },
      );

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return unsubscribe;
  }, []);

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,

    products,
  };
}