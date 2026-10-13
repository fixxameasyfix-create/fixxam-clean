import * as admin from "firebase-admin";

import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  distanceBetween,
  geohashQueryBounds,
} from "geofire-common";

/* ============================================================
   TYPES
============================================================ */

type SendServiceRequestData = {
  service: string;
  location: string;
  phone: string;
  latitude?: unknown;
  longitude?: unknown;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type CustomerCandidate = {
  id: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  data: Record<string, unknown>;
};

type NotificationDeliveryResult = {
  customerId: string;
  notificationCreated: boolean;
  pushAttempted: boolean;
  pushSent: boolean;
  tokenCount: number;
};

/* ============================================================
   CONSTANTS
============================================================== */

const MAX_CUSTOMERS = 5;

const SEARCH_RADIUS_KM = 15;

const REQUEST_EXPIRY_HOURS = 24;

const MAX_GEOHASH_RESULTS_PER_BOUND = 100;

/* ============================================================
   HELPERS
============================================================ */

function getValidCoordinates(
  latitude: unknown,
  longitude: unknown,
): Coordinates | null {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return null;
  }

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
  };
}

function cleanString(
  value: unknown,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}

function normalizePhone(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  const hasLeadingPlus =
    trimmed.startsWith("+");

  const digits = trimmed
    .replace(/\D/g, "")
    .slice(0, 15);

  if (
    digits.length < 10 ||
    digits.length > 15
  ) {
    return "";
  }

  return hasLeadingPlus
    ? `+${digits}`
    : digits;
}

function getUserRole(
  data: Record<string, unknown>,
): string {
  const possibleRoles = [
    data.role,
    data.userType,
    data.accountType,
  ];

  for (const value of possibleRoles) {
    if (typeof value === "string") {
      const role = value
        .trim()
        .toLowerCase();

      if (role) {
        return role;
      }
    }
  }

  return "";
}

