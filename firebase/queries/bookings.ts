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
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { bookingsCollection } from "@/firebase/collections/bookings";

import type {
  Booking,
  BookingStatus,
  CounterOfferBy,
  OfferStatus,
} from "@/types/booking";

import {
  MAX_NEGOTIATION_ROUNDS,
} from "@/types/booking";

/* ============================================================
   TYPES
============================================================ */

export type OfferAcceptedBy =
  | "customer"
  | "worker";

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

  if (price > 100_000_000) {
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
    normalizedMessage.length > 300
  ) {
    throw new Error(
      "Offer message must not exceed 300 characters.",
    );
  }

  return normalizedMessage;
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

function getOfferRound(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 1
  ) {
    return 1;
  }

  return Math.floor(value);
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

/* ============================================================
   CREATE BOOKING
============================================================ */

export async function createBooking(
  booking: Booking,
) {
  /* ----------------------------------------------------------
     CUSTOMER
  ---------------------------------------------------------- */

  const customerId =
    validateUserId(
      booking.customerId,
      "Customer ID",
    );

  /* ----------------------------------------------------------
     WORKER
  ---------------------------------------------------------- */

  const workerId =
    validateUserId(
      booking.workerId,
      "Worker ID",
    );

  /* ----------------------------------------------------------
     PREVENT SELF BOOKING
  ---------------------------------------------------------- */

  if (
    workerId === customerId
  ) {
    throw new Error(
      "Customer cannot create a booking for themselves.",
    );
  }

  /* ----------------------------------------------------------
     SERVICE
  ---------------------------------------------------------- */

  if (
    !booking.serviceId?.trim()
  ) {
    throw new Error(
      "Service ID is required.",
    );
  }

  /* ----------------------------------------------------------
     DESCRIPTION
  ---------------------------------------------------------- */

  if (
    !booking.description?.trim()
  ) {
    throw new Error(
      "Service description is required.",
    );
  }

  /* ----------------------------------------------------------
     BOOKING DATA
  ---------------------------------------------------------- */

  const bookingData = {
    ...booking,

    customerId,

    workerId,

    status:
      "pending" as BookingStatus,

    amount:
      typeof booking.amount ===
      "number"
        ? booking.amount
        : null,

    agreedPrice: null,

    /* ========================================================
       INITIAL OFFER
    ======================================================== */

    offerAmount: null,

    offerMessage: null,

    offerRound: 1,

    offerStatus:
      "none" as OfferStatus,

    offerExpiresAt: null,

    offerSentAt: null,

    offerRespondedAt: null,

    offerWorkerId: null,

    /* ========================================================
       COUNTER OFFER
    ======================================================== */

    counterOfferAmount: null,

    counterOfferMessage: null,

    counterOfferBy:
      null as CounterOfferBy,

    counterOfferStatus:
      "none",

    counterOfferSentAt: null,

    counterOfferRespondedAt: null,

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
    validateBookingId(id);

  const offerAmount =
    validateOfferPrice(price);

  const offerMessage =
    validateOfferMessage(message);

  const bookingRef = doc(
    db,
    "bookings",
    bookingId,
  );

  return runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (!snapshot.exists()) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

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
        typeof data.workerId !==
          "string" ||
        !data.workerId.trim()
      ) {
        throw new Error(
          "Worker is not assigned to this booking.",
        );
      }

      const counterStatus =
        data.counterOfferStatus;

      const counterBy =
        getValidCounterBy(
          data.counterOfferBy,
        );

      if (
        counterStatus === "sent" &&
        counterBy === "customer"
      ) {
        throw new Error(
          "The customer has an active counter offer. Accept, decline, or counter it first.",
        );
      }

      if (
        data.offerStatus === "sent"
      ) {
        throw new Error(
          "Your offer is already waiting for the customer.",
        );
      }

      const currentRound =
        getOfferRound(
          data.offerRound,
        );

      if (
        currentRound >
        MAX_NEGOTIATION_ROUNDS
      ) {
        throw new Error(
          "Maximum negotiation rounds reached.",
        );
      }

      transaction.update(
        bookingRef,
        {
          status:
            "pending" as BookingStatus,

          offerAmount,

          offerMessage,

          offerStatus:
            "sent" as OfferStatus,

          offerSentAt:
            serverTimestamp(),

          offerRespondedAt:
            null,

          offerWorkerId:
            data.workerId,

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

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   COUNTER OFFER
============================================================ */

export async function counterOffer(
  id: string,
  price: number,
  message: string = "",
  by: CounterOfferBy = "customer",
) {
  const bookingId =
    validateBookingId(id);

  const offerAmount =
    validateOfferPrice(price);

  const offerMessage =
    validateOfferMessage(message);

  if (
    by !== "customer" &&
    by !== "worker"
  ) {
    throw new Error(
      "Invalid counter offer role.",
    );
  }

  const bookingRef = doc(
    db,
    "bookings",
    bookingId,
  );

  return runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (!snapshot.exists()) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        isBookingClosed(
          data.status,
        )
      ) {
        throw new Error(
          "This booking is no longer available.",
        );
      }

      const currentRound =
        getOfferRound(
          data.offerRound,
        );

      if (
        currentRound >=
        MAX_NEGOTIATION_ROUNDS
      ) {
        throw new Error(
          "Maximum negotiation rounds reached.",
        );
      }

      const currentCounterStatus =
        data.counterOfferStatus;

      const currentCounterBy =
        getValidCounterBy(
          data.counterOfferBy,
        );

      if (
        currentCounterStatus ===
          "sent" &&
        currentCounterBy === by
      ) {
        throw new Error(
          "Your previous offer is still waiting for a response.",
        );
      }

      if (
        currentCounterStatus ===
          "sent" &&
        currentCounterBy ===
          "customer" &&
        by === "customer"
      ) {
        throw new Error(
          "The worker must respond to the current customer counter offer.",
        );
      }

      if (
        currentCounterStatus ===
          "sent" &&
        currentCounterBy ===
          "worker" &&
        by === "worker"
      ) {
        throw new Error(
          "The customer must respond to the current worker counter offer.",
        );
      }

      if (
        by === "customer" &&
        data.offerStatus !==
          "sent" &&
        currentCounterStatus !==
          "sent"
      ) {
        throw new Error(
          "There is no active worker offer to counter.",
        );
      }

      if (
        by === "worker" &&
        currentCounterStatus !==
          "sent"
      ) {
        throw new Error(
          "There is no active customer counter offer to counter.",
        );
      }

      const previousAmount =
        currentCounterStatus ===
          "sent" &&
        typeof data.counterOfferAmount ===
          "number"
          ? data.counterOfferAmount
          : typeof data.offerAmount ===
              "number"
            ? data.offerAmount
            : null;

      if (
        previousAmount !== null &&
        offerAmount === previousAmount
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
            offerAmount,

          counterOfferMessage:
            offerMessage,

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
============================================================ */

export async function acceptBooking(
  id: string,
  acceptedBy: OfferAcceptedBy,
) {
  const bookingId =
    validateBookingId(id);

  if (
    acceptedBy !== "customer" &&
    acceptedBy !== "worker"
  ) {
    throw new Error(
      "Invalid offer acceptance role.",
    );
  }

  const bookingRef = doc(
    db,
    "bookings",
    bookingId,
  );

  return runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (!snapshot.exists()) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        data.status ===
          "cancelled" ||
        data.status ===
          "expired" ||
        data.status ===
          "completed"
      ) {
        throw new Error(
          "This booking is no longer available.",
        );
      }

      const counterAmount =
        typeof data.counterOfferAmount ===
        "number"
          ? data.counterOfferAmount
          : null;

      const counterBy =
        data.counterOfferBy;

      const counterStatus =
        data.counterOfferStatus;

      const hasActiveCounter =
        counterStatus === "sent" &&
        counterAmount !== null &&
        (counterBy === "customer" ||
          counterBy === "worker");

      if (hasActiveCounter) {
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

      const workerOfferAmount =
        typeof data.offerAmount ===
        "number"
          ? data.offerAmount
          : null;

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

      if (
        acceptedBy ===
        "worker"
      ) {
        throw new Error(
          "Worker cannot accept their own offer.",
        );
      }

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
    validateBookingId(id);

  if (
    declinedBy !== "customer" &&
    declinedBy !== "worker"
  ) {
    throw new Error(
      "Invalid declining role.",
    );
  }

  const bookingRef = doc(
    db,
    "bookings",
    bookingId,
  );

  return runTransaction(
    db,
    async (transaction) => {
      const snapshot =
        await transaction.get(
          bookingRef,
        );

      if (!snapshot.exists()) {
        throw new Error(
          "Booking not found.",
        );
      }

      const data =
        snapshot.data();

      if (
        isBookingClosed(
          data.status,
        )
      ) {
        throw new Error(
          "This booking is no longer available.",
        );
      }

      const counterStatus =
        data.counterOfferStatus;

      const counterBy =
        getValidCounterBy(
          data.counterOfferBy,
        );

      if (
        counterStatus ===
          "sent" &&
        counterBy !== null
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
    validateBookingId(id);

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
    (snapshot) => {
      const bookings =
        snapshot.docs.map(
          (bookingDoc) =>
            ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            }) as Booking,
        );

      callback(bookings);
    },
    (error) => {
      onError?.(error);
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
    (snapshot) => {
      const bookings =
        snapshot.docs.map(
          (bookingDoc) =>
            ({
              id: bookingDoc.id,
              ...bookingDoc.data(),
            }) as Booking,
        );

      callback(bookings);
    },
    (error) => {
      onError?.(error);
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
    validateBookingId(id);

  const normalizedArrival =
    estimatedArrival.trim();

  if (!normalizedArrival) {
    throw new Error(
      "Estimated arrival is required.",
    );
  }

  return updateDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
    {
      estimatedArrival:
        normalizedArrival,

      updatedAt:
        serverTimestamp(),
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
    validateBookingId(id);

  return updateDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
    {
      status:
        "in-progress" as BookingStatus,

      startedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}

/* ============================================================
   FINISH WORK
============================================================ */

export async function finishWork(
  id: string,
) {
  return completeBooking(id);
}

/* ============================================================
   REJECT BOOKING
============================================================ */

export async function rejectBooking(
  id: string,
  reason?: string,
) {
  const bookingId =
    validateBookingId(id);

  return updateDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
    {
      status:
        "cancelled" as BookingStatus,

      cancelledReason:
        reason?.trim() ?? "",

      cancelledBy:
        "customer",

      cancelledAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
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
    validateBookingId(id);

  return updateDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
    {
      workerArrivedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}

/* ============================================================
   START BOOKING
============================================================ */

export async function startBooking(
  id: string,
) {
  return startWork(id);
}

/* ============================================================
   COMPLETE BOOKING
============================================================ */

export async function completeBooking(
  id: string,
) {
  const bookingId =
    validateBookingId(id);

  const bookingRef = doc(
    db,
    "bookings",
    bookingId,
  );

  return runTransaction(
    db,
    async (transaction) => {
      const bookingSnapshot =
        await transaction.get(
          bookingRef,
        );

      if (!bookingSnapshot.exists()) {
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

      const serviceRef = doc(
        db,
        "services",
        serviceId,
      );

      const serviceSnapshot =
        await transaction.get(
          serviceRef,
        );

      if (!serviceSnapshot.exists()) {
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
) {
  const bookingId =
    validateBookingId(id);

  return updateDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
    {
      status:
        "cancelled" as BookingStatus,

      cancelledAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}

/* ============================================================
   CUSTOMER CONFIRM PAYMENT
============================================================ */

export async function customerConfirmPayment(
  id: string,
) {
  const bookingId =
    validateBookingId(id);

  return updateDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
    {
      paymentStatus:
        "paid",

      customerPaymentConfirmedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}

/* ============================================================
   WORKER CONFIRM PAYMENT
============================================================ */

export async function workerConfirmPayment(
  id: string,
) {
  const bookingId =
    validateBookingId(id);

  const bookingRef = doc(
    db,
    "bookings",
    bookingId,
  );

  return runTransaction(
    db,
    async (transaction) => {
      const bookingSnapshot =
        await transaction.get(
          bookingRef,
        );

      if (!bookingSnapshot.exists()) {
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

      const serviceRef = doc(
        db,
        "services",
        serviceId,
      );

      const serviceSnapshot =
        await transaction.get(
          serviceRef,
        );

      if (!serviceSnapshot.exists()) {
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
    validateBookingId(id);

  return deleteDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
  );
}