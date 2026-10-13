import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   CONSTANTS
============================================================== */

const WORKER_RATINGS_COLLECTION =
  "workerRatings";

const FIXED_WORKER_RATING =
  3;

/* ==============================================================
   HELPERS
============================================================== */

function cleanRequiredId(
  value: unknown,
  fieldName: string,
): string {
  if (
    typeof value !== "string"
  ) {
    throw new Error(
      `${fieldName} is required.`,
    );
  }

  const cleaned =
    value.trim();

  if (!cleaned) {
    throw new Error(
      `${fieldName} is required.`,
    );
  }

  return cleaned;
}

function getAuthenticatedCustomerId(): string {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "You must be signed in to rate a worker.",
    );
  }

  return cleanRequiredId(
    user.uid,
    "Customer ID",
  );
}

/* ==============================================================
   WORKER RATING DOCUMENT ID
============================================================== */

export function getWorkerRatingId(
  workerId: string,
  customerId: string,
): string {
  const safeWorkerId =
    cleanRequiredId(
      workerId,
      "Worker ID",
    );

  const safeCustomerId =
    cleanRequiredId(
      customerId,
      "Customer ID",
    );

  return `${safeWorkerId}_${safeCustomerId}`;
}

/* ==============================================================
   ENSURE FIXED 3-STAR WORKER RATING
============================================================== */

/**
 * Ensures the authenticated customer has
 * exactly one quick rating for this worker.
 *
 * If the rating already exists:
 * - nothing is changed
 *
 * If it does not exist:
 * - a fixed 3-star rating is created
 *
 * This function never toggles/unrates.
 */
export async function ensureWorkerRated(
  workerId: string,
): Promise<void> {
  const customerId =
    getAuthenticatedCustomerId();

  const safeWorkerId =
    cleanRequiredId(
      workerId,
      "Worker ID",
    );

  if (
    safeWorkerId ===
    customerId
  ) {
    throw new Error(
      "You cannot rate yourself.",
    );
  }

  const ratingId =
    getWorkerRatingId(
      safeWorkerId,
      customerId,
    );

  const ratingRef =
    doc(
      db,
      WORKER_RATINGS_COLLECTION,
      ratingId,
    );

  const existingRating =
    await getDoc(
      ratingRef,
    );

  /*
   * Customer already rated this worker.
   *
   * Do not create another rating and
   * importantly do not unrate/toggle it.
   */
  if (
    existingRating.exists()
  ) {
    return;
  }

  await setDoc(
    ratingRef,
    {
      customerId,

      workerId:
        safeWorkerId,

      rating:
        FIXED_WORKER_RATING,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}