import React, { memo } from "react";

import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import SkeletonBox from "./SkeletonBox";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

export interface ProductCardSkeletonProps {
  width?: number;
  style?: StyleProp<ViewStyle>;
}

function ProductCardSkeleton({
  width = 156,
  style,
}: ProductCardSkeletonProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading product"
      style={[
        styles.card,
        { width },
        style,
      ]}
    >
      <SkeletonBox
        height={112}
        borderRadius={
          FixxamTokens.radius.image
        }
      />

      <View style={styles.content}>
        <SkeletonBox
          height={16}
          width="82%"
          borderRadius={
            FixxamTokens.radius.sm
          }
        />

        <SkeletonBox
          height={14}
          width="58%"
          borderRadius={
            FixxamTokens.radius.sm
          }
        />

        <SkeletonBox
          height={18}
          width="46%"
          borderRadius={
            FixxamTokens.radius.sm
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      Colors.surface,

    borderRadius:
      FixxamTokens.radius.card,

    padding:
      FixxamTokens.spacing.md,

    borderWidth:
      StyleSheet.hairlineWidth,

    borderColor:
      Colors.border,
  },

  content: {
    gap:
      FixxamTokens.spacing.sm,

    marginTop:
      FixxamTokens.spacing.md,
  },
});

export default memo(ProductCardSkeleton);