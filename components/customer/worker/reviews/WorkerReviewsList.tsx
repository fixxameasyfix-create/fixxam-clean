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
  totalReviews: number;

  onViewAll: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerReviewsList({
  totalReviews,
  onViewAll,
}: Props) {
  const safeTotalReviews =
    Number.isFinite(
      totalReviews,
    )
      ? Math.max(
          0,
          Math.floor(
            totalReviews,
          ),
        )
      : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="See other people's reviews"
      accessibilityHint="Opens all customer reviews for this provider"
      onPress={
        onViewAll
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
      {/* ICON */}

      <View
        style={
          styles.iconBox
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
      </View>

      {/* CONTENT */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
        >
          See other people&apos;s reviews
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.description
          }
        >
          View what customers say about this provider.
        </AppText>

        <AppText
          variant="caption"
          weight="semibold"
          style={
            styles.count
          }
        >
          {safeTotalReviews}{" "}
          {safeTotalReviews ===
          1
            ? "Review"
            : "Reviews"}
        </AppText>
      </View>

      {/* ARROW */}

      <View
        style={
          styles.arrowBox
        }
      >
        <AppIcon
          name="next"
          role="customer"
          size="sm"
          color={
            CustomerColors.primary
          }
        />
      </View>
    </Pressable>
  );
}

/* ==============================================================
   EXPORT
============================================================== */

const MemoizedWorkerReviewsList =
  memo(
    WorkerReviewsList,
  );

MemoizedWorkerReviewsList.displayName =
  "WorkerReviewsList";

export default MemoizedWorkerReviewsList;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      minHeight: 82,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

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

      ...FixxamTokens.shadow.card,
    },

    cardPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width: 42,

      height: 42,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    description: {
      marginTop: 2,

      lineHeight: 17,
    },

    count: {
      marginTop: 3,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       ARROW
    ======================================================== */

    arrowBox: {
      width: 30,

      height: 40,

      flexShrink: 0,

      alignItems:
        "flex-end",

      justifyContent:
        "center",

      marginLeft:
        FixxamTokens.spacing.xs,
    },
  });