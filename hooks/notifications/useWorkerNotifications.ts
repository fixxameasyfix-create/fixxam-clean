import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
  db,
} from "@/firebase/config";

/* ============================================================
   CONSTANTS
============================================================ */

const NOTIFICATION_QUERY_LIMIT =
  100;

/* ============================================================
   TYPES
============================================================ */

export type WorkerNotificationType =
  | "service_request"
  | "booking"
  | "shop_request"
  | "market_order"
  | "incoming_call"
  | "missed_call"
  | "call_update"
  | "message"
  | "worker_review"
  | "system";

export type NotificationRecipientRole =
  | "customer"
  | "worker";

export type WorkerNotificationAction =
  /* ==========================================================
     MARKET
  ========================================================== */

  | "order_created"
  | "order_accepted"
  | "order_on_the_way"
  | "order_completed"
  | "order_cancelled"
  | "product_unavailable"

  /* ==========================================================
     SERVICE / BOOKING
  ========================================================== */

  | "booking_created"
  | "offer_received"
  | "offer_accepted"
  | "offer_declined"
  | "counter_offer_received"
  | "counter_offer_accepted"
  | "counter_offer_declined"
  | "journey_started"
  | "worker_arrived"
  | "booking_in_progress"
  | "booking_completed"
  | "booking_cancelled"

  /* ==========================================================
     SHOP REQUEST
  ========================================================== */

  | "shop_request_created"
  | "shop_request_accepted"
  | "shop_request_declined"

  /* ==========================================================
     FIXXAM VOICE
  ========================================================== */

  | "incoming_call"
  | "missed_call"
  | "call_declined"

  /* ==========================================================
     REVIEWS
  ========================================================== */

  | "review_received";

export type WorkerNotification = {
  /* ==========================================================
     IDENTITY
  ========================================================== */

  id: string;

  notificationId: string;

  /* ==========================================================
     NOTIFICATION
  ========================================================== */

  type:
    WorkerNotificationType;

  title: string;

  message: string;

  action?:
    WorkerNotificationAction;

  /* ==========================================================
     GENERIC
  ========================================================== */

  entityId?: string;

  entityType?: string;

  status?: string;

  /* ==========================================================
     SERVICE / BOOKING / SHOP
  ========================================================== */

  bookingId?: string;

  requestId?: string;

  service?: string;

  location?: string;

  /* ==========================================================
     MARKET
  ========================================================== */

  orderId?: string;

  /* ==========================================================
     FIXXAM VOICE
  ========================================================== */

  callId?: string;

  callerId?: string;

  callerRole?:
    NotificationRecipientRole;

  calleeId?: string;

  calleeRole?:
    NotificationRecipientRole;

  /* ==========================================================
     ACTORS / DISPLAY
  ========================================================== */

  workerId?: string;

  workerName?: string;

  customerId?: string;

  customerName?: string;

  /* ==========================================================
     REVIEW
  ========================================================== */

  reviewId?: string;

  rating?: number;

  reviewComment?: string;

  /* ==========================================================
     RECIPIENT
  ========================================================== */

  recipientId: string;

  recipientRole:
    "worker";

  /* ==========================================================
     STATE
  ========================================================== */

  read: boolean;

  createdAt:
    Timestamp | null;

  expiresAt:
    Timestamp | null;
};

export type WorkerNotificationsResult = {
  notifications:
    WorkerNotification[];

  unreadCount:
    number;

  hasUnread:
    boolean;

  loading:
    boolean;

  error:
    string | null;

  markNotificationAsRead:
    (
      notificationId: string,
    ) => Promise<void>;
};

/* ============================================================
   HELPERS
============================================================ */

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

  return clean ||
    undefined;
}

