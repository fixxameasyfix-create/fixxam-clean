import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

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

import WorkerReviewCard from "@/components/customer/worker/reviews/WorkerReviewCard";
import WorkerReviewForm from "@/components/customer/worker/reviews/WorkerReviewForm";

import {
  cleanString,
  getFirestoreCode,
  getSelectedRatingLabel,
  MAX_COMMENT_LENGTH,
  MIN_COMMENT_LENGTH,
  normalizeRating,
  STAR_COUNT,
  type WorkerReview,
} from "@/components/customer/worker/reviews/reviewUtils";

/* ==============================================================
   TYPES
============================================================== */

type Params = {
  worker?: string | string[];
  workerName?: string | string[];
};

type RatingFilter =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5;

type ReviewFormMode =
  | "edit"
  | "say-again"
  | null;

/* ==============================================================
   CONSTANTS
============================================================== */

const RATING_FILTERS: RatingFilter[] = [
  0,
  1,
  2,
  3,
  4,
  5,
];

/* ==============================================================
   PARAM HELPER
============================================================== */

function getParam(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(
      value,
    )
  ) {
    return cleanString(
      value[0],
    );
  }

  return cleanString(
    value,
  );
}

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerReviewsScreen() {
  const params =
    useLocalSearchParams<Params>();

  const workerId =
    useMemo(
      () =>
        getParam(
          params.worker,
        ),
      [
        params.worker,
      ],
    );

  const workerName =
    useMemo(
      () =>
        getParam(
          params.workerName,
        ) ||
        "Provider",
      [
        params.workerName,
      ],
    );

  const customerId =
    cleanString(
      auth.currentUser?.uid,
    );

  /* ============================================================
     STATE
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

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<RatingFilter>(
      0,
    );

  const [
    formMode,
    setFormMode,
  ] =
    useState<ReviewFormMode>(
      null,
    );

  const [
    activeReview,
    setActiveReview,
  ] =
    useState<WorkerReview | null>(
      null,
    );

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

  /* ============================================================
     REVIEWS LISTENER

     Includes both:
     - worker reviews
     - product reviews belonging to worker
  ============================================================ */

  useEffect(() => {
    if (
      !workerId
    ) {
      setReviews(
        [],
      );

      setLoading(
        false,
      );

      setError(
        "Provider information is unavailable.",
      );

      return;
    }

    setLoading(
      true,
    );

    setError(
      null,
    );

    const reviewsQuery =
      query(
        collection(
          db,
          "reviews",
        ),

        where(
          "workerId",
          "==",
          workerId,
        ),
      );

    const unsubscribe =
      onSnapshot(
        reviewsQuery,

        snapshot => {
          const nextReviews =
            snapshot.docs
              .map(
                (
                  reviewDoc,
                ): WorkerReview | null => {
                  const data =
                    reviewDoc.data();

                  const targetType =
                    cleanString(
                      data.targetType,
                    );

                  /*
                   * Accept:
                   * - worker
                   * - product
                   * - legacy worker reviews without targetType
                   */

                  if (
                    targetType &&
                    targetType !==
                      "worker" &&
                    targetType !==
                      "product"
                  ) {
                    return null;
                  }

                  const rating =
                    normalizeRating(
                      data.rating,
                    );

                  if (
                    rating <=
                    0
                  ) {
                    return null;
                  }

                  return {
                    id:
                      reviewDoc.id,

                    customerId:
                      cleanString(
                        data.customerId,
                      ),

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
                      workerName,

                    rating,

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
                ): review is WorkerReview =>
                  review !==
                  null,
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
              );

          setReviews(
            nextReviews,
          );

          setLoading(
            false,
          );

          setError(
            null,
          );
        },

        listenerError => {
          console.error(
            "WORKER_REVIEWS_SCREEN_LISTENER_ERROR:",
            listenerError,
          );

          setReviews(
            [],
          );

          setLoading(
            false,
          );

          setError(
            "We couldn't load reviews right now.",
          );
        },
      );

    return unsubscribe;
  }, [
    workerId,
    workerName,
  ]);

  /* ============================================================
     CUSTOMER REVIEW STATUS
  ============================================================ */

  const customerReviews =
    useMemo(() => {
      if (
        !customerId
      ) {
        return [];
      }

      return reviews.filter(
        review =>
          review.customerId ===
          customerId,
      );
    }, [
      customerId,
      reviews,
    ]);

  const hasReviewed =
    customerReviews.length >
    0;

  /* ============================================================
     FILTERED REVIEWS
  ============================================================ */

  const filteredReviews =
    useMemo(() => {
      if (
        selectedFilter ===
        0
      ) {
        return reviews;
      }

      return reviews.filter(
        review =>
          Math.round(
            review.rating,
          ) ===
          selectedFilter,
      );
    }, [
      reviews,
      selectedFilter,
    ]);

  /* ============================================================
     RATING COUNTS
  ============================================================ */

  const ratingCounts =
    useMemo(() => {
      const counts: Record<
        1 | 2 | 3 | 4 | 5,
        number
      > = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      reviews.forEach(
        review => {
          const reviewRating =
            Math.round(
              review.rating,
            );

          if (
            reviewRating >=
              1 &&
            reviewRating <=
              5
          ) {
            counts[
              reviewRating as
                | 1
                | 2
                | 3
                | 4
                | 5
            ] += 1;
          }
        },
      );

      return counts;
    }, [
      reviews,
    ]);

  /* ============================================================
     AVERAGE RATING
  ============================================================ */

  const averageRating =
    useMemo(() => {
      if (
        reviews.length ===
        0
      ) {
        return 0;
      }

      const total =
        reviews.reduce(
          (
            sum,
            review,
          ) =>
            sum +
            review.rating,
          0,
        );

      return normalizeRating(
        total /
          reviews.length,
      );
    }, [
      reviews,
    ]);

  const averageLabel =
    useMemo(() => {
      if (
        averageRating <=
        0
      ) {
        return "New";
      }

      const roundedRating =
        Math.max(
          1,
          Math.min(
            5,
            Math.round(
              averageRating,
            ),
          ),
        );

      return getSelectedRatingLabel(
        roundedRating,
      );
    }, [
      averageRating,
    ]);

  /* ============================================================
     FORM VALIDATION
  ============================================================ */

  const cleanComment =
    comment.trim();

  const canSubmit =
    formMode !==
      null &&
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
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      if (
        formMode
      ) {
        setFormMode(
          null,
        );

        setActiveReview(
          null,
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

        return;
      }

      if (
        router.canGoBack()
      ) {
        router.back();

        return;
      }

      router.replace(
        "/(customer)/(tabs)/home" as never,
      );
    }, [
      formMode,
    ]);

  /* ============================================================
     EDIT REVIEW
  ============================================================ */

  const handleEditReview =
    useCallback(
      (
        review: WorkerReview,
      ) => {
        if (
          !customerId ||
          review.customerId !==
            customerId
        ) {
          return;
        }

        setActiveReview(
          review,
        );

        setSelectedRating(
          Math.max(
            1,
            Math.min(
              STAR_COUNT,
              Math.round(
                review.rating,
              ),
            ),
          ),
        );

        setComment(
          review.comment,
        );

        setSubmitError(
          null,
        );

        setFormMode(
          "edit",
        );
      },
      [
        customerId,
      ],
    );

  /* ============================================================
     SAY AGAIN
  ============================================================ */

  const handleSayAgain =
    useCallback(
      (
        review: WorkerReview,
      ) => {
        if (
          !customerId ||
          review.customerId !==
            customerId
        ) {
          return;
        }

        setActiveReview(
          review,
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

        setFormMode(
          "say-again",
        );
      },
      [
        customerId,
      ],
    );

  /* ============================================================
     CANCEL FORM
  ============================================================ */

  const handleCancelForm =
    useCallback(() => {
      if (
        submitting
      ) {
        return;
      }

      setFormMode(
        null,
      );

      setActiveReview(
        null,
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
    }, [
      submitting,
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
     SUBMIT EDIT / SAY AGAIN
  ============================================================ */

  const handleSubmitReview =
    useCallback(async () => {
      if (
        submitting ||
        !formMode
      ) {
        return;
      }

      const customer =
        auth.currentUser;

      if (
        !customer
      ) {
        setSubmitError(
          "Please sign in before submitting your review.",
        );

        return;
      }

      if (
        !workerId
      ) {
        setSubmitError(
          "Provider information is unavailable.",
        );

        return;
      }

      if (
        customer.uid ===
        workerId
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

        if (
          formMode ===
          "edit"
        ) {
          if (
            !activeReview
          ) {
            setSubmitError(
              "Review information is unavailable.",
            );

            return;
          }

          const reviewRef =
            doc(
              db,
              "reviews",
              activeReview.id,
            );

          await runTransaction(
            db,

            async transaction => {
              const snapshot =
                await transaction.get(
                  reviewRef,
                );

              if (
                !snapshot.exists()
              ) {
                throw new Error(
                  "REVIEW_NOT_FOUND",
                );
              }

              const data =
                snapshot.data();

              if (
                cleanString(
                  data.customerId,
                ) !==
                  customer.uid ||
                cleanString(
                  data.workerId,
                ) !==
                  workerId
              ) {
                throw new Error(
                  "REVIEW_NOT_OWNED",
                );
              }

              transaction.update(
                reviewRef,
                {
                  rating:
                    selectedRating,

                  comment:
                    reviewComment,

                  updatedAt:
                    serverTimestamp(),
                },
              );
            },
          );
        }

        if (
          formMode ===
          "say-again"
        ) {
          const sourceReview =
            activeReview;

          if (
            !sourceReview ||
            sourceReview.customerId !==
              customer.uid
          ) {
            throw new Error(
              "REVIEW_NOT_OWNED",
            );
          }

          const reviewRef =
            doc(
              collection(
                db,
                "reviews",
              ),
            );

          await runTransaction(
            db,

            async transaction => {
              transaction.set(
                reviewRef,
                {
                  customerId:
                    customer.uid,

                  customerName:
                    cleanString(
                      sourceReview.customerName,
                    ) ||
                    "Customer",

                  workerId,

                  workerName:
                    cleanString(
                      sourceReview.workerName,
                    ) ||
                    workerName,

                  targetId:
                    workerId,

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
        }

        setFormMode(
          null,
        );

        setActiveReview(
          null,
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
          "SAVE_WORKER_REVIEW_ERROR:",
          submitReviewError,
        );

        const errorMessage =
          submitReviewError instanceof
          Error
            ? submitReviewError.message
            : "";

        const firestoreCode =
          getFirestoreCode(
            submitReviewError,
          );

        if (
          errorMessage ===
          "REVIEW_NOT_FOUND"
        ) {
          setSubmitError(
            "This review is no longer available.",
          );

          return;
        }

        if (
          errorMessage ===
          "REVIEW_NOT_OWNED"
        ) {
          setSubmitError(
            "You can only change your own review.",
          );

          return;
        }

        if (
          firestoreCode ===
          "permission-denied"
        ) {
          setSubmitError(
            "You don't have permission to change this review.",
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
          formMode ===
            "edit"
            ? "We couldn't update your review. Please try again."
            : "We couldn't submit your new review. Please try again.",
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    }, [
      activeReview,
      comment,
      formMode,
      selectedRating,
      submitting,
      workerId,
      workerName,
    ]);

  /* ============================================================
     FILTER
  ============================================================ */

  const handleSelectFilter =
    useCallback(
      (
        filter: RatingFilter,
      ) => {
        setSelectedFilter(
          filter,
        );
      },
      [],
    );

  /* ============================================================
     REVIEW ITEM
  ============================================================ */

  const renderReview =
    useCallback(
      ({
        item,
      }: {
        item: WorkerReview;
      }) => (
        <WorkerReviewCard
          review={
            item
          }
          isOwnReview={
            Boolean(
              customerId &&
                item.customerId ===
                  customerId,
            )
          }
          onEdit={
            handleEditReview
          }
          onSayAgain={
            handleSayAgain
          }
        />
      ),
      [
        customerId,
        handleEditReview,
        handleSayAgain,
      ],
    );

  /* ============================================================
     FILTER ITEM
  ============================================================ */

  const renderFilter =
    (
      filter: RatingFilter,
    ) => {
      const selected =
        selectedFilter ===
        filter;

      const label =
        filter ===
        0
          ? "All"
          : `${filter}★`;

      const count =
        filter ===
        0
          ? reviews.length
          : ratingCounts[
              filter as
                | 1
                | 2
                | 3
                | 4
                | 5
            ];

      return (
        <Pressable
          key={
            filter
          }
          accessibilityRole="button"
          accessibilityState={{
            selected,
          }}
          accessibilityLabel={
            filter ===
            0
              ? `All reviews, ${count}`
              : `${filter} star reviews, ${count}`
          }
          onPress={() =>
            handleSelectFilter(
              filter,
            )
          }
          style={({
            pressed,
          }) => [
            styles.filterButton,

            selected
              ? styles.filterButtonSelected
              : null,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="semibold"
            style={[
              styles.filterText,

              selected
                ? styles.filterTextSelected
                : null,
            ]}
          >
            {label}
          </AppText>
        </Pressable>
      );
    };

  /* ============================================================
     LIST HEADER
  ============================================================ */

  const renderListHeader =
    () => (
      <View>
        <View
          style={
            styles.intro
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
          >
            What customers are saying
          </AppText>

          <AppText
            variant="bodyMedium"
            tone="secondary"
            style={
              styles.introText
            }
          >
            Here are all the people&apos;s reviews on this provider.
          </AppText>
        </View>

        <View
          style={
            styles.summaryCard
          }
        >
          <View
            style={
              styles.summaryMain
            }
          >
            <AppIcon
              name="star"
              role="customer"
              size="lg"
              color={
                Colors.warning
              }
            />

            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.averageText
              }
            >
              {averageRating.toFixed(
                1,
              )}
            </AppText>
          </View>

          <View
            style={
              styles.summaryDetails
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
            >
              {averageLabel}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.summaryCount
              }
            >
              {reviews.length}{" "}
              {reviews.length ===
              1
                ? "Review"
                : "Reviews"}
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.filterSection
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
          >
            Filter by rating
          </AppText>

          <View
            style={
              styles.filters
            }
          >
            {RATING_FILTERS.map(
              renderFilter,
            )}
          </View>
        </View>

        <View
          style={
            styles.listTitleRow
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
          >
            {selectedFilter ===
            0
              ? "All Reviews"
              : `${selectedFilter} Star Reviews`}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            {filteredReviews.length}
          </AppText>
        </View>
      </View>
    );

  /* ============================================================
     LIST FOOTER
  ============================================================ */

  const renderListFooter =
    () => (
      <View
        style={
          styles.footer
        }
      >
        {formMode ? (
          <View
            style={
              styles.formSection
            }
          >
            <View
              style={
                styles.formHeader
              }
            >
              <View
                style={
                  styles.formHeaderContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                >
                  {formMode ===
                  "edit"
                    ? "Edit your review"
                    : "Say something again"}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.formHeaderText
                  }
                >
                  {formMode ===
                  "edit"
                    ? "Update the rating or comment on this review."
                    : "Write another review about this provider."}
                </AppText>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel review"
                hitSlop={
                  8
                }
                disabled={
                  submitting
                }
                onPress={
                  handleCancelForm
                }
                style={({
                  pressed,
                }) => [
                  styles.cancelButton,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppIcon
                  name="close"
                  role="customer"
                  size="sm"
                  color={
                    Colors.textSecondary
                  }
                />
              </Pressable>
            </View>

            <WorkerReviewForm
              workerName={
                workerName
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
          </View>
        ) : hasReviewed ? (
          <View
            style={
              styles.reviewedCard
            }
          >
            <View
              style={
                styles.reviewedIcon
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
                styles.reviewedContent
              }
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
              >
                You reviewed this provider
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.reviewedText
                }
              >
                Use Say again on one of your review cards to edit it or write another review.
              </AppText>
            </View>
          </View>
        ) : null}
      </View>
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <SafeAreaView
      edges={[
        "top",
        "left",
        "right",
      ]}
      style={
        styles.safeArea
      }
    >
      <KeyboardAvoidingView
        style={
          styles.keyboardView
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          0
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={
              8
            }
            onPress={
              handleBack
            }
            style={({
              pressed,
            }) => [
              styles.backButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="customer"
              size="md"
            />
          </Pressable>

          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              numberOfLines={1}
            >
              Reviews
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
            >
              {workerName}
            </AppText>
          </View>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {loading ? (
          <View
            style={
              styles.center
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
                styles.centerText
              }
            >
              Loading reviews...
            </AppText>
          </View>
        ) : error ? (
          <View
            style={
              styles.center
            }
          >
            <AppIcon
              name="info"
              role="customer"
              size="md"
              color={
                Colors.textMuted
              }
            />

            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.centerTitle
              }
            >
              Reviews unavailable
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.centerText
              }
            >
              {error}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={
              filteredReviews
            }
            keyExtractor={(
              item,
            ) =>
              item.id
            }
            renderItem={
              renderReview
            }
            ListHeaderComponent={
              renderListHeader()
            }
            ListEmptyComponent={
              <View
                style={
                  styles.empty
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <AppIcon
                    name="star"
                    role="customer"
                    size="md"
                    color={
                      Colors.textMuted
                    }
                  />
                </View>

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.emptyTitle
                  }
                >
                  {selectedFilter ===
                  0
                    ? "No reviews yet"
                    : `No ${selectedFilter}-star reviews`}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.emptyText
                  }
                >
                  {selectedFilter ===
                  0
                    ? "Customer reviews for this provider will appear here."
                    : "Try another rating filter to see more customer reviews."}
                </AppText>
              </View>
            }
            ListFooterComponent={
              renderListFooter()
            }
            ItemSeparatorComponent={() => (
              <View
                style={
                  styles.separator
                }
              />
            )}
            contentContainerStyle={
              styles.listContent
            }
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS ===
              "ios"
                ? "interactive"
                : "on-drag"
            }
            initialNumToRender={
              8
            }
            maxToRenderPerBatch={
              8
            }
            windowSize={
              7
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        Colors.background,
    },

    keyboardView: {
      flex: 1,
    },

    header: {
      minHeight: 62,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.md,
      borderBottomWidth:
        StyleSheet.hairlineWidth,
      borderBottomColor:
        Colors.divider,
      backgroundColor:
        Colors.surface,
    },

    backButton: {
      width: 42,
      height: 42,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        FixxamTokens.radius.full,
    },

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    headerContent: {
      flex: 1,
      minWidth: 0,
      alignItems:
        "center",
    },

    headerSpacer: {
      width: 42,
      height: 42,
    },

    listContent: {
      flexGrow: 1,
      paddingHorizontal:
        FixxamTokens.spacing.md,
      paddingTop:
        FixxamTokens.spacing.md,
      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    separator: {
      height:
        FixxamTokens.spacing.sm,
    },

    intro: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    introText: {
      marginTop:
        FixxamTokens.spacing.xs,
      lineHeight: 21,
    },

    summaryCard: {
      minHeight: 82,
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.md,
      paddingVertical:
        FixxamTokens.spacing.sm,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.lg,
      backgroundColor:
        Colors.surface,
    },

    summaryMain: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    averageText: {
      marginLeft:
        FixxamTokens.spacing.xs,
      color:
        Colors.warning,
    },

    summaryDetails: {
      flex: 1,
      minWidth: 0,
      marginLeft:
        FixxamTokens.spacing.md,
    },

    summaryCount: {
      marginTop: 2,
    },

    filterSection: {
      marginTop:
        FixxamTokens.spacing.lg,
    },

    filters: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      marginTop:
        FixxamTokens.spacing.sm,
      gap:
        FixxamTokens.spacing.xs,
    },

    filterButton: {
      minWidth: 48,
      height: 36,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.sm,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        Colors.surface,
    },

    filterButtonSelected: {
      borderColor:
        CustomerColors.primary,
      backgroundColor:
        CustomerColors.primarySoft,
    },

    filterText: {
      color:
        Colors.textSecondary,
    },

    filterTextSelected: {
      color:
        CustomerColors.primary,
    },

    listTitleRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginTop:
        FixxamTokens.spacing.lg,
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    footer: {
      paddingTop:
        FixxamTokens.spacing.lg,
      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    reviewedCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.sm,
      paddingVertical:
        FixxamTokens.spacing.sm,
      borderRadius:
        FixxamTokens.radius.md,
      backgroundColor:
        CustomerColors.primarySoft,
    },

    reviewedIcon: {
      width: 38,
      height: 38,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    reviewedContent: {
      flex: 1,
      minWidth: 0,
      marginLeft:
        FixxamTokens.spacing.xs,
    },

    reviewedText: {
      marginTop: 2,
      lineHeight: 17,
    },

    formSection: {
      padding:
        FixxamTokens.spacing.sm,
      borderWidth:
        StyleSheet.hairlineWidth,
      borderColor:
        Colors.border,
      borderRadius:
        FixxamTokens.radius.lg,
      backgroundColor:
        Colors.surface,
    },

    formHeader: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    formHeaderContent: {
      flex: 1,
      minWidth: 0,
    },

    formHeaderText: {
      marginTop: 2,
      lineHeight: 17,
    },

    cancelButton: {
      width: 36,
      height: 36,
      flexShrink: 0,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft:
        FixxamTokens.spacing.xs,
      borderRadius:
        FixxamTokens.radius.full,
    },

    center: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    centerTitle: {
      marginTop:
        FixxamTokens.spacing.sm,
      textAlign:
        "center",
    },

    centerText: {
      marginTop:
        FixxamTokens.spacing.xs,
      textAlign:
        "center",
    },

    empty: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingVertical:
        FixxamTokens.spacing.xl,
    },

    emptyIcon: {
      width: 46,
      height: 46,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius:
        FixxamTokens.radius.full,
      backgroundColor:
        Colors.surface,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    emptyText: {
      maxWidth: 280,
      marginTop:
        FixxamTokens.spacing.xs,
      textAlign:
        "center",
      lineHeight: 18,
    },
  });