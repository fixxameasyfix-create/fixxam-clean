import type {
  Timestamp,
} from "firebase/firestore";

import type {
  BookingCancelledBy,
  BookingCancellationReason,
  BookingStatus,
  CounterOfferBy,
  OfferStatus,
  NegotiationStatus,
} from "@/types/booking";

import type {
  BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

import type {
  BookingPriority,
} from "@/types/bookingPriority";

/* ============================================================
   SHARED TIMESTAMP
============================================================ */

export type BookingTimestamp =
  | Timestamp
  | Date
  | string
  | number
  | null;

/* ============================================================
   BOOKING TIMING
============================================================ */

export type BookingTiming =
  | "asap"
  | "schedule";

/* ============================================================
   COUNTER OFFER
============================================================ */

export type CounterOfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined"
  | null;

/* ============================================================
   BOOKING LOCATION
============================================================ */

export type BookingLocation = {
  address?: string;

  latitude?:
    | number
    | null;

  longitude?:
    | number
    | null;
};

/* ============================================================
   LIVE LOCATION
============================================================ */

export type LiveLocation = {
  latitude: number;

  longitude: number;

  accuracy?:
    | number
    | null;

  heading?:
    | number
    | null;

  speed?:
    | number
    | null;

  userId?:
    | string
    | null;

  updatedAt?:
    BookingTimestamp;
};

/* ============================================================
   CUSTOMER BOOKING
============================================================ */

export type CustomerBooking = {
  id: string;


  startConfirmationRequestedAt?: unknown;
  /* ==========================================================
     CUSTOMER
  ========================================================== */

  customerId: string;

  customerName: string;

  customerPhotoURL?:
    | string
    | null;

  /* ==========================================================
     WORKER
  ========================================================== */

  workerId: string;

  workerName: string;

  workerPhoto?:
    | string
    | null;

  workerCategory?:
    | string
    | null;

  workerPhone?:
    | string
    | null;

  /* ==========================================================
     SERVICE
  ========================================================== */

  serviceId: string;

  serviceName: string;

  serviceIcon?:
    | string
    | null;

  categoryId?:
    | string
    | null;

  fulfillmentMode:
    BookingFulfillmentMode;

  description: string;

  photos: string[];

  /* ==========================================================
     LOCATION
  ========================================================== */

  address: string;

  latitude?:
    | number
    | null;

  longitude?:
    | number
    | null;

  location?:
    BookingLocation;

  /* ==========================================================
     SERVICE PRIORITY / TIMING
  ========================================================== */

  bookingPriority?:
    | BookingPriority
    | null;

  timing?:
    | BookingTiming
    | null;

  bookingDate?:
    | string
    | null;

  bookingTime?:
    | string
    | null;

  /* ==========================================================
     LEGACY SCHEDULE
  ========================================================== */

  date?:
    | string
    | null;

  time?:
    | string
    | null;

  /* ==========================================================
     PRICING
  ========================================================== */

  amount?:
    | number
    | null;

  agreedPrice?:
    | number
    | null;

  urgent: boolean;

  urgentFee?:
    | number
    | null;

  /* ==========================================================
     BOOKING STATUS
  ========================================================== */

  status:
    BookingStatus;

  /* ==========================================================
     CANCELLATION
  ========================================================== */

  cancellationReason?:
    | BookingCancellationReason
    | null;

  cancelledBy?:
    BookingCancelledBy;

  cancelledAt?:
    BookingTimestamp;

  /* ==========================================================
     PAYMENT
  ========================================================== */

  paymentStatus?:
    | string
    | null;

  /* ==========================================================
     WORKER OFFER
  ========================================================== */

  offerAmount?:
    | number
    | null;

  offerMessage?:
    | string
    | null;

  offerRound: number;

  offerStatus:
    OfferStatus;

  offerExpiresAt?:
    BookingTimestamp;

  offerSentAt?:
    BookingTimestamp;

  offerRespondedAt?:
    BookingTimestamp;

  offerAcceptedAt?:
    BookingTimestamp;

  offerWorkerId?:
    | string
    | null;

  /* ==========================================================
     COUNTER OFFER
  ========================================================== */

  counterOfferAmount?:
    | number
    | null;

  counterOfferMessage?:
    | string
    | null;

  counterOfferBy:
    CounterOfferBy;

  counterOfferStatus:
    CounterOfferStatus;

  counterOfferSentAt?:
    BookingTimestamp;

  counterOfferRespondedAt?:
    BookingTimestamp;

  /* ==========================================================
     NEGOTIATION
  ========================================================== */

  negotiationStatus?:
    | NegotiationStatus
    | null;


    /* ==========================================================
     SERVICE CONFIRMATIONS
  ========================================================== */

  workerMarkedCompletedAt?:
    BookingTimestamp;

  customerStartedConfirmedAt?:
    BookingTimestamp;

  customerCompletedConfirmedAt?:
    BookingTimestamp;


    serviceStartedAt?: BookingTimestamp;
serviceCompletedAt?: BookingTimestamp;
completedAt?: BookingTimestamp;

  /* ==========================================================
     REALTIME LOCATION
  ========================================================== */

  workerLiveLocation?:
    | LiveLocation
    | null;

  customerLiveLocation?:
    | LiveLocation
    | null;

  customerLiveSharingEnabled:
    boolean;

  /* ==========================================================
     META
  ========================================================== */

  createdAt?:
    BookingTimestamp;

  updatedAt?:
    BookingTimestamp;
};