/* ============================================================
   FIXXAM ACTIVITY CALCULATION
   ------------------------------------------------------------
   Sources:
     1. Service bookings
     2. Market orders

   SERVICE AMOUNT PRIORITY:
     agreedPrice
       -> amount
       -> price

   IMPORTANT:
     offerAmount is NEVER used.

   MARKET AMOUNT PRIORITY:
     productAmount
       -> products[].unitPrice × quantity
       -> subtotal - discountTotal

   DELIVERY FEE:
     NEVER included.

   SERVICE DATE:
     completedAt
       -> offerAcceptedAt
       -> createdAt

   MARKET DATE:
     deliveredAt
       -> completedAt
       -> acceptedAt
       -> createdAt

   FAILED DATE:
     createdAt

   PERIOD:
     7D / 30D / 90D
============================================================ */

/* ============================================================
   TYPES
============================================================ */

export type FixxamActivityPeriod =
  | "7D"
  | "30D"
  | "90D";

export type FixxamDateValue =
  | Date
  | number
  | string
  | {
      toDate?: () => Date;
      seconds?: number;
      nanoseconds?: number;
    }
  | null
  | undefined;

/* ============================================================
   SERVICE STATUS
============================================================ */

export type FixxamBookingStatus =
  | "pending"
  | "pending_estimate"
  | "accepted"
  | "worker_on_the_way"
  | "on_the_way"
  | "in_progress"
  | "in-progress"
  | "awaiting_cash"
  | "payment_pending_confirmation"
  | "completed"
  | "cancelled"
  | "failed"
  | "expired"
  | string;

/* ============================================================
   SERVICE BOOKING
============================================================ */

export type FixxamBooking = {
  id: string;

  status?: FixxamBookingStatus;

  agreedPrice?: number | null;

  amount?: number | null;

  price?: number | null;

  offerAmount?: number | null;

  createdAt?: FixxamDateValue;

  offerAcceptedAt?: FixxamDateValue;

  offerRespondedAt?: FixxamDateValue;

  completedAt?: FixxamDateValue;
};

/* ============================================================
   MARKET PRODUCT
============================================================ */

export type FixxamMarketProduct = {
  productId?: string | null;

  name?: string | null;

  price?: number | null;

  unitPrice?: number | null;

  quantity?: number | null;

  discountedPrice?: number | null;
};

/* ============================================================
   MARKET STATUS
============================================================ */

export type FixxamMarketOrderStatus =
  | "pending"
  | "accepted"
  | "processing"
  | "in-progress"
  | "ready"
  | "completed"
  | "delivered"
  | "cancelled"
  | "failed"
  | "expired"
  | string;

/* ============================================================
   MARKET ORDER
============================================================ */

export type FixxamMarketOrder = {
  id: string;

  status?: FixxamMarketOrderStatus;

  productAmount?: number | null;

  subtotal?: number | null;

  discountTotal?: number | null;

  deliveryFee?: number | null;

  total?: number | null;

  products?: FixxamMarketProduct[];

  createdAt?: FixxamDateValue;

  acceptedAt?: FixxamDateValue;

  completedAt?: FixxamDateValue;

  deliveredAt?: FixxamDateValue;
};

/* ============================================================
   ACTIVITY POINT
============================================================ */

export type FixxamActivityPoint = {
  label: string;

  value: number;

  transactions: number;
};

/* ============================================================
   ACTIVITY RESULT
============================================================ */

export type FixxamActivityResult = {
  period: FixxamActivityPeriod;

  volume: number;

  transactions: number;

  successfulTransactions: number;

  failedTransactions: number;

  successRate: number;

  growth: number;

  chartData: FixxamActivityPoint[];
};

/* ============================================================
   CONSTANTS
============================================================ */

const PERIOD_DAYS: Record<
  FixxamActivityPeriod,
  number
> = {
  "7D": 7,
  "30D": 30,
  "90D": 90,
};

/* ============================================================
   STATUS SETS
============================================================ */

