import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  bookingsCollection,
} from "@/firebase/collections/bookings";

import type {
  Booking,
  BookingStatus,
  CounterOfferBy,
  OfferStatus,
} from "@/types/booking";

/* ============================================================
   TYPES
============================================================ */

export type OfferAcceptedBy =
  | "customer"
  | "worker";



export const CUSTOMER_CANCELLATION_REASONS = [
  "not_ready",
  "accidental_request",
  "request_later",
  "personal_reason",
  "other",
] as const;

export type CustomerCancellationReason =
  (typeof CUSTOMER_CANCELLATION_REASONS)[number];
  
/* ============================================================
   CONSTANTS
============================================================ */

const MAX_OFFER_AMOUNT =
  100_000_000;

const MAX_OFFER_MESSAGE_LENGTH =
  300;

const MAX_CANCEL_REASON_LENGTH =
  500;

const MAX_ESTIMATED_ARRIVAL_LENGTH =
  120;

/* ============================================================
   VALIDATION
============================================================ */

function validateBookingId(
  id: string,
): string {
  const normalizedId =
    typeof id === "string"
      ? id.trim()
      : "";

  if (!normalizedId) {
    throw new Error(
      "Booking ID is required.",
    );
  }

  return normalizedId;
}

function validateUserId(
  id: string,
  label: string,
): string {
  const normalizedId =
    typeof id === "string"
      ? id.trim()
      : "";

  if (!normalizedId) {
    throw new Error(
      `${label} is required.`,
    );
  }

  return normalizedId;
}

function validateOfferPrice(
  price: number,
): number {
  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new Error(
      "A valid offer price is required.",
    );
  }

  if (
    price >
    MAX_OFFER_AMOUNT
  ) {
    throw new Error(
      "Offer price is too high.",
    );
  }

  return Math.round(price);
}

function validateOfferMessage(
  message: string = "",
): string {
  const normalizedMessage =
    typeof message === "string"
      ? message.trim()
      : "";

  if (
    normalizedMessage.length >
    MAX_OFFER_MESSAGE_LENGTH
  ) {
    throw new Error(
      `Offer message must not exceed ${MAX_OFFER_MESSAGE_LENGTH} characters.`,
    );
  }

  return normalizedMessage;
}

function validateEstimatedArrival(
  value: string,
): string {
  const normalizedValue =
    typeof value === "string"
      ? value.trim()
      : "";

  if (!normalizedValue) {
    throw new Error(
      "Estimated arrival is required.",
    );
  }

  if (
    normalizedValue.length >
    MAX_ESTIMATED_ARRIVAL_LENGTH
  ) {
    throw new Error(
      "Estimated arrival is too long.",
    );
  }

  return normalizedValue;
}

function validateCancellationReason(
  reason?: string,
): string {
  const normalizedReason =
    typeof reason === "string"
      ? reason.trim()
      : "";

  if (
    normalizedReason.length >
    MAX_CANCEL_REASON_LENGTH
  ) {
    throw new Error(
      `Cancellation reason must not exceed ${MAX_CANCEL_REASON_LENGTH} characters.`,
    );
  }

  return normalizedReason;
}

/* ============================================================
   FIRESTORE TIMESTAMP HELPER
============================================================ */

function getTimestampMillis(
  value: unknown,
): number | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  if (
    !("toMillis" in value)
  ) {
    return null;
  }

  const timestamp =
    value as {
      toMillis?: () => unknown;
    };

  if (
    typeof timestamp.toMillis !==
    "function"
  ) {
    return null;
  }

  const millis =
    timestamp.toMillis();

  if (
    typeof millis !== "number" ||
    !Number.isFinite(millis)
  ) {
    return null;
  }

  return millis;
}

/* ============================================================
   AUTH
============================================================ */

function getCurrentUserId(): string {
  const userId =
    auth.currentUser
      ?.uid
      ?.trim();

  if (!userId) {
    throw new Error(
      "You must be signed in to continue.",
    );
  }

  return userId;
}

