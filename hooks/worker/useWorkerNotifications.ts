import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";

import {
  useCallback,
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

type WorkerNotificationType =
  | "service_request"
  | "booking"
  | "shop_request"
  | "market_order"
  | "saved_worker"
  | "incoming_call"
  | "missed_call"
  | "call_update"
  | "message"
  | "system";

export type NotificationRecipientRole =
  | "customer"
  | "worker";

export type WorkerNotification = {
  id: string;

  notificationId: string;

  type:
    WorkerNotificationType;

  title: string;

  message: string;

  /* ==========================================================
     GENERIC
  ========================================================== */

  action?: string;

  entityId?: string;

  entityType?: string;

  status?: string;

  /* ==========================================================
     SERVICE / BOOKING
  ========================================================== */

  requestId?: string;

  bookingId?: string;

  service?: string;

  location?: string;

  /* ==========================================================
     MARKET
  ========================================================== */

  orderId?: string;

  /* ==========================================================
     SHOP REQUEST
  ========================================================== */

  shopRequestId?: string;

  shopId?: string;

  shopName?: string;

  /* ==========================================================
     CALL
  ========================================================== */

  callId?: string;

  /* ==========================================================
     OPTIONAL DISPLAY METADATA
  ========================================================== */

  customerId?: string;

  customerName?: string;

  workerId?: string;

  workerName?: string;

  /* ==========================================================
     RECIPIENT
  ========================================================== */

  recipientId?: string;

  recipientRole?:
    NotificationRecipientRole;

  /* ==========================================================
     STATE
  ========================================================== */

  read: boolean;

  createdAt:
    Timestamp | null;

  expiresAt:
    Timestamp | null;
};

/* ============================================================
   RESULT
============================================================ */

export type WorkerNotificationsResult = {
  notifications:
    WorkerNotification[];

  unreadCount:
    number;

  hasUnread:
    boolean;

  shopRequestCount:
    number;

  loading:
    boolean;

  error:
    string | null;

  markNotificationAsRead: (
    notificationId: string,
  ) => Promise<void>;
};

/* ============================================================
   HELPERS
============================================================ */

function isTimestamp(
  value: unknown,
): value is Timestamp {
  return (
    value instanceof
    Timestamp
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

  const normalized =
    value.trim();

  return (
    normalized ||
    undefined
  );
}

/* ============================================================
   TYPE VALIDATION
============================================================ */

function isNotificationType(
  value: unknown,
): value is WorkerNotificationType {
  return (
    value ===
      "service_request" ||
    value ===
      "booking" ||
    value ===
      "market_order" ||
    value ===
      "shop_request" ||
    value ===
      "incoming_call" ||
    value ===
      "missed_call" ||
    value ===
      "message" ||
    value ===
      "system"
  );
}

function isRecipientRole(
  value: unknown,
): value is NotificationRecipientRole {
  return (
    value ===
      "customer" ||
    value ===
      "worker"
  );
}

/* ============================================================
   DEFAULT TITLE
============================================================ */

function getDefaultTitle(
  type:
    WorkerNotificationType,
): string {
  switch (
    type
  ) {
    case "service_request":
      return "New Service Request";

    case "booking":
      return "Booking Update";

    case "market_order":
      return "Market Order Update";

    case "shop_request":
      return "New Shop Request";

    case "incoming_call":
      return "Incoming Fixxam Voice Call";

    case "missed_call":
      return "Missed Fixxam Voice Call";

    case "message":
      return "New Message";

    case "system":
    default:
      return "Fixxam Notification";
  }
}

/* ============================================================
   MAPPER
============================================================ */

function mapNotification(
  id: string,
  data: DocumentData,
): WorkerNotification {
  const type:
    WorkerNotificationType =
    isNotificationType(
      data.type,
    )
      ? data.type
      : "system";

  const requestId =
    getOptionalString(
      data.requestId,
    );

  const shopRequestId =
    getOptionalString(
      data.shopRequestId,
    ) ??
    (
      type ===
      "shop_request"
        ? requestId
        : undefined
    );

  return {
    id,

    notificationId:
      getOptionalString(
        data.notificationId,
      ) ??
      id,

    type,

    title:
      getOptionalString(
        data.title,
      ) ??
      getDefaultTitle(
        type,
      ),

    message:
      getOptionalString(
        data.message,
      ) ??
      "",

    /* ========================================================
       GENERIC
    ======================================================== */

    action:
      getOptionalString(
        data.action,
      ),

    entityId:
      getOptionalString(
        data.entityId,
      ),

    entityType:
      getOptionalString(
        data.entityType,
      ),

    status:
      getOptionalString(
        data.status,
      ),

    /* ========================================================
       SERVICE / BOOKING
    ======================================================== */

    requestId,

    bookingId:
      getOptionalString(
        data.bookingId,
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

    /* ========================================================
       MARKET
    ======================================================== */

    orderId:
      getOptionalString(
        data.orderId,
      ),

    /* ========================================================
       SHOP REQUEST
    ======================================================== */

    shopRequestId,

    shopId:
      getOptionalString(
        data.shopId,
      ),

    shopName:
      getOptionalString(
        data.shopName,
      ),

    /* ========================================================
       CALL
    ======================================================== */

    callId:
      getOptionalString(
        data.callId,
      ),

    /* ========================================================
       DISPLAY METADATA
    ======================================================== */

    customerId:
      getOptionalString(
        data.customerId,
      ),

    customerName:
      getOptionalString(
        data.customerName,
      ),

    workerId:
      getOptionalString(
        data.workerId,
      ),

    workerName:
      getOptionalString(
        data.workerName,
      ),

    /* ========================================================
       RECIPIENT
    ======================================================== */

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

    /* ========================================================
       STATE
    ======================================================== */

    read:
      data.read ===
      true,

    createdAt:
      isTimestamp(
        data.createdAt,
      )
        ? data.createdAt
        : null,

    expiresAt:
      isTimestamp(
        data.expiresAt,
      )
        ? data.expiresAt
        : null,
  };
}

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerNotifications():
  WorkerNotificationsResult {
  const [
    notifications,
    setNotifications,
  ] =
    useState<
      WorkerNotification[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  /* ==========================================================
     REALTIME LISTENER
  ========================================================== */

  useEffect(() => {
    let active =
      true;

    let unsubscribe:
      Unsubscribe | null =
      null;

    const startListener =
      async () => {
        try {
          setLoading(
            true,
          );

          setError(
            null,
          );

          await auth
            .authStateReady();

          if (
            !active
          ) {
            return;
          }

          const user =
            auth.currentUser;

          if (
            !user
          ) {
            setNotifications(
              [],
            );

            setLoading(
              false,
            );

            return;
          }

          /* ==================================================
             COLLECTION
          ================================================== */

          const notificationsRef =
            collection(
              db,
              "users",
              user.uid,
              "notifications",
            );

          /* ==================================================
             QUERY
          ================================================== */

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

          unsubscribe =
            onSnapshot(
              notificationsQuery,

              snapshot => {
                if (
                  !active
                ) {
                  return;
                }

                const now =
                  Date.now();

                const items =
                  snapshot.docs
                    .map(
                      document =>
                        mapNotification(
                          document.id,
                          document.data(),
                        ),
                    )

                    /* ==========================================
                       WORKER RECIPIENT
                    ========================================== */

                    .filter(
                      notification =>
                        notification
                          .recipientId ===
                          user.uid &&
                        notification
                          .recipientRole ===
                          "worker",
                    )

                    /* ==========================================
                       EXPIRATION
                    ========================================== */

                    .filter(
                      notification => {
                        const expiresAt =
                          notification
                            .expiresAt;

                        if (
                          !expiresAt
                        ) {
                          return true;
                        }

                        return (
                          expiresAt
                            .toMillis() >
                          now
                        );
                      },
                    );

                setNotifications(
                  items,
                );

                setLoading(
                  false,
                );

                setError(
                  null,
                );
              },

              listenerError => {
                console.error(
                  "FIXXAM_WORKER_NOTIFICATIONS_LISTENER_ERROR:",
                  listenerError,
                );

                if (
                  !active
                ) {
                  return;
                }

                setNotifications(
                  [],
                );

                setLoading(
                  false,
                );

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
        } catch (
          listenerSetupError
        ) {
          console.error(
            "FIXXAM_WORKER_NOTIFICATIONS_ERROR:",
            listenerSetupError,
          );

          if (
            !active
          ) {
            return;
          }

          setNotifications(
            [],
          );

          setLoading(
            false,
          );

          setError(
            "Unable to load notifications.",
          );
        }
      };

    void startListener();

    return () => {
      active =
        false;

      unsubscribe?.();

      unsubscribe =
        null;
    };
  }, []);

  /* ==========================================================
     MARK READ
  ========================================================== */

  const markNotificationAsRead =
    useCallback(
      async (
        notificationId: string,
      ): Promise<void> => {
        const cleanNotificationId =
          typeof notificationId ===
          "string"
            ? notificationId.trim()
            : "";

        if (
          !cleanNotificationId
        ) {
          return;
        }

        await auth
          .authStateReady();

        const user =
          auth.currentUser;

        if (
          !user
        ) {
          throw new Error(
            "AUTH_REQUIRED",
          );
        }

        /*
         * notificationId may be a backend
         * identifier while `id` is the real
         * Firestore document ID.
         */
        const matchingNotification =
          notifications.find(
            notification =>
              notification.id ===
                cleanNotificationId ||
              notification.notificationId ===
                cleanNotificationId,
          );

        const firestoreDocumentId =
          matchingNotification
            ?.id ??
          cleanNotificationId;

        /* ====================================================
           OPTIMISTIC UPDATE
        ==================================================== */

        setNotifications(
          current =>
            current.map(
              notification =>
                notification.id ===
                  firestoreDocumentId ||
                notification.notificationId ===
                  cleanNotificationId
                  ? {
                      ...notification,

                      read:
                        true,
                    }
                  : notification,
            ),
        );

        try {
          const notificationRef =
            doc(
              db,
              "users",
              user.uid,
              "notifications",
              firestoreDocumentId,
            );

          await updateDoc(
            notificationRef,
            {
              read:
                true,
            },
          );
        } catch (
          markReadError
        ) {
          console.error(
            "FIXXAM_WORKER_NOTIFICATION_MARK_READ_ERROR:",
            {
              notificationId:
                cleanNotificationId,

              firestoreDocumentId,

              error:
                markReadError,
            },
          );

          /* ==================================================
             ROLLBACK
          ================================================== */

          setNotifications(
            current =>
              current.map(
                notification =>
                  notification.id ===
                    firestoreDocumentId ||
                  notification.notificationId ===
                    cleanNotificationId
                    ? {
                        ...notification,

                        read:
                          false,
                      }
                    : notification,
              ),
          );

          throw markReadError;
        }
      },
      [
        notifications,
      ],
    );

  /* ==========================================================
     UNREAD COUNT
  ========================================================== */

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          notification =>
            !notification.read,
        ).length,
      [
        notifications,
      ],
    );

  /* ==========================================================
     HAS UNREAD
  ========================================================== */

  const hasUnread =
    unreadCount >
    0;

  /* ==========================================================
     SHOP REQUEST COUNT
  ========================================================== */

  const shopRequestCount =
    useMemo(
      () =>
        notifications.filter(
          notification =>
            notification.type ===
            "shop_request",
        ).length,
      [
        notifications,
      ],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    notifications,

    unreadCount,

    hasUnread,

    shopRequestCount,

    loading,

    error,

    markNotificationAsRead,
  };
}