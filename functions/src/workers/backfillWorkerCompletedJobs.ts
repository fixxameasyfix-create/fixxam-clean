import {
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";

import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

/* ==============================================================
   TYPES
============================================================== */

type OrderDocument = {
  workerId?: unknown;
  status?: unknown;
  deletedByWorker?: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeStatus(
  value: unknown,
): string {
  return cleanString(value)
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    );
}

function isCompletedStatus(
  value: unknown,
): boolean {
  const status =
    normalizeStatus(value);

  return (
    status === "completed" ||
    status === "delivered"
  );
}

/* ==============================================================
   ADD COMPLETED COUNTS
============================================================== */

function addCompletedCounts(
  documents: FirebaseFirestore.QueryDocumentSnapshot[],
  counts: Map<string, number>,
): void {
  for (const document of documents) {
    const data =
      document.data() as OrderDocument;

    /*
     * Must match useWorkerOrderCounts:
     * records hidden/deleted by worker
     * are not included.
     */
    if (
      data.deletedByWorker === true
    ) {
      continue;
    }

    if (
      !isCompletedStatus(
        data.status,
      )
    ) {
      continue;
    }

    const workerId =
      cleanString(
        data.workerId,
      );

    if (!workerId) {
      continue;
    }

    counts.set(
      workerId,
      (counts.get(workerId) ?? 0) + 1,
    );
  }
}

/* ==============================================================
   BACKFILL
============================================================== */

export const backfillWorkerCompletedJobs =
  onCall(
    {
      timeoutSeconds: 540,
      memory: "512MiB",
    },
    async request => {
      /* ========================================================
         SECURITY
      ======================================================== */

      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Authentication is required.",
        );
      }

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

      /* ========================================================
         LOAD SOURCES
      ======================================================== */

      const [
        bookingsSnapshot,
        ordersSnapshot,
        shopRequestsSnapshot,
        publicWorkersSnapshot,
      ] =
        await Promise.all([
          db
            .collection("bookings")
            .get(),

          db
            .collection("orders")
            .get(),

          db
            .collection("shopRequests")
            .get(),

          db
            .collection(
              "workerPublicProfiles",
            )
            .get(),
        ]);

      /* ========================================================
         CALCULATE COMPLETED JOBS
      ======================================================== */

      const completedCounts =
        new Map<string, number>();

      addCompletedCounts(
        bookingsSnapshot.docs,
        completedCounts,
      );

      addCompletedCounts(
        ordersSnapshot.docs,
        completedCounts,
      );

      addCompletedCounts(
        shopRequestsSnapshot.docs,
        completedCounts,
      );

      /* ========================================================
         UPDATE PUBLIC WORKERS
      ======================================================== */

      let processed = 0;
      let updated = 0;
      let unchanged = 0;

      const writer =
        db.bulkWriter();

      writer.onWriteError(
        error => {
          /*
           * Retry transient failures only.
           */
          if (
            error.failedAttempts < 3
          ) {
            return true;
          }

          console.error(
            "WORKER_COMPLETED_JOBS_BACKFILL_WRITE_ERROR:",
            {
              documentPath:
                error.documentRef.path,

              failedAttempts:
                error.failedAttempts,

              code:
                error.code,
            },
          );

          return false;
        },
      );

      for (
        const workerDocument of
        publicWorkersSnapshot.docs
      ) {
        processed++;

        const completedJobs =
          completedCounts.get(
            workerDocument.id,
          ) ?? 0;

        const currentValue =
          workerDocument.get(
            "completedJobs",
          );

        if (
          typeof currentValue === "number" &&
          Number.isFinite(currentValue) &&
          currentValue === completedJobs
        ) {
          unchanged++;
          continue;
        }

        writer.set(
          workerDocument.ref,
          {
            completedJobs,

            completedJobsUpdatedAt:
              FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        updated++;
      }

      await writer.close();

      console.log(
        "WORKER_COMPLETED_JOBS_BACKFILL_COMPLETE:",
        {
          processed,
          updated,
          unchanged,

          bookings:
            bookingsSnapshot.size,

          orders:
            ordersSnapshot.size,

          shopRequests:
            shopRequestsSnapshot.size,
        },
      );

      return {
        success: true,
        processed,
        updated,
        unchanged,
      };
    },
  );