function assertParticipantAccess(
  data: {
    customerId?: unknown;
    workerId?: unknown;
  },
  role: OfferAcceptedBy,
  currentUserId: string,
) {
  const customerId =
    typeof data.customerId ===
      "string"
      ? data.customerId.trim()
      : "";

  const workerId =
    typeof data.workerId ===
      "string"
      ? data.workerId.trim()
      : "";

  if (
    !customerId ||
    !workerId
  ) {
    throw new Error(
      "Booking participants are unavailable.",
    );
  }

  if (
    role === "customer" &&
    currentUserId !==
      customerId
  ) {
    throw new Error(
      "You are not allowed to perform this customer action.",
    );
  }

  if (
    role === "worker" &&
    currentUserId !==
      workerId
  ) {
    throw new Error(
      "You are not allowed to perform this worker action.",
    );
  }
}

/* ============================================================
   BOOKING STATE HELPERS
============================================================ */

function isBookingClosed(
  status: unknown,
): boolean {
  return (
    status === "cancelled" ||
    status === "expired" ||
    status === "completed"
  );
}

/*
 * Negotiation turn counter.
 *
 * 0 = fresh booking
 * 1 = worker initial offer
 * 2+ = alternating counter offers
 *
 * There is intentionally NO maximum round.
 */
function getOfferRound(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return Math.floor(
    value,
  );
}