const SERVICE_SUCCESSFUL_STATUSES =
  new Set<string>([
    "accepted",
    "worker_on_the_way",
    "on_the_way",
    "in_progress",
    "in-progress",
    "awaiting_cash",
    "payment_pending_confirmation",
    "completed",
  ]);

const MARKET_SUCCESSFUL_STATUSES =
  new Set<string>([
    "accepted",
    "processing",
    "in-progress",
    "ready",
    "completed",
    "delivered",
  ]);

const FAILED_STATUSES =
  new Set<string>([
    "cancelled",
    "failed",
    "expired",
  ]);

/* ============================================================
   DEBUG
============================================================ */

const ACTIVITY_DEBUG =
  typeof __DEV__ !== "undefined" &&
  __DEV__ === true;

function activityLog(
  ...args: unknown[]
): void {
  if (!ACTIVITY_DEBUG) {
    return;
  }

  console.log(
    "[FIXXAM_ACTIVITY]",
    ...args,
  );
}

function activityWarn(
  ...args: unknown[]
): void {
  if (!ACTIVITY_DEBUG) {
    return;
  }

  console.warn(
    "[FIXXAM_ACTIVITY]",
    ...args,
  );
}

/* ============================================================
   NORMALIZE STATUS
============================================================ */

function normalizeStatus(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase();
}

/* ============================================================
   NORMALIZE AMOUNT
============================================================ */

function normalizeAmount(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  ) {
    return value;
  }

  /*
   * Supports numeric strings safely.
   *
   * Useful if old Firestore documents
   * contain values such as "1500".
   */
  if (
    typeof value === "string"
  ) {
    const parsed =
      Number(
        value.trim(),
      );

    if (
      Number.isFinite(parsed) &&
      parsed > 0
    ) {
      return parsed;
    }
  }

  return 0;
}

/* ============================================================
   DATE CONVERTER
============================================================ */

function toDate(
  value: FixxamDateValue,
): Date | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  /* ----------------------------------------------------------
     DATE
  ---------------------------------------------------------- */

  if (
    value instanceof Date
  ) {
    return Number.isNaN(
      value.getTime(),
    )
      ? null
      : value;
  }

  /* ----------------------------------------------------------
     NUMBER
  ---------------------------------------------------------- */

  if (
    typeof value === "number"
  ) {
    if (
      !Number.isFinite(value)
    ) {
      return null;
    }

    /*
     * Firestore timestamps represented
     * as seconds are commonly ~10 digits.
     *
     * Milliseconds are ~13 digits.
     */
    const milliseconds =
      value < 10_000_000_000
        ? value * 1000
        : value;

    const date =
      new Date(
        milliseconds,
      );

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
  }

  /* ----------------------------------------------------------
     STRING
  ---------------------------------------------------------- */

  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return null;
    }

    const numeric =
      Number(trimmed);

    if (
      Number.isFinite(numeric)
    ) {
      return toDate(numeric);
    }

    const date =
      new Date(trimmed);

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
  }

  /* ----------------------------------------------------------
     FIRESTORE TIMESTAMP
  ---------------------------------------------------------- */

  if (
    typeof value === "object" &&
    value !== null
  ) {
    /*
     * IMPORTANT:
     *
     * Do NOT detach Timestamp.toDate()
     * from its original object.
     *
     * The previous implementation could
     * lose `this` binding.
     */

    if (
      typeof value.toDate ===
      "function"
    ) {
      try {
        const date =
          value.toDate();

        if (
          date instanceof Date &&
          !Number.isNaN(
            date.getTime(),
          )
        ) {
          return date;
        }
      } catch (error) {
        activityWarn(
          "TIMESTAMP_TO_DATE_FAILED",
          error,
        );
      }
    }

    /* --------------------------------------------------------
       seconds / nanoseconds
    -------------------------------------------------------- */

    const seconds =
      value.seconds;

    const nanoseconds =
      value.nanoseconds;

    if (
      typeof seconds ===
        "number" &&
      Number.isFinite(
        seconds,
      )
    ) {
      const milliseconds =
        seconds * 1000 +
        (typeof nanoseconds ===
          "number" &&
        Number.isFinite(
          nanoseconds,
        )
          ? nanoseconds /
            1_000_000
          : 0);

      const date =
        new Date(
          milliseconds,
        );

      return Number.isNaN(
        date.getTime(),
      )
        ? null
        : date;
    }
  }

  return null;
}

