import type {
  Timestamp,
} from "firebase/firestore";

import type {
  BookingStatus,
  CounterOfferBy,
  OfferStatus,
} from "@/types/booking";

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

  latitude?: number | null;

  longitude?: number | null;
};

/* ============================================================
   LIVE LOCATION
============================================================ */

export type LiveLocation = {
  latitude: number;

  longitude: number;

  accuracy?: number | null;

  heading?: number | null;

  speed?: number | null;

  userId?: string;

  updatedAt?: BookingTimestamp;
};

/* ============================================================
   CUSTOMER BOOKING
============================================================ */

export type CustomerBooking = {
  id: string;

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

  location?: BookingLocation;

  /* ==========================================================
     SCHEDULE
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

  /**
   * Final mutually agreed service amount.
   *
   * Once an offer is accepted this should
   * be treated as the source of truth for
   * the agreed service price.
   */
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

  status: BookingStatus;

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

  offerStatus: OfferStatus;

  offerExpiresAt?: BookingTimestamp;

  offerSentAt?: BookingTimestamp;

  offerRespondedAt?: BookingTimestamp;

  /* ==========================================================
     COUNTER OFFER
  ========================================================== */

  counterOfferAmount?:
    | number
    | null;

  counterOfferMessage?:
    | string
    | null;

  counterOfferBy: CounterOfferBy;

  counterOfferStatus:
    CounterOfferStatus;

  counterOfferSentAt?:
    BookingTimestamp;

  counterOfferRespondedAt?:
    BookingTimestamp;

  /* ==========================================================
     SERVICE CONFIRMATIONS
  ========================================================== */

  customerStartedConfirmedAt?:
    BookingTimestamp;

  customerCompletedConfirmedAt?:
    BookingTimestamp;

  /* ==========================================================
     LIVE LOCATION
  ========================================================== */

  workerLiveLocation?:
    | LiveLocation
    | null;

  /* ==========================================================
     META
  ========================================================== */

  createdAt?: BookingTimestamp;

  updatedAt?: BookingTimestamp;
};