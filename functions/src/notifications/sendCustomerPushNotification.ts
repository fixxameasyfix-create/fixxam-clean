import {
  FieldValue,
  Timestamp,
  getFirestore,
  type DocumentReference,
} from "firebase-admin/firestore";

const db =
  getFirestore();

/* ============================================================
   TYPES
============================================================ */

export type UserPushNotificationType =
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

  interruptionLevel:
    | "active"
    | "time-sensitive";
}

interface ExpoPushTicket {
  status?: string;

  id?: string;

  message?: string;

  details?: Record<string, unknown>;
}

interface ExpoPushResponse {
  data?: ExpoPushTicket[];

  errors?: Array<
    Record<string, unknown>
  >;
}

/* ============================================================
   CONSTANTS
============================================================ */

const EXPO_PUSH_URL =
  "https://exp.host/--/api/v2/push/send";

const EXPO_CHUNK_SIZE =
  100;

const NOTIFICATION_TTL_DAYS =
  30;

const PUSH_CLAIM_LEASE_MS =
  2 * 60 * 1000;

const MAX_TITLE_LENGTH =
  120;

const MAX_MESSAGE_LENGTH =
  1000;

const MAX_NOTIFICATION_ID_LENGTH =
  500;

const MAX_USER_ID_LENGTH =
  128;

/* ============================================================
   ANDROID CHANNELS
============================================================ */

const ANDROID_CHANNELS = {
  default:
    "fixxam-default-v2",

  calls:
    "fixxam-calls-v2",

  service:
    "fixxam-service-v2",

  market:
    "fixxam-market-v2",

  messages:
    "fixxam-messages-v2",
} as const;

/* ============================================================
   ARRAY CHUNKS
============================================================ */

function chunk<T>(
  items: T[],
  size: number,
): T[][] {
  const result: T[][] =
    [];

  for (
    let index = 0;
    index <
    items.length;
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

/* ============================================================
   TEXT
============================================================ */

function cleanText(
  value: unknown,
  maxLength: number,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      maxLength,
    );
}

/* ============================================================
   EXPO PUSH TOKEN
============================================================ */

function isExpoPushToken(
  value: unknown,
): value is string {
  if (
    typeof value !==
    "string"
  ) {
    return false;
  }

  const token =
    value.trim();

  return (
    (
      token.startsWith(
        "ExpoPushToken[",
      ) ||
      token.startsWith(
        "ExponentPushToken[",
      )
    ) &&
    token.endsWith(
      "]",
    )
  );
}

/* ============================================================
   RECIPIENT ROLE
============================================================ */

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
   NOTIFICATION TYPE
============================================================ */

function isNotificationType(
  value: unknown,
): value is UserPushNotificationType {
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
      "saved_worker" ||
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
  );
}

/* ============================================================
   CHANNEL ROUTING
============================================================ */

function getAndroidChannelId(
  type: UserPushNotificationType,
): string {
  switch (
    type
  ) {
    case "incoming_call":
    case "missed_call":
    case "call_update":
      return ANDROID_CHANNELS
        .calls;

    case "booking":
    case "service_request":
    case "shop_request":
      return ANDROID_CHANNELS
        .service;

    case "market_order":
      return ANDROID_CHANNELS
        .market;

    case "message":
      return ANDROID_CHANNELS
        .messages;

    case "saved_worker":
    case "system":
    default:
      return ANDROID_CHANNELS
        .default;
  }
}

/* ============================================================
   PUSH TTL
============================================================ */

function getPushTtlSeconds(
  type: UserPushNotificationType,
): number {
  switch (
    type
  ) {
    case "incoming_call":
      return 60;

    case "message":
    case "booking":
    case "service_request":
    case "shop_request":
    case "market_order":
    case "saved_worker":
      return (
        24 *
        60 *
        60
      );

    case "missed_call":
    case "call_update":
      return (
        6 *
        60 *
        60
      );

    case "system":
    default:
      return (
        6 *
        60 *
        60
      );
  }
}

