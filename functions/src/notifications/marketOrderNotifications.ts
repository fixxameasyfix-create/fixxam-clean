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

const REGION =
  "us-central1";

/* ============================================================
   TYPES
============================================================ */

type MarketOrderData =
  Record<string, unknown>;

type NotificationRecipientRole =
  | "customer"
  | "worker";

type MarketOrderAction =
  | "order_created"
  | "order_accepted"
  | "order_on_the_way"
  | "order_completed"
  | "order_cancelled"
  | "product_unavailable";

type CanonicalMarketStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "expired";

type OrderNotificationEvent = {
  action:
    MarketOrderAction;

  title:
    string;

  message:
    string;

  recipientId:
    string;

  recipientRole:
    NotificationRecipientRole;
};

/* ============================================================
   STRING
============================================================ */

function getString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ============================================================
   NUMBER
============================================================ */

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

/* ============================================================
   FORMAT AMOUNT
============================================================ */

function formatAmount(
  value: unknown,
): string {
  const amount =
    getNumber(value);

  if (
    amount === null ||
    amount < 0
  ) {
    return "";
  }

  return `₦${amount.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  )}`;
}

/* ============================================================
   NORMALIZE STATUS
============================================================ */

function normalizeMarketStatus(
  value: unknown,
): CanonicalMarketStatus {
  const status =
    getString(value)
      .toLowerCase()
      .replace(
        /[_\s]+/g,
        "-",
      );

  switch (status) {
   case "accepted":
case "packed":
  return "accepted";

case "in-progress":
case "on-the-way":
case "shipped":
  return "in-progress";

case "completed":
case "delivered":
  return "completed";

case "cancelled":
case "canceled":
  return "cancelled";

case "expired":
  return "expired";

case "pending":
default:
  return "pending";
  }
}

/* ============================================================
   MARKET ORDER CHECK
============================================================ */

function isMarketOrder(
  order: MarketOrderData,
): boolean {
  const orderType =
    getString(
      order.orderType,
    ).toLowerCase();

  const type =
    getString(
      order.type,
    ).toLowerCase();

  return (
    orderType === "market" ||
    type === "market"
  );
}

/* ============================================================
   PARTICIPANTS
============================================================ */

function getCustomerId(
  order: MarketOrderData,
): string {
  return getString(
    order.customerId,
  );
}

function getWorkerId(
  order: MarketOrderData,
): string {
  return getString(
    order.workerId,
  );
}

function getSellerId(
  order: MarketOrderData,
): string {
  return getString(
    order.sellerId,
  );
}

/* ============================================================
   CUSTOMER NAME
============================================================ */

function getCustomerName(
  order: MarketOrderData,
): string {
  return (
    getString(
      order.receiverName,
    ) ||
    getString(
      order.customerName,
    ) ||
    "Customer"
  );
}

/* ============================================================
   PRODUCT HELPERS
============================================================ */

function getProductCount(
  order: MarketOrderData,
): number {
  return Array.isArray(
    order.products,
  )
    ? order.products.length
    : 0;
}

function getFirstProductName(
  order: MarketOrderData,
): string {
  if (
    !Array.isArray(
      order.products,
    ) ||
    order.products.length === 0
  ) {
    return "";
  }

  const firstProduct =
    order.products[0];

  if (
    typeof firstProduct !==
      "object" ||
    firstProduct === null
  ) {
    return "";
  }

  return getString(
    (
      firstProduct as Record<
        string,
        unknown
      >
    ).name,
  );
}

/* ============================================================
   ORDER NUMBER
============================================================ */

function formatOrderNumber(
  orderId: string,
): string {
  const normalized =
    orderId
      .replace(
        /[^a-zA-Z0-9]/g,
        "",
      )
      .toUpperCase();

  if (!normalized) {
    return "Fixxam order";
  }

  const shortId =
    normalized.length > 6
      ? normalized.slice(-6)
      : normalized;

  return `#FX-${shortId}`;
}

/* ============================================================
   NOTIFICATION ID
============================================================ */

function sanitizeEventId(
  value: string,
): string {
  return value.replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
}

function createNotificationId(
  orderId: string,
  eventId: string,
  recipientRole:
    NotificationRecipientRole,
): string {
  return [
    "market",
    orderId,
    sanitizeEventId(
      eventId,
    ),
    recipientRole,
  ].join("_");
}

/* ============================================================
   NOTIFICATION DATA
============================================================ */

function buildNotificationData(
  orderId: string,
  action: MarketOrderAction,
  status: CanonicalMarketStatus,
): Record<string, unknown> {
  return {
    type:
      "market_order",

    action,

    orderId,

    entityType:
      "market_order",

    entityId:
      orderId,

    status,
  };
}

/* ============================================================
   CREATED MESSAGE
============================================================ */

