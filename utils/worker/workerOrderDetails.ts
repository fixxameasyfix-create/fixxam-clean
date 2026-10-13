import {
  WorkerColors,
} from "@/theme";

import type {
  Booking,
  BookingStatus,
  CounterOfferBy,
  CounterOfferStatus,
  OfferStatus,
  PaymentStatus,
} from "@/types/booking";

import {
  isBookingFulfillmentMode,
  type BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

/* ==============================================================
   TYPES
============================================================== */

export type BookingTiming =
  | "asap"
  | "schedule";

export type BookingPriority =
  | "immediate"
  | "normal"
  | "urgent";

export type WorkerLiveLocation = {
  latitude: number;

  longitude: number;

  accuracy?: number | null;

  heading?: number | null;

  speed?: number | null;

  userId?: string;

  updatedAt?: unknown;
};

export type WorkerBooking =
  Booking & {
    fulfillmentMode:
      BookingFulfillmentMode;

    /* ==========================================================
       SERVICE TIMING
    ========================================================== */

    timing:
      | BookingTiming
      | null;

    bookingPriority:
      | BookingPriority
      | null;

    bookingDate:
      | string
      | null;

    bookingTime:
      | string
      | null;

    /* ==========================================================
       WORKER DETAILS
    ========================================================== */

    customerPhone?: string | null;

    estimatedArrival?: string | null;

    workerArrivedAt?: unknown;

    serviceStartedAt?: unknown;

    startConfirmationRequestedAt?: unknown;

    serviceCompletedAt?: unknown;

    workerMarkedCompletedAt?: unknown;

    cancelledReason?: string | null;

    cancelledBy?:
      | "customer"
      | "worker"
      | null;

    workerLiveLocation?:
      | WorkerLiveLocation
      | null;

    serviceIconColor?: string;

    serviceIconBackground?: string;
  };

/* ==============================================================
   STRING
============================================================== */

export function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   IMAGE
============================================================== */

export function getSafeRemoteImage(
  value: unknown,
): string {
  const url =
    cleanString(
      value,
    );

  if (
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "http://",
    )
  ) {
    return url;
  }

  return "";
}

/* ==============================================================
   MONEY
============================================================== */

export function isSameMoneyAmount(
  first: number,
  second: number,
): boolean {
  return (
    Math.round(
      first * 100,
    ) ===
    Math.round(
      second * 100,
    )
  );
}

/* ==============================================================
   PAYMENT
============================================================== */

export function normalizePaymentStatus(
  value: unknown,
): PaymentStatus | null {
  switch (value) {
    case "pending":
    case "paid":
    case "cash":
      return value;

    default:
      return null;
  }
}

/* ==============================================================
   BOOKING TIMING
============================================================== */

export function normalizeBookingTiming(
  value: unknown,
): BookingTiming | null {
  switch (value) {
    case "asap":
      return "asap";

    case "schedule":
      return "schedule";

    default:
      return null;
  }
}

/* ==============================================================
   BOOKING PRIORITY
============================================================== */

export function normalizeBookingPriority(
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

/* ==============================================================
   LOCATION
============================================================== */

export function normalizeWorkerLiveLocation(
  value: unknown,
): WorkerLiveLocation | null {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const latitude =
    typeof data.latitude ===
    "number"
      ? data.latitude
      : null;

  const longitude =
    typeof data.longitude ===
    "number"
      ? data.longitude
      : null;

  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(
      latitude,
    ) ||
    !Number.isFinite(
      longitude,
    )
  ) {
    return null;
  }

  return {
    latitude,

    longitude,

    accuracy:
      typeof data.accuracy ===
        "number" &&
      Number.isFinite(
        data.accuracy,
      )
        ? data.accuracy
        : null,

    heading:
      typeof data.heading ===
        "number" &&
      Number.isFinite(
        data.heading,
      )
        ? data.heading
        : null,

    speed:
      typeof data.speed ===
        "number" &&
      Number.isFinite(
        data.speed,
      )
        ? data.speed
        : null,

    userId:
      cleanString(
        data.userId,
      ) ||
      undefined,

    updatedAt:
      data.updatedAt,
  };
}