function getValidCounterBy(
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

function getValidAmount(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function isSameAmount(
  first: number,
  second: number,
): boolean {
  return (
    Math.round(first) ===
    Math.round(second)
  );
}

/* ============================================================
   CREATE BOOKING
============================================================ */

export async function createBooking(
  booking: Booking,
) {
  const customerId =
    validateUserId(
      booking.customerId,
      "Customer ID",
    );

  const workerId =
    validateUserId(
      booking.workerId,
      "Worker ID",
    );

  if (
    workerId ===
    customerId
  ) {
    throw new Error(
      "Customer cannot create a booking for themselves.",
    );
  }

  const serviceId =
    typeof booking.serviceId ===
      "string"
      ? booking.serviceId.trim()
      : "";

  if (!serviceId) {
    throw new Error(
      "Service ID is required.",
    );
  }

  const description =
    typeof booking.description ===
      "string"
      ? booking.description.trim()
      : "";

  if (!description) {
    throw new Error(
      "Service description is required.",
    );
  }

  const bookingData = {
    ...booking,

    customerId,

    workerId,

    serviceId,

    description,

    status:
      "pending" as BookingStatus,

    /* ========================================================
       CANCELLATION
    ======================================================== */

    cancellationReason:
      null,

    cancelledBy:
      null,

    cancelledAt:
      null,

    /* ========================================================
       PRICE
    ======================================================== */

    amount:
      typeof booking.amount ===
        "number" &&
      Number.isFinite(
        booking.amount,
      ) &&
      booking.amount > 0
        ? booking.amount
        : null,

    agreedPrice:
      null,

    /* ========================================================
       INITIAL OFFER
    ======================================================== */

    offerAmount:
      null,

    offerMessage:
      null,

    offerRound:
      0,

    offerStatus:
      "none" as OfferStatus,

    offerExpiresAt:
      null,

    offerSentAt:
      null,

    offerRespondedAt:
      null,

    offerAcceptedAt:
      null,

    offerWorkerId:
      null,

    /* ========================================================
       COUNTER OFFER
    ======================================================== */

    counterOfferAmount:
      null,

    counterOfferMessage:
      null,

    counterOfferBy:
      null as CounterOfferBy,

    counterOfferStatus:
      "none",

    counterOfferSentAt:
      null,

    counterOfferRespondedAt:
      null,

    /* ========================================================
       NEGOTIATION
    ======================================================== */

    negotiationStatus:
      "none",

    /* ========================================================
       PAYMENT
    ======================================================== */

    paymentStatus:
      "pending",

    /* ========================================================
       META
    ======================================================== */

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  return addDoc(
    bookingsCollection,
    bookingData,
  );
}

/* ============================================================
   WORKER SEND INITIAL OFFER
============================================================ */

export async function sendEstimate(
  id: string,
  price: number,
  message: string = "",
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const offerAmount =
    validateOfferPrice(
      price,
    );

  const offerMessage =
    validateOfferMessage(
      message,
    );

  const currentWorkerId =
    getCurrentUserId();

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      assertParticipantAccess(
        data,
        "worker",
        currentWorkerId,
      );

      if (
        isBookingClosed(
          data.status,
        )
      ) {
        throw new Error(
          "This booking is no longer available.",
        );
      }

      if (
        data.status !==
        "pending"
      ) {
        throw new Error(
          "This booking is not waiting for an offer.",
        );
      }

      const currentRound =
        getOfferRound(
          data.offerRound,
        );

      if (
        currentRound !== 0
      ) {
        throw new Error(
          "An initial offer can no longer be sent for this booking.",
        );
      }

      if (
        data.offerStatus !==
        "none"
      ) {
        if (
          data.offerStatus ===
          "sent"
        ) {
          throw new Error(
            "Your offer is already waiting for the customer.",
          );
        }

        if (
          data.offerStatus ===
          "accepted"
        ) {
          throw new Error(
            "This offer has already been accepted.",
          );
        }

        throw new Error(
          "This booking is no longer ready for an initial offer.",
        );
      }

      if (
        data.counterOfferStatus !==
        "none"
      ) {
        throw new Error(
          "This booking already has negotiation activity.",
        );
      }

      if (
        getValidCounterBy(
          data.counterOfferBy,
        ) !== null
      ) {
        throw new Error(
          "This booking has an invalid negotiation state.",
        );
      }

      transaction.update(
        bookingRef,
        {
          status:
            "pending" as BookingStatus,

          offerAmount,

          offerMessage,

          offerRound:
            1,

          offerStatus:
            "sent" as OfferStatus,

          /*
           * Backend expiry function populates
           * the authoritative 24-hour expiry.
           */
          offerExpiresAt:
            null,

          offerSentAt:
            serverTimestamp(),

          offerRespondedAt:
            null,

          offerAcceptedAt:
            null,

          offerWorkerId:
            currentWorkerId,

          counterOfferAmount:
            null,

          counterOfferMessage:
            null,

          counterOfferBy:
            null,

          counterOfferStatus:
            "none",

          counterOfferSentAt:
            null,

          counterOfferRespondedAt:
            null,

          negotiationStatus:
            "negotiating",

          cancellationReason:
            null,

          cancelledBy:
            null,

          cancelledAt:
            null,

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   COUNTER OFFER

   Unlimited alternating negotiation.

   Worker
      ↓
   Customer counter
      ↓
   Worker counter
      ↓
   Customer counter
      ↓
   ...

   Once an active counter exists, the original
   24-hour initial offer expiry no longer controls
   the negotiation.
============================================================ */

export async function counterOffer(
  id: string,
  price: number,
  message: string = "",
  by: CounterOfferBy = "customer",
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const counterAmount =
    validateOfferPrice(
      price,
    );

  const counterMessage =
    validateOfferMessage(
      message,
    );

  if (
    by !== "customer" &&
    by !== "worker"
  ) {
    throw new Error(
      "Invalid counter offer role.",
    );
  }

  const currentUserId =
    getCurrentUserId();

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      assertParticipantAccess(
        data,
        by,
        currentUserId,
      );

      if (
        isBookingClosed(
          data.status,
        )
      ) {
        throw new Error(
          "This booking is no longer available.",
        );
      }

      if (
        data.status !==
        "pending"
      ) {
        throw new Error(
          "This booking is no longer open for negotiation.",
        );
      }

      if (
        data.offerStatus !==
        "sent"
      ) {
        throw new Error(
          "There is no active offer to negotiate.",
        );
      }

      const initialWorkerOffer =
        getValidAmount(
          data.offerAmount,
        );

      if (
        initialWorkerOffer ===
        null
      ) {
        throw new Error(
          "The worker offer amount is unavailable.",
        );
      }

      const currentRound =
        getOfferRound(
          data.offerRound,
        );

      if (
        currentRound < 1
      ) {
        throw new Error(
          "There is no active worker offer to negotiate.",
        );
      }

      const currentCounterStatus =
        typeof data.counterOfferStatus ===
          "string"
          ? data.counterOfferStatus
          : "none";

      const currentCounterBy =
        getValidCounterBy(
          data.counterOfferBy,
        );

      const currentCounterAmount =
        getValidAmount(
          data.counterOfferAmount,
        );

      let activeOfferAmount:
        | number
        | null =
        null;

      /* ======================================================
         ACTIVE COUNTER
      ====================================================== */

      if (
        currentCounterStatus ===
        "sent"
      ) {
        if (
          currentCounterBy ===
            null ||
          currentCounterAmount ===
            null
        ) {
          throw new Error(
            "This booking has an invalid counter offer state.",
          );
        }

        if (
          currentCounterBy ===
          by
        ) {
          throw new Error(
            by === "customer"
              ? "Your previous counter offer is still waiting for the worker."
              : "Your previous counter offer is still waiting for the customer.",
          );
        }

        activeOfferAmount =
          currentCounterAmount;
      } else {
        /* ====================================================
           NO COUNTER YET
        ==================================================== */

        if (
          currentCounterStatus !==
          "none"
        ) {
          throw new Error(
            "This negotiation is no longer available.",
          );
        }

        if (
          currentCounterBy !==
          null
        ) {
          throw new Error(
            "This booking has an invalid negotiation state.",
          );
        }

        if (
          by !== "customer"
        ) {
          throw new Error(
            "Worker cannot counter their own initial offer.",
          );
        }

        activeOfferAmount =
          initialWorkerOffer;
      }

      if (
        activeOfferAmount ===
        null
      ) {
        throw new Error(
          "The current offer amount is unavailable.",
        );
      }

      if (
        isSameAmount(
          counterAmount,
          activeOfferAmount,
        )
      ) {
        throw new Error(
          "Your counter offer must be different from the current offer.",
        );
      }

      const nextRound =
        currentRound + 1;

      transaction.update(
        bookingRef,
        {
          status:
            "pending" as BookingStatus,

          counterOfferAmount:
            counterAmount,

          counterOfferMessage:
            counterMessage,

          counterOfferBy:
            by,

          counterOfferStatus:
            "sent",

          counterOfferSentAt:
            serverTimestamp(),

          counterOfferRespondedAt:
            null,

          offerRound:
            nextRound,

          offerRespondedAt:
            serverTimestamp(),

          negotiationStatus:
            "negotiating",

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   ACCEPT OFFER

   Initial worker offer:
     - 24-hour expiry
     - customer only

   Active counter offer:
     - original expiry no longer applies
     - only the other party can accept

   IMPORTANT:
     Client-side Date.now() is only an additional
     protection. Firestore Rules must also enforce
     request.time against offerExpiresAt.
============================================================ */

export async function acceptBooking(
  id: string,
  acceptedBy: OfferAcceptedBy,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  if (
    acceptedBy !== "customer" &&
    acceptedBy !== "worker"
  ) {
    throw new Error(
      "Invalid offer acceptance role.",
    );
  }

  const currentUserId =
    getCurrentUserId();

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      /* ======================================================
         AUTHORIZATION
      ====================================================== */

      assertParticipantAccess(
        data,
        acceptedBy,
        currentUserId,
      );

      /* ======================================================
         BOOKING STATE
      ====================================================== */

      if (
        isBookingClosed(
          data.status,
        )
      ) {
        throw new Error(
          "This booking is no longer available.",
        );
      }

      if (
        data.status !==
        "pending"
      ) {
        throw new Error(
          "This booking is no longer waiting for an offer response.",
        );
      }

      /* ======================================================
         COUNTER OFFER STATE
      ====================================================== */

      const counterAmount =
        getValidAmount(
          data.counterOfferAmount,
        );

      const counterBy =
        getValidCounterBy(
          data.counterOfferBy,
        );

      const counterStatus =
        data.counterOfferStatus;

      const hasActiveCounter =
        counterStatus ===
          "sent" &&
        counterAmount !==
          null &&
        counterBy !==
          null;

      /* ======================================================
         ACCEPT ACTIVE COUNTER
      ====================================================== */

      if (
        hasActiveCounter
      ) {
        /*
         * The party who created the counter
         * cannot accept their own counter.
         */
        if (
          counterBy ===
          acceptedBy
        ) {
          throw new Error(
            "You cannot accept your own offer.",
          );
        }

        transaction.update(
          bookingRef,
          {
            status:
              "accepted" as BookingStatus,

            agreedPrice:
              counterAmount,

            amount:
              counterAmount,

            offerStatus:
              "accepted" as OfferStatus,

            counterOfferStatus:
              "accepted",

            offerRespondedAt:
              serverTimestamp(),

            offerAcceptedAt:
              serverTimestamp(),

            counterOfferRespondedAt:
              serverTimestamp(),

            negotiationStatus:
              "completed",

            updatedAt:
              serverTimestamp(),
          },
        );

        return;
      }

      /* ======================================================
         ACCEPT INITIAL WORKER OFFER
      ====================================================== */

      const workerOfferAmount =
        getValidAmount(
          data.offerAmount,
        );

      if (
        data.offerStatus !==
          "sent" ||
        workerOfferAmount ===
          null
      ) {
        throw new Error(
          "There is no active offer to accept.",
        );
      }

      /*
       * Only customer can accept the
       * worker's initial offer.
       */
      if (
        acceptedBy !==
        "customer"
      ) {
        throw new Error(
          "Worker cannot accept their own offer.",
        );
      }

      /* ======================================================
         AUTHORITATIVE OFFER EXPIRY
      ====================================================== */

      const offerExpiresAt =
        getTimestampMillis(
          data.offerExpiresAt,
        );

      /*
       * Fail closed if backend has not populated
       * the expiry timestamp yet.
       */
      if (
        offerExpiresAt ===
        null
      ) {
        throw new Error(
          "This offer is still being prepared. Please try again shortly.",
        );
      }

      /*
       * Client-side protection.
       *
       * Firestore Rules must independently enforce
       * request.time < offerExpiresAt.
       */
      if (
        Date.now() >=
        offerExpiresAt
      ) {
        throw new Error(
          "This offer has expired. The booking can no longer be accepted.",
        );
      }

      /* ======================================================
         ACCEPT
      ====================================================== */

      transaction.update(
        bookingRef,
        {
          status:
            "accepted" as BookingStatus,

          agreedPrice:
            workerOfferAmount,

          amount:
            workerOfferAmount,

          offerStatus:
            "accepted" as OfferStatus,

          offerRespondedAt:
            serverTimestamp(),

          offerAcceptedAt:
            serverTimestamp(),

          negotiationStatus:
            "completed",

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   DECLINE OFFER
============================================================ */

export async function declineOffer(
  id: string,
  declinedBy: OfferAcceptedBy,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  if (
    declinedBy !== "customer" &&
    declinedBy !== "worker"
  ) {
    throw new Error(
      "Invalid declining role.",
    );
  }

  const currentUserId =
    getCurrentUserId();

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      assertParticipantAccess(
        data,
        declinedBy,
        currentUserId,
      );

      if (
        isBookingClosed(
          data.status,
        )
      ) {
        throw new Error(
          "This booking is no longer available.",
        );
      }

      if (
        data.status !==
        "pending"
      ) {
        throw new Error(
          "This booking is no longer waiting for an offer response.",
        );
      }

      const counterStatus =
        data.counterOfferStatus;

      const counterBy =
        getValidCounterBy(
          data.counterOfferBy,
        );

      /* ======================================================
         DECLINE ACTIVE COUNTER
      ====================================================== */

      if (
        counterStatus ===
          "sent" &&
        counterBy !==
          null
      ) {
        if (
          counterBy ===
          declinedBy
        ) {
          throw new Error(
            "You cannot decline your own offer.",
          );
        }

        transaction.update(
          bookingRef,
          {
            status:
              "cancelled" as BookingStatus,

            offerStatus:
              "declined" as OfferStatus,

            counterOfferStatus:
              "declined",

            offerRespondedAt:
              serverTimestamp(),

            counterOfferRespondedAt:
              serverTimestamp(),

            negotiationStatus:
              "completed",

            cancellationReason:
              declinedBy ===
              "customer"
                ? "customer_cancelled"
                : "worker_cancelled",

            cancelledBy:
              declinedBy,

            cancelledAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        return;
      }

      /* ======================================================
         DECLINE INITIAL WORKER OFFER
      ====================================================== */

      if (
        data.offerStatus !==
        "sent"
      ) {
        throw new Error(
          "There is no active offer to decline.",
        );
      }

      if (
        declinedBy !==
        "customer"
      ) {
        throw new Error(
          "Worker cannot decline their own offer.",
        );
      }

      transaction.update(
        bookingRef,
        {
          status:
            "cancelled" as BookingStatus,

          offerStatus:
            "declined" as OfferStatus,

          offerRespondedAt:
            serverTimestamp(),

          negotiationStatus:
            "completed",

          cancellationReason:
            "customer_cancelled",

          cancelledBy:
            "customer",

          cancelledAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   GET BOOKING
============================================================ */

export async function getBooking(
  id: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  return getDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
  );
}

/* ============================================================
   CUSTOMER BOOKINGS
============================================================ */

export async function getCustomerBookings(
  customerId: string,
) {
  const normalizedCustomerId =
    validateUserId(
      customerId,
      "Customer ID",
    );

  return getDocs(
    query(
      bookingsCollection,
      where(
        "customerId",
        "==",
        normalizedCustomerId,
      ),
    ),
  );
}

/* ============================================================
   CUSTOMER BOOKINGS REALTIME
============================================================ */

export function listenCustomerBookings(
  customerId: string,
  callback: (
    bookings: Booking[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
) {
  const normalizedCustomerId =
    validateUserId(
      customerId,
      "Customer ID",
    );

  const bookingsQuery =
    query(
      bookingsCollection,
      where(
        "customerId",
        "==",
        normalizedCustomerId,
      ),
    );

  return onSnapshot(
    bookingsQuery,

    snapshot => {
      const bookings =
        snapshot.docs.map(
          bookingDoc =>
            ({
              id:
                bookingDoc.id,

              ...bookingDoc.data(),
            }) as Booking,
        );

      callback(
        bookings,
      );
    },

    error => {
      onError?.(
        error,
      );
    },
  );
}

/* ============================================================
   WORKER BOOKINGS
============================================================ */

export async function getWorkerBookings(
  workerId: string,
) {
  const normalizedWorkerId =
    validateUserId(
      workerId,
      "Worker ID",
    );

  return getDocs(
    query(
      bookingsCollection,
      where(
        "workerId",
        "==",
        normalizedWorkerId,
      ),
    ),
  );
}

/* ============================================================
   WORKER BOOKINGS REALTIME
============================================================ */

export function listenWorkerBookings(
  workerId: string,
  callback: (
    bookings: Booking[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
) {
  const normalizedWorkerId =
    validateUserId(
      workerId,
      "Worker ID",
    );

  const bookingsQuery =
    query(
      bookingsCollection,
      where(
        "workerId",
        "==",
        normalizedWorkerId,
      ),
    );

  return onSnapshot(
    bookingsQuery,

    snapshot => {
      const bookings =
        snapshot.docs.map(
          bookingDoc =>
            ({
              id:
                bookingDoc.id,

              ...bookingDoc.data(),
            }) as Booking,
        );

      callback(
        bookings,
      );
    },

    error => {
      onError?.(
        error,
      );
    },
  );
}

/* ============================================================
   PENDING BOOKINGS
============================================================ */

export async function getPendingBookings() {
  return getDocs(
    query(
      bookingsCollection,
      where(
        "status",
        "==",
        "pending",
      ),
    ),
  );
}

/* ============================================================
   START JOURNEY
============================================================ */

export async function startJourney(
  id: string,
  estimatedArrival: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const normalizedArrival =
    validateEstimatedArrival(
      estimatedArrival,
    );

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        data.status !==
        "accepted"
      ) {
        throw new Error(
          "Journey can only start after the booking has been accepted.",
        );
      }

      transaction.update(
        bookingRef,
        {
          estimatedArrival:
            normalizedArrival,

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   START WORK
============================================================ */

export async function startWork(
  id: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        data.status !==
        "accepted"
      ) {
        throw new Error(
          "This booking is not ready to start.",
        );
      }

      const agreedPrice =
        getValidAmount(
          data.agreedPrice,
        );

      if (
        agreedPrice ===
        null
      ) {
        throw new Error(
          "The agreed service amount is unavailable.",
        );
      }

      transaction.update(
        bookingRef,
        {
          status:
            "in-progress" as BookingStatus,

          startedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   FINISH WORK
============================================================ */

export async function finishWork(
  id: string,
) {
  return completeBooking(
    id,
  );
}

/* ============================================================
   REJECT BOOKING
============================================================ */

export async function rejectBooking(
  id: string,
  reason?: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const cancellationReason =
    validateCancellationReason(
      reason,
    );

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        data.status !==
          "pending" &&
        data.status !==
          "accepted"
      ) {
        throw new Error(
          "This booking can no longer be cancelled.",
        );
      }

      transaction.update(
        bookingRef,
        {
          status:
            "cancelled" as BookingStatus,

          cancellationReason:
            cancellationReason ||
            "customer_cancelled",

          cancelledBy:
            "customer",

          cancelledAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   WORKER ARRIVED
============================================================ */

export async function arrivedBooking(
  id: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !snapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        data.status !==
          "accepted" &&
        data.status !==
          "in-progress"
      ) {
        throw new Error(
          "Worker arrival cannot be recorded for this booking.",
        );
      }

      transaction.update(
        bookingRef,
        {
          workerArrivedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   START BOOKING
============================================================ */

export async function startBooking(
  id: string,
) {
  return startWork(
    id,
  );
}

/* ============================================================
   COMPLETE BOOKING
============================================================ */

export async function completeBooking(
  id: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const bookingSnapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !bookingSnapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const booking =
        bookingSnapshot.data();

      if (
        booking.status ===
        "completed"
      ) {
        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        throw new Error(
          "Only an in-progress booking can be completed.",
        );
      }

      const agreedPrice =
        getValidAmount(
          booking.agreedPrice,
        );

      if (
        agreedPrice ===
        null
      ) {
        throw new Error(
          "The agreed service amount is unavailable.",
        );
      }

      const serviceId =
        typeof booking.serviceId ===
          "string"
          ? booking.serviceId.trim()
          : "";

      if (!serviceId) {
        throw new Error(
          "Booking has no service ID.",
        );
      }

      const serviceRef =
        doc(
          db,
          "services",
          serviceId,
        );

      const serviceSnapshot =
        await transaction.get(
          serviceRef,
        );

      if (
        !serviceSnapshot.exists()
      ) {
        throw new Error(
          "Service associated with this booking was not found.",
        );
      }

      transaction.update(
        bookingRef,
        {
          status:
            "completed" as BookingStatus,

          amount:
            agreedPrice,

          agreedPrice,

          paymentStatus:
            "cash",

          completedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );

      transaction.update(
        serviceRef,
        {
          completedCount:
            increment(1),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   CANCEL BOOKING
============================================================ */
export async function cancelBooking(
  id: string,
  reason: CustomerCancellationReason,
  note = "",
) {
  const bookingId = validateBookingId(id);
  const currentUserId = getCurrentUserId();

  if (
    !CUSTOMER_CANCELLATION_REASONS.includes(reason)
  ) {
    throw new Error(
      "Please select a valid cancellation reason.",
    );
  }

  const normalizedNote =
    typeof note === "string" ? note.trim() : "";

  if (
    normalizedNote.length > MAX_CANCEL_REASON_LENGTH
  ) {
    throw new Error(
      `Cancellation note must not exceed ${MAX_CANCEL_REASON_LENGTH} characters.`,
    );
  }

  if (
    reason === "other" &&
    !normalizedNote
  ) {
    throw new Error(
      "Please explain your cancellation reason.",
    );
  }

  const bookingRef = doc(db, "bookings", bookingId);

  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(bookingRef);

    if (!snapshot.exists()) {
      throw new Error("Booking not found.");
    }

    const data = snapshot.data();

    assertParticipantAccess(
      data,
      "customer",
      currentUserId,
    );

    if (data.status !== "pending") {
      throw new Error(
        "This booking can no longer be cancelled.",
      );
    }

    if (
      data.offerStatus === "sent" ||
      data.counterOfferStatus === "sent"
    ) {
      throw new Error(
        "An offer is in progress. Use Decline to end the negotiation.",
      );
    }

    if (
      data.cancellationReason === "offer_expired"
    ) {
      throw new Error(
        "This offer has already expired.",
      );
    }

    transaction.update(bookingRef, {
      status: "cancelled" as BookingStatus,

      cancellationReason: reason,

      cancellationNote: normalizedNote || null,

      cancelledBy: "customer",

      cancelledAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    });
  });
}

/* ============================================================
   WORKER CONFIRM PAYMENT
============================================================ */

export async function workerConfirmPayment(
  id: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );

  return runTransaction(
    db,
    async transaction => {
      const bookingSnapshot =
        await transaction.get(
          bookingRef,
        );

      if (
        !bookingSnapshot.exists()
      ) {
        throw new Error(
          "Booking not found.",
        );
      }

      const booking =
        bookingSnapshot.data();

      if (
        booking.status ===
        "completed"
      ) {
        transaction.update(
          bookingRef,
          {
            paymentStatus:
              "paid",

            workerPaymentConfirmedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          },
        );

        return;
      }

      if (
        booking.status !==
        "in-progress"
      ) {
        throw new Error(
          "Payment cannot be confirmed for this booking.",
        );
      }

      const serviceId =
        typeof booking.serviceId ===
          "string"
          ? booking.serviceId.trim()
          : "";

      if (!serviceId) {
        throw new Error(
          "Booking has no service ID.",
        );
      }

      const serviceRef =
        doc(
          db,
          "services",
          serviceId,
        );

      const serviceSnapshot =
        await transaction.get(
          serviceRef,
        );

      if (
        !serviceSnapshot.exists()
      ) {
        throw new Error(
          "Service associated with this booking was not found.",
        );
      }

      transaction.update(
        bookingRef,
        {
          status:
            "completed" as BookingStatus,

          paymentStatus:
            "paid",

          workerPaymentConfirmedAt:
            serverTimestamp(),

          completedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );

      transaction.update(
        serviceRef,
        {
          completedCount:
            increment(1),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   DELETE BOOKING
============================================================ */

export async function deleteBooking(
  id: string,
) {
  const bookingId =
    validateBookingId(
      id,
    );

  return deleteDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
  );
}