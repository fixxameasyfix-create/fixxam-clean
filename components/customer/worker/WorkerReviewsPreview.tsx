import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  customerName?: string;

  comment?: string;

  rating?: number;

  reviewCount: number;

  date?: string;

  onPress: () => void;
};

/* ==============================================================
   HELPERS
============================================================== */

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

function normalizeRating(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

function normalizeCount(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value,
    ),
  );
}

function getInitial(
  name: string,
): string {
  const cleanName =
    cleanString(
      name,
    );

  if (!cleanName) {
    return "C";
  }

  return cleanName
    .charAt(0)
    .toUpperCase();
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerReviewsPreview({
  customerName,
  comment,
  rating = 0,
  reviewCount,
  date,
  onPress,
}: Props) {
  const safeCustomerName =
    cleanString(
      customerName,
    );

  const safeComment =
    cleanString(
      comment,
    );

  const safeDate =
    cleanString(
      date,
    );

  const safeRating =
    normalizeRating(
      rating,
    );

  const safeReviewCount =
    normalizeCount(
      reviewCount,
    );

  const hasReview =
    Boolean(
      safeCustomerName &&
      safeComment &&
      safeRating > 0,
    );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        hasReview
          ? `Open all ${safeReviewCount} reviews`
          : "Open reviews"
      }
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.card,

        pressed
          ? styles.cardPressed
          : null,
      ]}
    >
      {/* HEADER */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerLeft
          }
        >
          <View
            style={
              styles.headerIcon
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

          <AppText
            variant="bodyMedium"
            weight="bold"
          >
            Reviews
          </AppText>
        </View>

        <View
          style={
            styles.headerRight
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            {safeReviewCount}{" "}
            {safeReviewCount ===
            1
              ? "Review"
              : "Reviews"}
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            color={
              Colors.textMuted
            }
          />
        </View>
      </View>

      <View
        style={
          styles.divider
        }
      />

      {hasReview ? (
        <>
          {/* LAST REVIEW */}

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.sectionLabel
            }
          >
            Last Review
          </AppText>

          <View
            style={
              styles.reviewRow
            }
          >
            <View
              style={
                styles.avatar
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.avatarText
                }
              >
                {getInitial(
                  safeCustomerName,
                )}
              </AppText>
            </View>

            <View
              style={
                styles.reviewContent
              }
            >
              <View
                style={
                  styles.reviewTop
                }
              >
                <AppText
                  variant="bodyMedium"
                  weight="bold"
                  numberOfLines={
                    1
                  }
                  style={
                    styles.customerName
                  }
                >
                  {safeCustomerName}
                </AppText>

                <View
                  style={
                    styles.rating
                  }
                >
                  <AppIcon
                    name="star"
                    role="customer"
                    size="xs"
                    color={
                      Colors.warning
                    }
                  />

                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.ratingText
                    }
                  >
                    {safeRating.toFixed(
                      1,
                    )}
                  </AppText>
                </View>
              </View>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={
                  2
                }
                style={
                  styles.comment
                }
              >
                {safeComment}
              </AppText>

              {safeDate ? (
                <AppText
                  variant="caption"
                  tone="muted"
                  style={
                    styles.date
                  }
                >
                  {safeDate}
                </AppText>
              ) : null}
            </View>
          </View>
        </>
      ) : (
        /* EMPTY */

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
              size="sm"
              state="muted"
            />
          </View>

          <View
            style={
              styles.emptyContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
            >
              No reviews yet
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.emptyText
              }
            >
              Be the first customer to leave a review.
            </AppText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default memo(
  WorkerReviewsPreview,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    cardPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    headerLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerIcon: {
      width: 30,

      height: 30,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    headerRight: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },

    sectionLabel: {
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    reviewRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    avatar: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    avatarText: {
      color:
        Colors.textInverse,
    },

    reviewContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    reviewTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    customerName: {
      flex: 1,

      minWidth: 0,
    },

    rating: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    ratingText: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    comment: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,
    },

    date: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    empty: {
      flexDirection:
        "row",

      alignItems:
        "center",

      minHeight: 52,
    },

    emptyIcon: {
      width: 36,

      height: 36,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyContent: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },
  });