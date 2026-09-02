import * as admin from "firebase-admin";

/* ============================================================
   TYPES
============================================================ */

export type CustomerPushNotificationType =
  | "service_request"
  | "booking"
  | "market_order"
  | "system";

export type NotificationData = Record<
  string,
  string | number | boolean
>;

export type SendCustomerPushNotificationParams = {
  customerId: string;

  type: CustomerPushNotificationType;

  title: string;

  message: string;

  /**
   * Deterministic notification ID.
   *
   * Cloud Functions should provide this for events that
   * can be retried, e.g.:
   *
   * notificationId: `booking_${bookingId}_${event.id}`
   *
   * If omitted, Firestore generates a random ID.
   */
  notificationId?: string;

  data?: NotificationData;
};

/* ============================================================
   CONSTANTS
============================================================ */

const EXPO_PUSH_URL =
  "https://exp.host/--/api/v2/push/send";

const MAX_TOKENS_PER_REQUEST = 100;

const NOTIFICATION_EXPIRY_DAYS = 30;

const EXPO_CHANNEL_ID =
  "fixxam-default";

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidExpoPushToken(
  value: unknown,
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const token = value.trim();

  return (
    token.startsWith(
      "ExponentPushToken[",
    ) ||
    token.startsWith(
      "ExpoPushToken[",
    )
  );
}

function chunkArray<T>(
  items: T[],
  size: number,
): T[][] {
  const chunks: T[][] = [];

  for (
    let index = 0;
    index < items.length;
    index += size
  ) {
    chunks.push(
      items.slice(
        index,
        index + size,
      ),
    );
  }

  return chunks;
}

function getNotificationRef(
  customerId: string,
  notificationId?: string,
) {
  const notificationsRef =
    admin
      .firestore()
      .collection("users")
      .doc(customerId)
      .collection("notifications");

  if (notificationId) {
    return notificationsRef.doc(
      notificationId,
    );
  }

  return notificationsRef.doc();
}

/* ============================================================
   CREATE FIRESTORE NOTIFICATION
============================================================ */

async function createFirestoreNotification(
  params: SendCustomerPushNotificationParams,
): Promise<{
  notificationId: string;
  notificationPath: string;
}> {
  const {
    customerId,
    type,
    title,
    message,
    data = {},
    notificationId,
  } = params;

  const notificationRef =
    getNotificationRef(
      customerId,
      notificationId,
    );

  const notificationData = {
    type,

    title,

    message,

    read: false,

    createdAt:
      admin.firestore.FieldValue.serverTimestamp(),

    expiresAt:
      admin.firestore.Timestamp.fromMillis(
        Date.now() +
          NOTIFICATION_EXPIRY_DAYS *
            24 *
            60 *
            60 *
            1000,
      ),

    ...data,
  };

  /*
   * set() with merge:false intentionally creates/replaces
   * the deterministic notification document.
   *
   * When the same Cloud Function event is retried using
   * the same notificationId, no second document is created.
   */
  await notificationRef.set(
    notificationData,
    {
      merge: false,
    },
  );

  return {
    notificationId:
      notificationRef.id,

    notificationPath:
      notificationRef.path,
  };
}

/* ============================================================
   GET CUSTOMER
============================================================ */

async function getCustomerData(
  customerId: string,
): Promise<
  FirebaseFirestore.DocumentData | null
> {
  const customerRef =
    admin
      .firestore()
      .collection("users")
      .doc(customerId);

  const customerSnapshot =
    await customerRef.get();

  if (!customerSnapshot.exists) {
    console.warn(
      "FIXXAM_CUSTOMER_NOT_FOUND:",
      customerId,
    );

    return null;
  }

  return (
    customerSnapshot.data() ?? null
  );
}

/* ============================================================
   GET PUSH TOKENS
============================================================ */

function getValidPushTokens(
  customerData:
    | FirebaseFirestore.DocumentData
    | null,
): string[] {
  if (!customerData) {
    return [];
  }

  const rawTokens =
    Array.isArray(
      customerData.expoPushTokens,
    )
      ? customerData.expoPushTokens
      : [];

  return [
    ...new Set(
      rawTokens
        .filter(
          isValidExpoPushToken,
        )
        .map((token) =>
          token.trim(),
        ),
    ),
  ];
}