/* ============================================================
   STATUS HELPERS
============================================================ */

function isServiceSuccessful(
  status: unknown,
): boolean {
  return SERVICE_SUCCESSFUL_STATUSES.has(
    normalizeStatus(status),
  );
}

function isMarketSuccessful(
  status: unknown,
): boolean {
  return MARKET_SUCCESSFUL_STATUSES.has(
    normalizeStatus(status),
  );
}

function isFailed(
  status: unknown,
): boolean {
  return FAILED_STATUSES.has(
    normalizeStatus(status),
  );
}

/* ============================================================
   SERVICE AMOUNT
============================================================ */

function getServiceAmount(
  booking: FixxamBooking,
): number {
  const agreedPrice =
    normalizeAmount(
      booking.agreedPrice,
    );

  if (
    agreedPrice > 0
  ) {
    return agreedPrice;
  }

  const amount =
    normalizeAmount(
      booking.amount,
    );

  if (
    amount > 0
  ) {
    return amount;
  }

  const price =
    normalizeAmount(
      booking.price,
    );

  if (
    price > 0
  ) {
    return price;
  }

  return 0;
}

/* ============================================================
   SERVICE DATE
============================================================ */

function getServiceTransactionDate(
  booking: FixxamBooking,
): Date | null {
  const status =
    normalizeStatus(
      booking.status,
    );

  if (
    status === "completed"
  ) {
    return (
      toDate(
        booking.completedAt,
      ) ??
      toDate(
        booking.offerAcceptedAt,
      ) ??
      toDate(
        booking.createdAt,
      )
    );
  }

  if (
    isServiceSuccessful(
      status,
    )
  ) {
    return (
      toDate(
        booking.offerAcceptedAt,
      ) ??
      toDate(
        booking.createdAt,
      )
    );
  }

  if (
    isFailed(status)
  ) {
    return toDate(
      booking.createdAt,
    );
  }

  return null;
}

/* ============================================================
   MARKET PRODUCTS
============================================================ */

function calculateProductAmountFromProducts(
  products:
    | FixxamMarketProduct[]
    | undefined,
): number {
  if (
    !Array.isArray(products)
  ) {
    return 0;
  }

  return products.reduce(
    (
      total,
      product,
    ) => {
      const unitPrice =
        normalizeAmount(
          product.unitPrice,
        );

      const quantity =
        normalizeAmount(
          product.quantity,
        );

      if (
        unitPrice <= 0 ||
        quantity <= 0
      ) {
        return total;
      }

      return (
        total +
        unitPrice *
          quantity
      );
    },
    0,
  );
}

/* ============================================================
   MARKET AMOUNT
============================================================ */

function getMarketProductAmount(
  order: FixxamMarketOrder,
): number {
  const productAmount =
    normalizeAmount(
      order.productAmount,
    );

  if (
    productAmount > 0
  ) {
    return productAmount;
  }

  const calculatedProducts =
    calculateProductAmountFromProducts(
      order.products,
    );

  if (
    calculatedProducts > 0
  ) {
    return calculatedProducts;
  }

  const subtotal =
    normalizeAmount(
      order.subtotal,
    );

  if (
    subtotal <= 0
  ) {
    return 0;
  }

  const discount =
    normalizeAmount(
      order.discountTotal,
    );

  return Math.max(
    0,
    subtotal - discount,
  );
}

/* ============================================================
   MARKET DATE
============================================================ */

