import {
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

import {
  sendCustomerPushNotification,
} from "./sendCustomerPushNotification";

/* ============================================================
   TYPES
============================================================ */

type NotificationEvent = {
  type: "booking";

  title: string;

  message: string;

  action:
    | "booking_offer"
    | "booking_counter_offer"
    | "booking_accepted"
    | "booking_declined"
    | "booking_started"
    | "booking_completed"
    | "payment_confirmed";
};

/* ============================================================
   HELPERS
============================================================ */

function getString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getNumber(
  value: unknown,
): number | null {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function formatAmount(
  amount: number | null,
): string {
  if (amount === null) {
    return "";
  }

  return `₦${amount.toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   DETERMINE BOOKING EVENT
============================================================ */

function getBookingNotification(
  before: FirebaseFirestore.DocumentData,
  after: FirebaseFirestore.DocumentData,
): NotificationEvent | null {
  const beforeOfferStatus =
    getString(
      before.offerStatus,
    );

  const afterOfferStatus =
    getString(
      after.offerStatus,
    );

  const beforeCounterStatus =
    getString(
      before.counterOfferStatus,
    );

  const afterCounterStatus =
    getString(
      after.counterOfferStatus,
    );

  const beforeCounterBy =
    getString(
      before.counterOfferBy,
    );

  const afterCounterBy =
    getString(
      after.counterOfferBy,
    );

  const beforeStatus =
    getString(
      before.status,
    );

  const afterStatus =
    getString(
      after.status,
    );

  const beforePaymentStatus =
    getString(
      before.paymentStatus,
    );

  const afterPaymentStatus =
    getString(
      after.paymentStatus,
    );

  /* ==========================================================
     1. WORKER INITIAL OFFER
  ========================================================== */

  if (
    beforeOfferStatus !== "sent" &&
    afterOfferStatus === "sent" &&
    getString(after.offerWorkerId)
  ) {
    const amount =
      formatAmount(
        getNumber(
          after.offerAmount,
        ),
      );

    return {
      type: "booking",

      title:
        "New service offer",

      message: amount
        ? `A worker sent you a service offer of ${amount}.`
        : "A worker sent you a new service offer.",

      action:
        "booking_offer",
    };
  }

  /* ==========================================================
     2. WORKER COUNTER OFFER
  ========================================================== */

  if (
    beforeCounterStatus !==
      "sent" &&
    afterCounterStatus ===
      "sent" &&
    afterCounterBy ===
      "worker"
  ) {
    const amount =
      formatAmount(
        getNumber(
          after.counterOfferAmount,
        ),
      );

    return {
      type: "booking",

      title:
        "New counter offer",

      message: amount
        ? `The worker sent you a counter offer of ${amount}.`
        : "The worker sent you a new counter offer.",

      action:
        "booking_counter_offer",
    };
  }

  /* ==========================================================
     3. BOOKING ACCEPTED
  ========================================================== */

  if (
    beforeStatus !==
      "accepted" &&
    afterStatus ===
      "accepted"
  ) {
    const amount =
      formatAmount(
        getNumber(
          after.agreedPrice,
        ) ??
          getNumber(
            after.amount,
          ),
      );

    return {
      type: "booking",

      title:
        "Booking accepted",

      message: amount
        ? `Your booking has been accepted at ${amount}.`
        : "Your booking has been accepted by the worker.",

      action:
        "booking_accepted",
    };
  }

  /* ==========================================================
     4. WORKER DECLINED CUSTOMER COUNTER
  ========================================================== */

  if (
    beforeStatus !==
      "cancelled" &&
    afterStatus ===
      "cancelled" &&
    beforeCounterStatus !==
      "declined" &&
    afterCounterStatus ===
      "declined" &&
    afterCounterBy ===
      "customer"
  ) {
    return {
      type: "booking",

      title:
        "Offer declined",

      message:
        "The worker declined your counter offer.",

      action:
        "booking_declined",
    };
  }

  /* ==========================================================
     5. WORK STARTED
  ========================================================== */

  if (
    beforeStatus !==
      "in-progress" &&
    afterStatus ===
      "in-progress"
  ) {
    return {
      type: "booking",

      title:
        "Work started",

      message:
        "The worker has started working on your booking.",

      action:
        "booking_started",
    };
  }

  /* ==========================================================
     6. BOOKING COMPLETED
  ========================================================== */

  if (
    beforeStatus !==
      "completed" &&
    afterStatus ===
      "completed"
  ) {
    const amount =
      formatAmount(
        getNumber(
          after.agreedPrice,
        ) ??
          getNumber(
            after.amount,
          ),
      );

    return {
      type: "booking",

      title:
        "Service completed",

      message: amount
        ? `Your service has been completed. Amount: ${amount}.`
        : "Your service has been completed.",

      action:
        "booking_completed",
    };
  }

  /* ==========================================================
     7. PAYMENT CONFIRMED
  ========================================================== */

  if (
    beforePaymentStatus !==
      "paid" &&
    afterPaymentStatus ===
      "paid"
  ) {
    return {
      type: "booking",

      title:
        "Payment confirmed",

      message:
        "Payment for your booking has been confirmed.",

      action:
        "payment_confirmed",
    };
  }

  return null;
}

/* ============================================================
   BOOKING FIRESTORE TRIGGER
============================================================ */

export const bookingNotifications =
  onDocumentUpdated(
    {
      document:
        "bookings/{bookingId}",

      region:
        "us-central1",

      retry: true,
    },

    async (event) => {
      /* --------------------------------------------------------
         VALIDATE EVENT DATA
      -------------------------------------------------------- */

      const before =
        event.data?.before.data();

      const after =
        event.data?.after.data();

      if (
        !before ||
        !after
      ) {
        console.warn(
          "FIXXAM_BOOKING_EVENT_DATA_MISSING",
          {
            bookingId:
              event.params.bookingId,

            eventId:
              event.id,
          },
        );

        return;
      }

      /* --------------------------------------------------------
         BOOKING ID
      -------------------------------------------------------- */

      const bookingId =
        getString(
          event.params
            .bookingId,
        );

      if (!bookingId) {
        console.warn(
          "FIXXAM_BOOKING_ID_MISSING",
          {
            eventId:
              event.id,
          },
        );

        return;
      }

      /* --------------------------------------------------------
         CUSTOMER ID
      -------------------------------------------------------- */

      const customerId =
        getString(
          after.customerId,
        );

      if (!customerId) {
        console.warn(
          "FIXXAM_BOOKING_CUSTOMER_ID_MISSING",
          {
            bookingId,

            eventId:
              event.id,
          },
        );

        return;
      }

      /* --------------------------------------------------------
         DETERMINE EVENT
      -------------------------------------------------------- */

      const notification =
        getBookingNotification(
          before,
          after,
        );

      if (!notification) {
        return;
      }

      /* --------------------------------------------------------
         IDEMPOTENT NOTIFICATION ID
      -------------------------------------------------------- */

      const notificationId =
        `booking_${bookingId}_${event.id}`;

      /* --------------------------------------------------------
         SEND CUSTOMER NOTIFICATION
      -------------------------------------------------------- */

      try {
        await sendCustomerPushNotification({
          customerId,

          type:
            notification.type,

          title:
            notification.title,

          message:
            notification.message,

          notificationId,

          data: {
            type:
              notification.type,

            action:
              notification.action,

            bookingId,
          },
        });

        console.log(
          "FIXXAM_BOOKING_NOTIFICATION_SENT",
          {
            bookingId,

            customerId,

            eventId:
              event.id,

            notificationId,

            action:
              notification.action,
          },
        );
      } catch (error) {
        console.error(
          "FIXXAM_BOOKING_NOTIFICATION_ERROR",
          {
            bookingId,

            customerId,

            eventId:
              event.id,

            notificationId,

            error,
          },
        );

        /*
         * Keep retry enabled.
         *
         * If the function fails before completing,
         * Firebase can retry the event.
         */
        throw error;
      }
    },
  );