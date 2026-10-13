import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

/* ==============================================================
   STATUS
============================================================== */

export type WorkerOrderStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

/* ==============================================================
   FILTER
============================================================== */

export type WorkerFilterType =
  | "all"
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

/* ==============================================================
   COUNTS
============================================================== */

export type WorkerOrderCounts = {
  all: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

/* ==============================================================
   SERVICE ICON
============================================================== */

export type WorkerServiceIcon =
  keyof typeof MaterialCommunityIcons.glyphMap;

/* ==============================================================
   FULFILLMENT MODE
============================================================== */

export type WorkerFulfillmentMode =
  | "worker_visits_customer"
  | "customer_visits_worker"
  | "remote";

/* ==============================================================
   MARKET PRODUCT
============================================================== */

export type WorkerMarketProduct = {
  id?: string;

  productId?: string;

  name: string;

  productName?: string;

  image?: string;

  imageURL?: string;

  productImage?: string;

  quantity: number;

  price: number;
};

/* ==============================================================
   COMMON ORDER BASE
============================================================== */

export type WorkerOrderBase = {
  id: string;

  status: WorkerOrderStatus;

  customerId?: string;

  customerName: string;

  customerPhoto?: string;

  customerPhotoURL?: string;

  workerId?: string;

  fulfillmentMode?: WorkerFulfillmentMode;

  address?: string;

  location?: string;

  date: string;

  time?: string;

  createdAt?: unknown;

  updatedAt?: unknown;

  offerStatus?: string;

  offerAmount?: number | null;

  amount?: number | null;

  deletedByWorker?: boolean;
};

/* ==============================================================
   SERVICE ORDER
============================================================== */

export type WorkerServiceOrder = WorkerOrderBase & {
  type?: "service";

  serviceId?: string;

  serviceName: string;

  serviceIcon: WorkerServiceIcon;

  serviceColor: string;

  serviceBackgroundColor: string;

  description?: string;
};

/* ==============================================================
   MARKET ORDER
============================================================== */

export type WorkerMarketOrder = WorkerOrderBase & {
  type?: "market";

  storeId?: string;

  storeName: string;

  productId?: string;

  productName?: string;

  productImage?: string;

  products: WorkerMarketProduct[];

  itemCount?: number;

  total?: number;

  totalAmount?: number;
};

/* ==============================================================
   WORKER ORDER
   --------------------------------------------------------------
   Flexible union-like UI shape.
   Useful for screens that display both service and market orders.
============================================================== */

export type WorkerOrder = WorkerOrderBase & {
  type?: "service" | "market";

  /* ==========================================================
     SERVICE
  ========================================================== */

  serviceId?: string;

  serviceName?: string;

  serviceIcon?: WorkerServiceIcon;

  serviceColor?: string;

  serviceBackgroundColor?: string;

  description?: string;

  /* ==========================================================
     MARKET
  ========================================================== */

  storeId?: string;

  storeName?: string;

  productId?: string;

  productName?: string;

  productImage?: string;

  products?: WorkerMarketProduct[];

  itemCount?: number;

  total?: number;

  totalAmount?: number;
};