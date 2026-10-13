import * as admin from "firebase-admin";

import type {
  DocumentData,
} from "firebase-admin/firestore";

import {
  onDocumentCreated,
} from "firebase-functions/v2/firestore";

/* ============================================================
   TYPES
============================================================ */

type ReviewData = {
  bookingId?: unknown;

  orderId?: unknown;

  orderType?: unknown;

  customerId?: unknown;

  customerName?: unknown;

  workerId?: unknown;

  workerName?: unknown;

  targetId?: unknown;

  targetType?: unknown;

  rating?: unknown;

  comment?: unknown;

  serviceName?: unknown;

  aggregationProcessedAt?: unknown;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MIN_RATING =
  1;

const MAX_RATING =
  5;

const MAX_COMMENT_LENGTH =
  500;

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function getRating(
  value: unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    !Number.isInteger(
      value,
    ) ||
    value <
      MIN_RATING ||
    value >
      MAX_RATING
  ) {
    return null;
  }

  return value;
}

function getNonNegativeNumber(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function resolveCustomerName(
  bookingData:
    DocumentData,
  userData:
    DocumentData | undefined,
  reviewData:
    ReviewData,
): string {
  const bookingCustomerName =
    cleanString(
      bookingData.customerName,
    );

  if (
    bookingCustomerName
  ) {
    return bookingCustomerName;
  }

  const fullName =
    cleanString(
      userData?.fullName,
    );

  if (
    fullName
  ) {
    return fullName;
  }

  const joinedName =
    [
      cleanString(
        userData?.firstName,
      ),

      cleanString(
        userData?.otherName,
      ),

      cleanString(
        userData?.surname,
      ),
    ]
      .filter(
        Boolean,
      )
      .join(" ")
      .trim();

  if (
    joinedName
  ) {
    return joinedName;
  }

  const userName =
    cleanString(
      userData?.name,
    );

  if (
    userName
  ) {
    return userName;
  }

  const reviewCustomerName =
    cleanString(
      reviewData.customerName,
    );

  if (
    reviewCustomerName
  ) {
    return reviewCustomerName;
  }

  return "Customer";
}

function resolveWorkerName(
  bookingData:
    DocumentData,
  workerProfile:
    DocumentData,
  reviewData:
    ReviewData,
): string {
  const bookingWorkerName =
    cleanString(
      bookingData.workerName,
    );

  if (
    bookingWorkerName
  ) {
    return bookingWorkerName;
  }

  const workerFullName =
    cleanString(
      workerProfile.fullName,
    );

  if (
    workerFullName
  ) {
    return workerFullName;
  }

  const joinedName =
    [
      cleanString(
        workerProfile.firstName,
      ),

      cleanString(
        workerProfile.otherName,
      ),

      cleanString(
        workerProfile.surname,
      ),
    ]
      .filter(
        Boolean,
      )
      .join(" ")
      .trim();

  if (
    joinedName
  ) {
    return joinedName;
  }

  const profileName =
    cleanString(
      workerProfile.name,
    );

  if (
    profileName
  ) {
    return profileName;
  }

  const reviewWorkerName =
    cleanString(
      reviewData.workerName,
    );

  if (
    reviewWorkerName
  ) {
    return reviewWorkerName;
  }

  return "Worker";
}

/* ============================================================
   REVIEW CREATED
============================================================ */

export const onWorkerReviewCreated =
  onDocumentCreated(
    {
      document:
        "reviews/{reviewId}",

      memory:
        "256MiB",

      timeoutSeconds:
        30,

      retry:
        true,
    },

    async (
      event,
    ) => {
      const eventSnapshot =
        event.data;

      if (
        !eventSnapshot
      ) {
        console.warn(
          "FIXXAM_REVIEW_EVENT_DATA_MISSING",
        );

        return;
      }

      const reviewId =
        cleanString(
          event.params.reviewId,
        );

      if (
        !reviewId
      ) {
        console.warn(
          "FIXXAM_REVIEW_ID_MISSING",
        );

        return;
      }

      const initialReview =
        eventSnapshot.data() as
          ReviewData;

      /* ======================================================
         INITIAL REVIEW DATA
      ====================================================== */

      const bookingId =
        cleanString(
          initialReview.bookingId,
        );

      const customerId =
        cleanString(
          initialReview.customerId,
        );

      const workerId =
        cleanString(
          initialReview.workerId,
        );

      const rating =
        getRating(
          initialReview.rating,
        );

      const comment =
        cleanString(
          initialReview.comment,
        );

      /* ======================================================
         BASIC VALIDATION
      ====================================================== */

      if (
        !bookingId ||
        !customerId ||
        !workerId ||
        rating ===
          null
      ) {
        console.warn(
          "FIXXAM_REVIEW_INVALID_DOCUMENT:",
          {
            reviewId,
            bookingId,
            customerId,
            workerId,
          },
        );

        return;
      }

      if (
        initialReview.orderType !==
          "service" ||
        initialReview.targetType !==
          "worker"
      ) {
        console.warn(
          "FIXXAM_REVIEW_INVALID_TARGET:",
          {
            reviewId,
          },
        );

        return;
      }

      const targetId =
        cleanString(
          initialReview.targetId,
        );

      if (
        targetId &&
        targetId !==
          workerId
      ) {
        console.warn(
          "FIXXAM_REVIEW_TARGET_WORKER_MISMATCH:",
          {
            reviewId,
            targetId,
            workerId,
          },
        );

        return;
      }

      if (
        comment.length ===
          0 ||
        comment.length >
          MAX_COMMENT_LENGTH
      ) {
        console.warn(
          "FIXXAM_REVIEW_INVALID_COMMENT:",
          {
            reviewId,
          },
        );

        return;
      }

      /* ======================================================
         DETERMINISTIC REVIEW ID
      ====================================================== */

      const expectedReviewId =
        `service_${bookingId}`;

      if (
        reviewId !==
        expectedReviewId
      ) {
        console.warn(
          "FIXXAM_REVIEW_INVALID_ID:",
          {
            reviewId,
            expectedReviewId,
          },
        );

        return;
      }

      /* ======================================================
         REFERENCES
      ====================================================== */

      const db =
        admin.firestore();

      const reviewRef =
        db
          .collection(
            "reviews",
          )
          .doc(
            reviewId,
          );

      const bookingRef =
        db
          .collection(
            "bookings",
          )
          .doc(
            bookingId,
          );

      const workerProfileRef =
        db
          .collection(
            "workerPublicProfiles",
          )
          .doc(
            workerId,
          );

      const customerRef =
        db
          .collection(
            "users",
          )
          .doc(
            customerId,
          );

      /*
       * Deterministic notification ID prevents
       * duplicate worker notifications if the
       * Firestore trigger is retried.
       */
      const notificationId =
        `review_${reviewId}`;

      const notificationRef =
        db
          .collection(
            "users",
          )
          .doc(
            workerId,
          )
          .collection(
            "notifications",
          )
          .doc(
            notificationId,
          );

      /* ======================================================
         TRANSACTION
      ====================================================== */

      await db.runTransaction(
        async (
          transaction,
        ) => {
          /*
           * IMPORTANT:
           *
           * Complete every read before
           * performing any write.
           */

          const currentReviewSnapshot =
            await transaction.get(
              reviewRef,
            );

          const bookingSnapshot =
            await transaction.get(
              bookingRef,
            );

          const workerSnapshot =
            await transaction.get(
              workerProfileRef,
            );

          const customerSnapshot =
            await transaction.get(
              customerRef,
            );

          /* ==================================================
             CURRENT REVIEW
          ================================================== */

          if (
            !currentReviewSnapshot.exists
          ) {
            console.warn(
              "FIXXAM_REVIEW_DOCUMENT_DISAPPEARED:",
              {
                reviewId,
              },
            );

            return;
          }

          const currentReview =
            currentReviewSnapshot.data() as
              | ReviewData
              | undefined;

          if (
            !currentReview
          ) {
            console.warn(
              "FIXXAM_REVIEW_DATA_MISSING:",
              {
                reviewId,
              },
            );

            return;
          }

          /*
           * Idempotency guard.
           *
           * Never increment rating/count twice
           * when Cloud Functions retries.
           */
          if (
            currentReview.aggregationProcessedAt
          ) {
            console.log(
              "FIXXAM_REVIEW_ALREADY_PROCESSED:",
              {
                reviewId,
              },
            );

            return;
          }

          /* ==================================================
             BOOKING
          ================================================== */

          if (
            !bookingSnapshot.exists
          ) {
            console.warn(
              "FIXXAM_REVIEW_BOOKING_NOT_FOUND:",
              {
                reviewId,
                bookingId,
              },
            );

            return;
          }

          const booking =
            bookingSnapshot.data();

          if (
            !booking
          ) {
            console.warn(
              "FIXXAM_REVIEW_BOOKING_DATA_MISSING:",
              {
                reviewId,
                bookingId,
              },
            );

            return;
          }

          const authoritativeCustomerId =
            cleanString(
              booking.customerId,
            );

          const authoritativeWorkerId =
            cleanString(
              booking.workerId,
            );

          const bookingStatus =
            cleanString(
              booking.status,
            );

          if (
            authoritativeCustomerId !==
            customerId
          ) {
            console.warn(
              "FIXXAM_REVIEW_CUSTOMER_MISMATCH:",
              {
                reviewId,
                customerId,
                authoritativeCustomerId,
              },
            );

            return;
          }

          if (
            authoritativeWorkerId !==
            workerId
          ) {
            console.warn(
              "FIXXAM_REVIEW_WORKER_MISMATCH:",
              {
                reviewId,
                workerId,
                authoritativeWorkerId,
              },
            );

            return;
          }

          if (
            bookingStatus !==
            "completed"
          ) {
            console.warn(
              "FIXXAM_REVIEW_BOOKING_NOT_COMPLETED:",
              {
                reviewId,
                bookingStatus,
              },
            );

            return;
          }

          if (
            !booking
              .customerCompletedConfirmedAt
          ) {
            console.warn(
              "FIXXAM_REVIEW_COMPLETION_NOT_CONFIRMED:",
              {
                reviewId,
                bookingId,
              },
            );

            return;
          }

          /* ==================================================
             VERIFY REVIEW AGAIN INSIDE TRANSACTION
          ================================================== */

          const currentBookingId =
            cleanString(
              currentReview.bookingId,
            );

          const currentCustomerId =
            cleanString(
              currentReview.customerId,
            );

          const currentWorkerId =
            cleanString(
              currentReview.workerId,
            );

          const currentTargetId =
            cleanString(
              currentReview.targetId,
            );

          const currentOrderType =
            cleanString(
              currentReview.orderType,
            );

          const currentTargetType =
            cleanString(
              currentReview.targetType,
            );

          const currentRating =
            getRating(
              currentReview.rating,
            );

          const currentComment =
            cleanString(
              currentReview.comment,
            );

          if (
            currentBookingId !==
              bookingId ||
            currentCustomerId !==
              customerId ||
            currentWorkerId !==
              workerId ||
            currentOrderType !==
              "service" ||
            currentTargetType !==
              "worker" ||
            (
              currentTargetId &&
              currentTargetId !==
                workerId
            ) ||
            currentRating ===
              null ||
            currentComment.length ===
              0 ||
            currentComment.length >
              MAX_COMMENT_LENGTH
          ) {
            console.warn(
              "FIXXAM_REVIEW_CHANGED_OR_INVALID:",
              {
                reviewId,
              },
            );

            return;
          }

          /* ==================================================
             WORKER PROFILE
          ================================================== */

          if (
            !workerSnapshot.exists
          ) {
            console.error(
              "FIXXAM_REVIEW_WORKER_PROFILE_NOT_FOUND:",
              {
                reviewId,
                workerId,
              },
            );

            /*
             * Throw so transient profile
             * creation races can retry.
             */
            throw new Error(
              "WORKER_PROFILE_NOT_FOUND",
            );
          }

          const workerProfile =
            workerSnapshot.data();

          if (
            !workerProfile
          ) {
            console.error(
              "FIXXAM_REVIEW_WORKER_PROFILE_DATA_MISSING:",
              {
                reviewId,
                workerId,
              },
            );

            throw new Error(
              "WORKER_PROFILE_DATA_MISSING",
            );
          }

          /* ==================================================
             EXISTING RATING
          ================================================== */

          const currentTotalReviews =
            Math.max(
              0,
              Math.floor(
                getNonNegativeNumber(
                  workerProfile
                    .totalReviews,
                ),
              ),
            );

          const currentAverageRating =
            Math.min(
              MAX_RATING,
              getNonNegativeNumber(
                workerProfile
                  .rating,
              ),
            );

          const storedRatingSum =
            getNonNegativeNumber(
              workerProfile
                .ratingSum,
            );

          /*
           * Existing profiles may not have
           * ratingSum yet.
           *
           * In that case derive it from:
           *
           * average × count
           */
          const currentRatingSum =
            storedRatingSum >
              0 ||
            currentTotalReviews ===
              0
              ? storedRatingSum
              : currentAverageRating *
                currentTotalReviews;

          /* ==================================================
             NEXT RATING
          ================================================== */

          const nextTotalReviews =
            currentTotalReviews +
            1;

          const nextRatingSum =
            currentRatingSum +
            currentRating;

          const nextAverageRating =
            Number(
              (
                nextRatingSum /
                nextTotalReviews
              ).toFixed(
                2,
              ),
            );

          /* ==================================================
             DISPLAY DATA
          ================================================== */

          const customerData =
            customerSnapshot.exists
              ? customerSnapshot.data()
              : undefined;

          const customerName =
            resolveCustomerName(
              booking,
              customerData,
              currentReview,
            );

          const workerName =
            resolveWorkerName(
              booking,
              workerProfile,
              currentReview,
            );

          const serviceName =
            cleanString(
              booking.serviceName,
            ) ||
            cleanString(
              currentReview
                .serviceName,
            );

          const starWord =
            currentRating ===
            1
              ? "star"
              : "stars";

          /* ==================================================
             UPDATE WORKER PUBLIC RATING
          ================================================== */

          transaction.update(
            workerProfileRef,
            {
              rating:
                nextAverageRating,

              ratingSum:
                nextRatingSum,

              totalReviews:
                nextTotalReviews,

              updatedAt:
                admin.firestore
                  .FieldValue
                  .serverTimestamp(),
            },
          );

          /* ==================================================
             CREATE WORKER NOTIFICATION
          ================================================== */

          transaction.set(
            notificationRef,
            {
              notificationId,

              type:
                "worker_review",

              action:
                "review_received",

              title:
                "New Review",

              message:
                `${customerName} rated you ${currentRating} ${starWord}.`,

              entityId:
                reviewId,

              entityType:
                "worker_review",

              reviewId,

              bookingId,

              customerId,

              customerName,

              workerId,

              workerName,

              rating:
                currentRating,

              reviewComment:
                currentComment,

              ...(serviceName
                ? {
                    service:
                      serviceName,

                    serviceName,
                  }
                : {}),

              recipientId:
                workerId,

              recipientRole:
                "worker",

              read:
                false,

              createdAt:
                admin.firestore
                  .FieldValue
                  .serverTimestamp(),

              expiresAt:
                null,
            },
            {
              merge:
                false,
            },
          );

          /* ==================================================
             MARK REVIEW AS PROCESSED
          ================================================== */

          transaction.update(
            reviewRef,
            {
              customerName,

              workerName,

              aggregationProcessedAt:
                admin.firestore
                  .FieldValue
                  .serverTimestamp(),

              updatedAt:
                admin.firestore
                  .FieldValue
                  .serverTimestamp(),
            },
          );

          console.log(
            "FIXXAM_WORKER_REVIEW_PROCESSED:",
            {
              reviewId,

              bookingId,

              workerId,

              customerId,

              rating:
                currentRating,

              totalReviews:
                nextTotalReviews,

              averageRating:
                nextAverageRating,
            },
          );
        },
      );
    },
  );