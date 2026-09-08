import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
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

type Review = {
  id: string;

  customerName: string;

  rating: number;

  comment: string;

  date: string;
};

type Props = {
  rating: number;

  totalReviews: number;

  reviews: Review[];
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_VISIBLE_REVIEWS =
  3;

const STAR_COUNT =
  5;

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
  value: number,
): number {
  if (
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
  value: number,
): number {
  if (
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

function getRatingLabel(
  rating: number,
): string {
  if (
    rating >= 4.5
  ) {
    return "Excellent";
  }

  if (
    rating >= 4
  ) {
    return "Very Good";
  }

  if (
    rating >= 3
  ) {
    return "Good";
  }

  if (
    rating >= 2
  ) {
    return "Fair";
  }

  if (
    rating > 0
  ) {
    return "Needs Improvement";
  }

  return "New";
}

function getInitial(
  name: string,
): string {
  const cleanName =
    cleanString(
      name,
    );

  if (
    !cleanName
  ) {
    return "C";
  }

  return cleanName
    .charAt(0)
    .toUpperCase();
}

/* ==============================================================
   REVIEW STARS
============================================================== */

const ReviewStars =
  memo(function ReviewStars({
    rating,
  }: {
    rating: number;
  }) {
    const normalizedRating =
      normalizeRating(
        rating,
      );

    const activeStars =
      Math.round(
        normalizedRating,
      );

    return (
      <View
        style={
          styles.ratingRow
        }
        accessibilityLabel={`${normalizedRating.toFixed(
          1,
        )} out of 5 stars`}
      >
        {Array.from({
          length:
            STAR_COUNT,
        }).map(
          (
            _,
            index,
          ) => (
            <View
              key={
                index
              }
              style={
                styles.starItem
              }
            >
              <AppIcon
                name="star"
                role="customer"
                size="xs"
                color={
                  index <
                  activeStars
                    ? Colors.warning
                    : Colors.disabled
                }
              />
            </View>
          ),
        )}
      </View>
    );
  });

/* ==============================================================
   REVIEW CARD
============================================================== */

const ReviewCard =
  memo(function ReviewCard({
    review,
  }: {
    review: Review;
  }) {
    const customerName =
      cleanString(
        review.customerName,
      ) ||
      "Customer";

    const comment =
      cleanString(
        review.comment,
      );

    const date =
      cleanString(
        review.date,
      );

    return (
      <AppCard
        role="customer"
        variant="outlined"
        style={
          styles.card
        }
      >
        <View
          style={
            styles.row
          }
        >
          {/* ==================================================
              AVATAR
          ================================================== */}

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
                customerName,
              )}
            </AppText>
          </View>

          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <View
            style={
              styles.customerInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
            >
              {customerName}
            </AppText>

            <ReviewStars
              rating={
                review.rating
              }
            />
          </View>

          {/* ==================================================
              DATE
          ================================================== */}

          {date ? (
            <AppText
              variant="caption"
              tone="muted"
              numberOfLines={1}
              style={
                styles.date
              }
            >
              {date}
            </AppText>
          ) : null}
        </View>

        {/* ====================================================
            COMMENT
        ==================================================== */}

        {comment ? (
          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={3}
            style={
              styles.comment
            }
          >
            {comment}
          </AppText>
        ) : null}
      </AppCard>
    );
  });

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerReviews({
  rating,
  totalReviews,
  reviews,
}: Props) {
  const safeRating =
    normalizeRating(
      rating,
    );

  const safeTotalReviews =
    normalizeCount(
      totalReviews,
    );

  const ratingLabel =
    getRatingLabel(
      safeRating,
    );

  const visibleReviews =
    Array.isArray(
      reviews,
    )
      ? reviews.slice(
          0,
          MAX_VISIBLE_REVIEWS,
        )
      : [];

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

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

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <AppCard
        role="customer"
        variant="outlined"
        style={
          styles.summary
        }
      >
        <AppText
          variant="heading2"
          weight="bold"
          style={
            styles.bigRating
          }
        >
          {safeRating.toFixed(
            1,
          )}
        </AppText>

        <View
          style={
            styles.summaryText
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
          >
            {ratingLabel}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.summarySub
            }
          >
            {safeTotalReviews}{" "}
            {safeTotalReviews ===
            1
              ? "Review"
              : "Reviews"}
          </AppText>
        </View>
      </AppCard>

      {/* ======================================================
          REVIEWS
      ====================================================== */}

      {visibleReviews.length >
      0 ? (
        <View
          style={
            styles.reviewList
          }
        >
          {visibleReviews.map(
            (
              item,
            ) => (
              <ReviewCard
                key={
                  item.id
                }
                review={
                  item
                }
              />
            ),
          )}
        </View>
      ) : (
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
              Customer reviews will
              appear here after
              completed services.
            </AppText>
          </View>
        </View>
      )}
    </View>
  );
}

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
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summary: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    bigRating: {
      color:
        Colors.warning,
    },

    summaryText: {
      marginLeft:
        FixxamTokens.spacing.md,
    },

    summarySub: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       REVIEW LIST
    ======================================================== */

    reviewList: {
      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       REVIEW CARD
    ======================================================== */

    card: {
      padding:
        FixxamTokens.spacing.md,
    },

    row: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatar: {
      width:
        FixxamTokens.size
          .avatarXs,

      height:
        FixxamTokens.size
          .avatarXs,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    avatarText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       CUSTOMER
    ======================================================== */

    customerInfo: {
      flex: 1,

      minWidth: 0,
    },

    ratingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    starItem: {
      marginRight:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       DATE
    ======================================================== */

    date: {
      maxWidth: 92,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       COMMENT
    ======================================================== */

    comment: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      minHeight:
        FixxamTokens.size
          .cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

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

export default memo(
  WorkerReviews,
);