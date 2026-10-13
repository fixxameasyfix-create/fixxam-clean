import * as admin from "firebase-admin";

import {
  onDocumentWritten,
} from "firebase-functions/v2/firestore";

/* ============================================================
   CONSTANTS
============================================================ */

const REGION =
  "us-central1";

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizeStatus(
  value: unknown,
): string {
  return cleanString(
    value,
  )
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
    normalizeStatus(
      value,
    );

  return (
    status ===
      "completed" ||
    status ===
      "delivered"
  );
}

function isDeletedByWorker(
  data:
    | admin.firestore.DocumentData
    | undefined,
): boolean {
  return (
    data?.deletedByWorker ===
    true
  );
}

/* ============================================================
   RESOLVE AFFECTED WORKERS
============================================================ */

/**
 * A write can move a record from one worker to another.
 *
 * Therefore both before.workerId and after.workerId are checked.
 */
function getAffectedWorkerIds(
  before:
    | admin.firestore.DocumentData
    | undefined,

  after:
    | admin.firestore.DocumentData
    | undefined,
): string[] {
  const workerIds =
    new Set<string>();

  const beforeWorkerId =
    cleanString(
      before?.workerId,
    );

  const afterWorkerId =
    cleanString(
      after?.workerId,
    );

  if (beforeWorkerId) {
    workerIds.add(
      beforeWorkerId,
    );
  }

  if (afterWorkerId) {
    workerIds.add(
      afterWorkerId,
    );
  }

  return Array.from(
    workerIds,
  );
}

/* ============================================================
   COUNT COMPLETED DOCUMENTS
============================================================ */

async function countCompletedForWorker(
  collectionName: string,
  workerId: string,
): Promise<number> {
  const snapshot =
    await admin
      .firestore()
      .collection(
        collectionName,
      )
      .where(
        "workerId",
        "==",
        workerId,
      )
      .get();

  let count =
    0;

  for (
    const document of
    snapshot.docs
  ) {
    const data =
      document.data();

    /*
     * Must match useWorkerOrderCounts:
     *
     * soft-deleted records are not counted.
     */
    if (
      isDeletedByWorker(
        data,
      )
    ) {
      continue;
    }

    if (
      isCompletedStatus(
        data.status,
      )
    ) {
      count += 1;
    }
  }

  return count;
}

/* ============================================================
   REBUILD WORKER COMPLETED JOBS
============================================================ */

async function rebuildWorkerCompletedJobs(
  workerId: string,
): Promise<void> {
  const normalizedWorkerId =
    cleanString(
      workerId,
    );

  if (!normalizedWorkerId) {
    return;
  }

  /*
   * These are the same three sources used by
   * useWorkerOrderCounts:
   *
   * 1. bookings
   * 2. orders
   * 3. shopRequests
   */
  const [
    serviceCompleted,
    marketCompleted,
    shopCompleted,
  ] =
    await Promise.all([
      countCompletedForWorker(
        "bookings",
        normalizedWorkerId,
      ),

      countCompletedForWorker(
        "orders",
        normalizedWorkerId,
      ),

      countCompletedForWorker(
        "shopRequests",
        normalizedWorkerId,
      ),
    ]);

  const completedJobs =
    serviceCompleted +
    marketCompleted +
    shopCompleted;

  const publicProfileRef =
    admin
      .firestore()
      .collection(
        "workerPublicProfiles",
      )
      .doc(
        normalizedWorkerId,
      );

  /*
   * merge:true prevents this function from
   * overwriting:
   *
   * - online
   * - rating
   * - workerProfile
   * - profile photo
   * - services
   * - location
   */
  await publicProfileRef.set(
    {
      completedJobs,

      completedJobsUpdatedAt:
        admin.firestore
          .FieldValue
          .serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  console.log(
    "FIXXAM_WORKER_COMPLETED_JOBS_UPDATED:",
    {
      workerId:
        normalizedWorkerId,

      serviceCompleted,

      marketCompleted,

      shopCompleted,

      completedJobs,
    },
  );
}

/* ============================================================
   HANDLE WRITE
============================================================ */

async function handleOrderWrite(
  before:
    | admin.firestore.DocumentData
    | undefined,

  after:
    | admin.firestore.DocumentData
    | undefined,
): Promise<void> {
  const workerIds =
    getAffectedWorkerIds(
      before,
      after,
    );

  if (
    workerIds.length ===
    0
  ) {
    return;
  }

  await Promise.all(
    workerIds.map(
      workerId =>
        rebuildWorkerCompletedJobs(
          workerId,
        ),
    ),
  );
}

/* ============================================================
   BOOKINGS
============================================================ */

export const syncCompletedJobsFromBookings =
  onDocumentWritten(
    {
      document:
        "bookings/{bookingId}",

      region:
        REGION,

      memory:
        "256MiB",

      timeoutSeconds:
        60,
    },

    async event => {
      const before =
        event.data?.before.exists
          ? event.data.before.data()
          : undefined;

      const after =
        event.data?.after.exists
          ? event.data.after.data()
          : undefined;

      await handleOrderWrite(
        before,
        after,
      );
    },
  );

/* ============================================================
   MARKET ORDERS
============================================================ */

export const syncCompletedJobsFromOrders =
  onDocumentWritten(
    {
      document:
        "orders/{orderId}",

      region:
        REGION,

      memory:
        "256MiB",

      timeoutSeconds:
        60,
    },

    async event => {
      const before =
        event.data?.before.exists
          ? event.data.before.data()
          : undefined;

      const after =
        event.data?.after.exists
          ? event.data.after.data()
          : undefined;

      await handleOrderWrite(
        before,
        after,
      );
    },
  );

/* ============================================================
   SHOP REQUESTS
============================================================ */

export const syncCompletedJobsFromShopRequests =
  onDocumentWritten(
    {
      document:
        "shopRequests/{requestId}",

      region:
        REGION,

      memory:
        "256MiB",

      timeoutSeconds:
        60,
    },

    async event => {
      const before =
        event.data?.before.exists
          ? event.data.before.data()
          : undefined;

      const after =
        event.data?.after.exists
          ? event.data.after.data()
          : undefined;

      await handleOrderWrite(
        before,
        after,
      );
    },
  );