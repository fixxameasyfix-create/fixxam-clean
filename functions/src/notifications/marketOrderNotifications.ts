import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

import {
  sendUserPushNotification,
} from "./sendCustomerPushNotification";

/* ============================================================
   TYPES
============================================================ */

type NotificationRecipientRole =
  | "customer"
  | "worker";

type MarketOrderAction =
  | "order_created"
  | "order_accepted"
  | "order_packed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "order_payment_confirmed";

type OrderNotificationEvent = {
  type: "market_order";

  title: string;

  message: string;

  action: MarketOrderAction;

  recipientId: string;

  recipientRole: NotificationRecipientRole;
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
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
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
   ACTOR
============================================================ */

function getActorRole(
  actorId: string,
  customerId: string,
  workerId: string,
): NotificationRecipientRole | null {
  /*
   * IMPORTANT:
   *
   * Fixxam supports multi-role accounts.
   *
   * The same Firebase Auth UID can be both:
   *
   * Customer
   * +
   * Worker
   *
   * Therefore we must NOT reject:
   *
   * customerId === workerId
   *
   * For market-order actions where the backend stores
   * the actor UID, worker is checked first because seller/
   * worker actions are the authoritative actions for the
   * corresponding order lifecycle.
   */

  if (
    actorId &&
    actorId === workerId
  ) {
    return "worker";
  }

  if (
    actorId &&
    actorId === customerId
  ) {
    return "customer";
  }

  return null;
}

/* ============================================================
   NEW MARKET ORDER
   CUSTOMER → WORKER
============================================================ */

export const marketOrderCreatedNotifications =
  onDocumentCreated(
    {
      document:
        "orders/{orderId}",

      region:
        "us-central1",

      retry: true,
    },

    async (event) => {
      const order =
        event.data?.data();

      if (!order) {
        console.warn(
          "FIXXAM_MARKET_ORDER_CREATED_DATA_MISSING",
          {
            orderId:
              event.params.orderId,

            eventId:
              event.id,
          },
        );

        return;
      }

      const orderId =
        getString(
          event.params.orderId,
        );

      const customerId =
        getString(
          order.customerId,
        );

      const workerId =
        getString(
          order.workerId,
        );

      if (!orderId) {
        console.warn(
          "FIXXAM_MARKET_ORDER_CREATED_ID_MISSING",
          {
            eventId:
              event.id,
          },
        );

        return;
      }

      if (!customerId) {
        console.warn(
          "FIXXAM_MARKET_ORDER_CREATED_CUSTOMER_MISSING",
          {
            orderId,

            eventId:
              event.id,
          },
        );

        return;
      }

      if (!workerId) {
        console.warn(
          "FIXXAM_MARKET_ORDER_CREATED_WORKER_MISSING",
          {
            orderId,

            eventId:
              event.id,
          },
        );

        return;
      }

      /* ========================================================
         MULTI-ROLE ACCOUNT SUPPORT
         
         customerId === workerId IS ALLOWED.
         
         Example:
         
         customerId = ABC
         workerId   = ABC
         
         This is valid because one Firebase account can have
         both Customer and Worker roles.
         
         DO NOT BLOCK THIS ORDER.
      ======================================================== */

      if (
        customerId === workerId
      ) {
        console.log(
          "FIXXAM_MARKET_ORDER_MULTI_ROLE_ACCOUNT",
          {
            orderId,

            customerId,

            workerId,

            eventId:
              event.id,
          },
        );
      }

      const total =
        formatAmount(
          getNumber(
            order.total,
          ),
        );

      const customerName =
        getString(
          order.customerName,
        );

      const message =
        total
          ? customerName
            ? `${customerName} placed a new market order. Total: ${total}.`
            : `You have received a new market order. Total: ${total}.`
          : customerName
            ? `${customerName} placed a new market order.`
            : "You have received a new market order.";

      const notificationId =
        `order_created_${orderId}`;

      try {
        await sendUserPushNotification({
          userId:
            workerId,

          /*
           * IMPORTANT:
           *
           * Even when customerId === workerId,
           * this notification belongs to the Worker
           * notification stream.
           */
          recipientRole:
            "worker",

          type:
            "market_order",

          title:
            "New market order",

          message,

          notificationId,

          data: {
            type:
              "market_order",

            action:
              "order_created",

            orderId,

            customerId,

            workerId,

            recipientRole:
              "worker",
          },
        });

        console.log(
          "FIXXAM_MARKET_ORDER_CREATED_NOTIFICATION_SENT",
          {
            orderId,

            customerId,

            workerId,

            sameAccount:
              customerId === workerId,

            eventId:
              event.id,

            notificationId,
          },
        );
      } catch (error) {
        console.error(
          "FIXXAM_MARKET_ORDER_CREATED_NOTIFICATION_ERROR",
          {
            orderId,

            customerId,

            workerId,

            eventId:
              event.id,

            notificationId,

            error,
          },
        );

        throw error;
      }
    },
  );

/* ============================================================
   DETERMINE UPDATED ORDER EVENT
============================================================ */

function getOrderNotification(
  before: FirebaseFirestore.DocumentData,
  after: FirebaseFirestore.DocumentData,
): OrderNotificationEvent | null {
  const customerId =
    getString(
      after.customerId,
    );

  const workerId =
    getString(
      after.workerId,
    );

  if (
    !customerId ||
    !workerId
  ) {
    return null;
  }

  const beforeStatus =
    getString(
      before.status,
    ).toLowerCase();

  const afterStatus =
    getString(
      after.status,
    ).toLowerCase();

  const beforePaymentStatus =
    getString(
      before.paymentStatus,
    ).toLowerCase();

  const afterPaymentStatus =
    getString(
      after.paymentStatus,
    ).toLowerCase();

  /* ==========================================================
     ACCEPTED
  ========================================================== */

  if (
    beforeStatus !== "accepted" &&
    afterStatus === "accepted"
  ) {
    const acceptedBy =
      getString(
        after.acceptedBy,
      );

    const actorRole =
      getActorRole(
        acceptedBy,
        customerId,
        workerId,
      );

    if (
      actorRole !== "worker"
    ) {
      console.warn(
        "FIXXAM_MARKET_ORDER_INVALID_ACCEPT_ACTOR",
        {
          acceptedBy,

          customerId,

          workerId,
        },
      );

      return null;
    }

    return {
      type:
        "market_order",

      title:
        "Order accepted",

      message:
        "Your market order has been accepted by the seller.",

      action:
        "order_accepted",

      recipientId:
        customerId,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     PACKED
  ========================================================== */

  if (
    beforeStatus !== "packed" &&
    afterStatus === "packed"
  ) {
    return {
      type:
        "market_order",

      title:
        "Order packed",

      message:
        "Your market order has been packed and is ready for delivery.",

      action:
        "order_packed",

      recipientId:
        customerId,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     SHIPPED
  ========================================================== */

  if (
    beforeStatus !== "shipped" &&
    afterStatus === "shipped"
  ) {
    return {
      type:
        "market_order",

      title:
        "Order shipped",

      message:
        "Your market order has been shipped and is on its way.",

      action:
        "order_shipped",

      recipientId:
        customerId,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     DELIVERED
  ========================================================== */

  if (
    beforeStatus !== "delivered" &&
    afterStatus === "delivered"
  ) {
    const total =
      formatAmount(
        getNumber(
          after.total,
        ),
      );

    return {
      type:
        "market_order",

      title:
        "Order delivered",

      message:
        total
          ? `Your market order has been delivered. Total: ${total}.`
          : "Your market order has been delivered.",

      action:
        "order_delivered",

      recipientId:
        customerId,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     CANCELLED
  ========================================================== */

  if (
    beforeStatus !== "cancelled" &&
    afterStatus === "cancelled"
  ) {
    const cancelledBy =
      getString(
        after.cancelledBy,
      );

    const actorRole =
      getActorRole(
        cancelledBy,
        customerId,
        workerId,
      );

    if (!actorRole) {
      console.warn(
        "FIXXAM_MARKET_ORDER_UNKNOWN_CANCEL_ACTOR",
        {
          cancelledBy,

          customerId,

          workerId,
        },
      );

      return null;
    }

    /* --------------------------------------------------------
       WORKER → CUSTOMER
    -------------------------------------------------------- */

    if (
      actorRole === "worker"
    ) {
      const isProductUnavailable =
        getString(
          after.cancellationReason,
        ) ===
        "product_unavailable";

      return {
        type:
          "market_order",

        title:
          isProductUnavailable
            ? "Product unavailable"
            : "Order cancelled",

        message:
          isProductUnavailable
            ? (
                getString(
                  after.customerMessage,
                ) ||
                "This product is currently not available. Please try another store."
              )
            : "Your market order has been cancelled by the seller.",

        action:
          "order_cancelled",

        recipientId:
          customerId,

        recipientRole:
          "customer",
      };
    }

    /* --------------------------------------------------------
       CUSTOMER → WORKER
    -------------------------------------------------------- */

    return {
      type:
        "market_order",

      title:
        "Order cancelled",

      message:
        "The customer has cancelled this market order.",

      action:
        "order_cancelled",

      recipientId:
        workerId,

      recipientRole:
        "worker",
    };
  }

  /* ==========================================================
     PAYMENT CONFIRMED
  ========================================================== */

  if (
    beforePaymentStatus !== "paid" &&
    afterPaymentStatus === "paid"
  ) {
    const customerPaymentConfirmedBy =
      getString(
        after.customerPaymentConfirmedBy,
      );

    const workerPaymentConfirmedBy =
      getString(
        after.workerPaymentConfirmedBy,
      );

    if (
      customerPaymentConfirmedBy ===
      customerId
    ) {
      return {
        type:
          "market_order",

        title:
          "Payment confirmed",

        message:
          "The customer has confirmed payment for this market order.",

        action:
          "order_payment_confirmed",

        recipientId:
          workerId,

        recipientRole:
          "worker",
      };
    }

    if (
      workerPaymentConfirmedBy ===
      workerId
    ) {
      return {
        type:
          "market_order",

        title:
          "Payment confirmed",

        message:
          "Payment for your market order has been confirmed by the seller.",

        action:
          "order_payment_confirmed",

        recipientId:
          customerId,

        recipientRole:
          "customer",
      };
    }

    console.warn(
      "FIXXAM_MARKET_ORDER_PAYMENT_ACTOR_UNKNOWN",
      {
        customerId,

        workerId,

        paymentStatus:
          afterPaymentStatus,
      },
    );

    return null;
  }

  return null;
}

/* ============================================================
   UPDATED MARKET ORDER
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

      const notification =
        getOrderNotification(
          before,
          after,
        );

      if (!notification) {
        return;
      }

      const notificationId =
        `order_${orderId}_${event.id}`;

      try {
        await sendUserPushNotification({
          userId:
            notification.recipientId,

          recipientRole:
            notification.recipientRole,

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

            recipientRole:
              notification.recipientRole,
          },
        });

        console.log(
          "FIXXAM_MARKET_ORDER_NOTIFICATION_SENT",
          {
            orderId,

            recipientId:
              notification.recipientId,

            recipientRole:
              notification.recipientRole,

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

            recipientId:
              notification.recipientId,

            recipientRole:
              notification.recipientRole,

            eventId:
              event.id,

            notificationId,

            action:
              notification.action,

            error,
          },
        );

        throw error;
      }
    },
  );