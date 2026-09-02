/* ============================================================
   BOOKING TYPES
============================================================ */

export type BookingStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

/* ============================================================
   OFFER
============================================================ */

export type OfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined"
  | "countered";

export type CounterOfferBy =
  | "customer"
  | "worker"
  | null;

export type CounterOfferStatus =
  | "none"
  | "sent"
  | "accepted"
  | "declined"
  | null;

/* ============================================================
   PAYMENT
============================================================ */

export type PaymentStatus =
  | "pending"
  | "cash"
  | "paid"
  | "failed"
  | "refunded";

/* ============================================================
   NEGOTIATION
============================================================ */

export type NegotiationStatus =
  | "none"
  | "negotiating"
  | "completed";

/* ============================================================
   LOCATION
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

  updatedAt?: unknown;
};

/* ============================================================
   BOOKING
============================================================ */

export type Booking = {
  id: string;

  /* CUSTOMER */

  customerId: string;
  customerName: string;
  customerPhotoURL?: string | null;

  /* WORKER */

  workerId: string;
  workerName: string;
  workerPhoto?: string | null;
  workerCategory?: string | null;
  workerPhone?: string | null;

  /* SERVICE */

  serviceId: string;
  serviceName: string;
  serviceIcon?: string | null;
  categoryId?: string | null;

  /* REQUEST */

  description: string;
  photos: string[];

  /* LOCATION */

  address: string;
  latitude?: number | null;
  longitude?: number | null;
  location?: BookingLocation;

  /* SCHEDULE */

  date?: string | null;
  time?: string | null;

  /* PRICE */

  amount?: number | null;
  agreedPrice?: number | null;

  /* URGENT */

  urgent: boolean;
  urgentFee?: number | null;

  /* STATUS */

  status: BookingStatus;

  /* PAYMENT */

  paymentStatus?: PaymentStatus | null;

  /* OFFER */

  offerAmount?: number | null;
  offerMessage?: string | null;

  offerRound: number;
  offerStatus: OfferStatus;

 offerExpiresAt?: unknown;
offerSentAt?: unknown;
offerRespondedAt?: unknown;
offerAcceptedAt?: unknown;
offerWorkerId?: string | null;

  /* COUNTER OFFER */

  counterOfferAmount?: number | null;
  counterOfferMessage?: string | null;

  counterOfferBy: CounterOfferBy;
  counterOfferStatus: CounterOfferStatus;

  counterOfferSentAt?: unknown;
  counterOfferRespondedAt?: unknown;

  /* NEGOTIATION */

  negotiationStatus?: NegotiationStatus | null;

  /* SERVICE CONFIRMATIONS */

  customerStartedConfirmedAt?: unknown;
  customerCompletedConfirmedAt?: unknown;

  /* LIVE LOCATION */

  workerLiveLocation?: LiveLocation | null;

  /* META */

  createdAt?: unknown;
  updatedAt?: unknown;
};

/* ============================================================
   NEGOTIATION CONSTANTS
============================================================ */

export const MAX_NEGOTIATION_ROUNDS = 3;