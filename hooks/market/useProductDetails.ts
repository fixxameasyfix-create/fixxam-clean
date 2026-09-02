import {
  useEffect,
  useState,
} from "react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ============================================================
   PRODUCT
============================================================ */

export type ProductDetails = {
  id: string;

  workerId: string;

  storeId?: string;

  sellerId?: string;

  name: string;

  description: string;

  category: string;

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
};

/* ============================================================
   RETURN TYPE
============================================================ */

type UseProductDetailsResult = {
  loading: boolean;

  product: ProductDetails | null;

  deal: ActiveProductDeal | null;

  dealLoading: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

/**
 * Safely normalize a string.
 */
function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/**
 * Safely normalize a number.
 */
function normalizeNumber(
  value: unknown,
  fallback = 0,
): number {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

/**
 * Safely normalize boolean.
 */
function normalizeBoolean(
  value: unknown,
): boolean {
  return value === true;
}

/**
 * Safely normalize product condition.
 */
function normalizeCondition(
  value: unknown,
): "new" | "used" {
  return value === "used"
    ? "used"
    : "new";
}

/**
 * Safely normalize product status.
 */
function normalizeStatus(
  value: unknown,
): "active" | "out_of_stock" {
  return value ===
    "out_of_stock"
    ? "out_of_stock"
    : "active";
}

/**
 * Convert Firestore product data
 * into a safe ProductDetails object.
 */
function normalizeProduct(
  id: string,
  data: Record<
    string,
    unknown
  >,
): ProductDetails {
  const rawImages =
    Array.isArray(
      data.images,
    )
      ? data.images
      : [];

  const images =
    rawImages
      .map((image) =>
        normalizeString(image),
      )
      .filter(Boolean);

  const thumbnail =
    normalizeString(
      data.thumbnail,
    );

  /*
   * If thumbnail is missing but
   * images exist, use the first image.
   */
  const resolvedThumbnail =
    thumbnail ||
    images[0] ||
    "";

  return {
    id,

    workerId:
      normalizeString(
        data.workerId,
      ),

    storeId:
      normalizeString(
        data.storeId,
      ) || undefined,

    sellerId:
      normalizeString(
        data.sellerId,
      ) || undefined,

    name:
      normalizeString(
        data.name,
      ),

    description:
      normalizeString(
        data.description,
      ),

    category:
      normalizeString(
        data.category,
      ),

    price:
      Math.max(
        0,
        normalizeNumber(
          data.price,
        ),
      ),

    stock:
      Math.max(
        0,
        Math.floor(
          normalizeNumber(
            data.stock,
          ),
        ),
      ),

    thumbnail:
      resolvedThumbnail,

    images,

    delivery:
      normalizeBoolean(
        data.delivery,
      ),

    condition:
      normalizeCondition(
        data.condition,
      ),

    featured:
      normalizeBoolean(
        data.featured,
      ),

    status:
      normalizeStatus(
        data.status,
      ),
  };
}

/* ============================================================
   HOOK
============================================================ */

export default function useProductDetails(
  productId?: string,
): UseProductDetailsResult {
  /* ==========================================================
     PRODUCT STATE
  ========================================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    product,
    setProduct,
  ] =
    useState<ProductDetails | null>(
      null,
    );

  /* ==========================================================
     DEAL STATE
  ========================================================== */

  const [
    deal,
    setDeal,
  ] =
    useState<ActiveProductDeal | null>(
      null,
    );

  const [
    dealLoading,
    setDealLoading,
  ] = useState(false);

  /* ==========================================================
     PRODUCT SNAPSHOT
  ========================================================== */

  useEffect(() => {
    const normalizedId =
      normalizeString(
        productId,
      );

    /*
     * No product ID.
     */
    if (!normalizedId) {
      setProduct(null);
      setLoading(false);

      return;
    }

    let mounted = true;

    setLoading(true);

    const productRef =
      doc(
        db,
        "products",
        normalizedId,
      );

    const unsubscribe =
      onSnapshot(
        productRef,

        (snapshot) => {
          if (!mounted) {
            return;
          }

          if (!snapshot.exists()) {
            setProduct(null);
            setLoading(false);

            return;
          }

          try {
            const normalizedProduct =
              normalizeProduct(
                snapshot.id,
                snapshot.data() as Record<
                  string,
                  unknown
                >,
              );

            setProduct(
              normalizedProduct,
            );
          } catch (error) {
            console.error(
              "FIXXAM_PRODUCT_NORMALIZATION_ERROR:",
              error,
            );

            setProduct(null);
          }

          setLoading(false);
        },

        (error) => {
          console.error(
            "FIXXAM_PRODUCT_DETAILS_ERROR:",
            error,
          );

          if (!mounted) {
            return;
          }

          setProduct(null);
          setLoading(false);
        },
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [productId]);

  /* ==========================================================
     ACTIVE DEAL
  ========================================================== */

  useEffect(() => {
    const normalizedId =
      normalizeString(
        productId,
      );

    /*
     * No product ID.
     */
    if (!normalizedId) {
      setDeal(null);
      setDealLoading(false);

      return;
    }

    let mounted = true;

    const loadDeal =
      async () => {
        try {
          setDealLoading(true);

          /*
           * IMPORTANT:
           *
           * getActiveProductDeals()
           * expects string[].
           */
          const dealsByProductId =
            await getActiveProductDeals(
              [
                normalizedId,
              ],
            );

          /*
           * IMPORTANT:
           *
           * The service returns:
           *
           * Map<string, ActiveProductDeal>
           *
           * Therefore we must extract
           * the specific product's deal.
           */
          const activeDeal =
            dealsByProductId.get(
              normalizedId,
            ) ?? null;

          if (!mounted) {
            return;
          }

          setDeal(
            activeDeal,
          );
        } catch (error) {
          console.error(
            "FIXXAM_LOAD_PRODUCT_DEAL_ERROR:",
            error,
          );

          /*
           * Deal is optional.
           *
           * Product should still work
           * when the deal query fails.
           */
          if (mounted) {
            setDeal(null);
          }
        } finally {
          if (mounted) {
            setDealLoading(false);
          }
        }
      };

    void loadDeal();

    return () => {
      mounted = false;
    };
  }, [productId]);

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    loading,

    product,

    deal,

    dealLoading,
  };
}