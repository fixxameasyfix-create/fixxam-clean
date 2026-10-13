import type {
  WorkerFilterType,
  WorkerMarketOrder,
  WorkerOrderCounts,
  WorkerServiceOrder,
} from "@/types/workerOrders";

import type { FirebaseShopRequest } from "@/types/firebaseShopRequest";

/* ==============================================================
TYPES
============================================================== */

export type OrderCategory =
  | "service"
  | "market"
  | "shop";

export type CategoryIcon =
  | "tools"
  | "storefront-outline"
  | "clipboard-text-outline";

export type CategoryCardConfig = {
  key: OrderCategory;
  title: string;
  description: string;
  icon: CategoryIcon;
  iconColor: string;
  iconBackground: string;
  arrowColor: string;
  arrowBackground: string;
};

/* ==============================================================
CATEGORY CONFIG
============================================================== */

export const CATEGORY_CONFIG: CategoryCardConfig[] = [
  {
    key: "service",
    title: "Service Requests",
    description:
      "View service bookings and requests assigned to you.",
    icon: "tools",
    iconColor: "#087FEF",
    iconBackground: "#EAF4FF",
    arrowColor: "#087FEF",
    arrowBackground: "#EAF4FF",
  },
  {
    key: "market",
    title: "Market Requests",
    description:
      "View market orders and product requests assigned to you.",
    icon: "storefront-outline",
    iconColor: "#12B878",
    iconBackground: "#E9FBF2",
    arrowColor: "#12B878",
    arrowBackground: "#E9FBF2",
  },
  {
    key: "shop",
    title: "Shop Requests",
    description:
      "View requests customers have sent to your shop.",
    icon: "clipboard-text-outline",
    iconColor: "#F28A00",
    iconBackground: "#FFF5DE",
    arrowColor: "#F28A00",
    arrowBackground: "#FFF5DE",
  },
];

/* ==============================================================
FILTER CONFIG
============================================================== */

export const WORKER_FILTERS: {
  key: WorkerFilterType;
  label: string;
}[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "pending",
    label: "Pending",
  },
  {
    key: "active",
    label: "Active",
  },
  {
    key: "completed",
    label: "Completed",
  },
  {
    key: "cancelled",
    label: "Cancelled",
  },
];

/* ==============================================================
HELPERS
============================================================== */

export function normalizeStatus(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
}

export function matchesFilter(
  status: unknown,
  filter: WorkerFilterType,
): boolean {
  const normalized =
    normalizeStatus(status);

  switch (filter) {
    case "pending":
      return normalized === "pending";

    case "active":
      return (
        normalized === "accepted" ||
        normalized === "in-progress" ||
        normalized === "on-the-way"
      );

    case "completed":
      return (
        normalized === "completed" ||
        normalized === "delivered"
      );

    case "cancelled":
      return (
        normalized === "cancelled" ||
        normalized === "canceled" ||
        normalized === "expired" ||
        normalized === "declined"
      );

    case "all":
    default:
      return true;
  }
}

export function isDeletedByWorker(
  value: unknown,
): boolean {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const data =
    value as Record<string, unknown>;

  return data.deletedByWorker === true;
}

export function addStatusCount(
  counts: WorkerOrderCounts,
  status: unknown,
) {
  switch (normalizeStatus(status)) {
    case "pending":
      counts.pending += 1;
      break;

    case "accepted":
    case "in-progress":
    case "on-the-way":
      counts.active += 1;
      break;

    case "completed":
    case "delivered":
      counts.completed += 1;
      break;

    case "cancelled":
    case "canceled":
    case "expired":
    case "declined":
      counts.cancelled += 1;
      break;

    default:
      break;
  }
}

export function getSafeId(
  value: unknown,
): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  return "";
}

export function getString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (typeof value === "string") {
      const normalized =
        value.trim();

      if (normalized) {
        return normalized;
      }
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return String(value);
    }
  }

  return "";
}

export function parseSafeNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const cleanValue =
      value.trim();

    if (!cleanValue) {
      return undefined;
    }

    const parsed = Number(
      cleanValue.replace(
        /[₦,\s]/g,
        "",
      ),
    );

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function getNumber(
  ...values: unknown[]
): number {
  for (const value of values) {
    const parsed =
      parseSafeNumber(value);

    if (parsed !== undefined) {
      return parsed;
    }
  }

  return 0;
}

export function getOptionalNumber(
  ...values: unknown[]
): number | undefined {
  for (const value of values) {
    const parsed =
      parseSafeNumber(value);

    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
}

export function getTimestampMillis(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const cleanValue =
      value.trim();

    if (cleanValue) {
      const parsed =
        new Date(cleanValue).getTime();

      return Number.isFinite(parsed)
        ? parsed
        : 0;
    }
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const timestamp =
      value as {
        toMillis?: () => number;
        toDate?: () => Date;
      };

    if (
      typeof timestamp.toMillis ===
      "function"
    ) {
      try {
        const millis =
          timestamp.toMillis();

        return Number.isFinite(millis)
          ? millis
          : 0;
      } catch {
        return 0;
      }
    }

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      try {
        const millis =
          timestamp.toDate().getTime();

        return Number.isFinite(millis)
          ? millis
          : 0;
      } catch {
        return 0;
      }
    }
  }

  return 0;
}

export function getOrderDate(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (typeof value === "string") {
      const clean = value.trim();

      if (clean) {
        return clean;
      }
    }

    const millis =
      getTimestampMillis(value);

    if (millis > 0) {
      return new Date(
        millis,
      ).toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );
    }
  }

  return "Date unavailable";
}

