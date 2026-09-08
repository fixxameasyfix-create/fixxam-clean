import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  CustomerColors,
} from "@/theme";

/* ============================================================
   MARKET STATUS
============================================================ */

export type MarketStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

/* ============================================================
   MARKET PRODUCT
============================================================ */

export type MarketProduct = {
  productId: string;

  name: string;

  image?: string;

  price: number;

  quantity: number;
};

/* ============================================================
   PAYMENT STATUS
============================================================ */

export type MarketPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

/* ============================================================
   STATUS CONFIG
============================================================ */

export type MarketStatusConfig = {
  label: string;

  color: string;

  background: string;

  messageBackground: string;

  icon: AppIconName;

  message: string;
};

/* ============================================================
   NORMALIZE STATUS
============================================================ */

export function normalizeMarketStatus(
  value: unknown,
): MarketStatus {
  if (
    typeof value !== "string"
  ) {
    return "pending";
  }

  const status =
    value
      .trim()
      .toLowerCase();

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

/* ============================================================
   STATUS CONFIG
============================================================ */

export function getMarketStatusConfig(
  status: MarketStatus,
): MarketStatusConfig {
  switch (status) {
    case "accepted":
      return {
        label:
          "ACCEPTED",

        color:
          CustomerColors.primary,

        background:
          CustomerColors.primarySoft,

        messageBackground:
          CustomerColors.primarySoft,

        icon:
          "success",

        message:
          "The seller has accepted your order.",
      };

    case "in-progress":
      return {
        label:
          "ON THE WAY",

        color:
          CustomerColors.primary,

        background:
          CustomerColors.primarySoft,

        messageBackground:
          CustomerColors.primarySoft,

        icon:
          "navigation",

        message:
          "Your order is on the way. You can track it in real time.",
      };

    case "completed":
      return {
        label:
          "COMPLETED",

        color:
          Colors.success,

        background:
          Colors.successSoft,

        messageBackground:
          Colors.successSoft,

        icon:
          "success",

        message:
          "Your order has been delivered successfully.",
      };

    case "cancelled":
      return {
        label:
          "CANCELLED",

        color:
          Colors.error,

        background:
          Colors.errorSoft,

        messageBackground:
          Colors.errorSoft,

        icon:
          "error",

        message:
          "This order has been cancelled.",
      };

    case "expired":
      return {
        label:
          "EXPIRED",

        color:
          Colors.textSecondary,

        background:
          Colors.disabledBackground,

        messageBackground:
          Colors.disabledBackground,

        icon:
          "clock",

        message:
          "This order has expired.",
      };

    case "pending":
    default:
      return {
        label:
          "PENDING",

        color:
          Colors.warning,

        background:
          Colors.warningSoft,

        messageBackground:
          Colors.warningSoft,

        icon:
          "clock",

        message:
          "We are waiting for the seller to accept your order.",
      };
  }
}

/* ============================================================
   STATUS INDEX
============================================================ */

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

    case "pending":
    case "cancelled":
    case "expired":
    default:
      return 0;
  }
}

/* ============================================================
   STRING HELPER
============================================================ */