function getTimestamp(
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

function getOptionalRating(
  value: unknown,
): number | undefined {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    !Number.isInteger(
      value,
    ) ||
    value < 1 ||
    value > 5
  ) {
    return undefined;
  }

  return value;
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
      "shop_request" ||
    value ===
      "market_order" ||
    value ===
      "incoming_call" ||
    value ===
      "missed_call" ||
    value ===
      "call_update" ||
    value ===
      "message" ||
    value ===
      "worker_review" ||
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

function isNotificationAction(
  value: unknown,
): value is WorkerNotificationAction {
  return (
    /* ========================================================
       MARKET
    ======================================================== */

    value ===
      "order_created" ||
    value ===
      "order_accepted" ||
    value ===
      "order_on_the_way" ||
    value ===
      "order_completed" ||
    value ===
      "order_cancelled" ||
    value ===
      "product_unavailable" ||

    /* ========================================================
       SERVICE / BOOKING
    ======================================================== */

    value ===
      "booking_created" ||
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
      "counter_offer_declined" ||
    value ===
      "journey_started" ||
    value ===
      "worker_arrived" ||
    value ===
      "booking_in_progress" ||
    value ===
      "booking_completed" ||
    value ===
      "booking_cancelled" ||

    /* ========================================================
       SHOP REQUEST
    ======================================================== */

    value ===
      "shop_request_created" ||
    value ===
      "shop_request_accepted" ||
    value ===
      "shop_request_declined" ||

    /* ========================================================
       FIXXAM VOICE
    ======================================================== */

    value ===
      "incoming_call" ||
    value ===
      "missed_call" ||
    value ===
      "call_declined" ||

    /* ========================================================
       REVIEWS
    ======================================================== */

    value ===
      "review_received"
  );
}

/* ============================================================
   DEFAULT TITLE
============================================================ */

function getDefaultTitle(
  type: WorkerNotificationType,
): string {
  switch (
    type
  ) {
    case "service_request":
      return "Service Request";

    case "booking":
      return "Booking Update";

    case "shop_request":
      return "You have a new shop request";

    case "market_order":
      return "Market Order Update";

    case "incoming_call":
      return "Incoming call";

    case "missed_call":
      return "Missed call";

    case "call_update":
      return "Call update";

    case "message":
      return "New Message";

    case "worker_review":
      return "New Review";

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
  recipientId: string,
): WorkerNotification {
  const type:
    WorkerNotificationType =
    isNotificationType(
      data.type,
    )
      ? data.type
      : "system";

  const notificationId =
    getOptionalString(
      data.notificationId,
    ) ??
    id;

  const notification:
    WorkerNotification = {
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

      recipientId,

      recipientRole:
        "worker",

      read:
        data.read ===
        true,

      createdAt:
        getTimestamp(
          data.createdAt,
        ),

      expiresAt:
        getTimestamp(
          data.expiresAt,
        ),
    };

  /* ==========================================================
     ACTION
  ========================================================== */

  if (
    isNotificationAction(
      data.action,
    )
  ) {
    notification.action =
      data.action;
  }

  /* ==========================================================
     GENERIC
  ========================================================== */

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
     SERVICE / BOOKING / SHOP
  ========================================================== */

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

  /*
   * Shop Request notifications use requestId.
   *
   * entityId is kept as a safe fallback so older Shop
   * notifications can still open if they were written
   * before requestId was added explicitly.
   */
  const requestId =
    getOptionalString(
      data.requestId,
    ) ??
    (
      type ===
        "shop_request"
        ? getOptionalString(
            data.entityId,
          )
        : undefined
    );

  if (
    requestId
  ) {
    notification.requestId =
      requestId;
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
     FIXXAM VOICE
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
     ACTORS / DISPLAY
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

  const customerId =
    getOptionalString(
      data.customerId,
    );

  if (
    customerId
  ) {
    notification.customerId =
      customerId;
  }

  const customerName =
    getOptionalString(
      data.customerName,
    );

  if (
    customerName
  ) {
    notification.customerName =
      customerName;
  }

  /* ==========================================================
     REVIEW
  ========================================================== */

  const reviewId =
    getOptionalString(
      data.reviewId,
    );

  if (
    reviewId
  ) {
    notification.reviewId =
      reviewId;
  }

  const rating =
    getOptionalRating(
      data.rating,
    );

  if (
    rating !==
    undefined
  ) {
    notification.rating =
      rating;
  }

  const reviewComment =
    getOptionalString(
      data.reviewComment,
    ) ??
    getOptionalString(
      data.comment,
    );

  if (
    reviewComment
  ) {
    notification.reviewComment =
      reviewComment;
  }

  /*
   * PRIVACY:
   *
   * Intentionally never read:
   *
   * data.customerPhone
   * data.workerPhone
   * data.phone
   * data.phoneNumber
   *
   * Fixxam Voice keeps personal
   * phone numbers out of Bell data.
   */

  return notification;
}

/* ============================================================
   HOOK
============================================================ */

export function useWorkerNotifications(): WorkerNotificationsResult {
  const [
    notifications,
    setNotifications,
  ] =
    useState<
      WorkerNotification[]
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

    let unsubscribeNotifications:
      Unsubscribe | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,

        user => {
          /* ==================================================
             CLEAN PREVIOUS LISTENER
          ================================================== */

          unsubscribeNotifications?.();

          unsubscribeNotifications =
            undefined;

          /* ==================================================
             NO AUTHENTICATED USER
          ================================================== */

          if (
            !user
          ) {
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
              null,
            );

            return;
          }

          /* ==================================================
             AUTHENTICATED WORKER
          ================================================== */

          if (
            !active
          ) {
            return;
          }

          setLoading(
            true,
          );

          setError(
            null,
          );

          const notificationsRef =
            collection(
              db,
              "users",
              user.uid,
              "notifications",
            );

          /*
           * Keep realtime listener bounded.
           */
          const notificationsQuery =
            query(
              notificationsRef,

              orderBy(
                "createdAt",
                "desc",
              ),

              limit(
                NOTIFICATION_QUERY_LIMIT,
              ),
            );

          /* ==================================================
             REALTIME SNAPSHOT
          ================================================== */

          unsubscribeNotifications =
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

                const items:
                  WorkerNotification[] =
                  [];

                for (
                  const notificationDoc of
                    snapshot.docs
                ) {
                  const data =
                    notificationDoc.data();

                  /* ==========================================
                     STRICT RECIPIENT VALIDATION
                  ========================================== */

                  const recipientId =
                    getOptionalString(
                      data.recipientId,
                    );

                  if (
                    recipientId !==
                    user.uid
                  ) {
                    continue;
                  }

                  if (
                    data.recipientRole !==
                    "worker"
                  ) {
                    continue;
                  }

                  /* ==========================================
                     NORMALIZE
                  ========================================== */

                  const notification =
                    mapNotification(
                      notificationDoc.id,
                      data,
                      recipientId,
                    );

                  /* ==========================================
                     EXPIRATION
                  ========================================== */

                  if (
                    notification.expiresAt &&
                    notification.expiresAt.toMillis() <=
                      now
                  ) {
                    continue;
                  }

                  items.push(
                    notification,
                  );
                }

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

              snapshotError => {
                console.error(
                  "FIXXAM_WORKER_NOTIFICATIONS_ERROR:",
                  snapshotError,
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
                    snapshotError as {
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
        },
      );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      active =
        false;

      unsubscribeNotifications?.();

      unsubscribeAuth();
    };
  }, []);

  /* ==========================================================
     MARK AS READ
  ========================================================== */

  const markNotificationAsRead =
    useCallback(
      async (
        notificationId: string,
      ): Promise<void> => {
        const safeNotificationId =
          getOptionalString(
            notificationId,
          );

        if (
          !safeNotificationId
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
         * Resolve the actual Firestore
         * notification document ID.
         */
        const matchingNotification =
          notifications.find(
            notification =>
              notification.id ===
                safeNotificationId ||
              notification.notificationId ===
                safeNotificationId,
          );

        const documentId =
          matchingNotification?.id ??
          safeNotificationId;

        if (
          matchingNotification?.read
        ) {
          return;
        }

        /* ====================================================
           OPTIMISTIC UPDATE
        ==================================================== */

        setNotifications(
          current =>
            current.map(
              notification =>
                notification.id ===
                  documentId
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
              documentId,
            );

          /*
           * Firestore Rules should allow
           * the owner to modify only read.
           */
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
                documentId,

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
                    documentId
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
        notifications.reduce(
          (
            count,
            notification,
          ) =>
            notification.read
              ? count
              : count + 1,
          0,
        ),
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

    hasUnread:
      unreadCount >
      0,

    loading,

    error,

    markNotificationAsRead,
  };
}

export default useWorkerNotifications;