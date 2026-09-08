import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

/* ==============================================================
   SERVICE ICON

   IMPORTANT:
   MaterialCommunityIcons remains the official type source
   for service icons used by existing service/order data.
============================================================== */

export type ServiceIcon =
  keyof typeof MaterialCommunityIcons.glyphMap;

/* ==============================================================
   ORDER STATUS
============================================================== */

export type OrderStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

/* ==============================================================
   FILTER TYPE
============================================================== */

export type FilterType =
  | "all"
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

/* ==============================================================
   ORDER ACTOR
============================================================== */

export type OrderActorRole =
  | "customer"
  | "worker";

/* ==============================================================
   COMMON AMOUNT
============================================================== */

export type OrderAmount =
  number | null;

/* ==============================================================
   SERVICE ORDER
============================================================== */

export type Order = {
  id: string;

  status: OrderStatus;

  /* ==========================================================
     SERVICE
  ========================================================== */

  serviceName: string;

  serviceIcon: ServiceIcon;

  serviceColor?: string;

  serviceBackgroundColor?: string;

  /* ==========================================================
     WORKER
  ========================================================== */

  workerName: string;

  workerCategory: string;

  workerPhoto?: string;

  /* ==========================================================
     LOCATION
  ========================================================== */

  location: string;

  address?: string;

  /* ==========================================================
     SCHEDULE
  ========================================================== */

  date: string;

  time?: string;

  createdAt?: unknown;

  /* ==========================================================
     WORKER OFFER
  ========================================================== */

  offerStatus?: string;

  offerAmount?: OrderAmount;

  /* ==========================================================
     COUNTER OFFER
  ========================================================== */

  counterOfferStatus?: string;

  counterOfferAmount?: OrderAmount;

  counterOfferBy?:
    | OrderActorRole
    | null;

  /* ==========================================================
     AGREED PRICE
  ========================================================== */

  agreedPrice?: OrderAmount;
};

/* ==============================================================
   MARKET ORDER PRODUCT
============================================================== */

export type MarketOrderProduct = {
  productId: string;

  name: string;

  image?: string;

  price: number;

  quantity: number;
};

/* ==============================================================
   MARKET PAYMENT METHOD
============================================================== */

export type MarketPaymentMethod =
  | "cash"
  | "card"
  | "transfer";

/* ==============================================================
   MARKET ORDER
============================================================== */

export type MarketOrder = {
  id: string;

  status: OrderStatus;

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  products: MarketOrderProduct[];

  /*
   * Cached first-product preview fields.
   * Used by market order cards.
   */
  productImage?: string;

  productName?: string;

  /* ==========================================================
     CUSTOMER
  ========================================================== */

  customerId?: string;

  customerName?: string;

  customerPhoto?: string;

  /* ==========================================================
     ITEM COUNT
  ========================================================== */

  itemCount?: number;

  /* ==========================================================
     AMOUNTS / OFFERS
  ========================================================== */

  amount?: number;

  offerAmount?: number;

  offerStatus?: string;

  /* ==========================================================
     STORE / SELLER
  ========================================================== */

  storeName?: string;

  storeId?: string;

  sellerId?: string;

  /* ==========================================================
     LOCATION
  ========================================================== */

  address?: string;

  location?: string;

  /* ==========================================================
     PAYMENT
  ========================================================== */

  paymentMethod:
    MarketPaymentMethod;

  total: number;

  /* ==========================================================
     DATE / TIMESTAMP
  ========================================================== */

  date: string;

  createdAt?: unknown;

  completedAt?: string;
};