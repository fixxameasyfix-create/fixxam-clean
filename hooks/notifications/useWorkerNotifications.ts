import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type WorkerNotificationType =
  | "service_request"
  | "booking"
  | "market_order"
  | "system";

export type NotificationRecipientRole =
  | "customer"
  | "worker";

export type WorkerNotificationAction =
  | "order_created"
  | "order_accepted"
  | "order_packed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "order_payment_confirmed"
  | "offer_received"
  | "offer_accepted"
  | "offer_declined"
  | "counter_offer_received"
  | "counter_offer_accepted"
  | "counter_offer_declined";

export type WorkerNotification = {
  id: string;

  type: WorkerNotificationType;

  title: string;

  message: string;

  action?: WorkerNotificationAction;

  bookingId?: string;

  orderId?: string;

  requestId?: string;

  workerId?: string;

  workerName?: string;

  workerPhone?: string;

  customerId?: string;

  customerName?: string;

  customerPhone?: string;

  service?: string;

  location?: string;

  recipientId: string;

  recipientRole: "worker";

  read: boolean;

  createdAt?: Timestamp | null;
};

/* ============================================================
   HELPERS
============================================================ */

function isNotificationType(
  value: unknown,
): value is WorkerNotificationType {
  return (
    value ===
      "service_request" ||
    value === "booking" ||
    value === "market_order" ||
    value === "system"
  );
}

function isNotificationAction(
  value: unknown,
): value is WorkerNotificationAction {
  return (
    value ===
      "order_created" ||
    value ===
      "order_accepted" ||
    value ===
      "order_packed" ||
    value ===
      "order_shipped" ||
    value ===
      "order_delivered" ||
    value ===
      "order_cancelled" ||
    value ===
      "order_payment_confirmed" ||
    value ===
      "offer_received" ||
    value ===
      "offer_accepted" ||
    value ===
      "offer_declined" ||
    value ===
      "counter_offer_received" ||
    value ===
      "counter_offer_accepted" ||
    value ===
      "counter_offer_declined"
  );
}

function getOptionalString(
  value: unknown,
): string | undefined {
  if (
    typeof value !==
    "string"
  ) {
    return undefined;
  }

  const clean =
    value.trim();

  return clean || undefined;
}

function getCreatedAt(
  value: unknown,
): Timestamp | null {
  if (
    value &&
    typeof value ===
      "object" &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis ===
      "function"
  ) {
    return value as Timestamp;
  }

  return null;
}

/* ============================================================
   HOOK
============================================================ */

export function useWorkerNotifications() {
  const [
    notifications,
    setNotifications,
  ] = useState<
    WorkerNotification[]
  >([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let unsubscribeNotifications:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          /* ==================================================
             CLEANUP OLD LISTENER
          ================================================== */

          unsubscribeNotifications?.();

          unsubscribeNotifications =
            undefined;

          /* ==================================================
             NO USER
          ================================================== */

          if (!user) {
            setNotifications([]);

            setUnreadCount(0);

            setLoading(false);

            setError(null);

            return;
          }

          /* ==================================================
             AUTHENTICATED WORKER
          ================================================== */

          setLoading(true);

          setError(null);

          const notificationsRef =
            collection(
              db,
              "users",
              user.uid,
              "notifications",
            );

          /*
           * Only order by createdAt.
           *
           * Recipient filtering is performed locally
           * so no composite Firestore index is required.
           *
           * Security Rules must still protect the
           * user's notification collection.
           */

          const notificationsQuery =
            query(
              notificationsRef,
              orderBy(
                "createdAt",
                "desc",
              ),
            );

          /* ==================================================
             REALTIME LISTENER
          ================================================== */

          unsubscribeNotifications =
            onSnapshot(
              notificationsQuery,
              (snapshot) => {
                const items: WorkerNotification[] =
                  [];

                for (
                  const notificationDoc of
                    snapshot.docs
                ) {
                  const data =
                    notificationDoc.data();

                  /* ==========================================
                     RECIPIENT VALIDATION
                  ========================================== */

                  const recipientId =
                    getOptionalString(
                      data.recipientId,
                    );

                  const recipientRole =
                    data.recipientRole;

                  /*
                   * STRICT WORKER RECIPIENT CHECK.
                   *
                   * Do not use workerId as fallback.
                   *
                   * workerId can simply describe
                   * the worker involved in a notification.
                   */

                  if (
                    recipientId !==
                    user.uid
                  ) {
                    continue;
                  }

                  if (
                    recipientRole !==
                    "worker"
                  ) {
                    continue;
                  }

                  /* ==========================================
                     TYPE
                  ========================================== */

                  const type =
                    isNotificationType(
                      data.type,
                    )
                      ? data.type
                      : "system";

                  /* ==========================================
                     ACTION
                  ========================================== */

                  const action =
                    isNotificationAction(
                      data.action,
                    )
                      ? data.action
                      : undefined;

                  /* ==========================================
                     NORMALIZE
                  ========================================== */

                  const notification: WorkerNotification =
                    {
                      id:
                        notificationDoc.id,

                      type,

                      title:
                        typeof data.title ===
                        "string"
                          ? data.title.trim() ||
                            "Notification"
                          : "Notification",

                      message:
                        typeof data.message ===
                        "string"
                          ? data.message.trim()
                          : "",

                      action,

                      bookingId:
                        getOptionalString(
                          data.bookingId,
                        ),

                      orderId:
                        getOptionalString(
                          data.orderId,
                        ),

                      requestId:
                        getOptionalString(
                          data.requestId,
                        ),

                      workerId:
                        getOptionalString(
                          data.workerId,
                        ),

                      workerName:
                        getOptionalString(
                          data.workerName,
                        ),

                      workerPhone:
                        getOptionalString(
                          data.workerPhone,
                        ),

                      customerId:
                        getOptionalString(
                          data.customerId,
                        ),

                      customerName:
                        getOptionalString(
                          data.customerName,
                        ),

                      customerPhone:
                        getOptionalString(
                          data.customerPhone,
                        ),

                      service:
                        getOptionalString(
                          data.service,
                        ) ??
                        getOptionalString(
                          data.serviceName,
                        ),

                      location:
                        getOptionalString(
                          data.location,
                        ),

                      recipientId,

                      recipientRole:
                        "worker",

                      read:
                        data.read ===
                        true,

                      createdAt:
                        getCreatedAt(
                          data.createdAt,
                        ),
                    };

                  items.push(
                    notification,
                  );
                }

                /* ==========================================
                   STATE
                ========================================== */

                setNotifications(
                  items,
                );

                let unread = 0;

                for (
                  const notification of
                    items
                ) {
                  if (
                    !notification.read
                  ) {
                    unread += 1;
                  }
                }

                setUnreadCount(
                  unread,
                );

                setLoading(false);

                setError(null);
              },
              (snapshotError) => {
                console.error(
                  "FIXXAM_WORKER_NOTIFICATIONS_ERROR:",
                  snapshotError,
                );

                setNotifications([]);

                setUnreadCount(0);

                setLoading(false);

                setError(
                  "Unable to load notifications.",
                );
              },
            );
        },
      );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      unsubscribeNotifications?.();

      unsubscribeAuth();
    };
  }, []);

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    notifications,

    unreadCount,

    hasUnread:
      unreadCount > 0,

    loading,

    error,
  };
}

export default useWorkerNotifications;