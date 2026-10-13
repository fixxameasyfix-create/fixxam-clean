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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type ReviewOrderType =
  | "service"
  | "market";

type ReviewTargetType =
  | "worker"
  | "seller"
  | "product";

type CustomerReview = {
  id: string;

  customerId: string;

  orderId: string;

  orderType: ReviewOrderType;

  targetId: string;

  targetType: ReviewTargetType;

  targetName: string;

  rating: number;

  comment: string;

  createdAt: Timestamp | null;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_REVIEWS =
  50;

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

function normalizeOrderType(
  value: unknown,
): ReviewOrderType {
  return value === "market"
    ? "market"
    : "service";
}

function normalizeTargetType(
  value: unknown,
): ReviewTargetType {
  switch (value) {
    case "seller":
      return "seller";

    case "product":
      return "product";

    case "worker":
    default:
      return "worker";
  }
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

  return Math.min(
    5,
    Math.max(
      0,
      rating,
    ),
  );
}

function resolveTargetName(
  data: Record<
    string,
    unknown
  >,
): string {
  return (
    safeText(
      data.targetName,
    ) ||
    safeText(
      data.productName,
    ) ||
    safeText(
      data.workerName,
    ) ||
    safeText(
      data.sellerName,
    ) ||
    "Fixxam provider"
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

function getReviewContext(
  review: CustomerReview,
): string {
  switch (
    review.targetType
  ) {
    case "product":
      return "Product review";

    case "seller":
      return "Seller review";

    case "worker":
    default:
      return "Worker review";
  }
}

/* ============================================================
   SCREEN
============================================================ */

export default function CustomerReviewsScreen() {
  const [
    reviews,
    setReviews,
  ] =
    useState<CustomerReview[]>(
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

  const userId =
    auth.currentUser?.uid ??
    "";

  /* ==========================================================
     REVIEWS LISTENER

     Only reviews created by the current customer are loaded.

     Includes:
     - worker reviews
     - product reviews
     - seller reviews

     orderId is intentionally NOT required because product
     reviews may not contain an orderId.
  ========================================================== */

  useEffect(() => {
    if (
      !userId
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

    /*
     * Sorting remains on the client to avoid requiring
     * customerId + createdAt composite index.
     */
    const reviewsQuery =
      query(
        collection(
          db,
          "reviews",
        ),

        where(
          "customerId",
          "==",
          userId,
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
                ): CustomerReview => {
                  const data =
                    snapshotDoc.data();

                  return {
                    id:
                      snapshotDoc.id,

                    customerId:
                      safeText(
                        data.customerId,
                      ),

                    orderId:
                      safeText(
                        data.orderId,
                      ),

                    orderType:
                      normalizeOrderType(
                        data.orderType,
                      ),

                    targetId:
                      safeText(
                        data.targetId,
                      ),

                    targetType:
                      normalizeTargetType(
                        data.targetType,
                      ),

                    targetName:
                      resolveTargetName(
                        data,
                      ),

                    rating:
                      normalizeRating(
                        data.rating,
                      ),

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
                ) =>
                  review.customerId ===
                    userId &&
                  review.rating >
                    0 &&
                  (
                    review.targetType ===
                      "worker" ||
                    review.targetType ===
                      "product" ||
                    review.targetType ===
                      "seller"
                  ),
              )
              .sort(
                (
                  a,
                  b,
                ) =>
                  getCreatedAtMillis(
                    b.createdAt,
                  ) -
                  getCreatedAtMillis(
                    a.createdAt,
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
            "CUSTOMER_REVIEWS_LISTENER_ERROR:",
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
    userId,
  ]);

  /* ==========================================================
     DERIVED
  ========================================================== */

  const reviewCountLabel =
    useMemo(() => {
      const count =
        reviews.length;

      if (
        count === 1
      ) {
        return "1 review";
      }

      return `${count} reviews`;
    }, [
      reviews.length,
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
    !userId
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
          role="customer"
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
                role="customer"
                size="md"
                color={
                  CustomerColors.primary
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
                router.push(
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
     RENDER
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
        role="customer"
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
            onPress={() =>
              router.back()
            }
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
                CustomerColors.primary
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
                role="customer"
                size="md"
                color={
                  CustomerColors.primary
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
                role="customer"
                size="sm"
                color={
                  CustomerColors.primary
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
                styles.summary
              }
            >
              <View
                style={
                  styles.summaryIcon
                }
              >
                <AppIcon
                  name="star"
                  role="customer"
                  size="md"
                  color={
                    CustomerColors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.summaryContent
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
                  Reviews you have written for workers and products.
                </AppText>
              </View>

              {reviews.length >
              0 ? (
                <AppText
                  variant="caption"
                  weight="semibold"
                  style={
                    styles.reviewCount
                  }
                >
                  {reviewCountLabel}
                </AppText>
              ) : null}
            </View>

            {/* ================================================
                REVIEWS
            ================================================ */}

            {reviews.length >
            0 ? (
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
                    role="customer"
                    size="lg"
                    color={
                      CustomerColors.primary
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
                  Reviews you write for workers and products will appear here.
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
      review: CustomerReview;

      showDivider: boolean;
    }) {
      const date =
        formatReviewDate(
          review.createdAt,
        );

      const context =
        getReviewContext(
          review,
        );

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
                  : review.targetType ===
                      "seller"
                    ? "profile"
                    : "service"
              }
              role="customer"
              size="sm"
              color={
                CustomerColors.primary
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
                styles.reviewTitleRow
              }
            >
              <AppText
                variant="bodyMedium"
                weight="semibold"
                numberOfLines={1}
                style={
                  styles.reviewTarget
                }
              >
                {review.targetName}
              </AppText>

              <View
                style={
                  styles.rating
                }
              >
                <AppIcon
                  name="star"
                  size="xs"
                  color={
                    CustomerColors.primary
                  }
                />

                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  style={
                    styles.ratingText
                  }
                >
                  {review.rating.toFixed(
                    1,
                  )}
                </AppText>
              </View>
            </View>

            <View
              style={
                styles.metaRow
              }
            >
              <AppText
                variant="caption"
                tone="secondary"
              >
                {context}
              </AppText>

              {date ? (
                <>
                  <View
                    style={
                      styles.metaDot
                    }
                  />

                  <AppText
                    variant="caption"
                    tone="secondary"
                  >
                    {date}
                  </AppText>
                </>
              ) : null}
            </View>

            {review.comment ? (
              <AppText
                variant="body"
                numberOfLines={3}
                style={
                  styles.comment
                }
              >
                {review.comment}
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
       SUMMARY
    ======================================================== */

    summary: {
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
        CustomerColors.primarySoft,
    },

    summaryContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
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

    reviewCount: {
      flexShrink:
        0,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       REVIEW LIST
    ======================================================== */

    reviewsList: {
      overflow:
        "hidden",

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

    reviewRow: {
      minHeight:
        92,

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
        40,

      height:
        40,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    reviewContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    reviewTitleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    reviewTarget: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textPrimary,
    },

    rating: {
      flexShrink:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        3,
    },

    ratingText: {
      color:
        Colors.textPrimary,
    },

    metaRow: {
      marginTop:
        3,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    metaDot: {
      width:
        3,

      height:
        3,

      marginHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        999,

      backgroundColor:
        Colors.textMuted,
    },

    comment: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,

      lineHeight:
        20,
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
        CustomerColors.primarySoft,
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
        CustomerColors.primarySoft,
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
        CustomerColors.primary,
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
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    outlineButtonText: {
      color:
        CustomerColors.primary,
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