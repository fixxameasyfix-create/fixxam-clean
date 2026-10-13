import {
  FieldValue,
  getFirestore,
} from "firebase-admin/firestore";

import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

/* ==============================================================
   FIRESTORE
============================================================== */

const db =
  getFirestore();

/* ==============================================================
   TYPES
============================================================== */

type ReviewData = {
  workerId?: unknown;
  targetType?: unknown;
  rating?: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeRating(
  value: unknown,
): number {
  let rating = 0;

  if (
    typeof value === "number"
  ) {
    rating = value;
  } else if (
    typeof value === "string"
  ) {
    rating =
      Number(value);
  }

  if (
    !Number.isFinite(
      rating,
    )
  ) {
    return 0;
  }

  if (
    rating < 1 ||
    rating > 5
  ) {
    return 0;
  }

  return rating;
}

function roundRating(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    ) ||
    value <= 0
  ) {
    return 0;
  }

  return (
    Math.round(
      value * 10,
    ) / 10
  );
}

/* ==============================================================
   VALID REVIEW TYPE

   Same rule used by WorkerReviewsScreen:

   Included:
   - targetType === "worker"
   - targetType === "product"
   - legacy worker review without targetType

   Excluded:
   - any other targetType
============================================================== */

function isWorkerRatingReview(
  data: ReviewData,
): boolean {
  const targetType =
    cleanString(
      data.targetType,
    );

  if (
    !targetType
  ) {
    return true;
  }

  return (
    targetType === "worker" ||
    targetType === "product"
  );
}

/* ==============================================================
   RECALCULATE WORKER RATING

   Source:
   reviews where workerId == workerId

   Main public rating includes:
   - worker reviews
   - product reviews
   - legacy reviews without targetType

   Quick workerRatings are NOT included.
============================================================== */

async function recalculateWorkerRating(
  workerId: string,
): Promise<void> {
  const cleanWorkerId =
    cleanString(
      workerId,
    );

  if (
    !cleanWorkerId
  ) {
    return;
  }

  const reviewsSnapshot =
    await db
      .collection(
        "reviews",
      )
      .where(
        "workerId",
        "==",
        cleanWorkerId,
      )
      .get();

  let totalRating =
    0;

  let validReviews =
    0;

  reviewsSnapshot.docs.forEach(
    reviewDoc => {
      const data =
        reviewDoc.data() as ReviewData;

      if (
        !isWorkerRatingReview(
          data,
        )
      ) {
        return;
      }

      const rating =
        normalizeRating(
          data.rating,
        );

      if (
        rating <= 0
      ) {
        return;
      }

      totalRating +=
        rating;

      validReviews +=
        1;
    },
  );

  const averageRating =
    validReviews > 0
      ? roundRating(
          totalRating /
            validReviews,
        )
      : 0;

  const workerPublicRef =
    db
      .collection(
        "workerPublicProfiles",
      )
      .doc(
        cleanWorkerId,
      );

  await workerPublicRef.set(
    {
      rating:
        averageRating,

      totalReviews:
        validReviews,

      /*
       * Keep totalRatings aligned with the
       * same review population.
       *
       * Quick workerRatings are intentionally
       * excluded from this public rating.
       */
      totalRatings:
        validReviews,

      ratingUpdatedAt:
        FieldValue.serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  console.log(
    "WORKER_RATING_RECALCULATED",
    {
      workerId:
        cleanWorkerId,

      rating:
        averageRating,

      totalReviews:
        validReviews,

      totalRatings:
        validReviews,
    },
  );
}

/* ==============================================================
   REVIEW CREATED

   Works for:
   - worker review
   - product review
   - legacy review without targetType
============================================================== */

export const workerReviewCreated =
  onDocumentCreated(
    "reviews/{reviewId}",
    async event => {
      const snapshot =
        event.data;

      if (
        !snapshot
      ) {
        return;
      }

      const data =
        snapshot.data() as ReviewData;

      const workerId =
        cleanString(
          data.workerId,
        );

      if (
        !workerId
      ) {
        return;
      }

      if (
        !isWorkerRatingReview(
          data,
        )
      ) {
        return;
      }

      await recalculateWorkerRating(
        workerId,
      );
    },
  );

/* ==============================================================
   REVIEW UPDATED

   Important:
   If workerId changes, recalculate BOTH workers.

   This also handles:
   - rating change
   - targetType change
   - product review edit
   - worker review edit
============================================================== */

export const workerReviewUpdated =
  onDocumentUpdated(
    "reviews/{reviewId}",
    async event => {
      const beforeSnapshot =
        event.data?.before;

      const afterSnapshot =
        event.data?.after;

      if (
        !beforeSnapshot ||
        !afterSnapshot
      ) {
        return;
      }

      const before =
        beforeSnapshot.data() as ReviewData;

      const after =
        afterSnapshot.data() as ReviewData;

      const beforeWorkerId =
        cleanString(
          before.workerId,
        );

      const afterWorkerId =
        cleanString(
          after.workerId,
        );

      const affectedWorkerIds =
        new Set<string>();

      if (
        beforeWorkerId &&
        isWorkerRatingReview(
          before,
        )
      ) {
        affectedWorkerIds.add(
          beforeWorkerId,
        );
      }

      if (
        afterWorkerId &&
        isWorkerRatingReview(
          after,
        )
      ) {
        affectedWorkerIds.add(
          afterWorkerId,
        );
      }

      if (
        affectedWorkerIds.size ===
        0
      ) {
        return;
      }

      await Promise.all(
        Array.from(
          affectedWorkerIds,
        ).map(
          affectedWorkerId =>
            recalculateWorkerRating(
              affectedWorkerId,
            ),
        ),
      );
    },
  );

/* ==============================================================
   REVIEW DELETED

   Recalculate after:
   - worker review deletion
   - product review deletion
   - legacy review deletion
============================================================== */

export const workerReviewDeleted =
  onDocumentDeleted(
    "reviews/{reviewId}",
    async event => {
      const snapshot =
        event.data;

      if (
        !snapshot
      ) {
        return;
      }

      const data =
        snapshot.data() as ReviewData;

      const workerId =
        cleanString(
          data.workerId,
        );

      if (
        !workerId
      ) {
        return;
      }

      if (
        !isWorkerRatingReview(
          data,
        )
      ) {
        return;
      }

      await recalculateWorkerRating(
        workerId,
      );
    },
  );