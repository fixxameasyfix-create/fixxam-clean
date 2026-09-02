import {
  applicationDefault,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

/* ============================================================
   CONFIGURATION
============================================================ */

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  "fixxam-clean";

const BATCH_SIZE = 400;

/* ============================================================
   FIREBASE ADMIN
============================================================ */

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  console.log("");
  console.log(
    "Initializing Firebase Admin...",
  );

  console.log(
    `Project ID: ${FIREBASE_PROJECT_ID}`,
  );

  /*
   * Firebase Admin uses Application Default
   * Credentials.
   *
   * On Windows you can provide:
   *
   * set GOOGLE_APPLICATION_CREDENTIALS=C:\path\service-account.json
   *
   * OR use:
   *
   * gcloud auth application-default login
   */

  return initializeApp({
    credential:
      applicationDefault(),

    projectId:
      FIREBASE_PROJECT_ID,
  });
}

const firebaseApp =
  initializeFirebaseAdmin();

const db =
  getFirestore(firebaseApp);

/* ============================================================
   TYPES
============================================================ */

type ServiceCount = {
  serviceId: string;
  count: number;
};

type BookingDocument = {
  serviceId?: unknown;
  status?: unknown;
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
   MIGRATION
============================================================ */

async function migrateCompletedServiceCounts(): Promise<void> {
  console.log("");
  console.log(
    "==================================================",
  );
  console.log(
    "FIXXAM COMPLETED SERVICE COUNTS MIGRATION",
  );
  console.log(
    "==================================================",
  );
  console.log("");

  /* ==========================================================
     FIREBASE CHECK
  ========================================================== */

  console.log(
    "Firebase Admin initialized.",
  );

  console.log(
    `Using project: ${FIREBASE_PROJECT_ID}`,
  );

  console.log("");

  /* ==========================================================
     GET COMPLETED BOOKINGS
  ========================================================== */

  console.log(
    "Reading completed bookings...",
  );

  const bookingsSnapshot =
    await db
      .collection("bookings")
      .where(
        "status",
        "==",
        "completed",
      )
      .get();

  console.log(
    `Completed bookings found: ${bookingsSnapshot.size}`,
  );

  console.log("");

  /* ==========================================================
     COUNT BOOKINGS BY SERVICE
  ========================================================== */

  const counts =
    new Map<string, number>();

  let skippedBookings = 0;

  for (
    const bookingDoc of bookingsSnapshot.docs
  ) {
    const booking =
      bookingDoc.data() as BookingDocument;

    const serviceId =
      cleanString(
        booking.serviceId,
      );

    if (!serviceId) {
      skippedBookings++;

      console.warn(
        `SKIPPED BOOKING ${bookingDoc.id} - missing serviceId`,
      );

      continue;
    }

    const currentCount =
      counts.get(serviceId) ?? 0;

    counts.set(
      serviceId,
      currentCount + 1,
    );
  }

  /* ==========================================================
     CONVERT MAP TO ARRAY
  ========================================================== */

  const serviceCounts: ServiceCount[] =
    Array.from(
      counts.entries(),
    ).map(
      ([
        serviceId,
        count,
      ]) => ({
        serviceId,
        count,
      }),
    );

  console.log(
    `Services with completed bookings: ${serviceCounts.length}`,
  );

  console.log("");

  /* ==========================================================
     NO DATA
  ========================================================== */

  if (
    serviceCounts.length === 0
  ) {
    console.log(
      "No completed service counts found.",
    );

    console.log("");

    console.log(
      "Possible reasons:",
    );

    console.log(
      "1. There are no bookings with status = completed.",
    );

    console.log(
      "2. Completed bookings do not contain serviceId.",
    );

    console.log("");

    return;
  }

  /* ==========================================================
     SHOW COUNTS
  ========================================================== */

  console.log(
    "Completed bookings per service:",
  );

  console.log("");

  for (
    const service of serviceCounts
  ) {
    console.log(
      `  ${service.serviceId}: ${service.count}`,
    );
  }

  console.log("");

  /* ==========================================================
     UPDATE SERVICES
  ========================================================== */

  let migrated = 0;

  let missingServices = 0;

  console.log(
    "Updating services...",
  );

  console.log("");

  for (
    let index = 0;
    index <
    serviceCounts.length;
    index += BATCH_SIZE
  ) {
    const chunk =
      serviceCounts.slice(
        index,
        index + BATCH_SIZE,
      );

    const batch =
      db.batch();

    let batchWrites = 0;

    for (
      const service of chunk
    ) {
      const serviceRef =
        db
          .collection(
            "services",
          )
          .doc(
            service.serviceId,
          );

      const serviceSnapshot =
        await serviceRef.get();

      /* --------------------------------------------------------
         SERVICE DOES NOT EXIST
      -------------------------------------------------------- */

      if (
        !serviceSnapshot.exists
      ) {
        missingServices++;

        console.warn(
          `SKIPPED SERVICE ${service.serviceId} - service does not exist`,
        );

        continue;
      }

      /* --------------------------------------------------------
         WRITE EXACT COUNT
      -------------------------------------------------------- */

      batch.set(
        serviceRef,
        {
          completedCount:
            service.count,

          updatedAt:
            FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      batchWrites++;

      migrated++;
    }

    /* ----------------------------------------------------------
       COMMIT
    ---------------------------------------------------------- */

    if (
      batchWrites > 0
    ) {
      await batch.commit();
    }

    const processed =
      Math.min(
        index + chunk.length,
        serviceCounts.length,
      );

    console.log(
      `Processed ${processed}/${serviceCounts.length} services.`,
    );
  }

  /* ==========================================================
     FINAL VERIFICATION
  ========================================================== */

  console.log("");

  console.log(
    "Running final verification...",
  );

  let verificationFailed = 0;

  for (
    const service of serviceCounts
  ) {
    const serviceSnapshot =
      await db
        .collection(
          "services",
        )
        .doc(
          service.serviceId,
        )
        .get();

    if (
      !serviceSnapshot.exists
    ) {
      continue;
    }

    const data =
      serviceSnapshot.data();

    const savedCount =
      Number(
        data?.completedCount ?? 0,
      );

    if (
      savedCount !==
      service.count
    ) {
      verificationFailed++;

      console.error(
        `VERIFY FAILED ${service.serviceId}: expected ${service.count}, got ${savedCount}`,
      );
    }
  }

  /* ==========================================================
     SUMMARY
  ========================================================== */

  console.log("");

  console.log(
    "==================================================",
  );

  console.log(
    "MIGRATION COMPLETE",
  );

  console.log(
    "==================================================",
  );

  console.log(
    `Firebase project       : ${FIREBASE_PROJECT_ID}`,
  );

  console.log(
    `Completed bookings     : ${bookingsSnapshot.size}`,
  );

  console.log(
    `Services counted       : ${serviceCounts.length}`,
  );

  console.log(
    `Services migrated      : ${migrated}`,
  );

  console.log(
    `Missing services       : ${missingServices}`,
  );

  console.log(
    `Skipped bookings       : ${skippedBookings}`,
  );

  console.log(
    `Verification failures  : ${verificationFailed}`,
  );

  console.log(
    "==================================================",
  );

  console.log("");

  if (
    verificationFailed > 0
  ) {
    throw new Error(
      "Migration completed with verification failures.",
    );
  }

  console.log(
    "All completed service counts verified successfully.",
  );

  console.log("");
}

/* ============================================================
   RUN
============================================================ */

migrateCompletedServiceCounts()
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
        "==================================================",
      );
      console.error(
        "MIGRATION FATAL ERROR",
      );
      console.error(
        "==================================================",
      );

      if (
        error instanceof Error
      ) {
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