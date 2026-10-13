import type {
  ShopCategoryId,
  ShopCategoryFilter as SharedShopCategoryFilter,
} from '../constants/shopCategories';

/* ============================================================
   SHOP CATEGORIES

   Category IDs are defined only in:
   constants/shopCategories.ts

   This prevents Create Shop, Find Shop,
   filters and Firestore types from drifting apart.
============================================================ */

export type ShopCategory =
  ShopCategoryId;

export type ShopCategoryFilter =
  SharedShopCategoryFilter;

/* ============================================================
   SHOP
============================================================ */

export type Shop = {
  id: string;

  name: string;

  category: ShopCategory;

  serviceLabel: string;

  rating: number;

  reviews: number;

  distanceKm: number;

  location: string;

  isOpen: boolean;

  /**
   * Main shop cover photo.
   * Used as the large shop/profile image.
   */
  imageUrl: string;

  /**
   * Shop logo / profile image.
   * Used as the small image displayed
   * over the cover photo.
   */
  logoUrl: string;
};

/* ============================================================
   SHOP SERVICE
============================================================ */

export type ShopService = {
  id: string;

  name: string;

  description: string;

  priceLabel: string;

  imageUrl: string;
};

/* ============================================================
   OPENING HOURS
============================================================ */

export type ShopOpeningHour = {
  id: string;

  day: string;

  hours: string;
};

/* ============================================================
   SHOP REVIEW
============================================================ */

export type ShopReview = {
  id: string;

  customerName: string;

  rating: number;

  comment: string;

  createdLabel: string;
};

/* ============================================================
   SHOP PROFILE DETAILS
============================================================ */

export type ShopProfileDetails = {
  description: string;

  verified: boolean;

  openingStatusLabel: string;

  services: ShopService[];

  openingHours: ShopOpeningHour[];

  photos: string[];

  reviews: ShopReview[];
};

/* ============================================================
   SHOP DETAIL TABS
============================================================ */

export type ShopDetailTab =
  | 'Overview'
  | 'Services'
  | 'Reviews'
  | 'Location'
  | 'Photos';