import type { Ionicons } from "@expo/vector-icons";

/* ==============================================================
   MARKET STATUS
============================================================== */

export type MarketStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

/* ==============================================================
   MARKET PRODUCT
============================================================== */

export type MarketProduct = {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

/* ==============================================================
   STATUS CONFIG
============================================================== */

export type MarketStatusConfig = {
  label: string;
  color: string;
  background: string;
  messageBackground: string;
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
};

/* ==============================================================
   NORMALIZE STATUS
============================================================== */

export function normalizeMarketStatus(
  value: unknown,
): MarketStatus {
  switch (value) {
    case "accepted":
      return "accepted";

    case "in-progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
   STATUS CONFIG
============================================================== */

export function getMarketStatusConfig(
  status: MarketStatus,
): MarketStatusConfig {
  switch (status) {
    case "accepted":
      return {
        label: "ACCEPTED",
        color: "#2563EB",
        background: "#EFF6FF",
        messageBackground: "#EFF6FF",
        icon: "checkmark-circle-outline",
        message:
          "The seller has accepted your order.",
      };

    case "in-progress":
      return {
        label: "ON THE WAY",
        color: "#16A34A",
        background: "#ECFDF5",
        messageBackground: "#ECFDF5",
        icon: "navigate-outline",
        message:
          "Your order is on the way. You can track it in real time.",
      };

    case "completed":
      return {
        label: "COMPLETED",
        color: "#16A34A",
        background: "#ECFDF5",
        messageBackground: "#ECFDF5",
        icon: "checkmark-done-outline",
        message:
          "Your order has been delivered successfully.",
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        color: "#DC2626",
        background: "#FEF2F2",
        messageBackground: "#FEF2F2",
        icon: "close-circle-outline",
        message:
          "This order has been cancelled.",
      };

    case "expired":
      return {
        label: "EXPIRED",
        color: "#64748B",
        background: "#F1F5F9",
        messageBackground: "#F1F5F9",
        icon: "time-outline",
        message:
          "This order has expired.",
      };

    case "pending":
    default:
      return {
        label: "PENDING",
        color: "#D97706",
        background: "#FFF7E8",
        messageBackground: "#FFF7E8",
        icon: "time-outline",
        message:
          "We are waiting for the seller to accept your order.",
      };
  }
}

/* ==============================================================
   STATUS INDEX
============================================================== */

export function getMarketStatusIndex(
  status: MarketStatus,
): number {
  switch (status) {
    case "accepted":
      return 1;

    case "in-progress":
      return 2;

    case "completed":
      return 3;

    case "cancelled":
    case "expired":
    case "pending":
    default:
      return 0;
  }
}

/* ==============================================================
   STRING HELPER
============================================================== */

export function getMarketString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value.trim();
    }
  }

  return "";
}

/* ==============================================================
   NUMBER HELPER
============================================================== */

export function getMarketOrderValue(
  value: unknown,
  fallback: number,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return fallback;
}

/* ==============================================================
   PRODUCT NORMALIZER
============================================================== */

export function getMarketProducts(
  value: unknown,
): MarketProduct[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): MarketProduct | null => {
      if (
        typeof item !== "object" ||
        item === null
      ) {
        return null;
      }

      const data =
        item as Record<
          string,
          unknown
        >;

      const productId =
        getMarketString(
          data.productId,
          data.id,
        );

      const name =
        getMarketString(
          data.name,
          data.productName,
          "Product",
        );

      const image =
        getMarketString(
          data.image,
          data.imageUrl,
          data.photo,
        );

      const price =
        getMarketOrderValue(
          data.price,
          0,
        );

      const quantity =
        getMarketOrderValue(
          data.quantity,
          1,
        );

      return {
        productId:
          productId ||
          `product-${Math.random()
            .toString(36)
            .slice(2)}`,

        name,

        ...(image
          ? {
              image,
            }
          : {}),

        price,

        quantity:
          Math.max(
            1,
            Math.floor(
              quantity,
            ),
          ),
      };
    })
    .filter(
      (
        item,
      ): item is MarketProduct =>
        item !== null,
    );
}

