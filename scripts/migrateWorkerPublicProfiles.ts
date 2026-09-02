import {
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

/* ============================================================
   FIREBASE ADMIN
============================================================ */

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/* ============================================================
   TYPES
============================================================ */

type WorkerProfile = {
  category?: unknown;
  subcategory?: unknown;
  experience?: unknown;
  hourlyRate?: unknown;

  photoUrl?: unknown;

  latitude?: unknown;
  longitude?: unknown;

  selectedServices?: unknown;

  serviceDetails?: unknown;

  state?: unknown;
  lga?: unknown;
};

type UserDocument = {
  uid?: unknown;

  firstName?: unknown;
  otherName?: unknown;
  surname?: unknown;

  rating?: unknown;

  online?: unknown;
  available?: unknown;

  roles?: unknown;

  workerProfile?: WorkerProfile;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   SAFE NUMBER
============================================================ */

function safeNumber(
  value: unknown,
  fallback = 0,
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}

/* ============================================================
   SAFE COORDINATE
============================================================ */

function safeCoordinate(
  value: unknown,
): number | null {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : null;
}

/* ============================================================
   SAFE PHOTO URL
============================================================ */

function safePhotoUrl(
  value: unknown,
): string {
  const url = cleanString(value);

  if (!url) {
    return "";
  }

  /*
   * Local Expo/device paths cannot be used
   * as public worker photos.
   */
  if (url.startsWith("file://")) {
    return "";
  }

  if (
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }

  return "";
}

/* ============================================================
   SAFE SERVICES
============================================================ */

function safeSelectedServices(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      service: unknown,
    ): service is string =>
      typeof service === "string" &&
      service.trim().length > 0,
  );
}

/* ============================================================
   MIGRATION
============================================================ */

async function migrateWorkerPublicProfiles(): Promise<void> {
  console.log("");
  console.log(
    "==============================================",
  );
  console.log(
    "FIXXAM WORKER PUBLIC PROFILE MIGRATION",
  );
  console.log(
    "==============================================",
  );
  console.log("");

  /*
   * Find all users that already have
   * the worker role.
   */
  const usersSnapshot = await db
    .collection("users")
    .where(
      "roles",
      "array-contains",
      "worker",
    )
    .get();

  console.log(
    `Workers found: ${usersSnapshot.size}`,
  );

  console.log("");

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  /* ==========================================================
     PROCESS WORKERS
  ========================================================== */

  for (
    const userDoc of usersSnapshot.docs
  ) {
    const uid = userDoc.id;

    try {
      const user =
        userDoc.data() as UserDocument;

      /* ========================================================
         PUBLIC PROFILE REFERENCE
      ======================================================== */

      const publicRef = db
        .collection(
          "workerPublicProfiles",
        )
        .doc(uid);

      const publicDoc =
        await publicRef.get();

      /*
       * IMPORTANT:
       *
       * Never overwrite a worker that already
       * has the new public profile structure.
       */
      if (publicDoc.exists) {
        console.log(
          `SKIPPED  ${uid} - public profile already exists`,
        );

        skipped++;

        continue;
      }

      /* ========================================================
         BASIC INFORMATION
      ======================================================== */

      const firstName =
        cleanString(
          user.firstName,
        );

      const otherName =
        cleanString(
          user.otherName,
        );

      const surname =
        cleanString(
          user.surname,
        );

      const name = [
        firstName,
        otherName,
        surname,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      /* ========================================================
         WORKER PROFILE
      ======================================================== */

      const workerProfile =
        user.workerProfile ??
        {};

      const category =
        cleanString(
          workerProfile.category,
        ) ||
        "Service Provider";

      const subcategory =
        cleanString(
          workerProfile.subcategory,
        );

      const experience =
        cleanString(
          workerProfile.experience,
        );

      /*
       * Older profiles may have state/lga
       * directly inside workerProfile.
       */
      const state =
        cleanString(
          workerProfile.state,
        );

      const lga =
        cleanString(
          workerProfile.lga,
        );

      /* ========================================================
         SERVICES
      ======================================================== */

      const selectedServices =
        safeSelectedServices(
          workerProfile.selectedServices,
        );

      /* ========================================================
         LOCATION
      ======================================================== */

      const latitude =
        safeCoordinate(
          workerProfile.latitude,
        );

      const longitude =
        safeCoordinate(
          workerProfile.longitude,
        );

      /* ========================================================
         PHOTO
      ======================================================== */

      const photoUrl =
        safePhotoUrl(
          workerProfile.photoUrl,
        );

      /* ========================================================
         RATING
      ======================================================== */

      const rating =
        safeNumber(
          user.rating,
        );

      /* ========================================================
         ONLINE / AVAILABLE
      ======================================================== */

      const online =
        user.online === true;

      const available =
        user.available !== false;

      /* ========================================================
         PUBLIC PROFILE
      ======================================================== */

      const publicProfile = {
        uid,

        firstName,

        otherName,

        surname,

        name:
          name || "Worker",

        rating,

        online,

        available,

        workerProfile: {
          category,

          subcategory,

          experience,

          hourlyRate:
            safeNumber(
              workerProfile.hourlyRate,
            ),

          photoUrl,

          latitude,

          longitude,

          selectedServices,

          serviceDetails: {
            state,

            subcategory,
          },
        },

        migratedAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),
      };

      /* ========================================================
         CREATE PUBLIC PROFILE
      ======================================================== */

      await publicRef.set(
        publicProfile,
        {
          merge: true,
        },
      );

      console.log(
        `MIGRATED  ${uid} - ${
          name || "Worker"
        }`,
      );

      migrated++;
    } catch (error: unknown) {
      failed++;

      console.error("");
      console.error(
        `FAILED  ${uid}`,
      );

      if (error instanceof Error) {
        console.error(
          error.message,
        );
      } else {
        console.error(error);
      }

      console.error("");
    }
  }

  /* ==========================================================
     SUMMARY
  ========================================================== */

  console.log("");

  console.log(
    "==============================================",
  );

  console.log(
    "MIGRATION COMPLETE",
  );

  console.log(
    "==============================================",
  );

  console.log(
    `Workers found : ${usersSnapshot.size}`,
  );

  console.log(
    `Migrated      : ${migrated}`,
  );

  console.log(
    `Skipped       : ${skipped}`,
  );

  console.log(
    `Failed        : ${failed}`,
  );

  console.log(
    "==============================================",
  );

  console.log("");
}

/* ============================================================
   RUN
============================================================ */

migrateWorkerPublicProfiles()
  .then(() => {
    console.log(
      "Migration finished successfully.",
    );

    process.exit(0);
  })
  .catch(
    (error: unknown) => {
      console.error("");
      console.error(
        "MIGRATION FATAL ERROR",
      );

      if (error instanceof Error) {
        console.error(
          error.message,
        );
      } else {
        console.error(error);
      }

      console.error("");

      process.exit(1);
    },
  );