/* ============================================================
   INTERRUPTION LEVEL
============================================================ */

function getInterruptionLevel(
  type: UserPushNotificationType,
):
  | "active"
  | "time-sensitive" {
  if (
    type ===
    "incoming_call"
  ) {
    return "time-sensitive";
  }

  return "active";
}

/* ============================================================
   JSON SAFE VALUE
============================================================ */

function sanitizeValue(
  value: unknown,
): unknown {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return undefined;
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return value;
  }

  if (
    value instanceof
    Timestamp
  ) {
    return value
      .toDate()
      .toISOString();
  }

  if (
    value instanceof
    Date
  ) {
    return value
      .toISOString();
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value
      .map(
        sanitizeValue,
      )
      .filter(
        item =>
          item !==
          undefined,
      );
  }

  if (
    typeof value ===
    "object"
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
      const cleanKey =
        key
          .trim()
          .slice(
            0,
            100,
          );

      if (
        !cleanKey
      ) {
        continue;
      }

      const sanitized =
        sanitizeValue(
          item,
        );

      if (
        sanitized !==
        undefined
      ) {
        result[
          cleanKey
        ] =
          sanitized;
      }
    }

    return result;
  }

  return undefined;
}

/* ============================================================
   SANITIZE DATA
============================================================ */

function sanitizeData(
  data?: Record<
    string,
    unknown
  >,
): Record<string, unknown> {
  if (
    !data
  ) {
    return {};
  }

  const sanitized =
    sanitizeValue(
      data,
    );

  if (
    !sanitized ||
    typeof sanitized !==
      "object" ||
    Array.isArray(
      sanitized,
    )
  ) {
    return {};
  }

  return sanitized as Record<
    string,
    unknown
  >;
}

/* ============================================================
   VALID PUSH TOKENS
============================================================ */

function getValidExpoTokens(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          isExpoPushToken,
        )
        .map(
          token =>
            token.trim(),
        ),
    ),
  );
}

/* ============================================================
   PUSH DELIVERY CLAIM
============================================================ */

async function claimPushDelivery(
  notificationRef:
    DocumentReference,
): Promise<boolean> {
  return db.runTransaction(
    async transaction => {
      const snapshot =
        await transaction.get(
          notificationRef,
        );

      if (
        !snapshot.exists
      ) {
        return false;
      }

      const notification =
        snapshot.data() ??
        {};

      if (
        notification
          .pushSentAt
          instanceof
          Timestamp
      ) {
        return false;
      }

      const claimedAt =
        notification
          .pushClaimedAt;

      if (
        claimedAt instanceof
          Timestamp &&
        Date.now() -
          claimedAt.toMillis() <
          PUSH_CLAIM_LEASE_MS
      ) {
        return false;
      }

      transaction.set(
        notificationRef,
        {
          pushClaimedAt:
            Timestamp.now(),

          pushAttemptCount:
            FieldValue.increment(
              1,
            ),

          pushLastError:
            FieldValue.delete(),
        },
        {
          merge:
            true,
        },
      );

      return true;
    },
  );
}

/* ============================================================
   PUSH SUCCESS
============================================================ */

async function markPushDelivered(
  notificationRef:
    DocumentReference,
  ticketIds: string[],
): Promise<void> {
  await notificationRef.set(
    {
      pushSentAt:
        FieldValue
          .serverTimestamp(),

      pushClaimedAt:
        FieldValue.delete(),

      pushLastError:
        FieldValue.delete(),

      pushTicketIds:
        ticketIds,
    },
    {
      merge:
        true,
    },
  );
}

/* ============================================================
   PUSH FAILURE
============================================================ */

async function releasePushClaim(
  notificationRef:
    DocumentReference,
  reason: string,
): Promise<void> {
  await notificationRef.set(
    {
      pushClaimedAt:
        FieldValue.delete(),

      pushLastError:
        reason
          .trim()
          .slice(
            0,
            500,
          ),
    },
    {
      merge:
        true,
    },
  );
}

