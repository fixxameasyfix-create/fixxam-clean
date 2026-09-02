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
   FILTER TYPE
============================================================== */

export type FilterType =
  | "all"
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

/* ==============================================================
   SERVICE ORDER
============================================================== */

export type Order = {
  id: string;

  status: OrderStatus;

  serviceName: string;

  serviceIcon: ServiceIcon;

  serviceColor?: string;

  serviceBackgroundColor?: string;

  workerName: string;

  workerCategory: string;

  workerPhoto?: string;

  location: string;

  address?: string;

  date: string;

  time?: string;

  createdAt?: unknown;

  offerStatus?: string;

  offerAmount?: number | null;

  counterOfferStatus?: string;

  counterOfferAmount?: number | null;

  counterOfferBy?:
    | "customer"
    | "worker"
    | null;

  agreedPrice?: number | null;
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
     FULL PRODUCTS
  ========================================================== */

  products: MarketOrderProduct[];

  /* ==========================================================
     CARD PRODUCT PREVIEW
  ========================================================== */

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
     AMOUNTS
  ========================================================== */

  amount?: number;

  offerAmount?: number;

  offerStatus?: string;

  /* ==========================================================
     STORE
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

  paymentMethod: MarketPaymentMethod;

  total: number;

  /* ==========================================================
     DATE
  ========================================================== */

  date: string;

  createdAt?: unknown;

  completedAt?: string;
};