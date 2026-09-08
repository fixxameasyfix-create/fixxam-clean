import {
  FieldValue,
  Timestamp,
  getFirestore,
} from "firebase-admin/firestore";

const db = getFirestore();

/* ============================================================
   TYPES
============================================================ */

export type UserPushNotificationType =
  | "service_request"
  | "booking"
  | "market_order"
  | "system";

export type NotificationRecipientRole =
  | "customer"
  | "worker";

export interface SendUserPushNotificationParams {
  userId: string;

  recipientRole: NotificationRecipientRole;

  type: UserPushNotificationType;

  title: string;

  message: string;

  notificationId: string;

  data?: Record<string, unknown>;
}

export interface SendCustomerPushNotificationParams {
  customerId: string;

  type: UserPushNotificationType;

  title: string;

  message: string;

  notificationId: string;

  data?: Record<string, unknown>;
}

/* ============================================================
   EXPO TYPES
============================================================ */

interface ExpoPushMessage {
  to: string;

  sound: "default";

  title: string;

  body: string;

  data: Record<string, unknown>;

  channelId: string;

  priority: "high";

  ttl: number;
}

interface ExpoPushTicket {
  status?: string;

  id?: string;

  message?: string;

  details?: Record<string, unknown>;
}

interface ExpoPushResponse {
  data?: ExpoPushTicket[];

  errors?: Array<Record<string, unknown>>;
}

/* ============================================================
   CONSTANTS
============================================================ */

const EXPO_PUSH_URL =
  "https://exp.host/--/api/v2/push/send";

const EXPO_CHUNK_SIZE = 100;

const NOTIFICATION_TTL_DAYS = 30;

const PUSH_TTL_SECONDS =
  60 * 60;

const ANDROID_CHANNEL_ID =
  "fixxam-default";

/* ============================================================
   HELPERS
============================================================ */

/**
 * Split an array into smaller chunks.
 */
function chunk<T>(
  items: T[],
  size: number,
): T[][] {
  const result: T[][] = [];

  for (
    let index = 0;
    index < items.length;
    index += size
  ) {
    result.push(
      items.slice(
        index,
        index + size,
      ),
    );
  }

  return result;
}

/**
 * Validate Expo push token.
 */
function isExpoPushToken(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.startsWith(
      "ExponentPushToken[",
    ) &&
    value.endsWith("]")
  );
}

/**
 * Validate notification recipient role.
 */
function isRecipientRole(
  value: unknown,
): value is NotificationRecipientRole {
  return (
    value === "customer" ||
    value === "worker"
  );
}

/**
 * Convert arbitrary notification data
 * into JSON-safe values.
 *
 * Expo push data should contain primitive
 * JSON-compatible values.
 */
function sanitizeValue(
  value: unknown,
): unknown {
  if (
    value === null ||
    value === undefined
  ) {
    return undefined;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .map(sanitizeValue)
      .filter(
        (item) =>
          item !== undefined,
      );
  }

  if (
    typeof value === "object"
  ) {
    const result: Record<
      string,
      unknown
    > = {};

    for (
      const [
        key,
        item,
      ] of Object.entries(
        value as Record<
          string,
          unknown
        >,
      )
    ) {
      const sanitized =
        sanitizeValue(item);

      if (
        sanitized !== undefined
      ) {
        result[key] =
          sanitized;
      }
    }

    return result;
  }

  return undefined;
}

/**
 * Sanitize top-level notification data.
 */
function sanitizeData(
  data?: Record<string, unknown>,
): Record<string, unknown> {
  if (!data) {
    return {};
  }

  const sanitized =
    sanitizeValue(data);

  if (
    !sanitized ||
    typeof sanitized !== "object" ||
    Array.isArray(sanitized)
  ) {
    return {};
  }

  return sanitized as Record<
    string,
    unknown
  >;
}

/**
 * Return only valid unique Expo tokens.
 */
function getValidExpoTokens(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        isExpoPushToken,
      ),
    ),
  );
}

/* ============================================================
   SEND USER NOTIFICATION
============================================================ */

