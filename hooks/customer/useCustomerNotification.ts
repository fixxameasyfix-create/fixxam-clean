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

type CustomerNotificationType =
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

export type CustomerNotification = {
  id: string;

  /**
   * Backend notification identifier.
   *
   * Firestore document ID remains available
   * separately through `id`.
   */
  notificationId: string;

  type:
    CustomerNotificationType;

  title: string;

  message: string;

  /* ==========================================================
     GENERIC ACTION METADATA
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

  callerId?: string;

  callerRole?:
    NotificationRecipientRole;

  calleeId?: string;

  calleeRole?:
    NotificationRecipientRole;

  /* ==========================================================
     WORKER / PROVIDER
  ========================================================== */

  workerId?: string;

  workerName?: string;

  workerPhone?: string;

  distanceKm?: number;

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
   HOOK RESULT
============================================================ */

export type CustomerNotificationsResult = {
  notifications:
    CustomerNotification[];

  unreadCount:
    number;

  hasUnread:
    boolean;

  serviceRequestCount:
    number;

  shopRequestCount:
    number;

  loading:
    boolean;

  error:
    string | null;

  markNotificationAsRead:
    (
      notificationId:
        string,
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

function getOptionalNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    const parsed =
      Number(
        value,
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return undefined;
}

/* ============================================================
   TYPE VALIDATION
============================================================ */

function normalizeNotificationType(
  value: unknown,
): CustomerNotificationType {
  /*
   * Legacy compatibility.
   *
   * Older sendServiceRequest versions used:
   *
   * worker_service_request
   *
   * Treat it as the current:
   *
   * service_request
   */
  if (
    value ===
    "worker_service_request"
  ) {
    return "service_request";
  }

  if (
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
      "call_update" ||
    value ===
      "message" ||
    value ===
      "system"
  ) {
    return value;
  }

  return "system";
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
    CustomerNotificationType,
): string {
  switch (
    type
  ) {
    case "service_request":
      return "Worker Available Nearby";

    case "booking":
      return "Booking Update";

    case "market_order":
      return "Market Order Update";

    case "shop_request":
      return "Shop Request Update";

    case "incoming_call":
      return "Incoming call";

    case "missed_call":
      return "Missed call";

    case "call_update":
      return "Call update";

    case "message":
      return "New Message";

    case "system":
    default:
      return "Fixxam Notification";
  }
}

/* ============================================================
   RECIPIENT VALIDATION
============================================================ */

function belongsToCustomer(
  notification:
    CustomerNotification,
  customerId:
    string,
): boolean {
  /*
   * New notifications explicitly contain
   * recipientId and recipientRole.
   */

  if (
    notification.recipientId &&
    notification.recipientId !==
      customerId
  ) {
    return false;
  }

  if (
    notification.recipientRole &&
    notification.recipientRole !==
      "customer"
  ) {
    return false;
  }

  /*
   * Legacy notifications may not contain
   * recipient metadata.
   *
   * Since the document already lives under:
   *
   * users/{customerId}/notifications
   *
   * and Firestore rules protect that path,
   * the notification can safely remain visible.
   */

  return true;
}

/* ============================================================
   MAPPER
============================================================ */

function mapNotification(
  id: string,
  data: DocumentData,
): CustomerNotification {
  const type =
    normalizeNotificationType(
      data.type,
    );

  const notificationId =
    getOptionalString(
      data.notificationId,
    ) ??
    id;

  const notification:
    CustomerNotification = {
      id,

      notificationId,

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

  /* ==========================================================
     GENERIC ACTION METADATA
  ========================================================== */

  const action =
    getOptionalString(
      data.action,
    );

  if (
    action
  ) {
    notification.action =
      action;
  }

  const entityId =
    getOptionalString(
      data.entityId,
    );

  if (
    entityId
  ) {
    notification.entityId =
      entityId;
  }

  const entityType =
    getOptionalString(
      data.entityType,
    );

  if (
    entityType
  ) {
    notification.entityType =
      entityType;
  }

  const status =
    getOptionalString(
      data.status,
    );

  if (
    status
  ) {
    notification.status =
      status;
  }

  /* ==========================================================
     SERVICE / BOOKING
  ========================================================== */

  const requestId =
    getOptionalString(
      data.requestId,
    );

  if (
    requestId
  ) {
    notification.requestId =
      requestId;
  }

  const bookingId =
    getOptionalString(
      data.bookingId,
    );

  if (
    bookingId
  ) {
    notification.bookingId =
      bookingId;
  }

  const service =
    getOptionalString(
      data.service,
    ) ??
    getOptionalString(
      data.serviceName,
    );

  if (
    service
  ) {
    notification.service =
      service;
  }

  const location =
    getOptionalString(
      data.location,
    );

  if (
    location
  ) {
    notification.location =
      location;
  }

  /* ==========================================================
     MARKET
  ========================================================== */

  const orderId =
    getOptionalString(
      data.orderId,
    );

  if (
    orderId
  ) {
    notification.orderId =
      orderId;
  }

  /* ==========================================================
     SHOP REQUEST
  ========================================================== */

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

  if (
    shopRequestId
  ) {
    notification.shopRequestId =
      shopRequestId;
  }

  const shopId =
    getOptionalString(
      data.shopId,
    );

  if (
    shopId
  ) {
    notification.shopId =
      shopId;
  }

  const shopName =
    getOptionalString(
      data.shopName,
    );

  if (
    shopName
  ) {
    notification.shopName =
      shopName;
  }

  /* ==========================================================
     CALL
  ========================================================== */

  const callId =
    getOptionalString(
      data.callId,
    );

  if (
    callId
  ) {
    notification.callId =
      callId;
  }

  const callerId =
    getOptionalString(
      data.callerId,
    );

  if (
    callerId
  ) {
    notification.callerId =
      callerId;
  }

  if (
    isRecipientRole(
      data.callerRole,
    )
  ) {
    notification.callerRole =
      data.callerRole;
  }

  const calleeId =
    getOptionalString(
      data.calleeId,
    );

  if (
    calleeId
  ) {
    notification.calleeId =
      calleeId;
  }

  if (
    isRecipientRole(
      data.calleeRole,
    )
  ) {
    notification.calleeRole =
      data.calleeRole;
  }

  /* ==========================================================
     WORKER / PROVIDER
  ========================================================== */

  const workerId =
    getOptionalString(
      data.workerId,
    );

  if (
    workerId
  ) {
    notification.workerId =
      workerId;
  }

  const workerName =
    getOptionalString(
      data.workerName,
    );

  if (
    workerName
  ) {
    notification.workerName =
      workerName;
  }

  /*
   * Only the explicit workerPhone field
   * is mapped.
   *
   * We intentionally do not fallback to
   * generic `phone` or `phoneNumber`.
   */
  const workerPhone =
    getOptionalString(
      data.workerPhone,
    );

  if (
    workerPhone
  ) {
    notification.workerPhone =
      workerPhone;
  }

  const distanceKm =
    getOptionalNumber(
      data.distanceKm,
    );

  if (
    distanceKm !==
    undefined
  ) {
    notification.distanceKm =
      distanceKm;
  }

  /* ==========================================================
     RECIPIENT
  ========================================================== */

  const recipientId =
    getOptionalString(
      data.recipientId,
    );

  if (
    recipientId
  ) {
    notification.recipientId =
      recipientId;
  }

  if (
    isRecipientRole(
      data.recipientRole,
    )
  ) {
    notification.recipientRole =
      data.recipientRole;
  }

  return notification;
}

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerNotifications(): CustomerNotificationsResult {
  const [
    notifications,
    setNotifications,
  ] =
    useState<
      CustomerNotification[]
    >(
      [],
    );

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
      | Unsubscribe
      | null =
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

          /* ==================================================
             WAIT FOR AUTH
          ================================================== */

          await auth
            .authStateReady();

          if (
            !active
          ) {
            return;
          }

          const user =
            auth.currentUser;

          /* ==================================================
             NO USER
          ================================================== */

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
             LISTENER
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
                       RECIPIENT
                    ========================================== */

                    .filter(
                      notification =>
                        belongsToCustomer(
                          notification,
                          user.uid,
                        ),
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
                  "FIXXAM_CUSTOMER_NOTIFICATIONS_LISTENER_ERROR:",
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
                      code?:
                        string;
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
            "FIXXAM_CUSTOMER_NOTIFICATIONS_ERROR:",
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
     MARK AS READ
  ========================================================== */

  const markNotificationAsRead =
    useCallback(
      async (
        notificationId:
          string,
      ): Promise<void> => {
        const cleanNotificationId =
          typeof notificationId ===
          "string"
            ? notificationId
                .trim()
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
         * Resolve the real Firestore
         * document ID.
         *
         * notificationId may be a backend
         * identifier while `id` is always
         * the Firestore document ID.
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
            "FIXXAM_CUSTOMER_NOTIFICATION_MARK_READ_ERROR:",
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
     SERVICE REQUEST COUNT
  ========================================================== */

  const serviceRequestCount =
    useMemo(
      () =>
        notifications.filter(
          notification =>
            notification.type ===
            "service_request",
        ).length,
      [
        notifications,
      ],
    );

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

    serviceRequestCount,

    shopRequestCount,

    loading,

    error,

    markNotificationAsRead,
  };
}