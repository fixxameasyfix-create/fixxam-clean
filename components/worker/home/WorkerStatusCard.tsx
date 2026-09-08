import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  Switch,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  rating: number;

  reviewCount: number;

  online: boolean;

  onToggleOnline: (
    value: boolean,
  ) => void;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeRating(
  value: number,
): number {
  if (
    !Number.isFinite(value)
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

function getSafeReviewCount(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerStatusCard({
  rating,
  reviewCount,
  online,
  onToggleOnline,
}: Props) {
  const safeRating =
    useMemo(
      () =>
        getSafeRating(
          rating,
        ),
      [rating],
    );

  const safeReviewCount =
    useMemo(
      () =>
        getSafeReviewCount(
          reviewCount,
        ),
      [reviewCount],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          RATING
      ====================================================== */}

      <View
        style={
          styles.left
        }
      >
        <View
          style={
            styles.ratingIcon
          }
        >
          <AppIcon
            name="star"
            size="sm"
            color={
              Colors.warning
            }
          />
        </View>

        <View>
          <AppText
            variant="heading3"
            weight="bold"
            style={
              styles.rating
            }
          >
            {safeRating.toFixed(
              1,
            )}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.reviewText
            }
          >
            {safeReviewCount}{" "}
            {safeReviewCount ===
            1
              ? "Review"
              : "Reviews"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <View
        style={
          styles.right
        }
      >
        <View
          style={
            styles.statusRow
          }
        >
          <View
            style={[
              styles.statusDot,

              online
                ? styles.onlineDot
                : styles.offlineDot,
            ]}
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.statusText
            }
          >
            {online
              ? "Online"
              : "Offline"}
          </AppText>
        </View>

        <Switch
          value={
            online
          }
          onValueChange={
            onToggleOnline
          }
          trackColor={{
            false:
              Colors.disabled,

            true:
              WorkerColors.primarySoft,
          }}
          thumbColor={
            online
              ? WorkerColors.primary
              : Colors.surface
          }
          ios_backgroundColor={
            Colors.disabled
          }
          accessibilityRole="switch"
          accessibilityLabel="Worker availability"
          accessibilityState={{
            checked:
              online,
          }}
          style={
            styles.switch
          }
        />
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerStatusCard.displayName =
  "WorkerStatusCard";

export default memo(
  WorkerStatusCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      minHeight: 74,

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       RATING
    ======================================================== */

    left: {
      flex: 1,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    ratingIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.warningSoft,
    },

    rating: {
      color:
        Colors.textPrimary,
    },

    reviewText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    right: {
      alignItems:
        "flex-end",

      justifyContent:
        "center",
    },

    statusRow: {
      marginBottom:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    statusDot: {
      width: 8,

      height: 8,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    onlineDot: {
      backgroundColor:
        Colors.success,
    },

    offlineDot: {
      backgroundColor:
        Colors.textMuted,
    },

    statusText: {
      color:
        Colors.textPrimary,
    },

    switch: {
      transform: [
        {
          scaleX: 0.78,
        },
        {
          scaleY: 0.78,
        },
      ],
    },
  });