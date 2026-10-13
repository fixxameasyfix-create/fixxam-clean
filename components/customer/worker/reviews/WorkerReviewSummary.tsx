import React, {
  memo,
  useMemo,
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
  FixxamTokens,
} from "@/theme";

import {
  getRatingLabel,
  normalizeCount,
  normalizeRating,
} from "./reviewUtils";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  rating: number;

  totalReviews: number;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerReviewSummary({
  rating,
  totalReviews,
}: Props) {
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

  const ratingLabel =
    useMemo(
      () =>
        getRatingLabel(
          safeRating,
        ),
      [
        safeRating,
      ],
    );

  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.summary
      }
    >
      {/* RATING */}

      <View
        style={
          styles.summaryRating
        }
      >
        <AppIcon
          name="star"
          role="customer"
          size="md"
          color={
            Colors.warning
          }
        />

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
      </View>

      {/* INFO */}

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
  );
}

/* ==============================================================
   EXPORT
============================================================== */

const MemoizedWorkerReviewSummary =
  memo(
    WorkerReviewSummary,
  );

MemoizedWorkerReviewSummary.displayName =
  "WorkerReviewSummary";

export default MemoizedWorkerReviewSummary;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    summary: {
      minHeight:
        FixxamTokens.size.cardMinHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    summaryRating: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    bigRating: {
      marginLeft:
        FixxamTokens.spacing.xs,

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
  });