import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  CustomerColors,
} from "@/theme";

import type {
  FilterType,
  FulfillmentMode,
  MarketOrder,
  MarketOrderProduct,
  MarketPaymentMethod,
  Order,
  OrderStatus,
  ServiceIcon,
} from "./orders.types";

/* ==============================================================
   FILTERS
============================================================== */

export const FILTERS = [
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
] as const satisfies ReadonlyArray<{
  key: FilterType;
  label: string;
}>;

/* ==============================================================
   STATUS CONFIG
============================================================== */

export const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
  }
> = {
  pending: {
    label: "PENDING",
  },

  accepted: {
    label: "ACCEPTED",
  },

  "in-progress": {
    label: "IN PROGRESS",
  },

  completed: {
    label: "COMPLETED",
  },

  cancelled: {
    label: "CANCELLED",
  },

  expired: {
    label: "EXPIRED",
  },
};

/* ==============================================================
   GENERIC HELPERS
============================================================== */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return fallback;
}

function getNumber(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    if (trimmed) {
      const parsed =
        Number(trimmed);

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }
  }

  return fallback;
}

function getOptionalAmount(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return null;
}

/* ==============================================================
   STATUS NORMALIZER
============================================================== */

export function normalizeStatus(
  value: unknown,
): OrderStatus {
  const status =
    typeof value === "string"
      ? value
          .trim()
          .toLowerCase()
      : "";

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "in_progress":
    case "in progress":
    case "on-the-way":
    case "on_the_way":
    case "on the way":
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
   FULFILLMENT MODE
============================================================== */

export function resolveFulfillmentMode(
  value: unknown,
): FulfillmentMode | undefined {
  const mode =
    typeof value === "string"
      ? value
          .trim()
          .toLowerCase()
      : "";

  switch (mode) {
    case "worker_visits_customer":
      return "worker_visits_customer";

    case "customer_visits_worker":
      return "customer_visits_worker";

    case "remote":
      return "remote";

    default:
      return undefined;
  }
}

/* ==============================================================
   SERVICE ICON
============================================================== */

export function resolveServiceIcon(
  value: unknown,
): ServiceIcon {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "tools";
  }

  const icon =
    value.trim() as ServiceIcon;

  if (
    icon in
    MaterialCommunityIcons.glyphMap
  ) {
    return icon;
  }

  return "tools";
}

/* ==============================================================
   DATE VALUE
============================================================== */

export function getDateValue(
  value: unknown,
): Date | null {
  if (value == null) {
    return null;
  }

  try {
    if (value instanceof Date) {
      return Number.isNaN(
        value.getTime(),
      )
        ? null
        : value;
    }

    if (
      isRecord(value) &&
      typeof value.toDate ===
        "function"
    ) {
      const date = (
        value as {
          toDate: () => Date;
        }
      ).toDate();

      if (
        date instanceof Date &&
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return date;
      }

      return null;
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      const date =
        new Date(value);

      return Number.isNaN(
        date.getTime(),
      )
        ? null
        : date;
    }
  } catch {
    return null;
  }

  return null;
}

/* ==============================================================
   TIMESTAMP
============================================================== */

export function getTimestampMillis(
  value: unknown,
): number {
  if (value == null) {
    return 0;
  }

  try {
    if (value instanceof Date) {
      const milliseconds =
        value.getTime();

      return Number.isFinite(
        milliseconds,
      )
        ? milliseconds
        : 0;
    }

    if (
      isRecord(value) &&
      typeof value.toMillis ===
        "function"
    ) {
      const milliseconds = (
        value as {
          toMillis: () => number;
        }
      ).toMillis();

      return Number.isFinite(
        milliseconds,
      )
        ? milliseconds
        : 0;
    }

    const date =
      getDateValue(value);

    return date
      ? date.getTime()
      : 0;
  } catch {
    return 0;
  }
}

/* ==============================================================
   DATE FORMAT
============================================================== */