/* ============================================================
   EXPO TICKET ERROR CODE
============================================================ */

function getExpoTicketErrorCode(
  ticket: ExpoPushTicket,
): string {
  const errorCode =
    ticket
      .details
      ?.error;

  return typeof errorCode ===
    "string"
    ? errorCode
    : "";
}

/* ============================================================
   REMOVE INVALID DEVICE TOKENS
============================================================ */

async function removeInvalidExpoTokens(
  userRef:
    DocumentReference,
  tokens: string[],
): Promise<void> {
  if (
    tokens.length ===
    0
  ) {
    return;
  }

  const uniqueTokens =
    Array.from(
      new Set(
        tokens,
      ),
    );

  if (
    uniqueTokens.length ===
    0
  ) {
    return;
  }

  await userRef.set(
    {
      expoPushTokens:
        FieldValue.arrayRemove(
          ...uniqueTokens,
        ),

      pushTokenUpdatedAt:
        FieldValue
          .serverTimestamp(),

      updatedAt:
        FieldValue
          .serverTimestamp(),
    },
    {
      merge:
        true,
    },
  );

  console.info(
    "FIXXAM_INVALID_PUSH_TOKENS_REMOVED",
    {
      tokenCount:
        uniqueTokens.length,
    },
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
  const cleanUserId =
    cleanText(
      userId,
      MAX_USER_ID_LENGTH,
    );

  const cleanNotificationId =
    cleanText(
      notificationId,
      MAX_NOTIFICATION_ID_LENGTH,
    );

  const cleanTitle =
    cleanText(
      title,
      MAX_TITLE_LENGTH,
    );

  const cleanMessage =
    cleanText(
      message,
      MAX_MESSAGE_LENGTH,
    );

  if (
    !cleanUserId
  ) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: missing userId",
    );

    return;
  }

  if (
    cleanUserId.includes(
      "/",
    )
  ) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: invalid userId",
    );

    return;
  }

  if (
    !cleanNotificationId
  ) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: missing notificationId",
      {
        userId:
          cleanUserId,
      },
    );

    return;
  }

  if (
    cleanNotificationId.includes(
      "/",
    )
  ) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: invalid notificationId",
      {
        userId:
          cleanUserId,
      },
    );

    return;
  }

  if (
    !cleanTitle
  ) {
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

  if (
    !cleanMessage
  ) {
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

  if (
    !isRecipientRole(
      recipientRole,
    )
  ) {
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

  if (
    !isNotificationType(
      type,
    )
  ) {
    console.warn(
      "PUSH_NOTIFICATION_SKIPPED: invalid notification type",
      {
        userId:
          cleanUserId,

        notificationId:
          cleanNotificationId,
      },
    );

    return;
  }

  /* ==========================================================
     DATA
  ========================================================== */

  const cleanData =
    sanitizeData(
      data,
    );

  const notificationData: Record<
    string,
    unknown
  > = {
    ...cleanData,

    type,

    notificationId:
      cleanNotificationId,

    recipientId:
      cleanUserId,

    recipientRole,
  };

  /* ==========================================================
     FIRESTORE BELL NOTIFICATION
  ========================================================== */

  const notificationRef =
    db
      .collection(
        "users",
      )
      .doc(
        cleanUserId,
      )
      .collection(
        "notifications",
      )
      .doc(
        cleanNotificationId,
      );

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

  if (
    existingSnapshot.exists
  ) {
    await notificationRef.set(
      {
        ...notificationData,

        title:
          cleanTitle,

        message:
          cleanMessage,

        expiresAt,

        updatedAt:
          FieldValue
            .serverTimestamp(),
      },
      {
        merge:
          true,
      },
    );
  } else {
    await notificationRef.set({
      ...notificationData,

      title:
        cleanTitle,

      message:
        cleanMessage,

      read:
        false,

      createdAt:
        FieldValue
          .serverTimestamp(),

      updatedAt:
        FieldValue
          .serverTimestamp(),

      expiresAt,
    });
  }

  /* ==========================================================
     USER PROFILE
  ========================================================== */

  const userRef =
    db
      .collection(
        "users",
      )
      .doc(
        cleanUserId,
      );

  const userSnapshot =
    await userRef.get();

  if (
    !userSnapshot.exists
  ) {
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
    userSnapshot.data() ??
    {};

  /* ==========================================================
     PUSH PREFERENCE
  ========================================================== */

  if (
    userData
      .pushNotificationsEnabled ===
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
      userData
        .expoPushTokens,
    );

  if (
    tokens.length ===
    0
  ) {
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
     DEDUPLICATION CLAIM
  ========================================================== */

  const pushClaimed =
    await claimPushDelivery(
      notificationRef,
    );

  if (
    !pushClaimed
  ) {
    console.info(
      "FIXXAM_PUSH_DUPLICATE_SKIPPED",
      {
        userId:
          cleanUserId,

        recipientRole,

        type,

        notificationId:
          cleanNotificationId,
      },
    );

    return;
  }

  /* ==========================================================
     CHANNEL + TTL
  ========================================================== */

  const channelId =
    getAndroidChannelId(
      type,
    );

  const pushTtlSeconds =
    getPushTtlSeconds(
      type,
    );

  const interruptionLevel =
    getInterruptionLevel(
      type,
    );

  /* ==========================================================
     EXPO PUSH MESSAGES
  ========================================================== */

  const messages:
    ExpoPushMessage[] =
    tokens.map(
      token => ({
        to:
          token,

        sound:
          "default",

        title:
          cleanTitle,

        body:
          cleanMessage,

        data: {
          ...notificationData,

          bookingId:
            typeof notificationData
              .bookingId ===
            "string"
              ? notificationData
                  .bookingId
              : undefined,

          orderId:
            typeof notificationData
              .orderId ===
            "string"
              ? notificationData
                  .orderId
              : undefined,

          requestId:
            typeof notificationData
              .requestId ===
            "string"
              ? notificationData
                  .requestId
              : undefined,

          callId:
            typeof notificationData
              .callId ===
            "string"
              ? notificationData
                  .callId
              : undefined,

          action:
            typeof notificationData
              .action ===
            "string"
              ? notificationData
                  .action
              : undefined,
        },

        channelId,

        priority:
          "high",

        ttl:
          pushTtlSeconds,

        interruptionLevel,
      }),
    );

  /* ==========================================================
     CHUNKS
  ========================================================== */

  const messageChunks =
    chunk(
      messages,
      EXPO_CHUNK_SIZE,
    );

  let acceptedTicketCount =
    0;

  const acceptedTicketIds:
    string[] = [];

  const invalidTokens =
    new Set<string>();

  let lastPushError =
    "";

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
      messageChunks[
        chunkIndex
      ];

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

      if (
        !response.ok
      ) {
        const responseText =
          await response.text();

        lastPushError =
          `Expo HTTP ${response.status}`;

        console.error(
          "EXPO_PUSH_HTTP_ERROR",
          {
            userId:
              cleanUserId,

            recipientRole,

            type,

            notificationId:
              cleanNotificationId,

            channelId,

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

      let result:
        | ExpoPushResponse
        | undefined;

      try {
        result =
          (await response.json()) as
            ExpoPushResponse;
      } catch (
        parseError
      ) {
        lastPushError =
          "Unable to parse Expo push response.";

        console.error(
          "EXPO_PUSH_RESPONSE_PARSE_ERROR",
          {
            userId:
              cleanUserId,

            recipientRole,

            type,

            notificationId:
              cleanNotificationId,

            channelId,

            chunkIndex,

            error:
              parseError,
          },
        );

        continue;
      }

      console.info(
        "FIXXAM_EXPO_PUSH_RESPONSE",
        {
          userId:
            cleanUserId,

          recipientRole,

          type,

          notificationId:
            cleanNotificationId,

          channelId,

          pushTtlSeconds,

          interruptionLevel,

          chunkIndex,

          tokenCount:
            messagesChunk.length,

          response:
            result,
        },
      );

      const tickets =
        result?.data;

      if (
        Array.isArray(
          tickets,
        )
      ) {
        for (
          let ticketIndex =
            0;
          ticketIndex <
          tickets.length;
          ticketIndex++
        ) {
          const ticket =
            tickets[
              ticketIndex
            ];

          if (
            ticket?.status ===
            "ok"
          ) {
            acceptedTicketCount +=
              1;

            if (
              typeof ticket.id ===
                "string" &&
              ticket.id.trim()
            ) {
              acceptedTicketIds.push(
                ticket.id.trim(),
              );
            }

            console.info(
              "EXPO_PUSH_TICKET_OK",
              {
                userId:
                  cleanUserId,

                recipientRole,

                type,

                notificationId:
                  cleanNotificationId,

                channelId,

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
            const errorCode =
              getExpoTicketErrorCode(
                ticket,
              );

            lastPushError =
              ticket.message ||
              errorCode ||
              "Expo push ticket error.";

            if (
              errorCode ===
              "DeviceNotRegistered"
            ) {
              const failedToken =
                messagesChunk[
                  ticketIndex
                ]?.to;

              if (
                failedToken
              ) {
                invalidTokens.add(
                  failedToken,
                );
              }
            }

            console.error(
              "EXPO_PUSH_TICKET_ERROR",
              {
                userId:
                  cleanUserId,

                recipientRole,

                type,

                notificationId:
                  cleanNotificationId,

                channelId,

                chunkIndex,

                ticketIndex,

                ticketId:
                  ticket.id ??
                  null,

                errorCode:
                  errorCode ||
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

      const apiErrors =
        result?.errors;

      if (
        Array.isArray(
          apiErrors,
        ) &&
        apiErrors.length >
          0
      ) {
        lastPushError =
          "Expo push API returned an error.";

        console.error(
          "EXPO_PUSH_API_ERRORS",
          {
            userId:
              cleanUserId,

            recipientRole,

            type,

            notificationId:
              cleanNotificationId,

            channelId,

            chunkIndex,

            errors:
              apiErrors,
          },
        );
      }
    } catch (
      error
    ) {
      lastPushError =
        error instanceof
          Error
          ? error.message
          : "Expo push request failed.";

      console.error(
        "EXPO_PUSH_SEND_ERROR",
        {
          userId:
            cleanUserId,

          recipientRole,

          type,

          notificationId:
            cleanNotificationId,

          channelId,

          chunkIndex,

          error,
        },
      );
    }
  }

  /* ==========================================================
     REMOVE INVALID TOKENS
  ========================================================== */

  if (
    invalidTokens.size >
    0
  ) {
    try {
      await removeInvalidExpoTokens(
        userRef,
        Array.from(
          invalidTokens,
        ),
      );
    } catch (
      tokenCleanupError
    ) {
      console.error(
        "FIXXAM_PUSH_TOKEN_CLEANUP_ERROR",
        {
          userId:
            cleanUserId,

          invalidTokenCount:
            invalidTokens.size,

          error:
            tokenCleanupError,
        },
      );
    }
  }

  /* ==========================================================
     DELIVERY RESULT
  ========================================================== */

  if (
    acceptedTicketCount >
    0
  ) {
    await markPushDelivered(
      notificationRef,
      acceptedTicketIds,
    );
  } else {
    await releasePushClaim(
      notificationRef,
      lastPushError ||
        "No Expo push ticket was accepted.",
    );
  }

  console.info(
    "EXPO_PUSH_PROCESS_COMPLETED",
    {
      userId:
        cleanUserId,

      recipientRole,

      type,

      notificationId:
        cleanNotificationId,

      channelId,

      pushTtlSeconds,

      tokenCount:
        tokens.length,

      acceptedTicketCount,

      invalidTokenCount:
        invalidTokens.size,
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