export async function sendUserPushNotification({
  userId,
  recipientRole,
  type,
  title,
  message,
  notificationId,
  data,
}: SendUserPushNotificationParams): Promise<void> {
  /* ==========================================================
     VALIDATION
  ========================================================== */

  const cleanUserId =
    userId.trim();

  const cleanNotificationId =
    notificationId.trim();

  const cleanTitle =
    title.trim();

  const cleanMessage =
    message.trim();

  if (!cleanUserId) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: missing userId",
    );

    return;
  }

  if (!cleanNotificationId) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: missing notificationId",
      {
        userId: cleanUserId,
      },
    );

    return;
  }

  if (!cleanTitle) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: missing title",
      {
        userId:
          cleanUserId,

        notificationId:
          cleanNotificationId,
      },
    );

    return;
  }

  if (!cleanMessage) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: missing message",
      {
        userId:
          cleanUserId,

        notificationId:
          cleanNotificationId,
      },
    );

    return;
  }

  if (!isRecipientRole(recipientRole)) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: invalid recipientRole",
      {
        userId:
          cleanUserId,

        recipientRole,
      },
    );

    return;
  }

  /* ==========================================================
     SANITIZE DATA
  ========================================================== */

  const cleanData =
    sanitizeData(data);

  /**
   * Reserved fields are added last.
   *
   * This prevents callers from accidentally
   * overriding the actual notification recipient
   * or notification type.
   */
  const notificationData: Record<
    string,
    unknown
  > = {
    ...cleanData,

    type,

    recipientId:
      cleanUserId,

    recipientRole,
  };

  /* ==========================================================
     FIRESTORE NOTIFICATION
  ========================================================== */

  const notificationRef =
    db
      .collection("users")
      .doc(cleanUserId)
      .collection("notifications")
      .doc(cleanNotificationId);

  const expiresAt =
    Timestamp.fromMillis(
      Date.now() +
        NOTIFICATION_TTL_DAYS *
          24 *
          60 *
          60 *
          1000,
    );

  const existingSnapshot =
    await notificationRef.get();

  if (existingSnapshot.exists) {
    /**
     * IMPORTANT:
     *
     * Do not reset read:false during retries.
     */
    await notificationRef.set(
      {
        ...notificationData,

        title:
          cleanTitle,

        message:
          cleanMessage,

        expiresAt,
      },
      {
        merge: true,
      },
    );
  } else {
    await notificationRef.set({
      ...notificationData,

      title:
        cleanTitle,

      message:
        cleanMessage,

      read: false,

      createdAt:
        FieldValue.serverTimestamp(),

      expiresAt,
    });
  }

  /* ==========================================================
     USER PROFILE
  ========================================================== */

  const userRef =
    db
      .collection("users")
      .doc(cleanUserId);

  const userSnapshot =
    await userRef.get();

  if (!userSnapshot.exists) {
    console.warn(
      "PUSH_NOTIFICATION_USER_NOT_FOUND",
      {
        userId:
          cleanUserId,

        recipientRole,

        notificationId:
          cleanNotificationId,
      },
    );

    return;
  }

  const userData =
    userSnapshot.data() ?? {};

  /* ==========================================================
     PUSH PREFERENCE
  ========================================================== */

  if (
    userData.pushNotificationsEnabled ===
    false
  ) {
    console.info(
      "PUSH_NOTIFICATION_DISABLED_BY_USER",
      {
        userId:
          cleanUserId,

        recipientRole,

        notificationId:
          cleanNotificationId,
      },
    );

    return;
  }

  /* ==========================================================
     PUSH TOKENS
  ========================================================== */

  const tokens =
    getValidExpoTokens(
      userData.expoPushTokens,
    );

  if (tokens.length === 0) {
    console.info(
      "PUSH_NOTIFICATION_NO_TOKENS",
      {
        userId:
          cleanUserId,

        recipientRole,

        notificationId:
          cleanNotificationId,
      },
    );

    return;
  }

  console.info(
    "PUSH_NOTIFICATION_TOKENS_FOUND",
    {
      userId:
        cleanUserId,

      recipientRole,

      notificationId:
        cleanNotificationId,

      tokenCount:
        tokens.length,
    },
  );

  /* ==========================================================
     EXPO PUSH MESSAGES
  ========================================================== */

  const messages: ExpoPushMessage[] =
    tokens.map(
      (token) => ({
        to: token,

        sound:
          "default",

        title:
          cleanTitle,

        body:
          cleanMessage,

        data: {
          ...notificationData,

          bookingId:
            typeof notificationData.bookingId ===
            "string"
              ? notificationData.bookingId
              : undefined,

          orderId:
            typeof notificationData.orderId ===
            "string"
              ? notificationData.orderId
              : undefined,

          requestId:
            typeof notificationData.requestId ===
            "string"
              ? notificationData.requestId
              : undefined,

          action:
            typeof notificationData.action ===
            "string"
              ? notificationData.action
              : undefined,
        },

        channelId:
          ANDROID_CHANNEL_ID,

        priority:
          "high",

        ttl:
          PUSH_TTL_SECONDS,
      }),
    );

  /* ==========================================================
     CHUNK MESSAGES
  ========================================================== */

  const messageChunks =
    chunk(
      messages,
      EXPO_CHUNK_SIZE,
    );

  /* ==========================================================
     SEND TO EXPO
  ========================================================== */

  for (
    let chunkIndex = 0;
    chunkIndex <
    messageChunks.length;
    chunkIndex++
  ) {
    const messagesChunk =
      messageChunks[chunkIndex];

    try {
      const response =
        await fetch(
          EXPO_PUSH_URL,
          {
            method:
              "POST",

            headers: {
              Accept:
                "application/json",

              "Accept-encoding":
                "gzip, deflate",

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                messagesChunk,
              ),
          },
        );

      /* ======================================================
         HTTP ERROR
      ====================================================== */

      if (!response.ok) {
        const responseText =
          await response.text();

        console.error(
          "EXPO_PUSH_HTTP_ERROR",
          {
            userId:
              cleanUserId,

            recipientRole,

            notificationId:
              cleanNotificationId,

            chunkIndex,

            status:
              response.status,

            response:
              responseText.slice(
                0,
                1000,
              ),
          },
        );

        continue;
      }

      /* ======================================================
         PARSE RESPONSE
      ====================================================== */

      let result:
        | ExpoPushResponse
        | undefined;

      try {
        result =
          (await response.json()) as ExpoPushResponse;
      } catch (parseError) {
        console.error(
          "EXPO_PUSH_RESPONSE_PARSE_ERROR",
          {
            userId:
              cleanUserId,

            recipientRole,

            notificationId:
              cleanNotificationId,

            chunkIndex,

            error:
              parseError,
          },
        );

        continue;
      }

      /* ======================================================
         FULL RESPONSE LOG
      ====================================================== */

      console.info(
        "FIXXAM_EXPO_PUSH_RESPONSE",
        {
          userId:
            cleanUserId,

          recipientRole,

          notificationId:
            cleanNotificationId,

          chunkIndex,

          tokenCount:
            messagesChunk.length,

          response:
            result,
        },
      );

      /* ======================================================
         TICKETS
      ====================================================== */

      if (
        Array.isArray(
          result?.data,
        )
      ) {
        for (
          let ticketIndex = 0;
          ticketIndex <
          result.data.length;
          ticketIndex++
        ) {
          const ticket =
            result.data[
              ticketIndex
            ];

          if (
            ticket?.status ===
            "ok"
          ) {
            console.info(
              "EXPO_PUSH_TICKET_OK",
              {
                userId:
                  cleanUserId,

                recipientRole,

                notificationId:
                  cleanNotificationId,

                chunkIndex,

                ticketIndex,

                ticketId:
                  ticket.id ??
                  null,
              },
            );

            continue;
          }

          if (
            ticket?.status ===
            "error"
          ) {
            console.error(
              "EXPO_PUSH_TICKET_ERROR",
              {
                userId:
                  cleanUserId,

                recipientRole,

                notificationId:
                  cleanNotificationId,

                chunkIndex,

                ticketIndex,

                ticketId:
                  ticket.id ??
                  null,

                message:
                  ticket.message ??
                  null,

                details:
                  ticket.details ??
                  null,
              },
            );
          }
        }
      }

      /* ======================================================
         EXPO API ERRORS
      ====================================================== */

      if (
        Array.isArray(
          result?.errors,
        ) &&
        result.errors.length >
          0
      ) {
        console.error(
          "EXPO_PUSH_API_ERRORS",
          {
            userId:
              cleanUserId,

            recipientRole,

            notificationId:
              cleanNotificationId,

            chunkIndex,

            errors:
              result.errors,
          },
        );
      }
    } catch (error) {
      /**
       * Push failure must not delete
       * the Firestore notification.
       */
      console.error(
        "EXPO_PUSH_SEND_ERROR",
        {
          userId:
            cleanUserId,

          recipientRole,

          notificationId:
            cleanNotificationId,

          chunkIndex,

          error,
        },
      );
    }
  }

  /* ==========================================================
     COMPLETE
  ========================================================== */

  console.info(
    "EXPO_PUSH_PROCESS_COMPLETED",
    {
      userId:
        cleanUserId,

      recipientRole,

      type,

      notificationId:
        cleanNotificationId,

      tokenCount:
        tokens.length,
    },
  );
}

/* ============================================================
   CUSTOMER WRAPPER
============================================================ */

export async function sendCustomerPushNotification({
  customerId,
  type,
  title,
  message,
  notificationId,
  data,
}: SendCustomerPushNotificationParams): Promise<void> {
  await sendUserPushNotification({
    userId:
      customerId,

    recipientRole:
      "customer",

    type,

    title,

    message,

    notificationId,

    data,
  });
}