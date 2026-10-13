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

type ShopRequestData =
  Record<string, unknown>;

type NotificationRecipientRole =
  | "customer"
  | "worker";

type ShopRequestAction =
  | "shop_request_created"
  | "shop_request_accepted"
  | "shop_request_declined";

type ShopRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "completed"
  | "cancelled";

type ShopNotificationEvent = {
  action:
    ShopRequestAction;

  title:
    string;

  message:
    string;

  recipientId:
    string;

  recipientRole:
    NotificationRecipientRole;

  status:
    ShopRequestStatus;
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
   STATUS
============================================================ */

function normalizeShopRequestStatus(
  value: unknown,
): ShopRequestStatus {
  const status =
    getString(value)
      .toLowerCase()
      .replace(
        /[_\s]+/g,
        "-",
      );

  switch (status) {
    case "accepted":
      return "accepted";

    case "declined":
    case "rejected":
      return "declined";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "pending":
    default:
      return "pending";
  }
}

/* ============================================================
   PARTICIPANTS
============================================================ */

function getCustomerId(
  request: ShopRequestData,
): string {
  return getString(
    request.customerId,
  );
}

function getWorkerId(
  request: ShopRequestData,
): string {
  return getString(
    request.workerId,
  );
}

/* ============================================================
   DISPLAY VALUES
============================================================ */

function getCustomerName(
  request: ShopRequestData,
): string {
  return (
    getString(
      request.customerName,
    ) ||
    "Customer"
  );
}

function getShopName(
  request: ShopRequestData,
): string {
  return (
    getString(
      request.shopName,
    ) ||
    "This shop"
  );
}

function getServiceName(
  request: ShopRequestData,
): string {
  return (
    getString(
      request.serviceName,
    ) ||
    "service"
  );
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
  requestId: string,
  eventId: string,
  recipientRole:
    NotificationRecipientRole,
): string {
  return [
    "shop",
    requestId,
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
  requestId: string,
  request: ShopRequestData,
  action: ShopRequestAction,
  status: ShopRequestStatus,
): Record<string, unknown> {
  return {
    type:
      "shop_request",

    action,

    requestId,

    shopRequestId:
      requestId,

    entityType:
      "shop_request",

    entityId:
      requestId,

    shopId:
      getString(
        request.shopId,
      ),

    serviceId:
      getString(
        request.serviceId,
      ),

    status,
  };
}

/* ============================================================
   CREATED MESSAGE
============================================================ */

function buildCreatedMessage(
  request: ShopRequestData,
): string {
  const customerName =
    getCustomerName(
      request,
    );

  const serviceName =
    getServiceName(
      request,
    );

  return `${customerName} sent a request for ${serviceName}.`;
}

/* ============================================================
   UPDATE NOTIFICATION
============================================================ */

function getShopRequestNotification(
  requestId: string,
  before: ShopRequestData,
  after: ShopRequestData,
): ShopNotificationEvent | null {
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
      "FIXXAM_SHOP_REQUEST_PARTICIPANTS_MISSING",
      {
        requestId,

        customerId:
          customerId || null,

        workerId:
          workerId || null,
      },
    );

    return null;
  }

  if (
    customerId ===
    workerId
  ) {
    console.warn(
      "FIXXAM_SHOP_REQUEST_SELF_ASSIGNMENT_DETECTED",
      {
        requestId,
        customerId,
        workerId,
      },
    );

    return null;
  }

  const beforeStatus =
    normalizeShopRequestStatus(
      before.status,
    );

  const afterStatus =
    normalizeShopRequestStatus(
      after.status,
    );

  /* ==========================================================
     ACCEPTED

     Shop/worker accepted customer request.
  ========================================================== */

  if (
    beforeStatus ===
      "pending" &&
    afterStatus ===
      "accepted"
  ) {
    return {
      action:
        "shop_request_accepted",

      title:
        "This shop has accepted your request",

      message:
        "You can now go to the shop.",

      recipientId:
        customerId,

      recipientRole:
        "customer",

      status:
        "accepted",
    };
  }

  /* ==========================================================
     DECLINED

     Shop/worker rejected customer request.
  ========================================================== */

  if (
    beforeStatus ===
      "pending" &&
    afterStatus ===
      "declined"
  ) {
    return {
      action:
        "shop_request_declined",

      title:
        "This shop has rejected your request",

      message:
        "You cannot proceed with this shop request.",

      recipientId:
        customerId,

      recipientRole:
        "customer",

      status:
        "declined",
    };
  }

  return null;
}

