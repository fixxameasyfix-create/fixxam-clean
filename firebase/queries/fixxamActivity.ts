/* ============================================================
   FIXXAM ACTIVITY QUERY
   ------------------------------------------------------------
   Sources:
     bookings -> Service
     orders   -> Market

   IMPORTANT FIXES:
     1. Preserve Firestore Timestamp.toDate() binding.
     2. Map booking.amount.
     3. Map booking.price.
     4. Map market amounts.
     5. Development diagnostics.
============================================================ */

import {
  collection,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  calculateFixxamActivity,
  type FixxamActivityPeriod,
  type FixxamActivityResult,
  type FixxamBooking,
  type FixxamMarketOrder,
  type FixxamDateValue,
} from "@/utils/fixxam/calculateFixxamActivity";

/* ============================================================
   TYPES
============================================================ */

export type FixxamActivityListener = (
  result: FixxamActivityResult,
) => void;

export type FixxamActivityErrorListener = (
  error: Error,
) => void;

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
   STRING
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   NUMBER
============================================================ */

function normalizeNullableNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  /*
   * Supports legacy numeric strings.
   */
  if (
    typeof value === "string"
  ) {
    const parsed =
      Number(
        value.trim(),
      );

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return null;
}

/* ============================================================
   DATE
============================================================ */

function normalizeDateValue(
  value: unknown,
): FixxamDateValue {
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
    return value;
  }

  /* ----------------------------------------------------------
     NUMBER
  ---------------------------------------------------------- */

  if (
    typeof value === "number"
  ) {
    return value;
  }

  /* ----------------------------------------------------------
     STRING
  ---------------------------------------------------------- */

  if (
    typeof value === "string"
  ) {
    return value;
  }

  /* ----------------------------------------------------------
     FIRESTORE TIMESTAMP
  ---------------------------------------------------------- */

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const timestamp =
      value as {
        toDate?: () => Date;
        seconds?: number;
        nanoseconds?: number;
      };

    /*
     * IMPORTANT:
     *
     * Preserve the original Timestamp object
     * as `this` when calling toDate().
     *
     * The old code did:
     *
     *   return { toDate: data.toDate }
     *
     * which can break Firebase Timestamp methods.
     */

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      try {
        const date =
          timestamp.toDate.call(
            value,
          );

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
          "TIMESTAMP NORMALIZATION FAILED",
          error,
        );
      }
    }

    /* --------------------------------------------------------
       FALLBACK: seconds/nanoseconds
    -------------------------------------------------------- */

    if (
      typeof timestamp.seconds ===
        "number" &&
      Number.isFinite(
        timestamp.seconds,
      )
    ) {
      return {
        seconds:
          timestamp.seconds,

        nanoseconds:
          typeof timestamp.nanoseconds ===
            "number" &&
          Number.isFinite(
            timestamp.nanoseconds,
          )
            ? timestamp.nanoseconds
            : undefined,
      };
    }
  }

  return null;
}

/* ============================================================
   PRODUCT MAPPER
============================================================ */

function mapMarketProduct(
  value: unknown,
): NonNullable<
  FixxamMarketOrder["products"]
>[number] {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return {
      productId: null,
      name: null,
      price: null,
      unitPrice: null,
      quantity: null,
      discountedPrice: null,
    };
  }

  const product =
    value as Record<
      string,
      unknown
    >;

  return {
    productId:
      normalizeString(
        product.productId,
      ) || null,

    name:
      normalizeString(
        product.name,
      ) || null,

    price:
      normalizeNullableNumber(
        product.price,
      ),

    unitPrice:
      normalizeNullableNumber(
        product.unitPrice,
      ),

    quantity:
      normalizeNullableNumber(
        product.quantity,
      ),

    discountedPrice:
      normalizeNullableNumber(
        product.discountedPrice,
      ),
  };
}

/* ============================================================
   BOOKING MAPPER
============================================================ */

function mapBooking(
  snapshotId: string,
  data: DocumentData,
): FixxamBooking {
  return {
    id: snapshotId,

    status:
      typeof data.status ===
      "string"
        ? data.status
        : undefined,

    /* --------------------------------------------------------
       FINAL SERVICE AMOUNT
    -------------------------------------------------------- */

    agreedPrice:
      normalizeNullableNumber(
        data.agreedPrice,
      ),

    /*
     * IMPORTANT:
     *
     * These two fields were missing before.
     *
     * Your Firestore booking documents may use
     * amount or price instead of agreedPrice.
     */

    amount:
      normalizeNullableNumber(
        data.amount,
      ),

    price:
      normalizeNullableNumber(
        data.price,
      ),

    /* --------------------------------------------------------
       NEGOTIATION ONLY
    -------------------------------------------------------- */

    offerAmount:
      normalizeNullableNumber(
        data.offerAmount,
      ),

    /* --------------------------------------------------------
       DATES
    -------------------------------------------------------- */

    createdAt:
      normalizeDateValue(
        data.createdAt,
      ),

    offerAcceptedAt:
      normalizeDateValue(
        data.offerAcceptedAt,
      ),

    offerRespondedAt:
      normalizeDateValue(
        data.offerRespondedAt,
      ),

    completedAt:
      normalizeDateValue(
        data.completedAt,
      ),
  };
}

