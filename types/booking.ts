/* ============================================================
   BOOKING TYPES
============================================================ */

export type BookingStatus =
  | "pending"
  | "accepted"
  | "awaiting_start_confirmation"
  | "in-progress"
  | "awaiting_completion_confirmation"
  | "completed"
  | "cancelled"
  | "expired";

/* ============================================================
   CANCELLATION
============================================================ */

export type BookingCancellationReason =
  | "customer_cancelled"
  | "worker_cancelled"
  | "offer_expired"
  | "system";

export type BookingCancelledBy =
  | "customer"
  | "worker"
  | "system"
  | null;

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

  /* ----------------------------------------------------------
     CUSTOMER
  ---------------------------------------------------------- */

  customerId: string;
  customerName: string;
  customerPhotoURL?: string | null;

  /* ----------------------------------------------------------
     WORKER
  ---------------------------------------------------------- */

  workerId: string;
  workerName: string;
  workerPhoto?: string | null;
  workerCategory?: string | null;
  workerPhone?: string | null;

  /* ----------------------------------------------------------
     SERVICE
  ---------------------------------------------------------- */

  serviceId: string;
  serviceName: string;
  serviceIcon?: string | null;
  categoryId?: string | null;

  /* ----------------------------------------------------------
     REQUEST
  ---------------------------------------------------------- */

  description: string;
  photos: string[];

  /* ----------------------------------------------------------
     LOCATION
  ---------------------------------------------------------- */

  address: string;
  latitude?: number | null;
  longitude?: number | null;
  location?: BookingLocation;

  /* ----------------------------------------------------------
     SCHEDULE
  ---------------------------------------------------------- */

  date?: string | null;
  time?: string | null;

  /* ----------------------------------------------------------
     PRICE
  ---------------------------------------------------------- */

  amount?: number | null;
  agreedPrice?: number | null;

  /* ----------------------------------------------------------
     URGENT
  ---------------------------------------------------------- */

  urgent: boolean;
  urgentFee?: number | null;

  /* ----------------------------------------------------------
     STATUS
  ---------------------------------------------------------- */

  status: BookingStatus;

  /* ----------------------------------------------------------
     CANCELLATION
  ---------------------------------------------------------- */

  cancellationReason?: BookingCancellationReason | null;
  cancelledBy?: BookingCancelledBy;
  cancelledAt?: unknown;

  /* ----------------------------------------------------------
     PAYMENT
  ---------------------------------------------------------- */

  paymentStatus?: PaymentStatus | null;

  /* ----------------------------------------------------------
     OFFER
  ---------------------------------------------------------- */

  offerAmount?: number | null;
  offerMessage?: string | null;

  offerRound: number;
  offerStatus: OfferStatus;

  offerExpiresAt?: unknown;
  offerSentAt?: unknown;
  offerRespondedAt?: unknown;
  offerAcceptedAt?: unknown;
  offerWorkerId?: string | null;

  /* ----------------------------------------------------------
     COUNTER OFFER
  ---------------------------------------------------------- */

  counterOfferAmount?: number | null;
  counterOfferMessage?: string | null;

  counterOfferBy: CounterOfferBy;
  counterOfferStatus: CounterOfferStatus;

  counterOfferSentAt?: unknown;
  counterOfferRespondedAt?: unknown;

  /* ----------------------------------------------------------
     NEGOTIATION
  ---------------------------------------------------------- */

  negotiationStatus?: NegotiationStatus | null;

  /* ----------------------------------------------------------
     SERVICE CONFIRMATIONS
  ---------------------------------------------------------- */

  customerStartedConfirmedAt?: unknown;

  // Legacy field retained for backward compatibility.
  workerCompletionRequestedAt?: unknown;

  // Worker marks the service finished; customer must confirm.
  workerMarkedCompletedAt?: unknown;

  customerCompletedConfirmedAt?: unknown;

  /* ----------------------------------------------------------
     LIVE LOCATION
  ---------------------------------------------------------- */

  workerLiveLocation?: LiveLocation | null;

  /* ----------------------------------------------------------
     META
  ---------------------------------------------------------- */

  createdAt?: unknown;
  updatedAt?: unknown;
};

/* ============================================================
   CUSTOMER BOOKING
============================================================ */

/**
 * CustomerBooking intentionally uses the same booking shape
 * as Booking.
 *
 * This ensures customer-side hooks/components can safely access:
 *
 * - cancellationReason
 * - cancelledBy
 * - cancelledAt
 * - offerExpiresAt
 * - offerStatus
 * - counterOfferStatus
 * - negotiationStatus
 *
 * without using `any`.
 */
export type CustomerBooking = Booking;

/* ============================================================
   NEGOTIATION CONSTANTS
============================================================ */

/**
 * Kept for backwards compatibility with existing code.
 *
 * Current counter-offer business logic is handled by the
 * booking query/service layer and may allow continued
 * negotiation beyond this value.
 */
export const MAX_NEGOTIATION_ROUNDS = 3;