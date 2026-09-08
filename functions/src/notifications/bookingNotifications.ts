import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

import {
  sendUserPushNotification,
} from "./sendCustomerPushNotification";

/* ============================================================
   CONFIG
============================================================ */

const REGION = "us-central1";

/* ============================================================
   TYPES
============================================================ */

type BookingData = Record<string, unknown>;

type RecipientRole =
  | "customer"
  | "worker";

interface NotificationEvent {
  action: string;
  title: string;
  message: string;
  recipientRole: RecipientRole;
}

/* ============================================================
   HELPERS
============================================================ */

function getString(
  data: BookingData,
  key: string,
): string | undefined {
  const value = data[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value.trim();

  return cleaned || undefined;
}

function hasValue(
  value: unknown,
): boolean {
  return (
    value !== undefined &&
    value !== null
  );
}

function getRecipientId(
  booking: BookingData,
  role: RecipientRole,
): string | undefined {
  return role === "customer"
    ? getString(booking, "customerId")
    : getString(booking, "workerId");
}

function getName(
  booking: BookingData,
  role: RecipientRole,
): string {
  if (role === "customer") {
    return (
      getString(
        booking,
        "customerName",
      ) ?? "Customer"
    );
  }

  return (
    getString(
      booking,
      "workerName",
    ) ?? "Worker"
  );
}

function getServiceName(
  booking: BookingData,
): string {
  return (
    getString(
      booking,
      "serviceName",
    ) ?? "service"
  );
}

function getPrice(
  booking: BookingData,
): string | undefined {
  const price =
    booking.agreedPrice ??
    booking.counterOfferPrice ??
    booking.offerPrice ??
    booking.amount;

  if (
    typeof price === "number" &&
    Number.isFinite(price)
  ) {
    return price.toLocaleString("en-NG");
  }

  if (
    typeof price === "string" &&
    price.trim()
  ) {
    return price.trim();
  }

  return undefined;
}

function sanitizeEventId(
  eventId: string,
): string {
  return eventId.replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
}

function createNotificationId(
  bookingId: string,
  eventId: string,
  recipientRole: RecipientRole,
): string {
  return [
    "booking",
    bookingId,
    sanitizeEventId(eventId),
    recipientRole,
  ].join("_");
}

function buildNotificationData(
  bookingId: string,
  action: string,
): Record<string, unknown> {
  return {
    type: "booking",
    action,
    bookingId,
  };
}

/* ============================================================
   ACTOR HELPERS
============================================================ */

/**
 * Initial offer sender.
 *
 * `offerWorkerId` is the safest field for identifying
 * the worker who sent the initial offer.
 *
 * If it is not available, we fall back to workerId
 * because the current booking flow uses Worker as
 * the initial offer sender.
 */
function getInitialOfferSender(
  booking: BookingData,
): RecipientRole | undefined {
  const offerWorkerId =
    getString(
      booking,
      "offerWorkerId",
    );

  const workerId =
    getString(
      booking,
      "workerId",
    );

  const customerId =
    getString(
      booking,
      "customerId",
    );

  if (
    offerWorkerId &&
    offerWorkerId === workerId
  ) {
    return "worker";
  }

  if (
    offerWorkerId &&
    offerWorkerId === customerId
  ) {
    return "customer";
  }

  if (workerId) {
    return "worker";
  }

  return undefined;
}

function getOppositeRole(
  role: RecipientRole,
): RecipientRole {
  return role === "customer"
    ? "worker"
    : "customer";
}

/* ============================================================
   BOOKING UPDATED → NOTIFICATION DECISION
============================================================ */

function getNotification(
  before: BookingData,
  after: BookingData,
): NotificationEvent | null {
  const beforeStatus =
    getString(
      before,
      "status",
    );

  const afterStatus =
    getString(
      after,
      "status",
    );

  const beforeOfferStatus =
    getString(
      before,
      "offerStatus",
    );

  const afterOfferStatus =
    getString(
      after,
      "offerStatus",
    );

  const beforeCounterStatus =
    getString(
      before,
      "counterOfferStatus",
    );

  const afterCounterStatus =
    getString(
      after,
      "counterOfferStatus",
    );

  const beforeCounterBy =
    getString(
      before,
      "counterOfferBy",
    );

  const afterCounterBy =
    getString(
      after,
      "counterOfferBy",
    );

  /* ==========================================================
     INITIAL OFFER SENT
  ========================================================== */

  if (
    afterOfferStatus === "sent" &&
    beforeOfferStatus !== "sent"
  ) {
    const senderRole =
      getInitialOfferSender(after);

    if (!senderRole) {
      return null;
    }

    const recipientRole =
      getOppositeRole(senderRole);

    const price =
      getPrice(after);

    const senderName =
      getName(
        after,
        senderRole,
      );

    const serviceName =
      getServiceName(after);

    return {
      action: "offer_received",

      title: "New Offer Received",

      message: price
        ? `${senderName} sent you an offer of ₦${price} for ${serviceName}.`
        : `${senderName} sent you an offer for ${serviceName}.`,

      recipientRole,
    };
  }

  /* ==========================================================
     CUSTOMER COUNTER OFFER → WORKER
  ========================================================== */

  if (
    afterCounterStatus === "sent" &&
    afterCounterBy === "customer" &&
    !(
      beforeCounterStatus === "sent" &&
      beforeCounterBy === "customer"
    )
  ) {
    const price =
      getPrice(after);

    return {
      action:
        "counter_offer_received",

      title:
        "Customer Sent a Counter Offer",

      message: price
        ? `${getName(
            after,
            "customer",
          )} sent a counter offer of ₦${price}.`
        : `${getName(
            after,
            "customer",
          )} sent you a counter offer.`,

      recipientRole: "worker",
    };
  }

  /* ==========================================================
     WORKER COUNTER OFFER → CUSTOMER
  ========================================================== */

  if (
    afterCounterStatus === "sent" &&
    afterCounterBy === "worker" &&
    !(
      beforeCounterStatus === "sent" &&
      beforeCounterBy === "worker"
    )
  ) {
    const price =
      getPrice(after);

    return {
      action:
        "counter_offer_received",

      title:
        "Worker Sent a Counter Offer",

      message: price
        ? `${getName(
            after,
            "worker",
          )} sent a counter offer of ₦${price}.`
        : `${getName(
            after,
            "worker",
          )} sent you a counter offer.`,

      recipientRole: "customer",
    };
  }

  /* ==========================================================
     COUNTER OFFER ACCEPTED
  ========================================================== */

  if (
    afterCounterStatus === "accepted" &&
    beforeCounterStatus !== "accepted"
  ) {
    const counterSender =
      afterCounterBy === "customer"
        ? "customer"
        : afterCounterBy === "worker"
          ? "worker"
          : undefined;

    if (!counterSender) {
      return null;
    }

    const accepterRole =
      getOppositeRole(counterSender);

    const senderName =
      getName(
        after,
        counterSender,
      );

    const accepterName =
      getName(
        after,
        accepterRole,
      );

    return {
      action:
        "counter_offer_accepted",

      title:
        "Counter Offer Accepted",

      message:
        `${accepterName} accepted ${senderName}'s counter offer.`,

      recipientRole:
        counterSender,
    };
  }

  /* ==========================================================
     INITIAL OFFER ACCEPTED
  ========================================================== */

  if (
    afterStatus === "accepted" &&
    beforeStatus !== "accepted" &&
    afterCounterStatus !== "accepted"
  ) {
    const offerSender =
      getInitialOfferSender(after);

    if (!offerSender) {
      return null;
    }

    const accepterRole =
      getOppositeRole(
        offerSender,
      );

    const recipientRole =
      offerSender;

    const accepterName =
      getName(
        after,
        accepterRole,
      );

    const serviceName =
      getServiceName(after);

    return {
      action:
        "offer_accepted",

      title:
        "Offer Accepted",

      message:
        `${accepterName} accepted your offer for ${serviceName}.`,

      recipientRole,
    };
  }

  /* ==========================================================
     INITIAL OFFER DECLINED
  ========================================================== */

  if (
    afterOfferStatus === "declined" &&
    beforeOfferStatus !== "declined"
  ) {
    const offerSender =
      getInitialOfferSender(after);

    if (!offerSender) {
      return null;
    }

    const declinerRole =
      getOppositeRole(
        offerSender,
      );

    const declinerName =
      getName(
        after,
        declinerRole,
      );

    const serviceName =
      getServiceName(after);

    return {
      action:
        "offer_declined",

      title:
        "Offer Declined",

      message:
        `${declinerName} declined your offer for ${serviceName}.`,

      recipientRole:
        offerSender,
    };
  }

  /* ==========================================================
     COUNTER OFFER DECLINED
  ========================================================== */

  if (
    afterCounterStatus === "declined" &&
    beforeCounterStatus !== "declined"
  ) {
    const counterSender =
      afterCounterBy === "customer"
        ? "customer"
        : afterCounterBy === "worker"
          ? "worker"
          : undefined;

    if (!counterSender) {
      return null;
    }

    const declinerRole =
      getOppositeRole(
        counterSender,
      );

    const declinerName =
      getName(
        after,
        declinerRole,
      );

    return {
      action:
        "counter_offer_declined",

      title:
        "Counter Offer Declined",

      message:
        `${declinerName} declined your counter offer.`,

      recipientRole:
        counterSender,
    };
  }

  /* ==========================================================
     WORKER JOURNEY STARTED → CUSTOMER
  ========================================================== */

  const journeyStarted =
    hasValue(
      after.estimatedArrival,
    ) &&
    !hasValue(
      before.estimatedArrival,
    );

  if (journeyStarted) {
    return {
      action:
        "journey_started",

      title:
        "Worker Is On The Way",

      message:
        `${getName(
          after,
          "worker",
        )} has started the journey to your location.`,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     WORKER ARRIVED → CUSTOMER
  ========================================================== */

  const workerArrived =
    hasValue(
      after.workerArrivedAt,
    ) &&
    !hasValue(
      before.workerArrivedAt,
    );

  if (workerArrived) {
    return {
      action:
        "worker_arrived",

      title:
        "Worker Has Arrived",

      message:
        `${getName(
          after,
          "worker",
        )} has arrived at your location.`,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     WORK STARTED → CUSTOMER
  ========================================================== */

  if (
    afterStatus === "in-progress" &&
    beforeStatus !== "in-progress"
  ) {
    return {
      action:
        "work_started",

      title:
        "Work Started",

      message:
        `${getName(
          after,
          "worker",
        )} has started working on your ${getServiceName(
          after,
        )} booking.`,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     BOOKING COMPLETED → CUSTOMER
  ========================================================== */

  if (
    afterStatus === "completed" &&
    beforeStatus !== "completed"
  ) {
    return {
      action:
        "booking_completed",

      title:
        "Booking Completed",

      message:
        `Your ${getServiceName(
          after,
        )} booking has been completed.`,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     CUSTOMER PAYMENT CONFIRMED → WORKER
  ========================================================== */

  const customerPaymentConfirmed =
    hasValue(
      after.customerPaymentConfirmedAt,
    ) &&
    !hasValue(
      before.customerPaymentConfirmedAt,
    );

  if (customerPaymentConfirmed) {
    return {
      action:
        "payment_confirmed",

      title:
        "Payment Confirmed",

      message:
        `${getName(
          after,
          "customer",
        )} confirmed payment for the booking.`,

      recipientRole:
        "worker",
    };
  }

  /* ==========================================================
     WORKER PAYMENT CONFIRMED → CUSTOMER
  ========================================================== */

  const workerPaymentConfirmed =
    hasValue(
      after.workerPaymentConfirmedAt,
    ) &&
    !hasValue(
      before.workerPaymentConfirmedAt,
    );

  if (workerPaymentConfirmed) {
    return {
      action:
        "payment_confirmed",

      title:
        "Payment Confirmed",

      message:
        `${getName(
          after,
          "worker",
        )} confirmed payment for the booking.`,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     BOOKING CANCELLED
  ========================================================== */

  if (
    afterStatus === "cancelled" &&
    beforeStatus !== "cancelled"
  ) {
    const cancelledBy =
      getString(
        after,
        "cancelledBy",
      );

    if (
      cancelledBy === "customer"
    ) {
      return {
        action:
          "booking_cancelled",

        title:
          "Booking Cancelled",

        message:
          `${getName(
            after,
            "customer",
          )} cancelled the booking.`,

        recipientRole:
          "worker",
      };
    }

    if (
      cancelledBy === "worker"
    ) {
      return {
        action:
          "booking_cancelled",

        title:
          "Booking Cancelled",

        message:
          `${getName(
            after,
            "worker",
          )} cancelled the booking.`,

        recipientRole:
          "customer",
      };
    }

    return {
      action:
        "booking_cancelled",

      title:
        "Booking Cancelled",

      message:
        `The booking for ${getServiceName(
          after,
        )} has been cancelled.`,

      recipientRole:
        "worker",
    };
  }

  return null;
}

/* ============================================================
   BOOKING CREATED
   CUSTOMER → WORKER
============================================================ */

export const bookingCreatedNotifications =
  onDocumentCreated(
    {
      document:
        "bookings/{bookingId}",

      region:
        REGION,

      retry:
        true,
    },

    async (event) => {
      const booking =
        event.data?.data();

      if (!booking) {
        console.warn(
          "BOOKING_CREATED_NO_DATA",
          event.params.bookingId,
        );

        return;
      }

      const bookingId =
        event.params.bookingId;

      const workerId =
        getRecipientId(
          booking,
          "worker",
        );

      if (!workerId) {
        console.warn(
          "BOOKING_CREATED_NO_WORKER",
          bookingId,
        );

        return;
      }

      const customerName =
        getName(
          booking,
          "customer",
        );

      const serviceName =
        getServiceName(
          booking,
        );

      await sendUserPushNotification({
        userId:
          workerId,

        recipientRole:
          "worker",

        type:
          "booking",

        title:
          "New Booking Request",

        message:
          `${customerName} requested your ${serviceName} service.`,

        notificationId:
          `booking_${bookingId}_created_worker`,

        data:
          buildNotificationData(
            bookingId,
            "booking_created",
          ),
      });
    },
  );

/* ============================================================
   BOOKING UPDATED
============================================================ */

export const bookingNotifications =
  onDocumentUpdated(
    {
      document:
        "bookings/{bookingId}",

      region:
        REGION,

      retry:
        true,
    },

    async (event) => {
      const before =
        event.data?.before.data();

      const after =
        event.data?.after.data();

      if (!before || !after) {
        return;
      }

      const bookingId =
        event.params.bookingId;

      const notification =
        getNotification(
          before,
          after,
        );

      if (!notification) {
        return;
      }

      const recipientId =
        getRecipientId(
          after,
          notification.recipientRole,
        );

      if (!recipientId) {
        console.warn(
          "BOOKING_NOTIFICATION_NO_RECIPIENT",
          {
            bookingId,

            recipientRole:
              notification.recipientRole,

            action:
              notification.action,
          },
        );

        return;
      }

      const notificationId =
        createNotificationId(
          bookingId,
          event.id,
          notification.recipientRole,
        );

      await sendUserPushNotification({
        userId:
          recipientId,

        recipientRole:
          notification.recipientRole,

        type:
          "booking",

        title:
          notification.title,

        message:
          notification.message,

        notificationId,

        data:
          buildNotificationData(
            bookingId,
            notification.action,
          ),
      });
    },
  );