export function formatDate(
  value: unknown,
): string {
  const date =
    getDateValue(value);

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

/* ==============================================================
   ORDER NUMBER
============================================================== */

export function formatOrderNumber(
  id: string,
): string {
  const clean = id
    .replace(
      /[^a-zA-Z0-9]/g,
      "",
    )
    .toUpperCase();

  if (!clean) {
    return "#FX-ORDER";
  }

  const shortId =
    clean.length > 6
      ? clean.slice(-6)
      : clean;

  return `#FX-${shortId}`;
}

/* ==============================================================
   LOCATION
============================================================== */

export function resolveLocation(
  data: Record<string, unknown>,
): string {
  const directAddress =
    getString(
      data.address,
    );

  if (directAddress) {
    return directAddress;
  }

  const directLocation =
    getString(
      data.location,
    );

  if (directLocation) {
    return directLocation;
  }

  if (
    isRecord(
      data.location,
    )
  ) {
    const nestedAddress =
      getString(
        data.location.address,
      );

    if (nestedAddress) {
      return nestedAddress;
    }

    const nestedCity =
      getString(
        data.location.city,
      );

    if (nestedCity) {
      return nestedCity;
    }
  }

  return "Location unavailable";
}

/* ==============================================================
   PAYMENT METHOD
============================================================== */

function resolvePaymentMethod(
  value: unknown,
): MarketPaymentMethod {
  const method =
    typeof value === "string"
      ? value
          .trim()
          .toLowerCase()
      : "";

  switch (method) {
    case "card":
      return "card";

    case "transfer":
      return "transfer";

    case "cash":
    default:
      return "cash";
  }
}

/* ==============================================================
   MARKET PRODUCTS
============================================================== */

function mapMarketProducts(
  value: unknown,
): MarketOrderProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((product) => {
      const productId =
        getString(
          product.productId,
          getString(
            product.id,
          ),
        );

      const image =
        getString(
          product.image,
          getString(
            product.imageUrl,
            getString(
              product.photoUrl,
            ),
          ),
        );

      const name =
        getString(
          product.name,
          getString(
            product.productName,
            "Product",
          ),
        );

      const price =
        Math.max(
          0,
          getNumber(
            product.price,
          ),
        );

      const quantity =
        Math.max(
          1,
          Math.floor(
            getNumber(
              product.quantity,
              1,
            ),
          ),
        );

      return {
        productId,
        name,

        image:
          image ||
          undefined,

        price,
        quantity,
      };
    })
    .filter(
      (product) =>
        product.productId.length >
        0,
    );
}

/* ==============================================================
   SERVICE ORDER MAPPER
============================================================== */

export function mapFirestoreOrder(
  id: string,
  data: Record<string, unknown>,
): Order {
  const workerName =
    getString(
      data.workerName,
      "Selected worker",
    );

  const workerCategory =
    getString(
      data.workerCategory,
      "Service Provider",
    );

  const serviceName =
    getString(
      data.serviceName,
      "Selected service",
    );

  const workerPhoto =
    getString(
      data.workerPhoto,
      getString(
        data.workerPhotoUrl,
      ),
    ) || undefined;

  const time =
    getString(
      data.time,
    ) || undefined;

  const offerAmount =
    getOptionalAmount(
      data.offerAmount,
    );

  const counterOfferAmount =
    getOptionalAmount(
      data.counterOfferAmount,
    );

  const agreedPrice =
    getOptionalAmount(
      data.agreedPrice,
    );

  const counterOfferBy =
    data.counterOfferBy ===
      "customer" ||
    data.counterOfferBy ===
      "worker"
      ? data.counterOfferBy
      : null;

  const dateValue =
    data.createdAt ??
    data.date;

  return {
    id,

    status:
      normalizeStatus(
        data.status,
      ),

    serviceName,

    serviceIcon:
      resolveServiceIcon(
        data.serviceIcon,
      ),

    serviceColor:
      getString(
        data.serviceColor,
        CustomerColors.primary,
      ),

    serviceBackgroundColor:
      getString(
        data.serviceBackgroundColor,
        CustomerColors.primarySoft,
      ),

    workerName,

    workerCategory,

    workerPhoto,

    location:
      resolveLocation(data),

    address:
      getString(
        data.address,
      ) || undefined,

    /*
     * IMPORTANT:
     * This comes directly from the same
     * fulfillmentMode used by the customer
     * order detail screen.
     */
    fulfillmentMode:
      resolveFulfillmentMode(
        data.fulfillmentMode,
      ),

    date:
      formatDate(
        dateValue,
      ),

    time,

    createdAt:
      data.createdAt,

    offerStatus:
      getString(
        data.offerStatus,
      ) || undefined,

    offerAmount,

    counterOfferStatus:
      getString(
        data.counterOfferStatus,
      ) || undefined,

    counterOfferAmount,

    counterOfferBy,

    agreedPrice,
  };
}