/* ==============================================================
   SUBTOTAL
============================================================== */

export function calculateMarketSubtotal(
  products: MarketProduct[],
): number {
  return products.reduce(
    (
      total,
      product,
    ) =>
      total +
      product.price *
        product.quantity,
    0,
  );
}

/* ==============================================================
   FIRST PRODUCT NAME
============================================================== */

export function getFirstMarketProductName(
  products: MarketProduct[],
): string {
  return (
    products[0]?.name ??
    "Market Order"
  );
}

/* ==============================================================
   FIRST PRODUCT IMAGE
============================================================== */

export function getFirstMarketProductImage(
  products: MarketProduct[],
): string | null {
  const image =
    products[0]?.image;

  if (
    typeof image === "string" &&
    image.trim()
  ) {
    return image.trim();
  }

  return null;
}

/* ==============================================================
   PAYMENT METHOD
============================================================== */

export function formatMarketPaymentMethod(
  value: string,
): string {
  switch (
    value
      .toLowerCase()
      .trim()
  ) {
    case "card":
      return "Card Payment";

    case "transfer":
    case "bank_transfer":
      return "Bank Transfer";

    case "cash":
    case "cod":
    default:
      return "Pay on Delivery";
  }
}

/* ==============================================================
   PAYMENT ICON
============================================================== */

export function getMarketPaymentIcon(
  value: string,
): keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap {
  switch (
    value
      .toLowerCase()
      .trim()
  ) {
    case "card":
      return "card-outline";

    case "transfer":
    case "bank_transfer":
      return "business-outline";

    case "cash":
    case "cod":
    default:
      return "cash-outline";
  }
}

/* ==============================================================
   PAYMENT STATUS
============================================================== */

export function normalizeMarketPaymentStatus(
  value: unknown,
): "pending" | "paid" | "failed" | "refunded" {
  switch (
    String(value ?? "")
      .toLowerCase()
      .trim()
  ) {
    case "paid":
    case "success":
    case "successful":
      return "paid";

    case "failed":
      return "failed";

    case "refunded":
      return "refunded";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
   DATE VALUE
============================================================== */

export function getMarketDate(
  value: unknown,
): Date | null {
  if (!value) {
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
      typeof value === "object" &&
      value !== null &&
      "toMillis" in value &&
      typeof (
        value as {
          toMillis?: unknown;
        }
      ).toMillis === "function"
    ) {
      const millis = (
        value as {
          toMillis: () => number;
        }
      ).toMillis();

      const date =
        new Date(millis);

      return Number.isNaN(
        date.getTime(),
      )
        ? null
        : date;
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
  } catch (error) {
    console.error(
      "MARKET_DATE_PARSE_ERROR:",
      error,
    );
  }

  return null;
}

/* ==============================================================
   DATE FORMAT
============================================================== */

export function formatMarketDate(
  value: unknown,
): string {
  const date =
    getMarketDate(value);

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

/* ==============================================================
   DATE + TIME FORMAT
============================================================== */

export function formatMarketDateTime(
  value: unknown,
): string {
  const date =
    getMarketDate(value);

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

/* ==============================================================
   ORDER NUMBER
============================================================== */

export function formatMarketOrderNumber(
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
   TRACKING
============================================================== */

export function canTrackMarketOrder(
  status: MarketStatus,
): boolean {
  return (
    status === "accepted" ||
    status === "in-progress"
  );
}

/* ==============================================================
   CANCELLATION
============================================================== */

export function canCancelMarketOrder(
  status: MarketStatus,
): boolean {
  return status === "pending";
}

/* ==============================================================
   ACTIONS
============================================================== */

export type MarketOrderActionState = {
  canCancel: boolean;
  canTrack: boolean;
  canCallStore: boolean;
  canChatStore: boolean;
};

export function getMarketOrderActions(
  status: MarketStatus,
  storePhone?: string,
): MarketOrderActionState {
  return {
    canCancel:
      canCancelMarketOrder(
        status,
      ),

    canTrack:
      canTrackMarketOrder(
        status,
      ),

    canCallStore:
      Boolean(
        storePhone?.trim(),
      ),

    canChatStore: true,
  };
}