function getMarketTransactionDate(
  order: FixxamMarketOrder,
): Date | null {
  const status =
    normalizeStatus(
      order.status,
    );

  if (
    status === "delivered"
  ) {
    return (
      toDate(
        order.deliveredAt,
      ) ??
      toDate(
        order.completedAt,
      ) ??
      toDate(
        order.acceptedAt,
      ) ??
      toDate(
        order.createdAt,
      )
    );
  }

  if (
    status === "completed"
  ) {
    return (
      toDate(
        order.completedAt,
      ) ??
      toDate(
        order.deliveredAt,
      ) ??
      toDate(
        order.acceptedAt,
      ) ??
      toDate(
        order.createdAt,
      )
    );
  }

  if (
    isMarketSuccessful(
      status,
    )
  ) {
    return (
      toDate(
        order.acceptedAt,
      ) ??
      toDate(
        order.createdAt,
      )
    );
  }

  if (
    isFailed(status)
  ) {
    return toDate(
      order.createdAt,
    );
  }

  return null;
}

/* ============================================================
   PERIOD START
============================================================ */

function getPeriodStart(
  now: Date,
  days: number,
): Date {
  const start =
    new Date(now);

  start.setDate(
    start.getDate() -
      (days - 1),
  );

  start.setHours(
    0,
    0,
    0,
    0,
  );

  return start;
}

/* ============================================================
   PERIOD END
============================================================ */

function getPeriodEnd(
  now: Date,
): Date {
  const end =
    new Date(now);

  end.setHours(
    23,
    59,
    59,
    999,
  );

  return end;
}

/* ============================================================
   DATE RANGE
============================================================ */

function isDateInRange(
  date: Date | null,
  start: Date,
  end: Date,
): boolean {
  if (!date) {
    return false;
  }

  const timestamp =
    date.getTime();

  return (
    timestamp >=
      start.getTime() &&
    timestamp <=
      end.getTime()
  );
}

/* ============================================================
   CHART LABEL
============================================================ */

function getChartLabel(
  date: Date,
  period: FixxamActivityPeriod,
): string {
  if (
    period === "7D"
  ) {
    return date.toLocaleDateString(
      "en-NG",
      {
        weekday: "short",
      },
    );
  }

  if (
    period === "30D"
  ) {
    return date.toLocaleDateString(
      "en-NG",
      {
        day: "numeric",
      },
    );
  }

  return date.toLocaleDateString(
    "en-NG",
    {
      month: "short",
      day: "numeric",
    },
  );
}

/* ============================================================
   CHART GROUP SIZE
============================================================ */

function getChartGroupSize(
  period: FixxamActivityPeriod,
): number {
  switch (period) {
    case "7D":
      return 1;

    case "30D":
      return 3;

    case "90D":
      return 7;

    default:
      return 1;
  }
}

/* ============================================================
   BUILD CHART DATA
============================================================ */

