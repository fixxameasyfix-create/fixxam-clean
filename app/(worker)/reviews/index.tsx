import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  Stack,
} from "expo-router";

import {
  collection,
  limit,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type WorkerReviewTargetType =
  | "worker"
  | "product";

type WorkerReceivedReview = {
  id: string;

  customerId: string;

  customerName: string;

  workerId: string;

  targetId: string;

  targetType: WorkerReviewTargetType;

  targetName: string;

  rating: number;

  comment: string;

  createdAt: Timestamp | null;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_REVIEWS =
  100;

/* ============================================================
   HELPERS
============================================================ */

function safeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
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

function normalizeTargetType(
  value: unknown,
): WorkerReviewTargetType | null {
  const targetType =
    safeText(
      value,
    );

  /*
   * Legacy worker reviews may not contain targetType.
   */
  if (
    !targetType ||
    targetType === "worker"
  ) {
    return "worker";
  }

  if (
    targetType === "product"
  ) {
    return "product";
  }

  return null;
}

function resolveTargetName(
  data: Record<
    string,
    unknown
  >,
  targetType: WorkerReviewTargetType,
): string {
  if (
    targetType === "product"
  ) {
    return (
      safeText(
        data.productName,
      ) ||
      safeText(
        data.targetName,
      ) ||
      "Product"
    );
  }

  return (
    safeText(
      data.workerName,
    ) ||
    safeText(
      data.targetName,
    ) ||
    "Your service"
  );
}

function formatReviewDate(
  timestamp: Timestamp | null,
): string {
  if (
    !timestamp
  ) {
    return "";
  }

  try {
    return timestamp
      .toDate()
      .toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );
  } catch {
    return "";
  }
}

function getCreatedAtMillis(
  timestamp: Timestamp | null,
): number {
  if (
    !timestamp
  ) {
    return 0;
  }

  try {
    return timestamp.toMillis();
  } catch {
    return 0;
  }
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

function getRatingLabel(
  rating: number,
): string {
  if (
    rating <= 0
  ) {
    return "New";
  }

  const rounded =
    Math.max(
      1,
      Math.min(
        5,
        Math.round(
          rating,
        ),
      ),
    );

  switch (
    rounded
  ) {
    case 1:
      return "Poor";

    case 2:
      return "Fair";

    case 3:
      return "Good";

    case 4:
      return "Very Good";

    case 5:
      return "Excellent";

    default:
      return "New";
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerReviewsScreen() {
  const [
    reviews,
    setReviews,
  ] =
    useState<WorkerReceivedReview[]>(
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
    useState(false);

  const [
    retryKey,
    setRetryKey,
  ] =
    useState(0);

  const workerId =
    auth.currentUser?.uid ??
    "";

  /* ==========================================================
     REVIEWS LISTENER

     Shows reviews received by this worker.

     Includes:
     - worker reviews
     - product reviews belonging to worker
     - legacy worker reviews without targetType
  ========================================================== */

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

      return;
    }

    setLoading(
      true,
    );

    setError(
      false,
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

        limit(
          MAX_REVIEWS,
        ),
      );

    const unsubscribe =
      onSnapshot(
        reviewsQuery,

        (snapshot) => {
          const nextReviews =
            snapshot.docs
              .map(
                (
                  snapshotDoc,
                ): WorkerReceivedReview | null => {
                  const data =
                    snapshotDoc.data();

                  const targetType =
                    normalizeTargetType(
                      data.targetType,
                    );

                  if (
                    !targetType
                  ) {
                    return null;
                  }

                  const rating =
                    normalizeRating(
                      data.rating,
                    );

                  if (
                    rating <= 0
                  ) {
                    return null;
                  }

                  const reviewWorkerId =
                    safeText(
                      data.workerId,
                    );

                  if (
                    reviewWorkerId !==
                    workerId
                  ) {
                    return null;
                  }

                  return {
                    id:
                      snapshotDoc.id,

                    customerId:
                      safeText(
                        data.customerId,
                      ),

                    customerName:
                      safeText(
                        data.customerName,
                      ) ||
                      "Customer",

                    workerId:
                      reviewWorkerId,

                    targetId:
                      safeText(
                        data.targetId,
                      ),

                    targetType,

                    targetName:
                      resolveTargetName(
                        data,
                        targetType,
                      ),

                    rating,

                    comment:
                      safeText(
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
                ): review is WorkerReceivedReview =>
                  review !==
                  null,
              )
              .sort(
                (
                  first,
                  second,
                ) =>
                  getCreatedAtMillis(
                    second.createdAt,
                  ) -
                  getCreatedAtMillis(
                    first.createdAt,
                  ),
              );

          setReviews(
            nextReviews,
          );

          setError(
            false,
          );

          setLoading(
            false,
          );
        },

        (
          listenerError,
        ) => {
          console.error(
            "WORKER_RECEIVED_REVIEWS_LISTENER_ERROR:",
            listenerError,
          );

          setReviews(
            [],
          );

          setError(
            true,
          );

          setLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    retryKey,
    workerId,
  ]);

  /* ==========================================================
     TOTAL
  ========================================================== */

  const totalReviews =
    reviews.length;

  /* ==========================================================
     AVERAGE

     Uses the same review population:
     - worker
     - product
  ========================================================== */

  const averageRating =
    useMemo(() => {
      if (
        reviews.length === 0
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

      return roundRating(
        total /
          reviews.length,
      );
    }, [
      reviews,
    ]);

  const ratingLabel =
    useMemo(
      () =>
        getRatingLabel(
          averageRating,
        ),
      [
        averageRating,
      ],
    );

  const reviewCountLabel =
    useMemo(() => {
      if (
        totalReviews === 1
      ) {
        return "1 Review";
      }

      return `${totalReviews} Reviews`;
    }, [
      totalReviews,
    ]);

  /* ==========================================================
     RETRY
  ========================================================== */

  const handleRetry =
    () => {
      setRetryKey(
        (
          current,
        ) =>
          current + 1,
      );
    };

  /* ==========================================================
     AUTH REQUIRED
  ========================================================== */

  if (
    !workerId
  ) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown:
              false,
          }}
        />

        <AppScreen
          role="worker"
          padded={false}
        >
          <View
            style={
              styles.centerState
            }
          >
            <View
              style={
                styles.stateIcon
              }
            >
              <AppIcon
                name="lock"
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Sign in required
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.stateDescription
              }
            >
              Sign in to view your reviews.
            </AppText>

            <Pressable
              onPress={() =>
                router.replace(
                  "/(auth)/login" as never,
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              style={({
                pressed,
              }) => [
                styles.primaryButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.primaryButtonText
                }
              >
                Sign in
              </AppText>
            </Pressable>
          </View>
        </AppScreen>
      </>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <AppScreen
        role="worker"
        padded={false}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() => {
              if (
                router.canGoBack()
              ) {
                router.back();

                return;
              }

              router.replace(
                "/(worker)/(tabs)/profile" as never,
              );
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={
              8
            }
            style={({
              pressed,
            }) => [
              styles.headerButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="back"
              role="worker"
              size="sm"
              color={
                Colors.textPrimary
              }
            />
          </Pressable>

          <AppText
            variant="bodyLarge"
            weight="bold"
            style={
              styles.headerTitle
            }
          >
            Reviews
          </AppText>

          <View
            style={
              styles.headerButton
            }
          />
        </View>

        {/* ====================================================
            BODY
        ==================================================== */}

        {loading ? (
          <View
            style={
              styles.centerState
            }
          >
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.loadingText
              }
            >
              Loading reviews...
            </AppText>
          </View>
        ) : error ? (
          <View
            style={
              styles.centerState
            }
          >
            <View
              style={
                styles.stateIcon
              }
            >
              <AppIcon
                name="info"
                role="worker"
                size="md"
                color={
                  WorkerColors.primary
                }
              />
            </View>

            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.stateTitle
              }
            >
              Reviews unavailable
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.stateDescription
              }
            >
              We couldn&apos;t load your reviews right now.
            </AppText>

            <Pressable
              onPress={
                handleRetry
              }
              accessibilityRole="button"
              accessibilityLabel="Try loading reviews again"
              style={({
                pressed,
              }) => [
                styles.outlineButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="refresh"
                role="worker"
                size="sm"
                color={
                  WorkerColors.primary
                }
              />

              <AppText
                variant="bodyMedium"
                weight="semibold"
                style={
                  styles.outlineButtonText
                }
              >
                Try again
              </AppText>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.content
            }
          >
            {/* ================================================
                SUMMARY
            ================================================ */}

            <View
              style={
                styles.summaryHeader
              }
            >
              <View
                style={
                  styles.summaryIcon
                }
              >
                <AppIcon
                  name="star"
                  role="worker"
                  size="md"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.summaryHeaderContent
                }
              >
                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  style={
                    styles.summaryTitle
                  }
                >
                  My Total Reviews
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.summarySubtitle
                  }
                >
                  Reviews customers have written about you and your products.
                </AppText>
              </View>
            </View>

            {/* ================================================
                RATING SUMMARY
            ================================================ */}

            {reviews.length >
            0 ? (
              <View
                style={
                  styles.ratingSummary
                }
              >
                <View
                  style={
                    styles.ratingSummaryMain
                  }
                >
                  <AppIcon
                    name="star"
                    role="worker"
                    size="lg"
                    color={
                      Colors.warning
                    }
                  />

                  <AppText
                    variant="heading2"
                    weight="bold"
                    style={
                      styles.averageRating
                    }
                  >
                    {averageRating.toFixed(
                      1,
                    )}
                  </AppText>
                </View>

                <View
                  style={
                    styles.ratingSummaryDetails
                  }
                >
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={
                      styles.ratingLabel
                    }
                  >
                    {ratingLabel}
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={
                      styles.ratingCount
                    }
                  >
                    {reviewCountLabel}
                  </AppText>
                </View>
              </View>
            ) : null}

            {/* ================================================
                REVIEW LIST
            ================================================ */}

            {reviews.length >
            0 ? (
              <>
                <View
                  style={
                    styles.listHeader
                  }
                >
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                  >
                    Customer Reviews
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                  >
                    {totalReviews}
                  </AppText>
                </View>

                <View
                  style={
                    styles.reviewsList
                  }
                >
                  {reviews.map(
                    (
                      review,
                      index,
                    ) => (
                      <ReviewRow
                        key={
                          review.id
                        }
                        review={
                          review
                        }
                        showDivider={
                          index <
                          reviews.length -
                            1
                        }
                      />
                    ),
                  )}
                </View>
              </>
            ) : (
              <View
                style={
                  styles.emptyState
                }
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <AppIcon
                    name="star"
                    role="worker"
                    size="lg"
                    color={
                      WorkerColors.primary
                    }
                  />
                </View>

                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  style={
                    styles.emptyTitle
                  }
                >
                  No reviews yet
                </AppText>

                <AppText
                  variant="body"
                  tone="secondary"
                  style={
                    styles.emptyText
                  }
                >
                  Reviews customers write about you and your products will appear here.
                </AppText>
              </View>
            )}
          </ScrollView>
        )}
      </AppScreen>
    </>
  );
}

/* ============================================================
   REVIEW ROW
============================================================ */

const ReviewRow =
  memo(
    function ReviewRow({
      review,
      showDivider,
    }: {
      review: WorkerReceivedReview;

      showDivider: boolean;
    }) {
      const date =
        formatReviewDate(
          review.createdAt,
        );

      const context =
        review.targetType ===
        "product"
          ? "Product review"
          : "Worker review";

      return (
        <View
          style={[
            styles.reviewRow,

            showDivider
              ? styles.reviewDivider
              : null,
          ]}
        >
          {/* ==================================================
              ICON
          ================================================== */}

          <View
            style={
              styles.reviewIcon
            }
          >
            <AppIcon
              name={
                review.targetType ===
                "product"
                  ? "shop"
                  : "star"
              }
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <View
            style={
              styles.reviewContent
            }
          >
            <View
              style={
                styles.reviewTopRow
              }
            >
              <View
                style={
                  styles.customerContent
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="semibold"
                  numberOfLines={1}
                  style={
                    styles.customerName
                  }
                >
                  {review.customerName}
                </AppText>

                <AppText
                  variant="caption"
                  tone="secondary"
                  numberOfLines={1}
                  style={
                    styles.targetName
                  }
                >
                  {context}
                  {review.targetName
                    ? ` • ${review.targetName}`
                    : ""}
                </AppText>
              </View>

              <View
                style={
                  styles.reviewRating
                }
              >
                <AppIcon
                  name="star"
                  role="worker"
                  size="xs"
                  color={
                    Colors.warning
                  }
                />

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.reviewRatingText
                  }
                >
                  {review.rating.toFixed(
                    1,
                  )}
                </AppText>
              </View>
            </View>

            {review.comment ? (
              <AppText
                variant="body"
                style={
                  styles.comment
                }
              >
                {review.comment}
              </AppText>
            ) : null}

            {date ? (
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.date
                }
              >
                {date}
              </AppText>
            ) : null}
          </View>
        </View>
      );
    },
  );

ReviewRow.displayName =
  "ReviewRow";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    headerButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    headerTitle: {
      flex:
        1,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       SUMMARY HEADER
    ======================================================== */

    summaryHeader: {
      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    summaryIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    summaryHeaderContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    summaryTitle: {
      color:
        Colors.textPrimary,
    },

    summarySubtitle: {
      marginTop:
        2,

      lineHeight:
        17,
    },

    /* ========================================================
       RATING SUMMARY
    ======================================================== */

    ratingSummary: {
      minHeight:
        82,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      marginTop:
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

    ratingSummaryMain: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    averageRating: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.warning,
    },

    ratingSummaryDetails: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    ratingLabel: {
      color:
        Colors.textPrimary,
    },

    ratingCount: {
      marginTop:
        2,
    },

    /* ========================================================
       LIST
    ======================================================== */

    listHeader: {
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

    reviewsList: {
      overflow:
        "hidden",

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    reviewRow: {
      minHeight:
        100,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    reviewDivider: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    reviewIcon: {
      width:
        42,

      height:
        42,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    reviewContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    reviewTopRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    customerContent: {
      flex:
        1,

      minWidth:
        0,
    },

    customerName: {
      color:
        Colors.textPrimary,
    },

    targetName: {
      marginTop:
        2,
    },

    reviewRating: {
      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        3,
    },

    reviewRatingText: {
      color:
        Colors.textPrimary,
    },

    comment: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,

      lineHeight:
        20,
    },

    date: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyState: {
      marginTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",
    },

    emptyIcon: {
      width:
        64,

      height:
        64,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth:
        340,

      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",

      lineHeight:
        20,
    },

    /* ========================================================
       STATES
    ======================================================== */

    centerState: {
      flex:
        1,

      padding:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    stateIcon: {
      width:
        56,

      height:
        56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    stateDescription: {
      maxWidth:
        320,

      marginTop:
        FixxamTokens.spacing.xs,

      textAlign:
        "center",

      lineHeight:
        20,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       BUTTONS
    ======================================================== */

    primaryButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,
    },

    primaryButtonText: {
      color:
        Colors.textInverse,
    },

    outlineButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth:
        1,

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    outlineButtonText: {
      color:
        WorkerColors.primary,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });