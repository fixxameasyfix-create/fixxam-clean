import * as admin from "firebase-admin";

import {
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";

import {
  geohashQueryBounds,
  distanceBetween,
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

type CustomerCandidate = {
  id: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  data: Record<string, unknown>;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_CUSTOMERS = 5;

const SEARCH_RADIUS_KM = 15;

/* ============================================================
   HELPERS
============================================================ */

function isValidCoordinates(
  latitude: unknown,
  longitude: unknown,
): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function cleanString(
  value: unknown,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function getUserRole(
  data: Record<string, unknown>,
): string {
  if (typeof data.role === "string") {
    return data.role.trim().toLowerCase();
  }

  if (
    typeof data.userType === "string"
  ) {
    return data.userType
      .trim()
      .toLowerCase();
  }

  if (
    typeof data.accountType === "string"
  ) {
    return data.accountType
      .trim()
      .toLowerCase();
  }

  return "";
}

function buildWorkerName(
  data: Record<string, unknown>,
  authName: unknown,
): string {
  const fullName =
    cleanString(
      data.fullName,
      100,
    );

  if (fullName) {
    return fullName;
  }

  const firstName =
    cleanString(
      data.firstName,
      50,
    );

  const otherName =
    cleanString(
      data.otherName,
      50,
    );

  const surname =
    cleanString(
      data.surname,
      50,
    );

  const combined =
    [
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
   CLOUD FUNCTION
============================================================ */

export const sendServiceRequest =
  onCall(
    {
      region: "us-central1",
      timeoutSeconds: 30,
      memory: "256MiB",
    },

    async (request) => {
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
        request.data as SendServiceRequestData;

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
        cleanString(
          data.phone,
          20,
        );

      /*
       * IMPORTANT:
       *
       * Customer location ba dole bane.
       * Amma worker location dole ne domin
       * mu san inda ake neman customers.
       */

      const latitude =
        data.latitude;

      const longitude =
        data.longitude;

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
          "Worker phone number is required.",
        );
      }

      /*
       * Explicit type narrowing.
       *
       * Wannan shi ne gyaran TypeScript error:
       *
       * number | undefined
       *        ↓
       * number
       */

      if (
        !isValidCoordinates(
          latitude,
          longitude,
        ) ||
        typeof longitude !== "number"
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Valid worker latitude and longitude are required.",
        );
      }

      const workerLatitude =
        latitude;

      const workerLongitude =
        longitude;

      /* ========================================================
         FIRESTORE
      ======================================================== */

      const db =
        admin.firestore();

      /* ========================================================
         LOAD WORKER
      ======================================================== */

      const workerSnapshot =
        await db
          .collection("users")
          .doc(workerId)
          .get();

      if (
        !workerSnapshot.exists
      ) {
        throw new HttpsError(
          "failed-precondition",
          "Worker profile was not found.",
        );
      }

      const workerData =
        (workerSnapshot.data() ??
          {}) as Record<
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

      /*
       * If role exists, it MUST be worker.
       */

      if (
        workerRole &&
        workerRole !== "worker"
      ) {
        throw new HttpsError(
          "permission-denied",
          "Only workers can send service requests.",
        );
      }

      const workerName =
        buildWorkerName(
          workerData,
          request.auth.token
            .name,
        ) || "Worker";

      /* ========================================================
         FIND CUSTOMERS
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

      /*
       * Search all geohash ranges.
       */

      await Promise.all(
        bounds.map(
          async (bound) => {
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
                .limit(100)
                .get();

            for (
              const customerDoc of snapshot.docs
            ) {
              /*
               * Never send request to worker himself.
               */

              if (
                customerDoc.id ===
                workerId
              ) {
                continue;
              }

              const customerData =
                customerDoc.data();

              /* ================================================
                 ROLE
              ================================================ */

              const customerRole =
                getUserRole(
                  customerData,
                );

              /*
               * If role is known and not customer,
               * skip the account.
               */

              if (
                customerRole &&
                customerRole !==
                  "customer"
              ) {
                continue;
              }

              /* ================================================
                 CUSTOMER LOCATION
              ================================================ */

              const customerLatitude =
                customerData.latitude;

              const customerLongitude =
                customerData.longitude;

              /*
               * THIS IS IMPORTANT.
               *
               * Customer ba shi da latitude/longitude?
               * Skip shi kawai.
               *
               * Ba za mu fasa request gaba daya ba.
               */

              if (
                !isValidCoordinates(
                  customerLatitude,
                  customerLongitude,
                ) ||
                typeof customerLongitude !==
                  "number"
              ) {
                continue;
              }

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

              /*
               * Geohash query na iya dawo da
               * documents da suke wajen exact radius.
               *
               * Saboda haka muna sake tabbatarwa.
               */

              if (
                distanceKm >
                SEARCH_RADIUS_KM
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
         SORT CUSTOMERS
      ======================================================== */

      const customers =
        Array.from(
          customerMap.values(),
        )
          .sort(
            (a, b) =>
              a.distanceKm -
              b.distanceKm,
          )
          .slice(
            0,
            MAX_CUSTOMERS,
          );

      /* ========================================================
         NO CUSTOMER FOUND
      ======================================================== */

      if (
        customers.length === 0
      ) {
        console.log(
          "FIXXAM_SERVICE_REQUEST_NO_CUSTOMER:",
          {
            workerId,
            service,
            location,
            workerLatitude,
            workerLongitude,
          },
        );

        return {
          success: false,

          sentCount: 0,

          customers: [],

          message:
            "No customers with a valid location were found nearby.",
        };
      }

      /* ========================================================
         CREATE NOTIFICATIONS
      ======================================================== */

      const batch =
        db.batch();

      const createdAt =
        admin.firestore
          .FieldValue
          .serverTimestamp();

      const expiresAt =
        admin.firestore.Timestamp.fromMillis(
          Date.now() +
            24 *
              60 *
              60 *
              1000,
        );

      for (
        const customer of customers
      ) {
        const notificationRef =
          db
            .collection("users")
            .doc(customer.id)
            .collection(
              "notifications",
            )
            .doc();

        batch.set(
          notificationRef,
          {
            type:
              "worker_service_request",

            title:
              "New Service Request",

            message:
              `${workerName} is available for ${service} in ${location}.`,

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

            read: false,

            createdAt,

            expiresAt,
          },
        );
      }

      await batch.commit();

      /* ========================================================
         LOG
      ======================================================== */

      console.log(
        "FIXXAM_SERVICE_REQUEST_SENT:",
        {
          workerId,
          workerName,
          service,
          location,
          workerLatitude,
          workerLongitude,
          sentCount:
            customers.length,
          customerIds:
            customers.map(
              (customer) =>
                customer.id,
            ),
        },
      );

      /* ========================================================
         RESPONSE
      ======================================================== */

      return {
        success: true,

        sentCount:
          customers.length,

        customers:
          customers.map(
            (customer) => ({
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
          `Request sent to ${customers.length} customer${
            customers.length === 1
              ? ""
              : "s"
          }.`,
      };
    },
  );