function buildChartData(
  bookings: FixxamBooking[],
  marketOrders: FixxamMarketOrder[],
  period: FixxamActivityPeriod,
  start: Date,
): FixxamActivityPoint[] {
  const days =
    PERIOD_DAYS[period];

  const groupSize =
    getChartGroupSize(
      period,
    );

  const points: FixxamActivityPoint[] =
    [];

  for (
    let offset = 0;
    offset < days;
    offset += groupSize
  ) {
    const groupStart =
      new Date(start);

    groupStart.setDate(
      start.getDate() +
        offset,
    );

    groupStart.setHours(
      0,
      0,
      0,
      0,
    );

    const actualGroupDays =
      Math.min(
        groupSize,
        days - offset,
      );

    const groupEnd =
      new Date(groupStart);

    groupEnd.setDate(
      groupEnd.getDate() +
        actualGroupDays -
        1,
    );

    groupEnd.setHours(
      23,
      59,
      59,
      999,
    );

    let value = 0;

    let transactions = 0;

    /* ========================================================
       SERVICES
    ======================================================== */

    for (
      const booking of bookings
    ) {
      if (
        !isServiceSuccessful(
          booking.status,
        )
      ) {
        continue;
      }

      const date =
        getServiceTransactionDate(
          booking,
        );

      if (
        !isDateInRange(
          date,
          groupStart,
          groupEnd,
        )
      ) {
        continue;
      }

      const amount =
        getServiceAmount(
          booking,
        );

      if (
        amount <= 0
      ) {
        continue;
      }

      value += amount;

      transactions += 1;
    }

    /* ========================================================
       MARKET
    ======================================================== */

    for (
      const order of marketOrders
    ) {
      if (
        !isMarketSuccessful(
          order.status,
        )
      ) {
        continue;
      }

      const date =
        getMarketTransactionDate(
          order,
        );

      if (
        !isDateInRange(
          date,
          groupStart,
          groupEnd,
        )
      ) {
        continue;
      }

      const amount =
        getMarketProductAmount(
          order,
        );

      if (
        amount <= 0
      ) {
        continue;
      }

      value += amount;

      transactions += 1;
    }

    points.push({
      label:
        getChartLabel(
          groupStart,
          period,
        ),

      value,

      transactions,
    });
  }

  return points;
}

/* ============================================================
   PERIOD CALCULATION
============================================================ */

type PeriodCalculation = {
  volume: number;

  transactions: number;

  successfulTransactions: number;

  failedTransactions: number;

  successRate: number;

  chartData: FixxamActivityPoint[];
};

function calculatePeriod(
  bookings: FixxamBooking[],
  marketOrders: FixxamMarketOrder[],
  period: FixxamActivityPeriod,
  now: Date,
): PeriodCalculation {
  const days =
    PERIOD_DAYS[period];

  const start =
    getPeriodStart(
      now,
      days,
    );

  const end =
    getPeriodEnd(now);

  let volume = 0;

  let successfulTransactions =
    0;

  let failedTransactions =
    0;

  /* ==========================================================
     SERVICES
  ========================================================== */

  for (
    const booking of bookings
  ) {
    const status =
      normalizeStatus(
        booking.status,
      );

    const date =
      getServiceTransactionDate(
        booking,
      );

    if (
      !isDateInRange(
        date,
        start,
        end,
      )
    ) {
      continue;
    }

    if (
      isServiceSuccessful(
        status,
      )
    ) {
      const amount =
        getServiceAmount(
          booking,
        );

      if (
        amount > 0
      ) {
        volume += amount;

        successfulTransactions +=
          1;

        activityLog(
          "SERVICE COUNTED",
          {
            id:
              booking.id,
            status,
            amount,
            date:
              date?.toISOString(),
          },
        );
      } else {
        activityWarn(
          "SERVICE SKIPPED - NO AMOUNT",
          {
            id:
              booking.id,
            status,
            agreedPrice:
              booking.agreedPrice,
            amount:
              booking.amount,
            price:
              booking.price,
          },
        );
      }

      continue;
    }

    if (
      isFailed(status)
    ) {
      failedTransactions +=
        1;
    }
  }

  /* ==========================================================
     MARKET
  ========================================================== */

  for (
    const order of marketOrders
  ) {
    const status =
      normalizeStatus(
        order.status,
      );

    const date =
      getMarketTransactionDate(
        order,
      );

    if (
      !isDateInRange(
        date,
        start,
        end,
      )
    ) {
      continue;
    }

    if (
      isMarketSuccessful(
        status,
      )
    ) {
      const amount =
        getMarketProductAmount(
          order,
        );

      if (
        amount > 0
      ) {
        volume += amount;

        successfulTransactions +=
          1;

        activityLog(
          "ORDER COUNTED",
          {
            id:
              order.id,
            status,
            amount,
            date:
              date?.toISOString(),
            productAmount:
              order.productAmount,
            subtotal:
              order.subtotal,
          },
        );
      } else {
        activityWarn(
          "ORDER SKIPPED - NO AMOUNT",
          {
            id:
              order.id,
            status,
            productAmount:
              order.productAmount,
            subtotal:
              order.subtotal,
            discountTotal:
              order.discountTotal,
          },
        );
      }

      continue;
    }

    if (
      isFailed(status)
    ) {
      failedTransactions +=
        1;
    }
  }

  const decidedTransactions =
    successfulTransactions +
    failedTransactions;

  const rawSuccessRate =
    decidedTransactions > 0
      ? (
          successfulTransactions /
          decidedTransactions
        ) *
        100
      : 0;

  const successRate =
    Number.isFinite(
      rawSuccessRate,
    )
      ? Math.min(
          100,
          Math.max(
            0,
            rawSuccessRate,
          ),
        )
      : 0;

  const chartData =
    buildChartData(
      bookings,
      marketOrders,
      period,
      start,
    );

  activityLog(
    "PERIOD RESULT",
    {
      period,
      start:
        start.toISOString(),
      end:
        end.toISOString(),
      volume,
      successfulTransactions,
      failedTransactions,
      successRate,
    },
  );

  return {
    volume,

    transactions:
      successfulTransactions,

    successfulTransactions,

    failedTransactions,

    successRate,

    chartData,
  };
}

