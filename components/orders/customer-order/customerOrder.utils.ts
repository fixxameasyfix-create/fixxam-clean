import type {
  BookingStatus,
  CounterOfferBy,
  OfferStatus,
} from "@/types/booking";

import type {
  BookingLocation,
  BookingTimestamp,
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

    case "in-progress":
    case "in_progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
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
   *
   * We use structural validation here so this
   * remains compatible with Firestore timestamp
   * instances received from snapshot data.
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
        Number.isFinite(millis)
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

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  if (
    typeof normalized ===
      "string"
  ) {
    const millis =
      Date.parse(normalized);

    return Number.isFinite(millis)
      ? millis
      : null;
  }

  try {
    const millis =
      normalized.toMillis();

    return Number.isFinite(millis)
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
  const location =
    mapBookingLocation(
      data.location,
    );

  const photos =
    Array.isArray(
      data.photos,
    )
      ? Array.from(
          new Set(
            data.photos
              .map(
                (
                  photo,
                ) =>
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

  const workerLiveLocation =
    mapLiveLocation(
      data.workerLiveLocation,
    );

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
    rootLatitude ??
    location?.latitude ??
    null;

  const longitude =
    rootLongitude ??
    location?.longitude ??
    null;

  const address =
    cleanString(
      data.address,
    ) ||
    cleanString(
      location?.address,
    ) ||
    "Location unavailable";

  return {
    id:
      cleanString(id),

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

    description:
      cleanString(
        data.description,
      ),

    photos,

    /* ========================================================
       LOCATION
    ======================================================== */

    address,

    latitude,

    longitude,

    location,

    /* ========================================================
       SCHEDULE
    ======================================================== */

    date:
      cleanString(
        data.date,
      ) ||
      null,

    time:
      cleanString(
        data.time,
      ) ||
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

    urgent:
      data.urgent === true,

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

    customerStartedConfirmedAt:
      normalizeBookingTimestamp(
        data.customerStartedConfirmedAt,
      ),

    customerCompletedConfirmedAt:
      normalizeBookingTimestamp(
        data.customerCompletedConfirmedAt,
      ),

    /* ========================================================
       LIVE LOCATION
    ======================================================== */

    workerLiveLocation,

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