/* ============================================================
   SEND EXPO PUSH
============================================================ */

async function sendExpoPushNotifications(
  tokens: string[],
  notification: {
    title: string;
    body: string;
    data: NotificationData;
  },
): Promise<void> {
  if (tokens.length === 0) {
    return;
  }

  const tokenChunks =
    chunkArray(
      tokens,
      MAX_TOKENS_PER_REQUEST,
    );

  for (
    const tokenChunk of tokenChunks
  ) {
    const messages =
      tokenChunk.map(
        (to) => ({
          to,

          sound: "default",

          title:
            notification.title,

          body:
            notification.body,

          data:
            notification.data,

          channelId:
            EXPO_CHANNEL_ID,

          priority: "high",

          ttl: 60 * 60,

          mutableContent:
            true,
        }),
      );

    try {
      const response =
        await fetch(
          EXPO_PUSH_URL,
          {
            method: "POST",

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
                messages,
              ),
          },
        );

      const responseText =
        await response.text();

      if (!response.ok) {
        console.error(
          "FIXXAM_EXPO_PUSH_HTTP_ERROR:",
          {
            status:
              response.status,

            response:
              responseText,
          },
        );

        continue;
      }

      console.log(
        "FIXXAM_EXPO_PUSH_SENT:",
        {
          tokenCount:
            tokenChunk.length,

          response:
            responseText,
        },
      );
    } catch (error) {
      /*
       * Do not throw here.
       *
       * The Firestore notification has already been saved,
       * so the customer can still see it when opening the app.
       */
      console.error(
        "FIXXAM_EXPO_PUSH_REQUEST_ERROR:",
        error,
      );
    }
  }
}

/* ============================================================
   MAIN SERVICE
============================================================ */

export async function sendCustomerPushNotification(
  params: SendCustomerPushNotificationParams,
): Promise<void> {
  const customerId =
    normalizeString(
      params.customerId,
    );

  const title =
    normalizeString(
      params.title,
    );

  const message =
    normalizeString(
      params.message,
    );

  const type =
    params.type;

  const data =
    params.data ?? {};

  const notificationId =
    normalizeString(
      params.notificationId,
    );

  /* ----------------------------------------------------------
     VALIDATION
  ---------------------------------------------------------- */

  if (!customerId) {
    throw new Error(
      "customerId is required.",
    );
  }

  if (!title) {
    throw new Error(
      "Notification title is required.",
    );
  }

  if (!message) {
    throw new Error(
      "Notification message is required.",
    );
  }

  if (
    type !==
      "service_request" &&
    type !== "booking" &&
    type !== "market_order" &&
    type !== "system"
  ) {
    throw new Error(
      "Invalid notification type.",
    );
  }

  /* ----------------------------------------------------------
     SAVE FIRESTORE NOTIFICATION
  ---------------------------------------------------------- */

  const savedNotification =
    await createFirestoreNotification({
      customerId,

      type,

      title,

      message,

      notificationId:
        notificationId ||
        undefined,

      data,
    });

  console.log(
    "FIXXAM_NOTIFICATION_SAVED:",
    savedNotification,
  );

  /* ----------------------------------------------------------
     GET CUSTOMER
  ---------------------------------------------------------- */

  const customerData =
    await getCustomerData(
      customerId,
    );

  if (!customerData) {
    return;
  }

  /* ----------------------------------------------------------
     CHECK PUSH ENABLED
  ---------------------------------------------------------- */

  if (
    customerData
      .pushNotificationsEnabled ===
    false
  ) {
    console.log(
      "FIXXAM_PUSH_DISABLED_FOR_CUSTOMER:",
      customerId,
    );

    return;
  }

  /* ----------------------------------------------------------
     GET PUSH TOKENS
  ---------------------------------------------------------- */

  const tokens =
    getValidPushTokens(
      customerData,
    );

  if (tokens.length === 0) {
    console.log(
      "FIXXAM_NO_PUSH_TOKEN:",
      customerId,
    );

    return;
  }

  /* ----------------------------------------------------------
     SEND PUSH
  ---------------------------------------------------------- */

  await sendExpoPushNotifications(
    tokens,
    {
      title,

      body: message,

      data: {
        type,

        ...data,
      },
    },
  );
}