/* ==============================================================
   STATUS
============================================================== */

export function normalizeWorkerBookingStatus(
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

/* ==============================================================
   OFFER STATUS
============================================================== */

export function normalizeWorkerOfferStatus(
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

/* ==============================================================
   COUNTER OFFER STATUS
============================================================== */

export function normalizeWorkerCounterOfferStatus(
  value: unknown,
): CounterOfferStatus {
  switch (value) {
    case "sent":
      return "sent";

    case "accepted":
      return "accepted";

    case "declined":
      return "declined";

    case "none":
    default:
      return "none";
  }
}

export function normalizeWorkerCounterOfferBy(
  value: unknown,
): CounterOfferBy {
  if (
    value === "customer" ||
    value === "worker"
  ) {
    return value;
  }

  return null;
}

/* ==============================================================
   BOOKING MAPPER
============================================================== */

export function mapWorkerBooking(
  id: string,
  data: Record<
    string,
    unknown
  >,
): WorkerBooking {
  /* ============================================================
     FULFILLMENT
  ============================================================ */

  const fulfillmentMode:
    BookingFulfillmentMode =
    isBookingFulfillmentMode(
      data.fulfillmentMode,
    )
      ? data.fulfillmentMode
      : "worker_visits_customer";

  const isRemote =
    fulfillmentMode ===
    "remote";

  /* ============================================================
     LOCATION
  ============================================================ */

  const location =
    !isRemote &&
    typeof data.location ===
      "object" &&
    data.location !== null
      ? (
          data.location as Booking["location"]
        )
      : undefined;

  /* ============================================================
     PHOTOS
  ============================================================ */

  const photos =
    Array.isArray(
      data.photos,
    )
      ? data.photos
          .map(
            getSafeRemoteImage,
          )
          .filter(
            (
              photo,
            ): photo is string =>
              Boolean(
                photo,
              ),
          )
      : [];

  /* ============================================================
     MONEY
  ============================================================ */

  const amount =
    typeof data.amount ===
      "number" &&
    Number.isFinite(
      data.amount,
    )
      ? data.amount
      : null;

  const agreedPrice =
    typeof data.agreedPrice ===
      "number" &&
    Number.isFinite(
      data.agreedPrice,
    )
      ? data.agreedPrice
      : null;

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

  /* ============================================================
     SERVICE
  ============================================================ */

  const serviceIcon =
    cleanString(
      data.serviceIcon,
    ) ||
    "tools";

  /* ============================================================
     TIMING / PRIORITY
  ============================================================ */

  const timing =
    normalizeBookingTiming(
      data.timing,
    );

  const bookingPriority =
    normalizeBookingPriority(
      data.bookingPriority,
    );

  const bookingDate =
    cleanString(
      data.bookingDate,
    ) ||
    null;

  const bookingTime =
    cleanString(
      data.bookingTime,
    ) ||
    null;

  /*
   * Legacy compatibility.
   *
   * Older bookings may only contain:
   * - date
   * - time
   * - urgent
   */

  const legacyDate =
    cleanString(
      data.date,
    ) ||
    null;

  const legacyTime =
    cleanString(
      data.time,
    ) ||
    null;

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    id,

    /* ==========================================================
       CUSTOMER
    ========================================================== */

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
      getSafeRemoteImage(
        data.customerPhotoURL,
      ) ||
      null,

    customerPhone:
      cleanString(
        data.customerPhone,
      ) ||
      null,

    /* ==========================================================
       WORKER
    ========================================================== */

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
      getSafeRemoteImage(
        data.workerPhoto,
      ) ||
      null,

    /* ==========================================================
       SERVICE
    ========================================================== */

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
      serviceIcon as Booking["serviceIcon"],

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

    /* ==========================================================
       LOCATION
    ========================================================== */

    address:
      isRemote
        ? ""
        : cleanString(
            data.address,
          ) ||
          cleanString(
            location?.address,
          ) ||
          "Location unavailable",

    latitude:
      isRemote
        ? null
        : typeof data.latitude ===
              "number" &&
            Number.isFinite(
              data.latitude,
            )
          ? data.latitude
          : location?.latitude ??
            null,

    longitude:
      isRemote
        ? null
        : typeof data.longitude ===
              "number" &&
            Number.isFinite(
              data.longitude,
            )
          ? data.longitude
          : location?.longitude ??
            null,

    location:
      isRemote
        ? undefined
        : location,

    /* ==========================================================
       TIMING / PRIORITY
    ========================================================== */

    timing,

    bookingPriority,

    bookingDate,

    bookingTime,

    /*
     * Keep legacy fields because other parts of
     * the app may still depend on them.
     */

    date:
      legacyDate,

    time:
      legacyTime,

    /* ==========================================================
       PRICING
    ========================================================== */

    amount,

    agreedPrice,

    urgent:
      bookingPriority ===
        "urgent" ||
      data.urgent ===
        true,

    urgentFee:
      typeof data.urgentFee ===
        "number" &&
      Number.isFinite(
        data.urgentFee,
      )
        ? data.urgentFee
        : null,

    /* ==========================================================
       STATUS
    ========================================================== */

    status:
      normalizeWorkerBookingStatus(
        data.status,
      ),

    paymentStatus:
      normalizePaymentStatus(
        data.paymentStatus,
      ),

    /* ==========================================================
       OFFER
    ========================================================== */

    offerAmount,

    offerMessage:
      cleanString(
        data.offerMessage,
      ) ||
      null,

    offerRound:
      typeof data.offerRound ===
        "number" &&
      Number.isFinite(
        data.offerRound,
      )
        ? data.offerRound
        : 1,

    offerStatus:
      normalizeWorkerOfferStatus(
        data.offerStatus,
      ),

    offerExpiresAt:
      data.offerExpiresAt,

    offerSentAt:
      data.offerSentAt,

    offerRespondedAt:
      data.offerRespondedAt,

    offerWorkerId:
      cleanString(
        data.offerWorkerId,
      ) ||
      null,

    /* ==========================================================
       COUNTER OFFER
    ========================================================== */

    counterOfferAmount,

    counterOfferMessage:
      cleanString(
        data.counterOfferMessage,
      ) ||
      null,

    counterOfferBy:
      normalizeWorkerCounterOfferBy(
        data.counterOfferBy,
      ),

    counterOfferStatus:
      normalizeWorkerCounterOfferStatus(
        data.counterOfferStatus,
      ),

    counterOfferSentAt:
      data.counterOfferSentAt,

    counterOfferRespondedAt:
      data.counterOfferRespondedAt,

    negotiationStatus:
      data.negotiationStatus ===
        "negotiating" ||
      data.negotiationStatus ===
        "completed"
        ? data.negotiationStatus
        : "none",

    /* ==========================================================
       CONFIRMATIONS
    ========================================================== */

    customerStartedConfirmedAt:
      data.customerStartedConfirmedAt,

      startConfirmationRequestedAt:
  data.startConfirmationRequestedAt,

    workerMarkedCompletedAt:
      data.workerMarkedCompletedAt,

    customerCompletedConfirmedAt:
      data.customerCompletedConfirmedAt,

    /* ==========================================================
       LIVE LOCATION
    ========================================================== */

    workerLiveLocation:
      isRemote
        ? null
        : normalizeWorkerLiveLocation(
            data.workerLiveLocation,
          ),

    /* ==========================================================
       META
    ========================================================== */

    createdAt:
      data.createdAt,

    updatedAt:
      data.updatedAt,

    estimatedArrival:
      cleanString(
        data.estimatedArrival,
      ) ||
      null,

    workerArrivedAt:
      data.workerArrivedAt,

    serviceStartedAt:
      data.serviceStartedAt,

    serviceCompletedAt:
      data.serviceCompletedAt,

    cancelledReason:
      cleanString(
        data.cancelledReason,
      ) ||
      null,

    cancelledBy:
      data.cancelledBy ===
        "customer" ||
      data.cancelledBy ===
        "worker"
        ? data.cancelledBy
        : null,

    serviceIconColor:
      cleanString(
        data.serviceIconColor,
      ) ||
      WorkerColors.primary,

    serviceIconBackground:
      cleanString(
        data.serviceIconBackground,
      ) ||
      WorkerColors.primarySoft,
  } as WorkerBooking;
}