/* ============================================================
   SHOP REQUEST CREATED

   CUSTOMER → SHOP OWNER / WORKER
============================================================ */

export const shopRequestCreatedNotifications =
  onDocumentCreated(
    {
      document:
        "shopRequests/{requestId}",

      region:
        REGION,

      retry:
        true,
    },

    async event => {
      const request =
        event.data?.data();

      if (!request) {
        console.warn(
          "FIXXAM_SHOP_REQUEST_CREATED_DATA_MISSING",
          {
            requestId:
              event.params.requestId,

            eventId:
              event.id,
          },
        );

        return;
      }

      const requestId =
        getString(
          event.params.requestId,
        );

      const customerId =
        getCustomerId(
          request,
        );

      const workerId =
        getWorkerId(
          request,
        );

      if (
        !requestId ||
        !customerId ||
        !workerId
      ) {
        console.warn(
          "FIXXAM_SHOP_REQUEST_CREATED_INVALID",
          {
            requestId:
              requestId || null,

            customerId:
              customerId || null,

            workerId:
              workerId || null,

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
          "FIXXAM_SHOP_REQUEST_SELF_ASSIGNMENT_DETECTED",
          {
            requestId,
            customerId,
            workerId,
          },
        );

        return;
      }

      const status =
        normalizeShopRequestStatus(
          request.status,
        );

      if (
        status !==
        "pending"
      ) {
        console.warn(
          "FIXXAM_SHOP_REQUEST_CREATED_INVALID_STATUS",
          {
            requestId,
            status,
          },
        );

        return;
      }

      const notificationId =
        `shop_${requestId}_created_worker`;

      await sendUserPushNotification({
        userId:
          workerId,

        recipientRole:
          "worker",

        type:
          "shop_request",

        title:
          "You have a new shop request",

        message:
          buildCreatedMessage(
            request,
          ),

        notificationId,

        data:
          buildNotificationData(
            requestId,
            request,
            "shop_request_created",
            "pending",
          ),
      });

      console.info(
        "FIXXAM_SHOP_REQUEST_CREATED_NOTIFICATION_SENT",
        {
          requestId,

          customerId,

          workerId,

          shopId:
            getString(
              request.shopId,
            ) || null,

          notificationId,

          eventId:
            event.id,
        },
      );
    },
  );

/* ============================================================
   SHOP REQUEST UPDATED

   Only notifications supported here:
   - accepted
   - declined

   completed/cancelled intentionally produce no Shop
   notification.
============================================================ */

export const shopRequestNotifications =
  onDocumentUpdated(
    {
      document:
        "shopRequests/{requestId}",

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
          "FIXXAM_SHOP_REQUEST_UPDATE_DATA_MISSING",
          {
            requestId:
              event.params.requestId,

            eventId:
              event.id,
          },
        );

        return;
      }

      const requestId =
        getString(
          event.params.requestId,
        );

      if (!requestId) {
        return;
      }

      const notification =
        getShopRequestNotification(
          requestId,
          before,
          after,
        );

      if (!notification) {
        return;
      }

      const notificationId =
        createNotificationId(
          requestId,
          event.id,
          notification.recipientRole,
        );

      await sendUserPushNotification({
        userId:
          notification.recipientId,

        recipientRole:
          notification.recipientRole,

        type:
          "shop_request",

        title:
          notification.title,

        message:
          notification.message,

        notificationId,

        data:
          buildNotificationData(
            requestId,
            after,
            notification.action,
            notification.status,
          ),
      });

      console.info(
        "FIXXAM_SHOP_REQUEST_NOTIFICATION_SENT",
        {
          requestId,

          action:
            notification.action,

          recipientId:
            notification.recipientId,

          recipientRole:
            notification.recipientRole,

          shopName:
            getShopName(
              after,
            ),

          status:
            notification.status,

          notificationId,

          eventId:
            event.id,
        },
      );
    },
  );