/* ==============================================================
   MARKET ORDER MAPPER
============================================================== */

export function mapMarketOrder(
  id: string,
  data: Record<string, unknown>,
): MarketOrder {
  const dateValue =
    data.createdAt ??
    data.date;

  const products =
    mapMarketProducts(
      data.products,
    );

  const firstProduct =
    products[0];

  const productImage =
    firstProduct?.image;

  const productName =
    firstProduct?.name ??
    "Market Order";

  const itemCount =
    products.reduce(
      (
        total,
        product,
      ) =>
        total +
        Math.max(
          1,
          Math.floor(
            product.quantity,
          ),
        ),
      0,
    );

  const total =
    Math.max(
      0,
      getNumber(
        data.total,
      ),
    );

  const amount =
    Math.max(
      0,
      getNumber(
        data.amount,
        total,
      ),
    );

  const offerAmount =
    typeof data.offerAmount ===
      "number" &&
    Number.isFinite(
      data.offerAmount,
    )
      ? data.offerAmount
      : undefined;

  const customerId =
    getString(
      data.customerId,
    ) || undefined;

  const customerName =
    getString(
      data.customerName,
      getString(
        data.receiverName,
        "Customer",
      ),
    );

  const customerPhoto =
    getString(
      data.customerPhoto,
      getString(
        data.customerPhotoUrl,
        getString(
          data.customerImage,
          getString(
            data.customerImageUrl,
          ),
        ),
      ),
    ) || undefined;

  const location =
    resolveLocation(data);

  return {
    id,

    status:
      normalizeStatus(
        data.status,
      ),

    products,

    productImage,

    productName,

    customerId,

    customerName,

    customerPhoto,

    itemCount,

    amount,

    offerAmount,

    offerStatus:
      getString(
        data.offerStatus,
      ) || undefined,

    storeName:
      getString(
        data.storeName,
        getString(
          data.sellerName,
          "Seller",
        ),
      ),

    storeId:
      getString(
        data.storeId,
      ) || undefined,

    sellerId:
      getString(
        data.sellerId,
      ) || undefined,

    address:
      location,

    location,

    paymentMethod:
      resolvePaymentMethod(
        data.paymentMethod,
      ),

    total,

    date:
      formatDate(
        dateValue,
      ),

    createdAt:
      data.createdAt,

    completedAt:
      getString(
        data.completedAt,
      ) || undefined,
  };
}

/* ==============================================================
   FIRESTORE ERROR
============================================================== */

export function getOrdersErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const code =
      String(
        (
          error as {
            code?: unknown;
          }
        ).code,
      );

    switch (code) {
      case "permission-denied":
        return "You do not have permission to view these orders.";

      case "failed-precondition":
        return "The orders database query needs to be configured.";

      case "unavailable":
        return "The service is temporarily unavailable. Please check your connection and try again.";

      case "unauthenticated":
        return "Your session has expired. Please sign in again.";

      case "not-found":
        return "The requested order could not be found.";

      case "deadline-exceeded":
        return "The request took too long. Please try again.";

      case "resource-exhausted":
        return "The service is currently busy. Please try again shortly.";

      default:
        break;
    }
  }

  return "Unable to load your orders. Please try again.";
}