export function getMarketString(
  ...values: unknown[]
): string {
  for (
    const value of values
  ) {
    if (
      typeof value === "string"
    ) {
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

/* ============================================================
   NUMBER HELPER
============================================================ */

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

  if (
    typeof value === "string"
  ) {
    const normalized =
      value.trim();

    if (normalized) {
      const parsed =
        Number(normalized);

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }
  }

  return fallback;
}

/* ============================================================
   PRODUCT NORMALIZER
============================================================ */

export function getMarketProducts(
  value: unknown,
): MarketProduct[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return value
    .map(
      (
        item,
        index,
      ): MarketProduct | null => {
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
          ) ||
          `product-${index}`;

        const name =
          getMarketString(
            data.name,
            data.productName,
            data.title,
          ) ||
          "Product";

        const image =
          getMarketString(
            data.image,
            data.imageUrl,
            data.photo,
            data.photoUrl,
          );

        const rawPrice =
          getMarketOrderValue(
            data.price,
            getMarketOrderValue(
              data.unitPrice,
              getMarketOrderValue(
                data.amount,
                0,
              ),
            ),
          );

        const price =
          Math.max(
            0,
            rawPrice,
          );

        const rawQuantity =
          getMarketOrderValue(
            data.quantity,
            getMarketOrderValue(
              data.qty,
              1,
            ),
          );

        const quantity =
          Math.max(
            1,
            Math.floor(
              rawQuantity,
            ),
          );

        return {
          productId,

          name,

          ...(image
            ? {
                image,
              }
            : {}),

          price,

          quantity,
        };
      },
    )
    .filter(
      (
        item,
      ): item is MarketProduct =>
        item !== null,
    );
}

/* ============================================================
   SUBTOTAL
============================================================ */

export function calculateMarketSubtotal(
  products: MarketProduct[],
): number {
  return products.reduce(
    (
      total,
      product,
    ) => {
      const price =
        Number.isFinite(
          product.price,
        )
          ? Math.max(
              0,
              product.price,
            )
          : 0;

      const quantity =
        Number.isFinite(
          product.quantity,
        )
          ? Math.max(
              1,
              Math.floor(
                product.quantity,
              ),
            )
          : 1;

      return (
        total +
        price *
          quantity
      );
    },
    0,
  );
}

/* ============================================================
   FIRST PRODUCT NAME
============================================================ */

export function getFirstMarketProductName(
  products: MarketProduct[],
): string {
  const name =
    products[0]?.name?.trim();

  return (
    name ||
    "Market Order"
  );
}

/* ============================================================
   FIRST PRODUCT IMAGE
============================================================ */

export function getFirstMarketProductImage(
  products: MarketProduct[],
): string | null {
  const image =
    products[0]?.image;

  if (
    typeof image === "string"
  ) {
    const normalized =
      image.trim();

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

/* ============================================================
   PAYMENT METHOD
============================================================ */

export function formatMarketPaymentMethod(
  value: string,
): string {
  const method =
    value
      .trim()
      .toLowerCase();

  switch (method) {
    case "card":
      return "Card Payment";

    case "transfer":
    case "bank_transfer":
    case "bank-transfer":
      return "Bank Transfer";

    case "cash":
    case "cod":
    case "cash_on_delivery":
    case "cash-on-delivery":
    default:
      return "Pay on Delivery";
  }
}

/* ============================================================
   PAYMENT ICON
============================================================ */

export function getMarketPaymentIcon(
  value: string,
): AppIconName {
  const method =
    value
      .trim()
      .toLowerCase();

  switch (method) {
    case "card":
      return "payment";

    case "transfer":
    case "bank_transfer":
    case "bank-transfer":
      return "wallet";

    case "cash":
    case "cod":
    case "cash_on_delivery":
    case "cash-on-delivery":
    default:
      return "wallet";
  }
}

/* ============================================================
   PAYMENT STATUS
============================================================ */

export function normalizeMarketPaymentStatus(
  value: unknown,
): MarketPaymentStatus {
  const status =
    String(
      value ?? "",
    )
      .trim()
      .toLowerCase();

  switch (status) {
    case "paid":
    case "success":
    case "successful":
      return "paid";

    case "failed":
    case "failure":
      return "failed";

    case "refunded":
    case "refund":
      return "refunded";

    case "pending":
    default:
      return "pending";
  }
}

/* ============================================================
   DATE VALUE
============================================================ */

export function getMarketDate(
  value: unknown,
): Date | null {
  if (
    value == null
  ) {
    return null;
  }

  try {
    if (
      value instanceof Date
    ) {
      return Number.isFinite(
        value.getTime(),
      )
        ? value
        : null;
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
      const date =
        (
          value as {
            toDate:
              () => Date;
          }
        ).toDate();

      if (
        date instanceof Date &&
        Number.isFinite(
          date.getTime(),
        )
      ) {
        return date;
      }

      return null;
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
      const millis =
        (
          value as {
            toMillis:
              () => number;
          }
        ).toMillis();

      if (
        !Number.isFinite(
          millis,
        )
      ) {
        return null;
      }

      const date =
        new Date(
          millis,
        );

      return Number.isFinite(
        date.getTime(),
      )
        ? date
        : null;
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      const date =
        new Date(
          value,
        );

      return Number.isFinite(
        date.getTime(),
      )
        ? date
        : null;
    }

    if (
      typeof value === "string"
    ) {
      const normalized =
        value.trim();

      if (!normalized) {
        return null;
      }

      const date =
        new Date(
          normalized,
        );

      return Number.isFinite(
        date.getTime(),
      )
        ? date
        : null;
    }
  } catch (
    error
  ) {
    console.error(
      "MARKET_DATE_PARSE_ERROR:",
      error,
    );
  }

  return null;
}

/* ============================================================
   DATE FORMAT
============================================================ */

export function formatMarketDate(
  value: unknown,
): string {
  const date =
    getMarketDate(
      value,
    );

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    },
  );
}

/* ============================================================
   DATE + TIME FORMAT
============================================================ */

export function formatMarketDateTime(
  value: unknown,
): string {
  const date =
    getMarketDate(
      value,
    );

  if (!date) {
    return "Date unavailable";
  }

  return date.toLocaleString(
    "en-NG",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  );
}

/* ============================================================
   ORDER NUMBER
============================================================ */

export function formatMarketOrderNumber(
  id: string,
): string {
  const clean =
    id
      .trim()
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

/* ============================================================
   TRACKING
============================================================ */

export function canTrackMarketOrder(
  status: MarketStatus,
): boolean {
  return (
    status === "accepted" ||
    status === "in-progress"
  );
}

/* ============================================================
   CANCELLATION
============================================================ */

export function canCancelMarketOrder(
  status: MarketStatus,
): boolean {
  return (
    status === "pending"
  );
}

/* ============================================================
   ACTIONS
============================================================ */

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
  const normalizedPhone =
    typeof storePhone ===
      "string"
      ? storePhone.trim()
      : "";

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
      normalizedPhone.length >
      0,

    /*
     * Chat is order-based, therefore a
     * phone number is not required.
     */
    canChatStore:
      true,
  };
}