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
    ? getString(
        booking,
        "customerId",
      )
    : getString(
        booking,
        "workerId",
      );
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

/* ============================================================
   PRICE
============================================================ */

function getPrice(
  booking: BookingData,
): string | undefined {
  const price =
    booking.agreedPrice ??
    booking.counterOfferAmount ??
    booking.offerAmount ??
    booking.counterOfferPrice ??
    booking.offerPrice ??
    booking.amount;

  if (
    typeof price === "number" &&
    Number.isFinite(price) &&
    price >= 0
  ) {
    return price.toLocaleString(
      "en-NG",
    );
  }

  if (typeof price === "string") {
    const cleaned = price.trim();

    if (cleaned) {
      return cleaned;
    }
  }

  return undefined;
}

/* ============================================================
   NOTIFICATION ID
============================================================ */

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
  action: string,
): string {
  return [
    "booking",
    bookingId,
    sanitizeEventId(eventId),
    recipientRole,
    action,
  ].join("_");
}

/* ============================================================
   NOTIFICATION DATA
============================================================ */

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
 * Identify the sender of the initial offer.
 *
 * Current FIXXAM service flow normally uses Worker
 * as the sender of the initial offer.
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

  /*
   * Current production flow:
   * Worker sends the initial offer.
   */
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

function getNotifications(
  before: BookingData,
  after: BookingData,
): NotificationEvent[] {
  const notifications: NotificationEvent[] = [];

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
      getInitialOfferSender(
        after,
      );

    if (senderRole) {
      const recipientRole =
        getOppositeRole(
          senderRole,
        );

      const price =
        getPrice(after);

      const senderName =
        getName(
          after,
          senderRole,
        );

      const serviceName =
        getServiceName(after);

      notifications.push({
        action:
          "offer_received",

        title:
          "New Offer Received",

        message: price
          ? `${senderName} sent you an offer of ₦${price} for ${serviceName}.`
          : `${senderName} sent you an offer for ${serviceName}.`,

        recipientRole,
      });
    }

    return notifications;
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

    notifications.push({
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

      recipientRole:
        "worker",
    });

    return notifications;
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

    notifications.push({
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

      recipientRole:
        "customer",
    });

    return notifications;
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
      return notifications;
    }

    const senderName =
      getName(
        after,
        counterSender,
      );

    const accepterRole =
      getOppositeRole(
        counterSender,
      );

    const accepterName =
      getName(
        after,
        accepterRole,
      );

    notifications.push({
      action:
        "counter_offer_accepted",

      title:
        "Counter Offer Accepted",

      message:
        `${accepterName} accepted ${senderName}'s counter offer.`,

      recipientRole:
        counterSender,
    });

    return notifications;
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
      getInitialOfferSender(
        after,
      );

    if (!offerSender) {
      return notifications;
    }

    const accepterRole =
      getOppositeRole(
        offerSender,
      );

    const accepterName =
      getName(
        after,
        accepterRole,
      );

    const serviceName =
      getServiceName(after);

    notifications.push({
      action:
        "offer_accepted",

      title:
        "Offer Accepted",

      message:
        `${accepterName} accepted your offer for ${serviceName}.`,

      recipientRole:
        offerSender,
    });

    return notifications;
  }

  /* ==========================================================
     INITIAL OFFER DECLINED
  ========================================================== */

  if (
    afterOfferStatus === "declined" &&
    beforeOfferStatus !== "declined"
  ) {
    const offerSender =
      getInitialOfferSender(
        after,
      );

    if (!offerSender) {
      return notifications;
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

    notifications.push({
      action:
        "offer_declined",

      title:
        "Offer Declined",

      message:
        `${declinerName} declined your offer for ${serviceName}.`,

      recipientRole:
        offerSender,
    });

    return notifications;
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
      return notifications;
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

    notifications.push({
      action:
        "counter_offer_declined",

      title:
        "Counter Offer Declined",

      message:
        `${declinerName} declined your counter offer.`,

      recipientRole:
        counterSender,
    });

    return notifications;
  }

  /* ==========================================================
     OFFER EXPIRED
     
     Backend authority:
     status = cancelled
     cancellationReason = offer_expired
     cancelledBy = system
     
     Notify BOTH customer and worker.
  ========================================================== */

  const cancellationReason =
    getString(
      after,
      "cancellationReason",
    );

  if (
    afterStatus === "cancelled" &&
    beforeStatus !== "cancelled" &&
    cancellationReason === "offer_expired"
  ) {
    const serviceName =
      getServiceName(after);

    notifications.push(
      {
        action:
          "offer_expired",

        title:
          "Offer Expired",

        message:
          `The offer for your ${serviceName} booking expired because no response was received within 24 hours.`,

        recipientRole:
          "customer",
      },
      {
        action:
          "offer_expired",

        title:
          "Offer Expired",

        message:
          `The offer for the ${serviceName} booking expired because the customer did not respond within 24 hours.`,

        recipientRole:
          "worker",
      },
    );

    return notifications;
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
    notifications.push({
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
    });

    return notifications;
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
    notifications.push({
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
    });

    return notifications;
  }

  /* ==========================================================
     WORK STARTED → CUSTOMER
  ========================================================== */

  if (
    afterStatus === "in-progress" &&
    beforeStatus !== "in-progress"
  ) {
    notifications.push({
      action:
        "booking_in_progress",

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
    });

    return notifications;
  }

  /* ==========================================================
     BOOKING COMPLETED → CUSTOMER
  ========================================================== */

  if (
    afterStatus === "completed" &&
    beforeStatus !== "completed"
  ) {
    notifications.push({
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
    });

    return notifications;
  }

  /* ==========================================================
     BOOKING CANCELLED
  ========================================================== */

  if (
    afterStatus === "cancelled" &&
    beforeStatus !== "cancelled"
  ) {
    /*
     * offer_expired has already been handled above.
     */
    if (
      cancellationReason ===
      "offer_expired"
    ) {
      return notifications;
    }

    const cancelledBy =
      getString(
        after,
        "cancelledBy",
      );

    /* --------------------------------------------------------
       CUSTOMER CANCELLED → WORKER
    -------------------------------------------------------- */

    if (
      cancelledBy === "customer"
    ) {
      notifications.push({
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
      });

      return notifications;
    }

    /* --------------------------------------------------------
       WORKER CANCELLED → CUSTOMER
    -------------------------------------------------------- */

    if (
      cancelledBy === "worker"
    ) {
      notifications.push({
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
      });

      return notifications;
    }

    /* --------------------------------------------------------
       SYSTEM / LEGACY FALLBACK
    -------------------------------------------------------- */

    notifications.push({
      action:
        "booking_cancelled",

      title:
        "Booking Cancelled",

      message:
        `The booking for ${getServiceName(
          after,
        )} has been cancelled.`,

      recipientRole:
        "customer",
    });

    return notifications;
  }

  return notifications;
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

    async event => {
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

      const customerId =
        getRecipientId(
          booking,
          "customer",
        );

      /* ======================================================
         SELF-ASSIGNMENT PROTECTION
      ====================================================== */

      if (
        customerId &&
        customerId === workerId
      ) {
        console.warn(
          "BOOKING_CREATED_SELF_ASSIGNMENT_SKIPPED",
          {
            bookingId,
            customerId,
            workerId,
          },
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

    async event => {
      const before =
        event.data?.before.data();

      const after =
        event.data?.after.data();

      if (
        !before ||
        !after
      ) {
        return;
      }

      const bookingId =
        event.params.bookingId;

      const notifications =
        getNotifications(
          before,
          after,
        );

      if (
        notifications.length === 0
      ) {
        return;
      }

      const customerId =
        getRecipientId(
          after,
          "customer",
        );

      const workerId =
        getRecipientId(
          after,
          "worker",
        );

      /* ======================================================
         SELF-ASSIGNMENT PROTECTION
      ====================================================== */

      if (
        customerId &&
        workerId &&
        customerId === workerId
      ) {
        console.warn(
          "BOOKING_NOTIFICATION_SELF_ASSIGNMENT_SKIPPED",
          {
            bookingId,

            actions:
              notifications.map(
                notification =>
                  notification.action,
              ),
          },
        );

        return;
      }

      /* ======================================================
         SEND ALL EVENT NOTIFICATIONS
      ====================================================== */

      for (
        const notification of
          notifications
      ) {
        const recipientId =
          getRecipientId(
            after,
            notification.recipientRole,
          );

        if (
          !recipientId
        ) {
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

          continue;
        }

        const notificationId =
          createNotificationId(
            bookingId,
            event.id,
            notification.recipientRole,
            notification.action,
          );

        try {
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
        } catch (error) {
          /*
           * Do not stop the remaining recipients
           * if one notification fails.
           */
          console.error(
            "BOOKING_NOTIFICATION_SEND_ERROR",
            {
              bookingId,

              recipientId,

              recipientRole:
                notification.recipientRole,

              action:
                notification.action,

              error,
            },
          );
        }
      }
    },
  );