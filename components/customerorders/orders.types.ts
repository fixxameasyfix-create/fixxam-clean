import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

/* ==============================================================
   SERVICE ICON
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
   FULFILLMENT MODE
============================================================== */

export type FulfillmentMode =
  | "worker_visits_customer"
  | "customer_visits_worker"
  | "remote";

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
  | number
  | null;

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
     FULFILLMENT
  ========================================================== */

  fulfillmentMode?: FulfillmentMode;

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

  products: MarketOrderProduct[];

  productImage?: string;

  productName?: string;

  customerId?: string;

  customerName?: string;

  customerPhoto?: string;

  itemCount?: number;

  amount?: number;

  offerAmount?: number;

  offerStatus?: string;

  storeName?: string;

  storeId?: string;

  sellerId?: string;

  address?: string;

  location?: string;

  paymentMethod:
    MarketPaymentMethod;

  total: number;

  date: string;

  createdAt?: unknown;

  completedAt?: string;
};