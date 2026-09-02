/* ============================================================
   FIXXAM ACTIVITY CALCULATION
============================================================ */

export type FixxamActivityPeriod =
  | "7D"
  | "30D"
  | "90D";

/* ============================================================
   BOOKING INPUT
============================================================ */

export type FixxamBooking = {
  id: string;

  status?: string | null;

  /**
   * Final agreed service price.
   *
   * This is the authoritative amount after
   * negotiation has been completed.
   */
  agreedPrice?: number | null;

  /**
   * Latest offer amount.
   *
   * This must NOT be counted as transaction
   * volume unless the booking is completed
   * and agreedPrice is unavailable.
   */
  offerAmount?: number | null;

  createdAt?:
    | Date
    | number
    | string
    | null;

  updatedAt?:
    | Date
    | number
    | string
    | null;

  /**
   * Time when the current offer was responded to.
   *
   * Kept for compatibility with the booking
   * negotiation model.
   */
  offerRespondedAt?:
    | Date
    | number
    | string
    | null;
};

/* ============================================================
   ACTIVITY POINT
============================================================ */

export type FixxamActivityPoint = {
  label: string;
  value: number;
};

/* ============================================================
   RESULT
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

/**
 * Booking statuses that represent a
 * successfully completed transaction.
 */
const SUCCESS_STATUSES =
  new Set<string>([
    "success",
    "completed",
  ]);

/**
 * Booking statuses that represent
 * a failed/cancelled transaction.
 */
const FAILED_STATUSES =
  new Set<string>([
    "failed",
    "cancelled",
  ]);

/* ============================================================
   DATE TYPES
============================================================ */

type DateValue =
  | Date
  | number
  | string
  | null
  | undefined;

/* ============================================================
   DATE
============================================================ */

function toDate(
  value: DateValue,
): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime(),
    )
      ? null
      : value;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
  }

  if (
    typeof value === "string"
  ) {
    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
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
   NORMALIZE AMOUNT
============================================================ */

function normalizeAmount(
  amount: unknown,
): number {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return 0;
  }

  return amount;
}

/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(
  status: unknown,
): string {
  if (
    typeof status !== "string"
  ) {
    return "";
  }

  return status
    .trim()
    .toLowerCase();
}

function isSuccessful(
  status: unknown,
): boolean {
  return SUCCESS_STATUSES.has(
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
   FINAL TRANSACTION AMOUNT
============================================================ */

/**
 * Only completed/successful bookings should
 * contribute to transaction volume.
 *
 * agreedPrice is authoritative.
 *
 * offerAmount is intentionally NOT used as
 * a replacement for agreedPrice because an
 * offer is not a completed transaction.
 */
function getTransactionAmount(
  booking: FixxamBooking,
): number {
  return normalizeAmount(
    booking.agreedPrice,
  );
}

/* ============================================================
   FILTER PERIOD
============================================================ */

function getBookingsForPeriod(
  bookings: FixxamBooking[],
  start: Date,
  end: Date,
): FixxamBooking[] {
  return bookings.filter(
    (booking) => {
      const date =
        toDate(
          booking.createdAt,
        );

      if (!date) {
        return false;
      }

      return (
        date >= start &&
        date <= end
      );
    },
  );
}

/* ============================================================
   CHART LABEL
============================================================ */

function getChartLabel(
  date: Date,
  period: FixxamActivityPeriod,
): string {
  if (period === "7D") {
    return date.toLocaleDateString(
      "en-NG",
      {
        weekday: "short",
      },
    );
  }

  if (period === "30D") {
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
   BUILD CHART
============================================================ */

function buildChartData(
  bookings: FixxamBooking[],
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

    const groupEnd =
      new Date(groupStart);

    groupEnd.setDate(
      groupEnd.getDate() +
        groupSize -
        1,
    );

    groupEnd.setHours(
      23,
      59,
      59,
      999,
    );

    const value =
      bookings
        .filter(
          (booking) => {
            if (
              !isSuccessful(
                booking.status,
              )
            ) {
              return false;
            }

            const date =
              toDate(
                booking.createdAt,
              );

            if (!date) {
              return false;
            }

            return (
              date >=
                groupStart &&
              date <=
                groupEnd
            );
          },
        )
        .reduce(
          (
            total,
            booking,
          ) =>
            total +
            getTransactionAmount(
              booking,
            ),
          0,
        );

    points.push({
      label:
        getChartLabel(
          groupStart,
          period,
        ),
      value,
    });
  }

  return points;
}

/* ============================================================
   CALCULATE PERIOD
============================================================ */

function calculatePeriod(
  bookings: FixxamBooking[],
  period: FixxamActivityPeriod,
  now: Date,
): {
  volume: number;
  transactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
  chartData: FixxamActivityPoint[];
} {
  const days =
    PERIOD_DAYS[period];

  const start =
    getPeriodStart(
      now,
      days,
    );

  const end =
    getPeriodEnd(now);

  const periodBookings =
    getBookingsForPeriod(
      bookings,
      start,
      end,
    );

  let volume = 0;

  let successfulTransactions = 0;

  let failedTransactions = 0;

  /*
   * IMPORTANT:
   *
   * transactions = only decided transactions
   * success + failed.
   *
   * Pending/accepted/in-progress bookings
   * are not financial transactions yet.
   */

  for (const booking of periodBookings) {
    if (
      isSuccessful(
        booking.status,
      )
    ) {
      successfulTransactions +=
        1;

      volume +=
        getTransactionAmount(
          booking,
        );

      continue;
    }

    if (
      isFailed(
        booking.status,
      )
    ) {
      failedTransactions +=
        1;
    }
  }

  const transactions =
    successfulTransactions +
    failedTransactions;

  const successRate =
    transactions > 0
      ? (successfulTransactions /
          transactions) *
        100
      : 0;

  const chartData =
    buildChartData(
      periodBookings,
      period,
      start,
    );

  return {
    volume,

    transactions,

    successfulTransactions,

    failedTransactions,

    successRate,

    chartData,
  };
}

/* ============================================================
   MAIN CALCULATION
============================================================ */

export function calculateFixxamActivity(
  bookings: FixxamBooking[],
  period: FixxamActivityPeriod = "30D",
  now: Date = new Date(),
): FixxamActivityResult {
  const safeBookings =
    Array.isArray(bookings)
      ? bookings
      : [];

  const current =
    calculatePeriod(
      safeBookings,
      period,
      now,
    );

  /* ==========================================================
     PREVIOUS PERIOD
  ========================================================== */

  const currentStart =
    getPeriodStart(
      now,
      PERIOD_DAYS[period],
    );

  const previousEnd =
    new Date(
      currentStart.getTime() -
        1,
    );

  const previous =
    calculatePeriod(
      safeBookings,
      period,
      previousEnd,
    );

  /* ==========================================================
     GROWTH
  ========================================================== */

  let growth = 0;

  if (
    previous.volume > 0
  ) {
    growth =
      ((current.volume -
        previous.volume) /
        previous.volume) *
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

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
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
}