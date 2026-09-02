import {
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

import {
  sendCustomerPushNotification,
} from "./sendCustomerPushNotification";

/* ============================================================
   TYPES
============================================================ */

type OrderNotificationEvent = {
  type: "market_order";

  title: string;

  message: string;

  action:
    | "order_accepted"
    | "order_packed"
    | "order_shipped"
    | "order_delivered"
    | "order_cancelled"
    | "order_payment_confirmed";
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
   DETERMINE ORDER EVENT
============================================================ */

function getOrderNotification(
  before: FirebaseFirestore.DocumentData,
  after: FirebaseFirestore.DocumentData,
): OrderNotificationEvent | null {
  const beforeStatus =
    getString(before.status);

  const afterStatus =
    getString(after.status);

  const beforePaymentStatus =
    getString(
      before.paymentStatus,
    );

  const afterPaymentStatus =
    getString(
      after.paymentStatus,
    );

  /* ==========================================================
     ORDER ACCEPTED
  ========================================================== */

  if (
    beforeStatus !== "accepted" &&
    afterStatus === "accepted"
  ) {
    return {
      type: "market_order",

      title:
        "Order accepted",

      message:
        "Your market order has been accepted by the seller.",

      action:
        "order_accepted",
    };
  }

  /* ==========================================================
     ORDER PACKED
  ========================================================== */

  if (
    beforeStatus !== "packed" &&
    afterStatus === "packed"
  ) {
    return {
      type: "market_order",

      title:
        "Order packed",

      message:
        "Your market order has been packed and is ready for delivery.",

      action:
        "order_packed",
    };
  }

  /* ==========================================================
     ORDER SHIPPED
  ========================================================== */

  if (
    beforeStatus !== "shipped" &&
    afterStatus === "shipped"
  ) {
    return {
      type: "market_order",

      title:
        "Order shipped",

      message:
        "Your market order has been shipped and is on its way.",

      action:
        "order_shipped",
    };
  }

  /* ==========================================================
     ORDER DELIVERED
  ========================================================== */

  if (
    beforeStatus !== "delivered" &&
    afterStatus === "delivered"
  ) {
    const total =
      formatAmount(
        getNumber(after.total),
      );

    return {
      type: "market_order",

      title:
        "Order delivered",

      message: total
        ? `Your market order has been delivered. Total: ${total}.`
        : "Your market order has been delivered.",

      action:
        "order_delivered",
    };
  }

  /* ==========================================================
     ORDER CANCELLED
  ========================================================== */

  if (
    beforeStatus !== "cancelled" &&
    afterStatus === "cancelled"
  ) {
    return {
      type: "market_order",

      title:
        "Order cancelled",

      message:
        "Your market order has been cancelled.",

      action:
        "order_cancelled",
    };
  }

  /* ==========================================================
     PAYMENT CONFIRMED
  ========================================================== */

  if (
    beforePaymentStatus !== "paid" &&
    afterPaymentStatus === "paid"
  ) {
    return {
      type: "market_order",

      title:
        "Payment confirmed",

      message:
        "Payment for your market order has been confirmed.",

      action:
        "order_payment_confirmed",
    };
  }

  return null;
}

/* ============================================================
   MARKET ORDER FIRESTORE TRIGGER
============================================================ */

export const marketOrderNotifications =
  onDocumentUpdated(
    {
      document:
        "orders/{orderId}",

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
          "FIXXAM_ORDER_EVENT_DATA_MISSING",
          {
            orderId:
              event.params.orderId,

            eventId:
              event.id,
          },
        );

        return;
      }

      /* --------------------------------------------------------
         ORDER ID
      -------------------------------------------------------- */

      const orderId =
        getString(
          event.params.orderId,
        );

      if (!orderId) {
        console.warn(
          "FIXXAM_ORDER_ID_MISSING",
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
          "FIXXAM_ORDER_CUSTOMER_ID_MISSING",
          {
            orderId,

            eventId:
              event.id,
          },
        );

        return;
      }

      /* --------------------------------------------------------
         DETERMINE ORDER EVENT
      -------------------------------------------------------- */

      const notification =
        getOrderNotification(
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
        `order_${orderId}_${event.id}`;

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

            orderId,
          },
        });

        console.log(
          "FIXXAM_MARKET_ORDER_NOTIFICATION_SENT",
          {
            orderId,

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
          "FIXXAM_MARKET_ORDER_NOTIFICATION_ERROR",
          {
            orderId,

            customerId,

            eventId:
              event.id,

            notificationId,

            error,
          },
        );

        /*
         * Allow Firebase to retry the event.
         */
        throw error;
      }
    },
  );