function buildCreatedMessage(
  order: MarketOrderData,
): string {
  const customerName =
    getCustomerName(
      order,
    );

  const productCount =
    getProductCount(
      order,
    );

  const firstProduct =
    getFirstProductName(
      order,
    );

  const total =
    formatAmount(
      order.total,
    );

  if (
    productCount === 1 &&
    firstProduct
  ) {
    return total
      ? `${customerName} ordered ${firstProduct}. Total: ${total}.`
      : `${customerName} ordered ${firstProduct}.`;
  }

  if (
    productCount > 1
  ) {
    return total
      ? `${customerName} placed an order for ${productCount} products. Total: ${total}.`
      : `${customerName} placed an order for ${productCount} products.`;
  }

  return total
    ? `${customerName} placed a new market order. Total: ${total}.`
    : `${customerName} placed a new market order.`;
}

/* ============================================================
   DETERMINE UPDATE NOTIFICATION
============================================================ */

function getOrderNotification(
  orderId: string,
  before: MarketOrderData,
  after: MarketOrderData,
): OrderNotificationEvent | null {
  if (
    !isMarketOrder(
      after,
    )
  ) {
    return null;
  }

  const customerId =
    getCustomerId(
      after,
    );

  const workerId =
    getWorkerId(
      after,
    );

  if (
    !customerId ||
    !workerId
  ) {
    console.warn(
      "FIXXAM_MARKET_NOTIFICATION_PARTICIPANTS_MISSING",
      {
        orderId,
        customerId:
          customerId || null,
        workerId:
          workerId || null,
        sellerId:
          getSellerId(after) || null,
      },
    );

    return null;
  }

  const beforeStatus =
    normalizeMarketStatus(
      before.status,
    );

  const afterStatus =
    normalizeMarketStatus(
      after.status,
    );

  /* ==========================================================
     CANCELLED

     Check before other lifecycle transitions because
     cancellation may also update offerStatus and other fields.
  ========================================================== */

  if (
    beforeStatus !==
      "cancelled" &&
    afterStatus ===
      "cancelled"
  ) {
    const cancelledBy =
      getString(
        after.cancelledBy,
      );

    const cancellationReason =
      getString(
        after.cancellationReason,
      );

    /* --------------------------------------------------------
       CUSTOMER CANCELLED → WORKER
    -------------------------------------------------------- */

    if (
      cancelledBy ===
      customerId
    ) {
      return {
        action:
          "order_cancelled",

        title:
          "Market Order Cancelled",

        message:
          `${getCustomerName(
            after,
          )} cancelled ${formatOrderNumber(
            orderId,
          )}.`,

        recipientId:
          workerId,

        recipientRole:
          "worker",
      };
    }

    /* --------------------------------------------------------
       WORKER CANCELLED / PRODUCT UNAVAILABLE → CUSTOMER
    -------------------------------------------------------- */

    if (
      cancelledBy ===
      workerId
    ) {
      if (
        cancellationReason ===
        "product_unavailable"
      ) {
        const customerMessage =
          getString(
            after.customerMessage,
          );

        return {
          action:
            "product_unavailable",

          title:
            "Product Unavailable",

          message:
            customerMessage ||
            "The requested product is currently unavailable. Please try another store.",

          recipientId:
            customerId,

          recipientRole:
            "customer",
        };
      }

      return {
        action:
          "order_cancelled",

        title:
          "Market Order Cancelled",

        message:
          "Your market order was cancelled by the worker.",

        recipientId:
          customerId,

        recipientRole:
          "customer",
      };
    }

    /*
     * sellerId exists in the order schema, but the
     * currently verified Market action flow uses workerId
     * for worker order actions.
     *
     * Do not guess an unknown cancellation actor.
     */
    console.warn(
      "FIXXAM_MARKET_CANCEL_ACTOR_UNKNOWN",
      {
        orderId,
        cancelledBy:
          cancelledBy || null,
        customerId,
        workerId,
        sellerId:
          getSellerId(after) || null,
      },
    );

    return null;
  }

  /* ==========================================================
     ACCEPTED
     WORKER → CUSTOMER
  ========================================================== */

  if (
    beforeStatus !==
      "accepted" &&
    afterStatus ===
      "accepted"
  ) {
    const acceptedBy =
      getString(
        after.acceptedBy,
      );

    if (
      acceptedBy !==
      workerId
    ) {
      console.warn(
        "FIXXAM_MARKET_ACCEPT_ACTOR_INVALID",
        {
          orderId,
          acceptedBy:
            acceptedBy || null,
          workerId,
        },
      );

      return null;
    }

    return {
      action:
        "order_accepted",

      title:
        "Order Accepted",

      message:
        "Your market order has been accepted. The worker will prepare it for delivery.",

      recipientId:
        customerId,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     ON THE WAY
     WORKER → CUSTOMER
  ========================================================== */

  if (
    beforeStatus !==
      "in-progress" &&
    afterStatus ===
      "in-progress"
  ) {
    const onTheWayBy =
      getString(
        after.onTheWayBy,
      );

    if (
      onTheWayBy !==
      workerId
    ) {
      console.warn(
        "FIXXAM_MARKET_ON_THE_WAY_ACTOR_INVALID",
        {
          orderId,
          onTheWayBy:
            onTheWayBy || null,
          workerId,
        },
      );

      return null;
    }

    return {
      action:
        "order_on_the_way",

      title:
        "Order Is On The Way",

      message:
        "Your market order is on the way. You can now track it in Fixxam.",

      recipientId:
        customerId,

      recipientRole:
        "customer",
    };
  }

  /* ==========================================================
     COMPLETED
     WORKER → CUSTOMER
  ========================================================== */

  if (
    beforeStatus !==
      "completed" &&
    afterStatus ===
      "completed"
  ) {
    const completedBy =
      getString(
        after.completedBy,
      );

    if (
      completedBy !==
      workerId
    ) {
      console.warn(
        "FIXXAM_MARKET_COMPLETE_ACTOR_INVALID",
        {
          orderId,
          completedBy:
            completedBy || null,
          workerId,
        },
      );

      return null;
    }

    if (
      after.completionConfirmed !==
      true
    ) {
      console.warn(
        "FIXXAM_MARKET_COMPLETION_NOT_CONFIRMED",
        {
          orderId,
          workerId,
        },
      );

      return null;
    }

    return {
      action:
        "order_completed",

      title:
        "Order Completed",

      message:
        "Your market order has been completed successfully.",

      recipientId:
        customerId,

      recipientRole:
        "customer",
    };
  }

  return null;
}

/* ============================================================
   MARKET ORDER CREATED
   CUSTOMER → WORKER
============================================================ */

export const marketOrderCreatedNotifications =
  onDocumentCreated(
    {
      document:
        "orders/{orderId}",

      region:
        REGION,

      retry:
        true,
    },

    async event => {
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

      if (
        !isMarketOrder(
          order,
        )
      ) {
        return;
      }

      const orderId =
        getString(
          event.params.orderId,
        );

      const customerId =
        getCustomerId(
          order,
        );

      const workerId =
        getWorkerId(
          order,
        );

      if (
        !orderId ||
        !customerId ||
        !workerId
      ) {
        console.warn(
          "FIXXAM_MARKET_ORDER_CREATED_INVALID",
          {
            orderId:
              orderId || null,

            customerId:
              customerId || null,

            workerId:
              workerId || null,

            sellerId:
              getSellerId(order) ||
              null,

            eventId:
              event.id,
          },
        );

        return;
      }

      if (
        customerId ===
        workerId
      ) {
        console.warn(
          "FIXXAM_MARKET_ORDER_SELF_ASSIGNMENT_DETECTED",
          {
            orderId,
            customerId,
            workerId,
          },
        );

        return;
      }

      const status =
        normalizeMarketStatus(
          order.status,
        );

      if (
        status !==
        "pending"
      ) {
        console.warn(
          "FIXXAM_MARKET_ORDER_CREATED_INVALID_STATUS",
          {
            orderId,
            status,
          },
        );

        return;
      }

      const notificationId =
        `market_${orderId}_created_worker`;

      await sendUserPushNotification({
        userId:
          workerId,

        recipientRole:
          "worker",

        type:
          "market_order",

        title:
          "New Market Order",

        message:
          buildCreatedMessage(
            order,
          ),

        notificationId,

        data:
          buildNotificationData(
            orderId,
            "order_created",
            "pending",
          ),
      });

      console.info(
        "FIXXAM_MARKET_ORDER_CREATED_NOTIFICATION_SENT",
        {
          orderId,
          customerId,
          workerId,
          notificationId,
        },
      );
    },
  );

/* ============================================================
   MARKET ORDER UPDATED
============================================================ */

export const marketOrderNotifications =
  onDocumentUpdated(
    {
      document:
        "orders/{orderId}",

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
        console.warn(
          "FIXXAM_MARKET_ORDER_UPDATE_DATA_MISSING",
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
        return;
      }

      if (
        !isMarketOrder(
          after,
        )
      ) {
        return;
      }

      const notification =
        getOrderNotification(
          orderId,
          before,
          after,
        );

      if (!notification) {
        return;
      }

      const status =
        normalizeMarketStatus(
          after.status,
        );

      const notificationId =
        createNotificationId(
          orderId,
          event.id,
          notification.recipientRole,
        );

      await sendUserPushNotification({
        userId:
          notification.recipientId,

        recipientRole:
          notification.recipientRole,

        type:
          "market_order",

        title:
          notification.title,

        message:
          notification.message,

        notificationId,

        data:
          buildNotificationData(
            orderId,
            notification.action,
            status,
          ),
      });

      console.info(
        "FIXXAM_MARKET_ORDER_NOTIFICATION_SENT",
        {
          orderId,

          action:
            notification.action,

          recipientId:
            notification.recipientId,

          recipientRole:
            notification.recipientRole,

          status,

          notificationId,

          eventId:
            event.id,
        },
      );
    },
  );