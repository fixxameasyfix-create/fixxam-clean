import {
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";

import {
  getFirestore,
  FieldValue,
} from "firebase-admin/firestore";

import {
  geohashForLocation,
} from "geofire-common";

/* ==============================================================
   TYPES
============================================================== */

type WorkerDocument = {
  roles?: unknown;

  latitude?: unknown;
  longitude?: unknown;

  geohash?: unknown;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const BATCH_SIZE = 400;

/* ==============================================================
   HELPERS
============================================================== */

function toNumber(
  value: unknown,
): number | null {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function hasWorkerRole(
  roles: unknown,
): boolean {
  return (
    Array.isArray(roles) &&
    roles.some(
      (role) =>
        typeof role === "string" &&
        role.trim().toLowerCase() ===
          "worker",
    )
  );
}

function isValidCoordinate(
  latitude: number,
  longitude: number,
): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/* ==============================================================
   BACKFILL
============================================================== */

export const backfillWorkerGeohashes =
  onCall(
    async (request) => {
      /*
       * ----------------------------------------------------------
       * SECURITY
       * ----------------------------------------------------------
       *
       * This is an administrative operation.
       *
       * Do NOT leave it publicly accessible.
       */

      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Authentication is required.",
        );
      }

      /*
       * ----------------------------------------------------------
       * ADMIN CHECK
       * ----------------------------------------------------------
       *
       * This expects a custom claim:
       *
       * admin: true
       *
       * on the authenticated Firebase user.
       */

      if (
        request.auth.token.admin !== true
      ) {
        throw new HttpsError(
          "permission-denied",
          "Administrator access is required.",
        );
      }

      const db =
        getFirestore();

      const snapshot =
        await db
          .collection("users")
          .get();

      if (snapshot.empty) {
        return {
          success: true,
          processed: 0,
          updated: 0,
          skipped: 0,
        };
      }

      let processed = 0;
      let updated = 0;
      let skipped = 0;

      let batch =
        db.batch();

      let batchWrites = 0;

      /*
       * ----------------------------------------------------------
       * PROCESS USERS
       * ----------------------------------------------------------
       */

      for (
        const doc of snapshot.docs
      ) {
        processed++;

        const data =
          doc.data() as WorkerDocument;

        /*
         * Only workers.
         */
        if (
          !hasWorkerRole(
            data.roles,
          )
        ) {
          skipped++;
          continue;
        }

        const latitude =
          toNumber(
            data.latitude,
          );

        const longitude =
          toNumber(
            data.longitude,
          );

        /*
         * Invalid location.
         */
        if (
          latitude === null ||
          longitude === null ||
          !isValidCoordinate(
            latitude,
            longitude,
          )
        ) {
          skipped++;
          continue;
        }

        /*
         * Generate GeoHash.
         */
        const geohash =
          geohashForLocation([
            latitude,
            longitude,
          ]);

        /*
         * Already correct.
         */
        if (
          data.geohash ===
          geohash
        ) {
          skipped++;
          continue;
        }

        batch.update(
          doc.ref,
          {
            geohash,

            updatedAt:
              FieldValue.serverTimestamp(),
          },
        );

        batchWrites++;
        updated++;

        /*
         * Firestore batch limit.
         */
        if (
          batchWrites >=
          BATCH_SIZE
        ) {
          await batch.commit();

          batch =
            db.batch();

          batchWrites = 0;
        }
      }

      /*
       * Commit remaining writes.
       */
      if (
        batchWrites > 0
      ) {
        await batch.commit();
      }

      console.log(
        "WORKER GEOHASH BACKFILL COMPLETE",
        {
          processed,
          updated,
          skipped,
        },
      );

      return {
        success: true,
        processed,
        updated,
        skipped,
      };
    },
  );