/* ==============================================================
FIRESTORE
============================================================== */

export type FirestoreData =
  Record<string, unknown>;

/* ==============================================================
SERVICE NORMALIZATION
============================================================== */

export function normalizeWorkerServiceOrder(
  id: string,
  data: FirestoreData,
): WorkerServiceOrder {
  const createdAt =
    data.createdAt ??
    data.date ??
    data.requestedAt ??
    null;

  const serviceName =
    getString(
      data.serviceName,
      data.service,
      data.title,
      "Service",
    );

  const customerName =
    getString(
      data.customerName,
      data.customerDisplayName,
      "Customer",
    );

  const customerPhoto =
    getString(
      data.customerPhoto,
      data.customerImage,
      data.customerAvatar,
    );

  const location =
    getString(
      data.location,
      data.address,
      data.serviceAddress,
      "Address unavailable",
    );

  const date =
    getOrderDate(
      data.date,
      data.createdAt,
      data.requestedAt,
    );

  const serviceIcon =
    getString(
      data.serviceIcon,
      "tools",
    );

  const offerAmount =
    getOptionalNumber(
      data.offerAmount,
    );

  return {
    ...data,
    id,
    type: "service",
    serviceName,
    customerName,
    ...(customerPhoto
      ? { customerPhoto }
      : {}),
    location,
    date,
    createdAt,
    serviceIcon:
      serviceIcon as WorkerServiceOrder["serviceIcon"],
    ...(typeof data.serviceColor ===
    "string"
      ? {
          serviceColor:
            data.serviceColor,
        }
      : {}),
    ...(typeof data.serviceBackgroundColor ===
    "string"
      ? {
          serviceBackgroundColor:
            data.serviceBackgroundColor,
        }
      : {}),
    status:
      normalizeWorkerServiceStatus(
        data.status,
      ),
    deletedByWorker:
      data.deletedByWorker === true,
    ...(offerAmount !== undefined
      ? {
          offerAmount,
        }
      : {}),
    ...(typeof data.offerStatus ===
    "string"
      ? {
          offerStatus:
            data.offerStatus as WorkerServiceOrder["offerStatus"],
        }
      : {}),
  } as WorkerServiceOrder;
}

/* ==============================================================
MARKET NORMALIZATION
============================================================== */

export function normalizeWorkerMarketOrder(
  id: string,
  data: FirestoreData,
): WorkerMarketOrder {
  const products =
    Array.isArray(data.products)
      ? data.products.filter(
          (
            product,
          ): product is Record<
            string,
            unknown
          > =>
            typeof product ===
              "object" &&
            product !== null,
        )
      : [];

  const firstProduct =
    products[0];

  const productName =
    getString(
      firstProduct?.name,
      firstProduct?.productName,
      data.productName,
      data.name,
      data.title,
      "Market Order",
    );

  const productImage =
    getString(
      firstProduct?.image,
      firstProduct?.productImage,
      firstProduct?.imageUrl,
      firstProduct?.photo,
      firstProduct?.productPhoto,
      data.productImage,
      data.image,
      data.imageUrl,
      data.productPhoto,
    );

  const customerName =
    getString(
      data.customerName,
      data.customerDisplayName,
      data.receiverName,
      "Customer",
    );

  const customerPhoto =
    getString(
      data.customerPhoto,
      data.customerImage,
      data.customerAvatar,
    );

  const amount =
    getNumber(
      data.amount,
      data.total,
      data.price,
    );

  const offerAmount =
    getOptionalNumber(
      data.offerAmount,
      data.counterOfferAmount,
    );

  const address =
    getString(
      data.address,
      data.deliveryAddress,
      data.location,
    );

  const date =
    getOrderDate(
      data.createdAt,
      data.date,
      data.requestedAt,
    );

  const itemCount =
    products.length > 0
      ? products.length
      : Math.max(
          1,
          Math.floor(
            getNumber(
              data.itemCount,
              1,
            ),
          ),
        );

  const createdAt =
    data.createdAt ??
    data.date ??
    data.requestedAt ??
    null;

  return {
    ...data,
    id,
    type: "market",
    amount,
    productName,
    ...(productImage
      ? {
          productImage,
        }
      : {}),
    customerName,
    ...(customerPhoto
      ? {
          customerPhoto,
        }
      : {}),
    ...(address
      ? {
          address,
        }
      : {}),
    date,
    createdAt,
    itemCount,
    status:
      normalizeWorkerMarketStatus(
        data.status,
      ),
    deletedByWorker:
      data.deletedByWorker === true,
    ...(offerAmount !== undefined
      ? {
          offerAmount,
        }
      : {}),
    ...(typeof data.offerStatus ===
    "string"
      ? {
          offerStatus:
            data.offerStatus as WorkerMarketOrder["offerStatus"],
        }
      : {}),
  } as WorkerMarketOrder;
}

export function normalizeWorkerServiceStatus(
  value: unknown,
): WorkerServiceOrder["status"] {
  const status =
    normalizeStatus(value);

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

export function normalizeWorkerMarketStatus(
  value: unknown,
): WorkerMarketOrder["status"] {
  const status =
    normalizeStatus(value);

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
FILTER TYPES
============================================================== */

export type WorkerOrdersData = {
  serviceOrders: WorkerServiceOrder[];
  marketOrders: WorkerMarketOrder[];
  shopRequests: FirebaseShopRequest[];
};