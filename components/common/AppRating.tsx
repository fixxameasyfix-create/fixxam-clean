import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

export interface AppRatingProps {
  rating: number;

  reviews?: number;

  /*
   * Number remains supported
   * for existing screens.
   */
  size?: number;
}

function AppRating({
  rating,
  reviews,
  size = FixxamTokens.size.iconXs,
}: AppRatingProps) {
  const safeRating = Number.isFinite(rating)
    ? Math.min(5, Math.max(0, rating))
    : 0;

  const safeReviews =
    reviews !== undefined
      ? Math.max(0, Math.floor(reviews))
      : undefined;

  const accessibilityLabel =
    safeReviews !== undefined
      ? `${safeRating.toFixed(1)} out of 5 stars, ${safeReviews} reviews`
      : `${safeRating.toFixed(1)} out of 5 stars`;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      style={styles.container}
    >
      <AppIcon
        name="star"
        size={size}
        color={Colors.warning}
        strokeWidth="strong"
      />

      <AppText
        variant="bodyMedium"
        style={styles.rating}
      >
        {safeRating.toFixed(1)}
      </AppText>

      {safeReviews !== undefined ? (
        <AppText
          variant="caption"
          tone="secondary"
          style={styles.reviews}
        >
          ({safeReviews})
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },

  rating: {
    marginLeft:
      FixxamTokens.spacing.xs,
  },

  reviews: {
    marginLeft:
      FixxamTokens.spacing.xs,
  },
});

export default memo(AppRating);