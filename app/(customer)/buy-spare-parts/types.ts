import type {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   PRODUCT STATUS
============================================================== */

export type ProductStatus =
  | "active"
  | "out_of_stock";

/* ==============================================================
   AI SEARCH MODE
============================================================== */

export type AiSearchMode =
  | "photo"
  | "description"
  | "equipment"
  | "combined"
  | "";

/* ==============================================================
   ROUTE PARAMS
============================================================== */

export type SpareProductsParams = {
  photoUri?: string;

  description?: string;

  source?: string;

  equipmentId?: string;

  equipmentName?: string;

  brandId?: string;

  brandName?: string;

  aiPartName?: string;

  aiCategory?: string;

  aiSearchQuery?: string;

  aiKeywords?: string;

  aiConfidence?: string;

  aiMode?: string;
};

/* ==============================================================
   PRODUCT
============================================================== */

export type Product = {
  id: string;

  name: string;

  price: number;

  thumbnail: string;

  /*
   * Existing product rating.
   * Kept for compatibility.
   */
  rating: number;

  /*
   * Rating of the worker who owns
   * this spare part.
   *
   * Source:
   * workerPublicProfiles/{workerId}.rating
   */
  workerRating?: number;

  sold: number;

  /*
   * Product interaction counts.
   */
  favoriteCount?: number;

  ratingCount?: number;

  reviewCount?: number;

  stock: number;

  status: ProductStatus;

  category?: string;

  categoryId?: string;

  /*
   * Worker who owns this product.
   *
   * Required by product review flow
   * when available.
   */
  workerId?: string;

  storeId?: string;

  serviceId?: string;

  serviceIds?: string[];

  /* ============================================================
     SEARCH / COMPATIBILITY METADATA
  ============================================================ */

  brandId?: string;

  brandName?: string;

  equipmentId?: string;

  equipmentIds?: string[];

  equipmentName?: string;

  equipmentNames?: string[];

  keywords?: string[];

  tags?: string[];
};

/* ==============================================================
   PRODUCT WITH ACTIVE DEAL
============================================================== */

export type ProductWithDeal =
  Product & {
    activeDeal:
      | ActiveProductDeal
      | null;
  };

/* ==============================================================
   PRODUCT CARD
============================================================== */

export type SparePartCardProps = {
  product: ProductWithDeal;

  /*
   * Open / buy product.
   */
  onBuy: (
    product: ProductWithDeal,
  ) => void;

  /*
   * Product rating action from
   * three-dot ProductCardMenu.
   */
  onRating?: (
    product: ProductWithDeal,
  ) => void;

  /*
   * Product review action from
   * three-dot ProductCardMenu.
   */
  onReview?: (
    product: ProductWithDeal,
  ) => void;
};

/* ==============================================================
   AI RANKING
============================================================== */

export type RankedProduct = {
  product: ProductWithDeal;

  score: number;
};