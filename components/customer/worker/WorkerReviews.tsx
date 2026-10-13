import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import WorkerReviewSummary from "./reviews/WorkerReviewSummary";
import WorkerReviewForm from "./reviews/WorkerReviewForm";
import WorkerReviewsList from "./reviews/WorkerReviewsList";

import {
  cleanString,
  getFirestoreCode,
  MAX_COMMENT_LENGTH,
  MAX_VISIBLE_REVIEWS,
  MIN_COMMENT_LENGTH,
  normalizeCount,
  normalizeRating,
  STAR_COUNT,
  type ReviewEligibility,
  type WorkerReview,
} from "./reviews/reviewUtils";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workerId: string;

  workerName: string;

  rating: number;

  totalReviews: number;
};

/* ==============================================================
   CUSTOMER NAME
============================================================== */

async function resolveCustomerName(
  customerId: string,
): Promise<string> {
  const user =
    auth.currentUser;

  const authName =
    cleanString(
      user?.displayName,
    );

  if (
    authName
  ) {
    return authName;
  }

  try {
    const userSnapshot =
      await getDoc(
        doc(
          db,
          "users",
          customerId,
        ),
      );

    if (
      userSnapshot.exists()
    ) {
      const data =
        userSnapshot.data();

      const fullName =
        cleanString(
          data.fullName,
        );

      if (
        fullName
      ) {
        return fullName;
      }

      const joinedName =
        [
          cleanString(
            data.firstName,
          ),

          cleanString(
            data.otherName,
          ),

          cleanString(
            data.surname,
          ),
        ]
          .filter(
            Boolean,
          )
          .join(
            " ",
          )
          .trim();

      if (
        joinedName
      ) {
        return joinedName;
      }

      const fallbackName =
        cleanString(
          data.name,
        );

      if (
        fallbackName
      ) {
        return fallbackName;
      }
    }
  } catch (
    error
  ) {
    console.warn(
      "RESOLVE_REVIEW_CUSTOMER_NAME_ERROR:",
      error,
    );
  }

  return "Customer";
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerReviews({
  workerId,
  workerName,
  rating,
  totalReviews,
}: Props) {
  /* ============================================================
     REVIEWS
  ============================================================ */

  const [
    reviews,
    setReviews,
  ] =
    useState<WorkerReview[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  /* ============================================================
     ELIGIBILITY
  ============================================================ */

  const [
    eligibility,
    setEligibility,
  ] =
    useState<ReviewEligibility>(
      "checking",
    );

  /* ============================================================
     FORM
  ============================================================ */

  const [
    selectedRating,
    setSelectedRating,
  ] =
    useState(0);

  const [
    comment,
    setComment,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    submittedRating,
    setSubmittedRating,
  ] =
    useState<number | null>(
      null,
    );

  /* ============================================================
     NORMALIZED VALUES
  ============================================================ */

  const cleanWorkerId =
    useMemo(
      () =>
        cleanString(
          workerId,
        ),
      [
        workerId,
      ],
    );

  const cleanWorkerName =
    useMemo(
      () =>
        cleanString(
          workerName,
        ) ||
        "Worker",
      [
        workerName,
      ],
    );

  const safeRating =
    useMemo(
      () =>
        normalizeRating(
          rating,
        ),
      [
        rating,
      ],
    );

  const safeTotalReviews =
    useMemo(
      () =>
        normalizeCount(
          totalReviews,
        ),
      [
        totalReviews,
      ],
    );

  const customerId =
    cleanString(
      auth.currentUser?.uid,
    );

  /* ============================================================
     DISPLAY SUMMARY
  ============================================================ */

  const displayTotalReviews =
    submittedRating !==
    null
      ? safeTotalReviews +
        1
      : safeTotalReviews;

  const displayRating =
    submittedRating !==
    null
      ? (
          safeRating *
            safeTotalReviews +
          submittedRating
        ) /
        Math.max(
          1,
          safeTotalReviews +
            1,
        )
      : safeRating;

  /* ============================================================
     FORM VALIDATION
  ============================================================ */

  const cleanComment =
    comment.trim();

  const canSubmit =
    eligibility ===
      "eligible" &&
    !submitting &&
    selectedRating >=
      1 &&
    selectedRating <=
      STAR_COUNT &&
    cleanComment.length >=
      MIN_COMMENT_LENGTH &&
    cleanComment.length <=
      MAX_COMMENT_LENGTH;

  /* ============================================================
     PUBLIC REVIEWS LISTENER
  ============================================================ */

  useEffect(() => {
    if (
      !cleanWorkerId
    ) {
      setReviews(
        [],
      );

      setLoading(
        false,
      );

      return;
    }

    setLoading(
      true,
    );

    /*
     * Public worker reviews are intentionally read from the
     * publicWorkerReviews mirror collection.
     *
     * The original "reviews" collection remains protected because
     * it contains customerId and other protected review data.
     *
     * publicWorkerReviews must contain only safe public fields.
     *
     * We intentionally avoid Firestore orderBy here.
     *
     * The full Reviews screen already uses this pattern because
     * where(workerId) + orderBy(createdAt) requires a composite
     * Firestore index.
     *
     * Fetch the worker's public reviews and sort locally instead.
     */

    const reviewsQuery =
      query(
        collection(
          db,
          "publicWorkerReviews",
        ),

        where(
          "workerId",
          "==",
          cleanWorkerId,
        ),
      );

    const unsubscribe =
      onSnapshot(
        reviewsQuery,

        (
          snapshot,
        ) => {
          const nextReviews =
            snapshot.docs
              .map(
                (
                  snapshotDoc,
                ): WorkerReview => {
                  const data =
                    snapshotDoc.data();

                  return {
                    id:
                      snapshotDoc.id,

                    /*
                     * customerId is intentionally not exposed by
                     * the public mirror.
                     *
                     * The existing WorkerReview type expects this
                     * property, so an empty value is used here.
                     */
                    customerId:
                      "",

                    customerName:
                      cleanString(
                        data.customerName,
                      ) ||
                      "Customer",

                    workerId:
                      cleanString(
                        data.workerId,
                      ),

                    workerName:
                      cleanString(
                        data.workerName,
                      ) ||
                      "Worker",

                    rating:
                      normalizeRating(
                        data.rating,
                      ),

                    comment:
                      cleanString(
                        data.comment,
                      ),

                    createdAt:
                      data.createdAt instanceof
                      Timestamp
                        ? data.createdAt
                        : null,
                  };
                },
              )
              .filter(
                (
                  review,
                ) =>
                  review.rating >
                  0,
              )
              .sort(
                (
                  first,
                  second,
                ) => {
                  const firstTime =
                    first.createdAt?.toMillis() ??
                    0;

                  const secondTime =
                    second.createdAt?.toMillis() ??
                    0;

                  return (
                    secondTime -
                    firstTime
                  );
                },
              )
              .slice(
                0,
                MAX_VISIBLE_REVIEWS,
              );

          setReviews(
            nextReviews,
          );

          setLoading(
            false,
          );
        },

        (
          listenerError,
        ) => {
          console.error(
            "WORKER_PUBLIC_REVIEWS_LISTENER_ERROR:",
            listenerError,
          );

          setReviews(
            [],
          );

          setLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    cleanWorkerId,
  ]);

  /* ============================================================
     PREPARE REVIEW FORM

     Multiple reviews are now supported.

     We no longer check whether this customer has already reviewed
     this worker. A signed-in customer may create another review.
  ============================================================ */

  useEffect(() => {
    const customer =
      auth.currentUser;

    if (
      !customer
    ) {
      setEligibility(
        "ineligible",
      );

      setSubmitError(
        "Please sign in before leaving a review.",
      );

      return;
    }

    if (
      !cleanWorkerId
    ) {
      setEligibility(
        "ineligible",
      );

      setSubmitError(
        "Worker information is unavailable.",
      );

      return;
    }

    if (
      customer.uid ===
      cleanWorkerId
    ) {
      setEligibility(
        "ineligible",
      );

      setSubmitError(
        "You cannot review your own worker profile.",
      );

      return;
    }

    setEligibility(
      "eligible",
    );

    setSubmitError(
      null,
    );
  }, [
    cleanWorkerId,
    customerId,
  ]);

  /* ============================================================
     SELECT RATING
  ============================================================ */

  const handleSelectRating =
    useCallback(
      (
        value: number,
      ) => {
        if (
          submitting ||
          value <
            1 ||
          value >
            STAR_COUNT
        ) {
          return;
        }

        setSelectedRating(
          value,
        );

        setSubmitError(
          null,
        );
      },
      [
        submitting,
      ],
    );

  /* ============================================================
     COMMENT
  ============================================================ */

  const handleCommentChange =
    useCallback(
      (
        value: string,
      ) => {
        if (
          submitting
        ) {
          return;
        }

        setComment(
          value.slice(
            0,
            MAX_COMMENT_LENGTH,
          ),
        );

        setSubmitError(
          null,
        );
      },
      [
        submitting,
      ],
    );

  /* ============================================================
     SUBMIT REVIEW
  ============================================================ */

  const handleSubmitReview =
    useCallback(async () => {
      if (
        submitting ||
        eligibility !==
          "eligible"
      ) {
        return;
      }

      const customer =
        auth.currentUser;

      if (
        !customer
      ) {
        setSubmitError(
          "Please sign in before leaving a review.",
        );

        return;
      }

      if (
        !cleanWorkerId
      ) {
        setSubmitError(
          "Worker information is unavailable.",
        );

        return;
      }

      if (
        customer.uid ===
        cleanWorkerId
      ) {
        setSubmitError(
          "You cannot review your own worker profile.",
        );

        return;
      }

      if (
        selectedRating <
          1 ||
        selectedRating >
          STAR_COUNT
      ) {
        setSubmitError(
          "Please select a rating from 1 to 5 stars.",
        );

        return;
      }

      const reviewComment =
        comment.trim();

      if (
        reviewComment.length <
        MIN_COMMENT_LENGTH
      ) {
        setSubmitError(
          "Please write a short review about this provider.",
        );

        return;
      }

      if (
        reviewComment.length >
        MAX_COMMENT_LENGTH
      ) {
        setSubmitError(
          `Your review must be ${MAX_COMMENT_LENGTH} characters or less.`,
        );

        return;
      }

      try {
        setSubmitting(
          true,
        );

        setSubmitError(
          null,
        );

        const customerName =
          await resolveCustomerName(
            customer.uid,
          );

        /*
         * Firestore generates a unique document ID.
         *
         * This allows:
         *
         * Review 1
         * Review 2
         * Review 3
         *
         * from the same customer to the same worker.
         */

        const reviewRef =
          doc(
            collection(
              db,
              "reviews",
            ),
          );

        await runTransaction(
          db,

          async (
            transaction,
          ) => {
            transaction.set(
              reviewRef,
              {
                customerId:
                  customer.uid,

                customerName,

                workerId:
                  cleanWorkerId,

                workerName:
                  cleanWorkerName,

                targetId:
                  cleanWorkerId,

                targetType:
                  "worker",

                rating:
                  selectedRating,

                comment:
                  reviewComment,

                createdAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp(),
              },
            );
          },
        );

        setSubmittedRating(
          selectedRating,
        );

        /*
         * After the first submission from this profile section,
         * keep the existing submitted confirmation.
         *
         * Additional reviews will later be created through
         * "Say again" from the customer's own review card.
         */

        setEligibility(
          "already-reviewed",
        );

        setSelectedRating(
          0,
        );

        setComment(
          "",
        );

        setSubmitError(
          null,
        );
      } catch (
        submitReviewError
      ) {
        console.error(
          "SUBMIT_WORKER_REVIEW_ERROR:",
          submitReviewError,
        );

        const firestoreCode =
          getFirestoreCode(
            submitReviewError,
          );

        if (
          firestoreCode ===
          "permission-denied"
        ) {
          setSubmitError(
            "You don't have permission to submit this review.",
          );

          return;
        }

        if (
          firestoreCode ===
          "unavailable"
        ) {
          setSubmitError(
            "Network connection is unavailable. Please try again.",
          );

          return;
        }

        setSubmitError(
          "We couldn't submit your review. Please try again.",
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    }, [
      cleanWorkerId,
      cleanWorkerName,
      comment,
      eligibility,
      selectedRating,
      submitting,
    ]);

  /* ============================================================
     VIEW ALL REVIEWS
  ============================================================ */

  const handleViewAllReviews =
    useCallback(() => {
      if (
        !cleanWorkerId
      ) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/worker/[worker]/reviews",

        params: {
          worker:
            cleanWorkerId,

          workerName:
            cleanWorkerName,
        },
      } as never);
    }, [
      cleanWorkerId,
      cleanWorkerName,
    ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >
        <AppIcon
          name="star"
          role="customer"
          size="sm"
          color={
            Colors.warning
          }
        />

        <AppText
          variant="bodyMedium"
          weight="bold"
          style={
            styles.title
          }
        >
          Customer Reviews
        </AppText>
      </View>

      {/* SUMMARY */}

      <WorkerReviewSummary
        rating={
          displayRating
        }
        totalReviews={
          displayTotalReviews
        }
      />

      {/* ELIGIBILITY CHECK */}

      {eligibility ===
      "checking" ? (
        <View
          style={
            styles.reviewCheck
          }
        >
          <ActivityIndicator
            size="small"
            color={
              CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.reviewCheckText
            }
          >
            Preparing review form...
          </AppText>
        </View>
      ) : null}

      {/* REVIEW FORM */}

      {eligibility ===
      "eligible" ? (
        <WorkerReviewForm
          workerName={
            cleanWorkerName
          }
          selectedRating={
            selectedRating
          }
          comment={
            comment
          }
          submitting={
            submitting
          }
          canSubmit={
            canSubmit
          }
          submitError={
            submitError
          }
          onSelectRating={
            handleSelectRating
          }
          onCommentChange={
            handleCommentChange
          }
          onSubmit={
            handleSubmitReview
          }
        />
      ) : null}

      {/* REVIEW SUBMITTED */}

      {eligibility ===
      "already-reviewed" ? (
        <View
          style={
            styles.reviewSubmitted
          }
        >
          <View
            style={
              styles.reviewSubmittedIcon
            }
          >
            <AppIcon
              name="star"
              role="customer"
              size="sm"
              color={
                Colors.warning
              }
            />
          </View>

          <View
            style={
              styles.reviewSubmittedContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
            >
              Review submitted
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.reviewSubmittedText
              }
            >
              Your review for {cleanWorkerName} has been submitted.
            </AppText>
          </View>
        </View>
      ) : null}

      {/* INELIGIBLE */}

      {eligibility ===
        "ineligible" &&
      submitError ? (
        <View
          style={
            styles.reviewUnavailable
          }
        >
          <AppIcon
            name="info"
            role="customer"
            size="sm"
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.reviewUnavailableText
            }
          >
            {submitError}
          </AppText>
        </View>
      ) : null}

      {/* REVIEWS */}

      <WorkerReviewsList
        totalReviews={
          displayTotalReviews
        }
        onViewAll={
          handleViewAllReviews
        }
      />
    </View>
  );
}

/* ==============================================================
   EXPORT
============================================================== */

const MemoizedWorkerReviews =
  memo(
    WorkerReviews,
  );

MemoizedWorkerReviews.displayName =
  "WorkerReviews";

export default MemoizedWorkerReviews;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    title: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CHECKING
    ======================================================== */

    reviewCheck: {
      minHeight: 48,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop: 6,
    },

    reviewCheckText: {
      marginLeft:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       SUBMITTED
    ======================================================== */

    reviewSubmitted: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    reviewSubmittedIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    reviewSubmittedContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    reviewSubmittedText: {
      marginTop: 1,
    },

    /* ========================================================
       INELIGIBLE
    ======================================================== */

    reviewUnavailable: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.sm,
    },

    reviewUnavailableText: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.xs,
    },
  });