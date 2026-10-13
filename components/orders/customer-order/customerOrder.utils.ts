import type {
  BookingStatus,
  CounterOfferBy,
  OfferStatus,
} from "@/types/booking";

import type {
  BookingPriority,
} from "@/types/bookingPriority";

import {
  isBookingFulfillmentMode,
} from "@/types/bookingFulfillment";

import type {
  BookingLocation,
  BookingTimestamp,
  BookingTiming,
  CounterOfferStatus,
  CustomerBooking,
  LiveLocation,
} from "./customerOrder.types";

/* ============================================================
   CONSTANTS
============================================================ */

export const MAX_NEGOTIATION_ROUNDS =
  3 as const;

/* ============================================================
   STRING
============================================================ */

export function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   NUMBER
============================================================ */

function normalizeFiniteNumber(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

function normalizePositiveNumber(
  value: unknown,
): number | null {
  const normalized =
    normalizeFiniteNumber(value);

  if (
    normalized === null ||
    normalized <= 0
  ) {
    return null;
  }

  return normalized;
}

/* ============================================================
   COORDINATES
============================================================ */

export function isValidLatitude(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

export function isValidLongitude(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

export function hasValidCoordinates(
  latitude: unknown,
  longitude: unknown,
): boolean {
  return (
    isValidLatitude(latitude) &&
    isValidLongitude(longitude)
  );
}

/* ============================================================
   STATUS
============================================================ */

export function normalizeStatus(
  value: unknown,
): BookingStatus {
  switch (value) {
    case "accepted":
      return "accepted";

    case "awaiting_start_confirmation":
      return "awaiting_start_confirmation";

    case "in-progress":
    case "in_progress":
      return "in-progress";

    case "awaiting_completion_confirmation":
      return "awaiting_completion_confirmation";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    case "pending_estimate":
    case "negotiating":
    default:
      return "pending";
  }
}

export function normalizeOfferStatus(
  value: unknown,
): OfferStatus {
  switch (value) {
    case "sent":
      return "sent";

    case "accepted":
      return "accepted";

    case "declined":
      return "declined";

    case "countered":
      return "countered";

    case "none":
    default:
      return "none";
  }
}

export function normalizeCounterOfferBy(
  value: unknown,
): CounterOfferBy {
  if (
    value === "customer"
  ) {
    return "customer";
  }

  if (
    value === "worker"
  ) {
    return "worker";
  }

  return null;
}

export function normalizeCounterOfferStatus(
  value: unknown,
): CounterOfferStatus {
  switch (value) {
    case "none":
      return "none";

    case "sent":
      return "sent";

    case "accepted":
      return "accepted";

    case "declined":
      return "declined";

    default:
      return null;
  }
}

export function normalizeRound(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 1;
  }

  return Math.min(
    MAX_NEGOTIATION_ROUNDS,
    Math.max(
      1,
      Math.floor(value),
    ),
  );
}

/* ============================================================
   BOOKING PRIORITY
============================================================ */

function normalizeBookingPriority(
  value: unknown,
): BookingPriority | null {
  switch (value) {
    case "immediate":
      return "immediate";

    case "normal":
      return "normal";

    case "urgent":
      return "urgent";

    default:
      return null;
  }
}

/* ============================================================
   BOOKING TIMING
============================================================ */

function normalizeBookingTiming(
  value: unknown,
): BookingTiming | null {
  if (
    value === "asap"
  ) {
    return "asap";
  }

  if (
    value === "schedule"
  ) {
    return "schedule";
  }

  return null;
}

/* ============================================================
   TIMESTAMP
============================================================ */

function normalizeBookingTimestamp(
  value: unknown,
): BookingTimestamp {
  if (
    value == null
  ) {
    return null;
  }

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
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : null;
  }

  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return null;
    }

    return Number.isFinite(
      Date.parse(trimmed),
    )
      ? trimmed
      : null;
  }

  /*
   * Firestore Timestamp.
   */
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
    try {
      const millis = (
        value as {
          toMillis: () => number;
        }
      ).toMillis();

      if (
        Number.isFinite(
          millis,
        )
      ) {
        return value as BookingTimestamp;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function resolveTimestampMillis(
  value: unknown,
): number | null {
  const normalized =
    normalizeBookingTimestamp(
      value,
    );

  if (
    normalized == null
  ) {
    return null;
  }

  if (
    typeof normalized ===
    "number"
  ) {
    return normalized;
  }

  if (
    normalized instanceof Date
  ) {
    const millis =
      normalized.getTime();

    return Number.isFinite(
      millis,
    )
      ? millis
      : null;
  }

  if (
    typeof normalized ===
    "string"
  ) {
    const millis =
      Date.parse(
        normalized,
      );

    return Number.isFinite(
      millis,
    )
      ? millis
      : null;
  }

  try {
    const millis =
      normalized.toMillis();

    return Number.isFinite(
      millis,
    )
      ? millis
      : null;
  } catch {
    return null;
  }
}

/* ============================================================
   AMOUNT
============================================================ */

export function formatAmount(
  value?: number | null,
): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "₦0";
  }

  return `₦${value.toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   BOOKING LOCATION
============================================================ */

function mapBookingLocation(
  value: unknown,
): BookingLocation | undefined {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return undefined;
  }

  const raw =
    value as Record<
      string,
      unknown
    >;

  const address =
    cleanString(
      raw.address,
    );

  const latitude =
    isValidLatitude(
      raw.latitude,
    )
      ? raw.latitude
      : null;

  const longitude =
    isValidLongitude(
      raw.longitude,
    )
      ? raw.longitude
      : null;

  /*
   * Remote bookings intentionally persist:
   *
   * address: ""
   * latitude: null
   * longitude: null
   */
  if (
    !address &&
    latitude === null &&
    longitude === null
  ) {
    return undefined;
  }

  return {
    ...(address
      ? {
          address,
        }
      : {}),

    latitude,

    longitude,
  };
}

/* ============================================================
   LIVE LOCATION
============================================================ */

export function mapLiveLocation(
  value: unknown,
): LiveLocation | null {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return null;
  }

  const location =
    value as Record<
      string,
      unknown
    >;

  if (
    !isValidLatitude(
      location.latitude,
    ) ||
    !isValidLongitude(
      location.longitude,
    )
  ) {
    return null;
  }

  const accuracy =
    normalizeFiniteNumber(
      location.accuracy,
    );

  const heading =
    normalizeFiniteNumber(
      location.heading,
    );

  const speed =
    normalizeFiniteNumber(
      location.speed,
    );

  const userId =
    cleanString(
      location.userId,
    );

  return {
    latitude:
      location.latitude,

    longitude:
      location.longitude,

    accuracy:
      accuracy !== null
        ? Math.max(
            0,
            accuracy,
          )
        : null,

    heading,

    speed,

    ...(userId
      ? {
          userId,
        }
      : {}),

    updatedAt:
      normalizeBookingTimestamp(
        location.updatedAt,
      ),
  };
}

/* ============================================================
   BOOKING MAPPER
============================================================ */

export function mapBooking(
  id: string,
  data: Record<
    string,
    unknown
  >,
): CustomerBooking {

  /* ==========================================================
     FULFILLMENT
  ========================================================== */

  const fulfillmentMode =
    isBookingFulfillmentMode(
      data.fulfillmentMode,
    )
      ? data.fulfillmentMode
      : "worker_visits_customer";

  /* ==========================================================
     LOCATION OBJECT
  ========================================================== */

  const location =
    mapBookingLocation(
      data.location,
    );

  /* ==========================================================
     PHOTOS
  ========================================================== */

  const photos =
    Array.isArray(
      data.photos,
    )
      ? Array.from(
          new Set(
            data.photos
              .map(
                photo =>
                  cleanString(
                    photo,
                  ),
              )
              .filter(
                Boolean,
              ),
          ),
        )
      : [];

  /* ==========================================================
     PRIORITY / TIMING
  ========================================================== */

  const rawBookingPriority =
    normalizeBookingPriority(
      data.bookingPriority,
    );

  const rawTiming =
    normalizeBookingTiming(
      data.timing,
    );

  const legacyUrgent =
    data.urgent === true;

  const legacyDate =
    cleanString(
      data.date,
    );

  const legacyTime =
    cleanString(
      data.time,
    );

  const storedBookingDate =
    cleanString(
      data.bookingDate,
    );

  const storedBookingTime =
    cleanString(
      data.bookingTime,
    );

  const hasStoredSchedule =
    Boolean(
      storedBookingDate ||
        storedBookingTime ||
        legacyDate ||
        legacyTime,
    );

  let timing:
    | BookingTiming
    | null =
    rawTiming;

  let bookingPriority:
    | BookingPriority
    | null =
    rawBookingPriority;

  /*
   * Legacy documents may not contain timing.
   */
  if (!timing) {
    if (
      hasStoredSchedule
    ) {
      timing =
        "schedule";

      bookingPriority =
        null;
    } else if (
      bookingPriority
    ) {
      timing =
        "asap";
    } else if (
      legacyUrgent
    ) {
      timing =
        "asap";

      bookingPriority =
        "urgent";
    }
  }

  /*
   * Scheduled bookings never expose an ASAP priority.
   */
  if (
    timing ===
    "schedule"
  ) {
    bookingPriority =
      null;
  }

  if (
    !timing &&
    bookingPriority
  ) {
    timing =
      "asap";
  }

  const bookingDate =
    timing ===
      "schedule"
      ? storedBookingDate ||
        legacyDate ||
        null
      : null;

  const bookingTime =
    timing ===
      "schedule"
      ? storedBookingTime ||
        legacyTime ||
        null
      : null;

  const urgent =
    bookingPriority ===
      "urgent" ||
    (
      !rawBookingPriority &&
      legacyUrgent &&
      timing !==
        "schedule"
    );

  /* ==========================================================
     WORKER LIVE LOCATION

     Canonical:
       workerLiveLocation

     Existing compatibility:
       liveLocation
  ========================================================== */

  const workerLiveLocation =
    mapLiveLocation(
      data.workerLiveLocation,
    ) ??
    mapLiveLocation(
      data.liveLocation,
    );

  /* ==========================================================
     CUSTOMER LIVE LOCATION

     customerLiveSharingEnabled is explicit customer consent.

     A valid customerLiveLocation by itself does NOT mean
     that sharing is active.
  ========================================================== */

  const customerLiveSharingEnabled =
    data.customerLiveSharingEnabled ===
    true;

  const customerLiveLocation =
    mapLiveLocation(
      data.customerLiveLocation,
    );

  /* ==========================================================
     ROOT COORDINATES
  ========================================================== */

  const rootLatitude =
    isValidLatitude(
      data.latitude,
    )
      ? data.latitude
      : null;

  const rootLongitude =
    isValidLongitude(
      data.longitude,
    )
      ? data.longitude
      : null;

  const latitude =
    fulfillmentMode ===
    "remote"
      ? null
      : rootLatitude ??
        location?.latitude ??
        null;

  const longitude =
    fulfillmentMode ===
    "remote"
      ? null
      : rootLongitude ??
        location?.longitude ??
        null;

  /*
   * Physical legacy bookings retain the old
   * "Location unavailable" fallback.
   *
   * Remote bookings intentionally have no
   * physical address.
   */
  const address =
    fulfillmentMode ===
    "remote"
      ? ""
      : cleanString(
          data.address,
        ) ||
        cleanString(
          location?.address,
        ) ||
        "Location unavailable";

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    id:
      cleanString(
        id,
      ),

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerId:
      cleanString(
        data.customerId,
      ),

    customerName:
      cleanString(
        data.customerName,
      ) ||
      "Customer",

    customerPhotoURL:
      cleanString(
        data.customerPhotoURL,
      ) ||
      null,

    /* ========================================================
       WORKER
    ======================================================== */

    workerId:
      cleanString(
        data.workerId,
      ),

    workerName:
      cleanString(
        data.workerName,
      ) ||
      "Worker",

    workerPhoto:
      cleanString(
        data.workerPhoto,
      ) ||
      null,

    workerCategory:
      cleanString(
        data.workerCategory,
      ) ||
      null,

    workerPhone:
      cleanString(
        data.workerPhone,
      ) ||
      null,

    /* ========================================================
       SERVICE
    ======================================================== */

    serviceId:
      cleanString(
        data.serviceId,
      ),

    serviceName:
      cleanString(
        data.serviceName,
      ) ||
      "Service request",

    serviceIcon:
      cleanString(
        data.serviceIcon,
      ) ||
      null,

    categoryId:
      cleanString(
        data.categoryId,
      ) ||
      null,

    fulfillmentMode,

    description:
      cleanString(
        data.description,
      ),

    photos,

    /* ========================================================
       FIXED SERVICE LOCATION
    ======================================================== */

    address,

    latitude,

    longitude,

    location:
      fulfillmentMode ===
      "remote"
        ? undefined
        : location,

    /* ========================================================
       PRIORITY / TIMING
    ======================================================== */

    bookingPriority,

    timing,

    bookingDate,

    bookingTime,

    /* ========================================================
       LEGACY SCHEDULE
    ======================================================== */

    date:
      legacyDate ||
      bookingDate ||
      null,

    time:
      legacyTime ||
      bookingTime ||
      null,

    /* ========================================================
       PRICING
    ======================================================== */

    amount:
      normalizeFiniteNumber(
        data.amount,
      ),

    agreedPrice:
      normalizePositiveNumber(
        data.agreedPrice,
      ),

    urgent,

    urgentFee:
      normalizeFiniteNumber(
        data.urgentFee,
      ),

    /* ========================================================
       STATUS
    ======================================================== */

    status:
      normalizeStatus(
        data.status,
      ),

    paymentStatus:
      cleanString(
        data.paymentStatus,
      ) ||
      null,

    /* ========================================================
       WORKER OFFER
    ======================================================== */

    offerAmount:
      normalizePositiveNumber(
        data.offerAmount,
      ),

    offerMessage:
      cleanString(
        data.offerMessage,
      ) ||
      null,

    offerRound:
      normalizeRound(
        data.offerRound,
      ),

    offerStatus:
      normalizeOfferStatus(
        data.offerStatus,
      ),

    offerExpiresAt:
      normalizeBookingTimestamp(
        data.offerExpiresAt,
      ),

    offerSentAt:
      normalizeBookingTimestamp(
        data.offerSentAt,
      ),

    offerRespondedAt:
      normalizeBookingTimestamp(
        data.offerRespondedAt,
      ),

    /* ========================================================
       COUNTER OFFER
    ======================================================== */

    counterOfferAmount:
      normalizePositiveNumber(
        data.counterOfferAmount,
      ),

    counterOfferMessage:
      cleanString(
        data.counterOfferMessage,
      ) ||
      null,

    counterOfferBy:
      normalizeCounterOfferBy(
        data.counterOfferBy,
      ),

    counterOfferStatus:
      normalizeCounterOfferStatus(
        data.counterOfferStatus,
      ),

    counterOfferSentAt:
      normalizeBookingTimestamp(
        data.counterOfferSentAt,
      ),

    counterOfferRespondedAt:
      normalizeBookingTimestamp(
        data.counterOfferRespondedAt,
      ),

   /* ========================================================
   SERVICE CONFIRMATIONS
======================================================== */

startConfirmationRequestedAt:
  normalizeBookingTimestamp(
    data.startConfirmationRequestedAt,
  ),

serviceStartedAt:
  normalizeBookingTimestamp(
    data.serviceStartedAt,
  ),

workerMarkedCompletedAt:
  normalizeBookingTimestamp(
    data.workerMarkedCompletedAt,
  ),

serviceCompletedAt:
  normalizeBookingTimestamp(
    data.serviceCompletedAt,
  ),

completedAt:
  normalizeBookingTimestamp(
    data.completedAt,
  ),

customerStartedConfirmedAt:
  normalizeBookingTimestamp(
    data.customerStartedConfirmedAt,
  ),

customerCompletedConfirmedAt:
  normalizeBookingTimestamp(
    data.customerCompletedConfirmedAt,
  ),

    /* ========================================================
       REALTIME LOCATION

       workerLiveLocation:
         Worker GPS -> Customer Track Worker

       customerLiveLocation:
         Customer GPS -> Worker Track Customer

       customerLiveSharingEnabled:
         Explicit customer consent.

       Realtime travel tracking is only relevant when
       the worker travels to the customer.
    ======================================================== */

    workerLiveLocation:
      fulfillmentMode ===
      "worker_visits_customer"
        ? workerLiveLocation
        : null,

    customerLiveLocation:
      fulfillmentMode ===
      "worker_visits_customer"
        ? customerLiveLocation
        : null,

    customerLiveSharingEnabled:
      fulfillmentMode ===
        "worker_visits_customer" &&
      customerLiveSharingEnabled,

    /* ========================================================
       META
    ======================================================== */

    createdAt:
      normalizeBookingTimestamp(
        data.createdAt,
      ),

    updatedAt:
      normalizeBookingTimestamp(
        data.updatedAt,
      ),
  };
}