function buildWorkerName(
  data: Record<string, unknown>,
  authName: unknown,
): string {
  const fullName = cleanString(
    data.fullName,
    100,
  );

  if (fullName) {
    return fullName;
  }

  const firstName = cleanString(
    data.firstName,
    50,
  );

  const otherName = cleanString(
    data.otherName,
    50,
  );

  const surname = cleanString(
    data.surname,
    50,
  );

  const combined = [
    firstName,
    otherName,
    surname,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (combined) {
    return combined;
  }

  return cleanString(
    authName,
    100,
  );
}

/* ============================================================
   FCM TOKEN HELPERS
============================================================ */

function normalizeToken(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function addToken(
  tokens: Set<string>,
  value: unknown,
): void {
  const token = normalizeToken(value);

  if (!token) {
    return;
  }

  /*
   * Expo push tokens are not Firebase FCM tokens.
   * They must not be passed to admin.messaging().
   */
  if (
    token.startsWith("ExponentPushToken[") ||
    token.startsWith("ExpoPushToken[")
  ) {
    return;
  }

  tokens.add(token);
}

function getCustomerFcmTokens(
  data: Record<string, unknown>,
): string[] {
  const tokens = new Set<string>();

  addToken(
    tokens,
    data.fcmToken,
  );

  addToken(
    tokens,
    data.pushToken,
  );

  const fcmTokens =
    data.fcmTokens;

  if (Array.isArray(fcmTokens)) {
    for (const token of fcmTokens) {
      addToken(tokens, token);
    }
  }

  const pushTokens =
    data.pushTokens;

  if (Array.isArray(pushTokens)) {
    for (const token of pushTokens) {
      addToken(tokens, token);
    }
  }

  return Array.from(tokens);
}

/* ============================================================
   FCM NOTIFICATION
============================================================ */

async function sendCustomerPushNotification(
  customer: CustomerCandidate,
  workerName: string,
  service: string,
  location: string,
  notificationId: string,
): Promise<{
  attempted: boolean;
  sent: boolean;
  tokenCount: number;
}> {
  const tokens =
    getCustomerFcmTokens(
      customer.data,
    );

  if (tokens.length === 0) {
    console.log(
      "FIXXAM_CUSTOMER_NO_FCM_TOKEN:",
      {
        customerId:
          customer.id,
      },
    );

    return {
      attempted: false,
      sent: false,
      tokenCount: 0,
    };
  }

  const messaging =
    admin.messaging();

  try {
    const response =
      await messaging.sendEachForMulticast({
        tokens,

        notification: {
          title:
            "New Service Request",

          body:
            `${workerName} is available for ${service} near ${location}.`,
        },

        data: {
          type:
            "service_request",

          notificationId,

          customerId:
            customer.id,

          workerId:
            customer.data.workerId
              ? String(
                  customer.data.workerId,
                )
              : "",

          service,

          location,

          distanceKm:
            String(
              Number(
                customer.distanceKm.toFixed(
                  2,
                ),
              ),
            ),

          action:
            "view_service_request",
        },

        android: {
          priority:
            "high",

          notification: {
            channelId:
              "service_requests",

            sound:
              "default",

            clickAction:
              "FLUTTER_NOTIFICATION_CLICK",
          },
        },

        apns: {
          payload: {
            aps: {
              sound:
                "default",

              badge:
                1,
            },
          },
        },
      });

    console.log(
      "FIXXAM_FCM_RESULT:",
      {
        customerId:
          customer.id,

        tokenCount:
          tokens.length,

        successCount:
          response.successCount,

        failureCount:
          response.failureCount,
      },
    );

    /*
     * Remove invalid/unregistered FCM tokens.
     */
    const invalidTokenIndexes =
      new Set<number>();

    response.responses.forEach(
      (
        result,
        index,
      ) => {
        if (
          result.success ||
          !result.error
        ) {
          return;
        }

        const errorCode =
          result.error.code;

        if (
          errorCode ===
            "messaging/registration-token-not-registered" ||
          errorCode ===
            "messaging/invalid-registration-token"
        ) {
          invalidTokenIndexes.add(
            index,
          );
        }
      },
    );

    if (
      invalidTokenIndexes.size >
      0
    ) {
      const customerRef =
        admin
          .firestore()
          .collection("users")
          .doc(customer.id);

      const invalidTokens =
        Array.from(
          invalidTokenIndexes,
        ).map(
          index =>
            tokens[index],
        );

      try {
        await customerRef.update({
          fcmTokens:
            admin.firestore.FieldValue.arrayRemove(
              ...invalidTokens,
            ),
        });
      } catch (
        cleanupError
      ) {
        console.warn(
          "FIXXAM_FCM_TOKEN_CLEANUP_ERROR:",
          {
            customerId:
              customer.id,

            error:
              cleanupError,
          },
        );
      }
    }

    return {
      attempted: true,

      sent:
        response.successCount > 0,

      tokenCount:
        tokens.length,
    };
  } catch (
    pushError
  ) {
    console.error(
      "FIXXAM_FCM_SEND_ERROR:",
      {
        customerId:
          customer.id,

        error:
          pushError,
      },
    );

    return {
      attempted: true,
      sent: false,
      tokenCount:
        tokens.length,
    };
  }
}

/* ============================================================
   CLOUD FUNCTION
============================================================ */

export const sendServiceRequest =
  onCall(
    {
      region:
        "us-central1",

      timeoutSeconds:
        30,

      memory:
        "256MiB",
    },

    async request => {
      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "You must be signed in to send a service request.",
        );
      }

      const workerId =
        request.auth.uid;

      /* ========================================================
         INPUT
      ======================================================== */

      const data =
        (
          request.data ??
          {}
        ) as SendServiceRequestData;

      const service =
        cleanString(
          data.service,
          100,
        );

      const location =
        cleanString(
          data.location,
          200,
        );

      const phone =
        normalizePhone(
          data.phone,
        );

      if (!service) {
        throw new HttpsError(
          "invalid-argument",
          "Service is required.",
        );
      }

      if (!location) {
        throw new HttpsError(
          "invalid-argument",
          "Location is required.",
        );
      }

      if (!phone) {
        throw new HttpsError(
          "invalid-argument",
          "A valid worker phone number is required.",
        );
      }

      const workerCoordinates =
        getValidCoordinates(
          data.latitude,
          data.longitude,
        );

      if (!workerCoordinates) {
        throw new HttpsError(
          "invalid-argument",
          "Valid worker latitude and longitude are required.",
        );
      }

      const {
        latitude:
          workerLatitude,

        longitude:
          workerLongitude,
      } =
        workerCoordinates;

      /* ========================================================
         FIRESTORE
      ======================================================== */

      const db =
        admin.firestore();

      /* ========================================================
         LOAD WORKER
      ======================================================== */

      const workerRef =
        db
          .collection("users")
          .doc(workerId);

      const workerSnapshot =
        await workerRef.get();

      if (!workerSnapshot.exists) {
        throw new HttpsError(
          "failed-precondition",
          "Worker profile was not found.",
        );
      }

      const workerData =
        (
          workerSnapshot.data() ??
          {}
        ) as Record<
          string,
          unknown
        >;

      /* ========================================================
         VERIFY WORKER ROLE
      ======================================================== */

      const workerRole =
        getUserRole(
          workerData,
        );

      if (
        workerRole &&
        workerRole !==
          "worker"
      ) {
        throw new HttpsError(
          "permission-denied",
          "Only workers can send service requests.",
        );
      }

      const workerName =
        buildWorkerName(
          workerData,
          request.auth.token.name,
        ) ||
        "Worker";

      /* ========================================================
         GEOHASH SEARCH
      ======================================================== */

      const bounds =
        geohashQueryBounds(
          [
            workerLatitude,
            workerLongitude,
          ],
          SEARCH_RADIUS_KM *
            1000,
        );

      const customerMap =
        new Map<
          string,
          CustomerCandidate
        >();

      await Promise.all(
        bounds.map(
          async bound => {
            const snapshot =
              await db
                .collection("users")
                .where(
                  "geohash",
                  ">=",
                  bound[0],
                )
                .where(
                  "geohash",
                  "<=",
                  bound[1],
                )
                .limit(
                  MAX_GEOHASH_RESULTS_PER_BOUND,
                )
                .get();

            for (
              const customerDoc of
                snapshot.docs
            ) {
              if (
                customerDoc.id ===
                workerId
              ) {
                continue;
              }

              const customerData =
                (
                  customerDoc.data() ??
                  {}
                ) as Record<
                  string,
                  unknown
                >;

              /* ==============================================
                 ROLE
              ============================================== */

              const customerRole =
                getUserRole(
                  customerData,
                );

              if (
                customerRole &&
                customerRole !==
                  "customer"
              ) {
                continue;
              }

              /* ==============================================
                 LOCATION
              ============================================== */

              const customerCoordinates =
                getValidCoordinates(
                  customerData.latitude,
                  customerData.longitude,
                );

              if (
                !customerCoordinates
              ) {
                continue;
              }

              const {
                latitude:
                  customerLatitude,

                longitude:
                  customerLongitude,
              } =
                customerCoordinates;

              /* ==============================================
                 EXACT DISTANCE
              ============================================== */

              const distanceKm =
                distanceBetween(
                  [
                    workerLatitude,
                    workerLongitude,
                  ],
                  [
                    customerLatitude,
                    customerLongitude,
                  ],
                );

              if (
                distanceKm >
                SEARCH_RADIUS_KM
              ) {
                continue;
              }

              /* ==============================================
                 DEDUPLICATION
              ============================================== */

              const existing =
                customerMap.get(
                  customerDoc.id,
                );

              if (
                existing &&
                existing.distanceKm <=
                  distanceKm
              ) {
                continue;
              }

              customerMap.set(
                customerDoc.id,
                {
                  id:
                    customerDoc.id,

                  latitude:
                    customerLatitude,

                  longitude:
                    customerLongitude,

                  distanceKm,

                  data:
                    customerData,
                },
              );
            }
          },
        ),
      );

      /* ========================================================
         SORT + LIMIT
      ======================================================== */

      const customers =
        Array.from(
          customerMap.values(),
        )
          .sort(
            (
              first,
              second,
            ) =>
              first.distanceKm -
              second.distanceKm,
          )
          .slice(
            0,
            MAX_CUSTOMERS,
          );

      /* ========================================================
         NONE FOUND
      ======================================================== */

      if (
        customers.length ===
        0
      ) {
        console.log(
          "FIXXAM_SERVICE_REQUEST_NO_CUSTOMER:",
          {
            workerId,

            service,

            location,

            workerLatitude,

            workerLongitude,

            radiusKm:
              SEARCH_RADIUS_KM,
          },
        );

        return {
          success:
            false,

          sentCount:
            0,

          customers:
            [],

          message:
            "No customers with a valid location were found nearby.",
        };
      }

      /* ========================================================
         EXPIRY
      ======================================================== */

      const expiresAt =
        admin.firestore.Timestamp.fromMillis(
          Date.now() +
            REQUEST_EXPIRY_HOURS *
              60 *
              60 *
              1000,
        );

      /* ========================================================
         SERVICE REQUEST ID
      ======================================================== */

      const serviceRequestRef =
        db
          .collection(
            "serviceRequests",
          )
          .doc();

      const serviceRequestId =
        serviceRequestRef.id;

      /* ========================================================
         BATCH
      ======================================================== */

      const batch =
        db.batch();

      batch.set(
        serviceRequestRef,
        {
          requestId:
            serviceRequestId,

          workerId,

          workerName,

          workerPhone:
            phone,

          service,

          location,

          workerLatitude,

          workerLongitude,

          status:
            "pending",

          recipientCount:
            customers.length,

          createdAt:
            admin.firestore
              .FieldValue
              .serverTimestamp(),

          expiresAt,
        },
      );

      /* ========================================================
         CREATE CUSTOMER NOTIFICATIONS
      ======================================================== */

      const notificationRefs =
        new Map<
          string,
          FirebaseFirestore.DocumentReference
        >();

      for (
        const customer of
          customers
      ) {
        const notificationRef =
          db
            .collection(
              "users",
            )
            .doc(
              customer.id,
            )
            .collection(
              "notifications",
            )
            .doc();

        notificationRefs.set(
          customer.id,
          notificationRef,
        );

        batch.set(
          notificationRef,
          {
            notificationId:
              notificationRef.id,

            type:
              "service_request",

            title:
              "Worker Available Nearby",

            message:
              `${workerName} is available for ${service} in ${location}.`,

            recipientId:
              customer.id,

            recipientRole:
              "customer",

            action:
              "view_service_request",

            entityId:
              serviceRequestId,

            entityType:
              "worker_service_request",

            serviceRequestId,

            workerId,

            workerName,

            workerPhone:
              phone,

            service,

            location,

            workerLatitude,

            workerLongitude,

            customerLatitude:
              customer.latitude,

            customerLongitude:
              customer.longitude,

            distanceKm:
              Number(
                customer.distanceKm.toFixed(
                  2,
                ),
              ),

            read:
              false,

            createdAt:
              admin.firestore
                .FieldValue
                .serverTimestamp(),

            expiresAt,
          },
        );
      }

      /* ========================================================
         COMMIT FIRESTORE
      ======================================================== */

      await batch.commit();

      /* ========================================================
         SEND PUSH NOTIFICATIONS
      ======================================================== */

      const deliveryResults:
        NotificationDeliveryResult[] =
        [];

      await Promise.all(
        customers.map(
          async customer => {
            const notificationRef =
              notificationRefs.get(
                customer.id,
              );

            if (!notificationRef) {
              return;
            }

            const push =
              await sendCustomerPushNotification(
                customer,
                workerName,
                service,
                location,
                notificationRef.id,
              );

            deliveryResults.push({
              customerId:
                customer.id,

              notificationCreated:
                true,

              pushAttempted:
                push.attempted,

              pushSent:
                push.sent,

              tokenCount:
                push.tokenCount,
            });
          },
        ),
      );

      /* ========================================================
         DELIVERY COUNTS
      ======================================================== */

      const firestoreNotificationCount =
        deliveryResults.filter(
          result =>
            result.notificationCreated,
        ).length;

      const pushAttemptedCount =
        deliveryResults.filter(
          result =>
            result.pushAttempted,
        ).length;

      const pushSentCount =
        deliveryResults.filter(
          result =>
            result.pushSent,
        ).length;

      /* ========================================================
         LOG
      ======================================================== */

      console.log(
        "FIXXAM_SERVICE_REQUEST_SENT:",
        {
          serviceRequestId,

          workerId,

          workerName,

          service,

          location,

          workerLatitude,

          workerLongitude,

          radiusKm:
            SEARCH_RADIUS_KM,

          customerCount:
            customers.length,

          firestoreNotificationCount,

          pushAttemptedCount,

          pushSentCount,

          customerIds:
            customers.map(
              customer =>
                customer.id,
            ),

          deliveries:
            deliveryResults,
        },
      );

      /* ========================================================
         RESPONSE
      ======================================================== */

      return {
        success:
          firestoreNotificationCount >
          0,

        sentCount:
          firestoreNotificationCount,

        pushSentCount,

        customers:
          customers.map(
            customer => ({
              id:
                customer.id,

              distanceKm:
                Number(
                  customer.distanceKm.toFixed(
                    2,
                  ),
                ),
            }),
          ),

        message:
          pushSentCount > 0
            ? `Request sent to ${firestoreNotificationCount} nearby customer${
                firestoreNotificationCount ===
                1
                  ? ""
                  : "s"
              }.`
            : `Request created for ${firestoreNotificationCount} nearby customer${
                firestoreNotificationCount ===
                1
                  ? ""
                  : "s"
              }, but no push notification was delivered because the customers do not currently have valid FCM tokens.`,
      };
    },
  );