/* ============================================================
   MARKET ORDER MAPPER
============================================================ */

function mapMarketOrder(
  snapshotId: string,
  data: DocumentData,
): FixxamMarketOrder {
  const rawProducts =
    Array.isArray(
      data.products,
    )
      ? data.products
      : [];

  return {
    id: snapshotId,

    status:
      typeof data.status ===
      "string"
        ? data.status
        : undefined,

    productAmount:
      normalizeNullableNumber(
        data.productAmount,
      ),

    subtotal:
      normalizeNullableNumber(
        data.subtotal,
      ),

    discountTotal:
      normalizeNullableNumber(
        data.discountTotal,
      ),

    deliveryFee:
      normalizeNullableNumber(
        data.deliveryFee,
      ),

    total:
      normalizeNullableNumber(
        data.total,
      ),

    products:
      rawProducts.map(
        mapMarketProduct,
      ),

    createdAt:
      normalizeDateValue(
        data.createdAt,
      ),

    acceptedAt:
      normalizeDateValue(
        data.acceptedAt,
      ),

    completedAt:
      normalizeDateValue(
        data.completedAt,
      ),

    deliveredAt:
      normalizeDateValue(
        data.deliveredAt,
      ),
  };
}

/* ============================================================
   SNAPSHOT MAPPERS
============================================================ */

function mapBookingsSnapshot(
  snapshot: QuerySnapshot<DocumentData>,
): FixxamBooking[] {
  return snapshot.docs.map(
    (document) =>
      mapBooking(
        document.id,
        document.data(),
      ),
  );
}

function mapMarketOrdersSnapshot(
  snapshot: QuerySnapshot<DocumentData>,
): FixxamMarketOrder[] {
  return snapshot.docs.map(
    (document) =>
      mapMarketOrder(
        document.id,
        document.data(),
      ),
  );
}

/* ============================================================
   DEBUG BOOKINGS
============================================================ */

function logBookingsSnapshot(
  snapshot: QuerySnapshot<DocumentData>,
  customerId: string,
): void {
  if (!ACTIVITY_DEBUG) {
    return;
  }

  activityLog(
    "BOOKINGS SNAPSHOT",
    {
      customerId,
      count:
        snapshot.size,
      empty:
        snapshot.empty,
    },
  );

  snapshot.docs.forEach(
    (document) => {
      const data =
        document.data();

      activityLog(
        "BOOKING RAW",
        {
          id:
            document.id,

          customerId:
            data.customerId ??
            null,

          status:
            data.status ??
            null,

          agreedPrice:
            data.agreedPrice ??
            null,

          amount:
            data.amount ??
            null,

          price:
            data.price ??
            null,

          offerAmount:
            data.offerAmount ??
            null,

          createdAt:
            data.createdAt ??
            null,

          offerAcceptedAt:
            data.offerAcceptedAt ??
            null,

          completedAt:
            data.completedAt ??
            null,
        },
      );
    },
  );
}

/* ============================================================
   DEBUG ORDERS
============================================================ */

function logOrdersSnapshot(
  snapshot: QuerySnapshot<DocumentData>,
  customerId: string,
): void {
  if (!ACTIVITY_DEBUG) {
    return;
  }

  activityLog(
    "ORDERS SNAPSHOT",
    {
      customerId,
      count:
        snapshot.size,
      empty:
        snapshot.empty,
    },
  );

  snapshot.docs.forEach(
    (document) => {
      const data =
        document.data();

      activityLog(
        "ORDER RAW",
        {
          id:
            document.id,

          customerId:
            data.customerId ??
            null,

          status:
            data.status ??
            null,

          productAmount:
            data.productAmount ??
            null,

          subtotal:
            data.subtotal ??
            null,

          discountTotal:
            data.discountTotal ??
            null,

          deliveryFee:
            data.deliveryFee ??
            null,

          total:
            data.total ??
            null,

          createdAt:
            data.createdAt ??
            null,

          acceptedAt:
            data.acceptedAt ??
            null,

          completedAt:
            data.completedAt ??
            null,

          deliveredAt:
            data.deliveredAt ??
            null,
        },
      );
    },
  );
}

/* ============================================================
   SUBSCRIBE
============================================================ */

