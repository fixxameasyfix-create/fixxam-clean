import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type CustomerNotificationType =
  | "service_request"
  | "booking"
  | "market_order"
  | "system";

export type NotificationRecipientRole =
  | "customer"
  | "worker";

export type CustomerNotification = {
  id: string;

  type: CustomerNotificationType;

  title: string;

  message: string;

  workerId?: string;

  workerName?: string;

  workerPhone?: string;

  service?: string;

  location?: string;

  requestId?: string;

  bookingId?: string;

  orderId?: string;

  recipientId?: string;

  recipientRole?:
    NotificationRecipientRole;

  read: boolean;

  createdAt: Timestamp | null;

  expiresAt: Timestamp | null;
};

/* ============================================================
   HELPERS
============================================================ */

function isTimestamp(
  value: unknown,
): value is Timestamp {
  return value instanceof Timestamp;
}

function getOptionalString(
  value: unknown,
): string | undefined {
  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized || undefined;
}

/* ============================================================
   TYPE VALIDATION
============================================================ */

function isNotificationType(
  value: unknown,
): value is CustomerNotificationType {
  return (
    value === "service_request" ||
    value === "booking" ||
    value === "market_order" ||
    value === "system"
  );
}

function isRecipientRole(
  value: unknown,
): value is NotificationRecipientRole {
  return (
    value === "customer" ||
    value === "worker"
  );
}

/* ============================================================
   MAPPER
============================================================ */

function mapNotification(
  id: string,
  data: DocumentData,
): CustomerNotification {
  const type: CustomerNotificationType =
    isNotificationType(data.type)
      ? data.type
      : "system";

  return {
    id,

    type,

    title:
      typeof data.title === "string" &&
      data.title.trim().length > 0
        ? data.title.trim()
        : type === "service_request"
          ? "New Service Request"
          : type === "booking"
            ? "Booking Update"
            : type === "market_order"
              ? "Market Order Update"
              : "Fixxam Notification",

    message:
      typeof data.message === "string"
        ? data.message.trim()
        : "",

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

    requestId:
      getOptionalString(
        data.requestId,
      ),

    bookingId:
      getOptionalString(
        data.bookingId,
      ),

    orderId:
      getOptionalString(
        data.orderId,
      ),

    recipientId:
      getOptionalString(
        data.recipientId,
      ),

    recipientRole:
      isRecipientRole(
        data.recipientRole,
      )
        ? data.recipientRole
        : undefined,

    read:
      data.read === true,

    createdAt:
      isTimestamp(data.createdAt)
        ? data.createdAt
        : null,

    expiresAt:
      isTimestamp(data.expiresAt)
        ? data.expiresAt
        : null,
  };
}

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerNotifications() {
  const [
    notifications,
    setNotifications,
  ] = useState<
    CustomerNotification[]
  >([]);

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

  /* ==========================================================
     REAL-TIME LISTENER
  ========================================================== */

  useEffect(() => {
    let active = true;

    let unsubscribe:
      | Unsubscribe
      | null = null;

    const startListener =
      async () => {
        try {
          setLoading(true);
          setError(null);

          /*
           * Wait for Firebase Auth session.
           */
          await auth.authStateReady();

          if (!active) {
            return;
          }

          const user =
            auth.currentUser;

          /*
           * No authenticated customer.
           */
          if (!user) {
            setNotifications([]);
            setLoading(false);
            return;
          }

          /*
           * users/{uid}/notifications
           */
          const notificationsRef =
            collection(
              db,
              "users",
              user.uid,
              "notifications",
            );

          /*
           * Single-field orderBy.
           */
          const notificationsQuery =
            query(
              notificationsRef,
              orderBy(
                "createdAt",
                "desc",
              ),
            );

          unsubscribe =
            onSnapshot(
              notificationsQuery,

              (snapshot) => {
                if (!active) {
                  return;
                }

                const now =
                  Date.now();

                const items =
                  snapshot.docs
                    .map(
                      (document) =>
                        mapNotification(
                          document.id,
                          document.data(),
                        ),
                    )

                    /*
                     * ==================================================
                     * CUSTOMER RECIPIENT FILTER
                     * ==================================================
                     *
                     * Only notifications explicitly addressed to
                     * this authenticated customer are allowed.
                     *
                     * This prevents Worker notifications from appearing
                     * inside the Customer application.
                     */
                    .filter(
                      (
                        notification,
                      ) =>
                        notification.recipientId ===
                          user.uid &&
                        notification.recipientRole ===
                          "customer",
                    )

                    /*
                     * ==================================================
                     * EXPIRATION FILTER
                     * ==================================================
                     */
                    .filter(
                      (
                        notification,
                      ) => {
                        if (
                          notification.expiresAt
                        ) {
                          return (
                            notification.expiresAt.toMillis() >
                            now
                          );
                        }

                        return true;
                      },
                    );

                setNotifications(
                  items,
                );

                setLoading(false);
                setError(null);
              },

              (listenerError) => {
                console.error(
                  "FIXXAM_CUSTOMER_NOTIFICATIONS_LISTENER_ERROR:",
                  listenerError,
                );

                if (!active) {
                  return;
                }

                setNotifications([]);
                setLoading(false);

                const errorCode =
                  (
                    listenerError as {
                      code?: string;
                    }
                  )?.code;

                if (
                  errorCode ===
                  "permission-denied"
                ) {
                  setError(
                    "You do not have permission to read notifications.",
                  );

                  return;
                }

                if (
                  errorCode ===
                  "failed-precondition"
                ) {
                  setError(
                    "Notification service is not ready. Please try again.",
                  );

                  return;
                }

                setError(
                  "Unable to load notifications.",
                );
              },
            );
        } catch (error) {
          console.error(
            "FIXXAM_CUSTOMER_NOTIFICATIONS_ERROR:",
            error,
          );

          if (!active) {
            return;
          }

          setNotifications([]);
          setLoading(false);

          setError(
            "Unable to load notifications.",
          );
        }
      };

    void startListener();

    return () => {
      active = false;

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    };
  }, []);

  /* ==========================================================
     UNREAD COUNT
  ========================================================== */

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.read,
        ).length,
      [notifications],
    );

  /* ==========================================================
     HAS UNREAD
  ========================================================== */

  const hasUnread =
    unreadCount > 0;

  /* ==========================================================
     SERVICE REQUEST COUNT
  ========================================================== */

  const serviceRequestCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            notification.type ===
            "service_request",
        ).length,
      [notifications],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    notifications,

    unreadCount,

    hasUnread,

    serviceRequestCount,

    loading,

    error,
  };
}