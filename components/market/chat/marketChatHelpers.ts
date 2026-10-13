/* ============================================================
   TYPES
============================================================ */

export type OrderItem = {
  id: string;

  name: string;

  image?: string;

  price: number;

  quantity: number;
};

export type MarketChatSenderRole =
  | "customer"
  | "worker";

/* ============================================================
   PARAMS
============================================================ */

export function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

/* ============================================================
   STRING
============================================================ */

export function getString(
  ...values: unknown[]
): string {
  for (
    const value of values
  ) {
    if (
      typeof value ===
      "string"
    ) {
      const normalized =
        value.trim();

      if (
        normalized
      ) {
        return normalized;
      }
    }

    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return String(
        value,
      );
    }
  }

  return "";
}

/* ============================================================
   NUMBER
============================================================ */

export function getNumber(
  ...values: unknown[]
): number {
  for (
    const value of values
  ) {
    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return Math.max(
        0,
        value,
      );
    }

    if (
      typeof value ===
      "string"
    ) {
      const normalized =
        value.trim();

      if (
        !normalized
      ) {
        continue;
      }

      const parsed =
        Number(
          normalized,
        );

      if (
        Number.isFinite(
          parsed,
        )
      ) {
        return Math.max(
          0,
          parsed,
        );
      }
    }
  }

  return 0;
}

/* ============================================================
   ORDER ITEMS
============================================================ */

export function normalizeOrderItems(
  value: unknown,
): OrderItem[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .map(
      (
        item,
        index,
      ): OrderItem | null => {
        if (
          typeof item !==
            "object" ||
          item === null
        ) {
          return null;
        }

        const data =
          item as Record<
            string,
            unknown
          >;

        /* ====================================================
           NAME
        ==================================================== */

        const name =
          getString(
            data.name,
            data.productName,
            data.title,
          ) ||
          "Product";

        /* ====================================================
           QUANTITY
        ==================================================== */

        const rawQuantity =
          getNumber(
            data.quantity,
            data.qty,
            1,
          );

        const quantity =
          Math.max(
            1,
            Math.floor(
              rawQuantity,
            ),
          );

        /* ====================================================
           PRICE
        ==================================================== */

        const price =
          getNumber(
            data.price,
            data.unitPrice,
            data.amount,
          );

        /* ====================================================
           IMAGE
        ==================================================== */

        const image =
          getString(
            data.image,
            data.imageUrl,
            data.photo,
            data.photoUrl,
          );

        /* ====================================================
           ID
        ==================================================== */

        const sourceId =
          getString(
            data.id,
            data.productId,
          );

        /*
         * Include the array index so React keys stay unique
         * when the same product appears more than once.
         */
        const id =
          sourceId
            ? `${sourceId}-${index}`
            : `item-${index}`;

        return {
          id,

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
      ): item is OrderItem =>
        item !== null,
    );
}

/* ============================================================
   SENDER ROLE
============================================================ */

export function normalizeSenderRole(
  value: unknown,
): MarketChatSenderRole {
  if (
    typeof value ===
    "string"
  ) {
    const role =
      value
        .trim()
        .toLowerCase();

    if (
      role ===
        "worker" ||
      role ===
        "seller"
    ) {
      return "worker";
    }

    if (
      role ===
      "customer"
    ) {
      return "customer";
    }
  }

  /*
   * Preserve compatibility with older
   * messages that have no senderRole.
   */
  return "customer";
}

/* ============================================================
   TIMESTAMP
============================================================ */

export function getTimestampMillis(
  value: unknown,
): number {
  if (
    value == null
  ) {
    return 0;
  }

  try {
    if (
      typeof value ===
      "object"
    ) {
      const timestamp =
        value as {
          toMillis?: unknown;

          toDate?: unknown;
        };

      /* ======================================================
         FIRESTORE TIMESTAMP — toMillis
      ====================================================== */

      if (
        typeof timestamp.toMillis ===
        "function"
      ) {
        const millis =
          (
            timestamp.toMillis as
              () => number
          )();

        return Number.isFinite(
          millis,
        )
          ? millis
          : 0;
      }

      /* ======================================================
         FIRESTORE TIMESTAMP — toDate
      ====================================================== */

      if (
        typeof timestamp.toDate ===
        "function"
      ) {
        const date =
          (
            timestamp.toDate as
              () => Date
          )();

        if (
          date instanceof
          Date
        ) {
          const millis =
            date.getTime();

          return Number.isFinite(
            millis,
          )
            ? millis
            : 0;
        }
      }
    }

    /* ========================================================
       DATE
    ======================================================== */

    if (
      value instanceof Date
    ) {
      const millis =
        value.getTime();

      return Number.isFinite(
        millis,
      )
        ? millis
        : 0;
    }

    /* ========================================================
       NUMBER
    ======================================================== */

    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return Math.max(
        0,
        value,
      );
    }

    /* ========================================================
       STRING DATE
    ======================================================== */

    if (
      typeof value ===
      "string"
    ) {
      const normalized =
        value.trim();

      if (
        !normalized
      ) {
        return 0;
      }

      const millis =
        Date.parse(
          normalized,
        );

      return Number.isFinite(
        millis,
      )
        ? millis
        : 0;
    }
  } catch (
    timestampError
  ) {
    console.error(
      "FIXXAM_MARKET_CHAT_TIMESTAMP_ERROR:",
      timestampError,
    );
  }

  return 0;
}

/* ============================================================
   TIME FORMAT
============================================================ */

export function formatTime(
  timestamp: number,
): string {
  if (
    !Number.isFinite(
      timestamp,
    ) ||
    timestamp <= 0
  ) {
    return "";
  }

  const date =
    new Date(
      timestamp,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-NG",
    {
      hour:
        "numeric",

      minute:
        "2-digit",
    },
  );
}

/* ============================================================
   MONEY
============================================================ */

export function formatMoney(
  value: number,
): string {
  const safeValue =
    Number.isFinite(
      value,
    )
      ? Math.max(
          0,
          value,
        )
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits:
        2,
    },
  )}`;
}

/* ============================================================
   ORDER ID
============================================================ */

export function shortOrderId(
  value: string,
): string {
  const normalized =
    typeof value ===
    "string"
      ? value.trim()
      : "";

  if (
    !normalized
  ) {
    return "";
  }

  if (
    normalized.length <=
    10
  ) {
    return normalized;
  }

  return `${normalized.slice(
    0,
    5,
  )}...${normalized.slice(
    -4,
  )}`;
}