export function subscribeToFixxamActivity(
  customerId: string,
  period: FixxamActivityPeriod = "30D",
  onResult: FixxamActivityListener,
  onError?: FixxamActivityErrorListener,
): Unsubscribe {
  const normalizedCustomerId =
    normalizeString(
      customerId,
    );

  activityLog(
    "SUBSCRIBE START",
    {
      customerId:
        normalizedCustomerId,
      period,
    },
  );

  if (
    !normalizedCustomerId
  ) {
    const error =
      new Error(
        "Customer ID is required.",
      );

    activityWarn(
      "MISSING CUSTOMER ID",
    );

    onError?.(error);

    return () => {};
  }

  /* ==========================================================
     QUERIES
  ========================================================== */

  const bookingsQuery =
    query(
      collection(
        db,
        "bookings",
      ),
      where(
        "customerId",
        "==",
        normalizedCustomerId,
      ),
    );

  const ordersQuery =
    query(
      collection(
        db,
        "orders",
      ),
      where(
        "customerId",
        "==",
        normalizedCustomerId,
      ),
    );

  /* ==========================================================
     STATE
  ========================================================== */

  let bookings:
    FixxamBooking[] = [];

  let marketOrders:
    FixxamMarketOrder[] = [];

  let bookingsLoaded =
    false;

  let ordersLoaded =
    false;

  let stopped = false;

  /* ==========================================================
     EMIT
  ========================================================== */

  const emit =
    () => {
      if (
        stopped
      ) {
        return;
      }

      if (
        !bookingsLoaded ||
        !ordersLoaded
      ) {
        activityLog(
          "WAITING FOR SNAPSHOTS",
          {
            bookingsLoaded,
            ordersLoaded,
          },
        );

        return;
      }

      try {
        activityLog(
          "CALCULATION INPUT",
          {
            bookings:
              bookings.length,

            orders:
              marketOrders.length,

            period,
          },
        );

        const result =
          calculateFixxamActivity(
            bookings,
            marketOrders,
            period,
          );

        activityLog(
          "ACTIVITY RESULT RECEIVED",
          result,
        );

        onResult(result);
      } catch (error) {
        console.error(
          "[FIXXAM_ACTIVITY] CALCULATION ERROR",
          error,
        );

        onError?.(
          error instanceof Error
            ? error
            : new Error(
                "Unable to calculate Fixxam Activity.",
              ),
        );
      }
    };

  /* ==========================================================
     BOOKINGS LISTENER
  ========================================================== */

  const unsubscribeBookings =
    onSnapshot(
      bookingsQuery,

      (snapshot) => {
        if (
          stopped
        ) {
          return;
        }

        activityLog(
          "BOOKINGS SNAPSHOT RECEIVED",
          {
            count:
              snapshot.size,
          },
        );

        logBookingsSnapshot(
          snapshot,
          normalizedCustomerId,
        );

        bookings =
          mapBookingsSnapshot(
            snapshot,
          );

        bookingsLoaded =
          true;

        activityLog(
          "BOOKINGS MAPPED",
          {
            count:
              bookings.length,
          },
        );

        emit();
      },

      (error) => {
        if (
          stopped
        ) {
          return;
        }

        console.error(
          "[FIXXAM_ACTIVITY] BOOKINGS LISTENER ERROR",
          error,
        );

        onError?.(
          new Error(
            "Unable to load service activity.",
          ),
        );
      },
    );

  /* ==========================================================
     ORDERS LISTENER
  ========================================================== */

  const unsubscribeOrders =
    onSnapshot(
      ordersQuery,

      (snapshot) => {
        if (
          stopped
        ) {
          return;
        }

        activityLog(
          "ORDERS SNAPSHOT RECEIVED",
          {
            count:
              snapshot.size,
          },
        );

        logOrdersSnapshot(
          snapshot,
          normalizedCustomerId,
        );

        marketOrders =
          mapMarketOrdersSnapshot(
            snapshot,
          );

        ordersLoaded =
          true;

        activityLog(
          "ORDERS MAPPED",
          {
            count:
              marketOrders.length,
          },
        );

        emit();
      },

      (error) => {
        if (
          stopped
        ) {
          return;
        }

        console.error(
          "[FIXXAM_ACTIVITY] ORDERS LISTENER ERROR",
          error,
        );

        onError?.(
          new Error(
            "Unable to load market activity.",
          ),
        );
      },
    );

  /* ==========================================================
     CLEANUP
  ========================================================== */

  return () => {
    if (
      stopped
    ) {
      return;
    }

    stopped =
      true;

    activityLog(
      "UNSUBSCRIBE",
      {
        customerId:
          normalizedCustomerId,
        period,
      },
    );

    unsubscribeBookings();
    unsubscribeOrders();
  };
}

/* ============================================================
   ONE-TIME CALCULATION
============================================================ */

export function calculateFixxamActivityFromData(
  bookings: FixxamBooking[] = [],
  marketOrders: FixxamMarketOrder[] = [],
  period: FixxamActivityPeriod =
    "30D",
): FixxamActivityResult {
  return calculateFixxamActivity(
    Array.isArray(
      bookings,
    )
      ? bookings
      : [],

    Array.isArray(
      marketOrders,
    )
      ? marketOrders
      : [],

    period,
  );
}