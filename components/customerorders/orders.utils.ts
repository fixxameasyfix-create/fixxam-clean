import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type {
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
] as const;

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
   STATUS NORMALIZER
============================================================== */

export function normalizeStatus(
  value: unknown,
): OrderStatus {
  const status =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : "";

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "in_progress":
    case "in progress":
    case "on-the-way":
    case "on_the_way":
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
  if (!value) {
    return null;
  }

  try {
    if (value instanceof Date) {
      return value;
    }

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate === "function"
    ) {
      const date = (
        value as {
          toDate: () => Date;
        }
      ).toDate();

      return date instanceof Date &&
        !Number.isNaN(
          date.getTime(),
        )
        ? date
        : null;
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      const date =
        new Date(value);

      if (
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return date;
      }
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
  if (!value) {
    return 0;
  }

  try {
    if (value instanceof Date) {
      return value.getTime();
    }

    if (
      typeof value === "object" &&
      value !== null &&
      "toMillis" in value &&
      typeof (
        value as {
          toMillis?: unknown;
        }
      ).toMillis === "function"
    ) {
      return (
        value as {
          toMillis: () => number;
        }
      ).toMillis();
    }

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof (
        value as {
          toDate?: unknown;
        }
      ).toDate === "function"
    ) {
      const date = (
        value as {
          toDate: () => Date;
        }
      ).toDate();

      return date instanceof Date
        ? date.getTime()
        : 0;
    }

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      const date =
        new Date(value);

      if (
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        return date.getTime();
      }
    }
  } catch {
    return 0;
  }

  return 0;
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
  if (!id) {
    return "#FX-ORDER";
  }

  const clean =
    id
      .replace(
        /[^a-zA-Z0-9]/g,
        "",
      )
      .toUpperCase();

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
  if (
    typeof data.address ===
      "string" &&
    data.address.trim()
  ) {
    return data.address.trim();
  }

  if (
    typeof data.location ===
      "string" &&
    data.location.trim()
  ) {
    return data.location.trim();
  }

  if (
    typeof data.location ===
      "object" &&
    data.location !== null
  ) {
    const location =
      data.location as {
        address?: unknown;
        city?: unknown;
      };

    if (
      typeof location.address ===
        "string" &&
      location.address.trim()
    ) {
      return location.address.trim();
    }

    if (
      typeof location.city ===
        "string" &&
      location.city.trim()
    ) {
      return location.city.trim();
    }
  }

  return "Location unavailable";
}

/* ==============================================================
   NUMBER HELPER
============================================================== */

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
    typeof value === "string" &&
    value.trim()
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return fallback;
}

/* ==============================================================
   STRING HELPER
============================================================== */

function getString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

/* ==============================================================
   PAYMENT METHOD
============================================================== */

function resolvePaymentMethod(
  value: unknown,
): MarketPaymentMethod {
  switch (
    typeof value === "string"
      ? value.trim().toLowerCase()
      : ""
  ) {
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
    .filter(
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
    .map(
      (product) => {
        const productId =
          getString(
            product.productId,
            getString(
              product.id,
            ),
          );

        /*
         * IMPORTANT:
         * Support image, imageUrl and photoUrl.
         */
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
            image || undefined,

          price,

          quantity,
        };
      },
    )
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
    typeof data.offerAmount ===
      "number" &&
    Number.isFinite(
      data.offerAmount,
    )
      ? data.offerAmount
      : null;

  const counterOfferAmount =
    typeof data.counterOfferAmount ===
      "number" &&
    Number.isFinite(
      data.counterOfferAmount,
    )
      ? data.counterOfferAmount
      : null;

  const agreedPrice =
    typeof data.agreedPrice ===
      "number" &&
    Number.isFinite(
      data.agreedPrice,
    )
      ? data.agreedPrice
      : null;

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
        "#2563EB",
      ),

    serviceBackgroundColor:
      getString(
        data.serviceBackgroundColor,
        "#EFF6FF",
      ),

    workerName,

    workerCategory,

    workerPhoto,

    location:
      resolveLocation(data),

    address:
      typeof data.address ===
        "string"
        ? data.address
        : undefined,

    date:
      formatDate(dateValue),

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

  /* ============================================================
     PRODUCTS
  ============================================================ */

  const products =
    mapMarketProducts(
      data.products,
    );

  /* ============================================================
     FIRST PRODUCT
     
     WorkerMarketOrderCard needs:
       productImage
       productName
  ============================================================ */

  const firstProduct =
    products[0];

  const productImage =
    firstProduct?.image;

  const productName =
    firstProduct?.name ||
    "Market Order";

  /* ============================================================
     ITEM COUNT
  ============================================================ */

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

  /* ============================================================
     TOTAL
  ============================================================ */

  const total =
    Math.max(
      0,
      getNumber(
        data.total,
      ),
    );

  /* ============================================================
     AMOUNT
     
     WorkerMarketOrderCard checks:
       amount
       offerAmount
  ============================================================ */

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

  /* ============================================================
     CUSTOMER
  ============================================================ */

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

  /* ============================================================
     LOCATION
  ============================================================ */

  const location =
    resolveLocation(data);

  /* ============================================================
     MARKET ORDER
  ============================================================ */

  return {
    id,

    status:
      normalizeStatus(
        data.status,
      ),

    /*
     * Full products array.
     */
    products,

    /*
     * IMPORTANT:
     * These fields are consumed directly
     * by WorkerMarketOrderCard.
     */
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
      formatDate(dateValue),

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

      default:
        break;
    }
  }

  return "Unable to load your orders. Please try again.";
}