/* ============================================================
   MAIN
============================================================ */

export function calculateFixxamActivity(
  bookings: FixxamBooking[] = [],
  marketOrders: FixxamMarketOrder[] = [],
  period: FixxamActivityPeriod =
    "30D",
  now: Date = new Date(),
): FixxamActivityResult {
  const safeBookings =
    Array.isArray(bookings)
      ? bookings
      : [];

  const safeMarketOrders =
    Array.isArray(
      marketOrders,
    )
      ? marketOrders
      : [];

  activityLog(
    "CALCULATION START",
    {
      bookings:
        safeBookings.length,
      orders:
        safeMarketOrders.length,
      period,
      now:
        now.toISOString(),
    },
  );

  /* ==========================================================
     CURRENT
  ========================================================== */

  const current =
    calculatePeriod(
      safeBookings,
      safeMarketOrders,
      period,
      now,
    );

  /* ==========================================================
     PREVIOUS PERIOD
  ========================================================== */

  const previousNow =
    new Date(now);

  previousNow.setDate(
    previousNow.getDate() -
      PERIOD_DAYS[period],
  );

  const previous =
    calculatePeriod(
      safeBookings,
      safeMarketOrders,
      period,
      previousNow,
    );

  /* ==========================================================
     GROWTH
  ========================================================== */

  let growth = 0;

  if (
    previous.volume > 0
  ) {
    growth =
      (
        (
          current.volume -
          previous.volume
        ) /
        previous.volume
      ) *
      100;
  } else if (
    current.volume > 0
  ) {
    growth = 100;
  }

  if (
    !Number.isFinite(growth)
  ) {
    growth = 0;
  }

  const result: FixxamActivityResult =
    {
      period,

      volume:
        current.volume,

      transactions:
        current.transactions,

      successfulTransactions:
        current.successfulTransactions,

      failedTransactions:
        current.failedTransactions,

      successRate:
        current.successRate,

      growth,

      chartData:
        current.chartData,
    };

  activityLog(
    "FINAL ACTIVITY RESULT",
    result,
  );

  if (
    result.volume === 0
  ) {
    activityWarn(
      "ACTIVITY VOLUME IS ZERO",
      {
        bookingCount:
          safeBookings.length,

        orderCount:
          safeMarketOrders.length,

        message:
          "Check transaction dates, statuses and service amount fields.",
      },
    );
  }

  return result;
}

/* ============================================================
   OPTIONAL EXPORTS FOR TESTING
============================================================ */

export const __fixxamActivityTestUtils = {
  toDate,

  normalizeAmount,

  normalizeStatus,

  getServiceAmount,

  getServiceTransactionDate,

  getMarketProductAmount,

  getMarketTransactionDate,

  getPeriodStart,

  getPeriodEnd,
};