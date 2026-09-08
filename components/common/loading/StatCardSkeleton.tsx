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

export interface StatCardSkeletonProps {
  style?: StyleProp<ViewStyle>;
}

function StatCardSkeleton({
  style,
}: StatCardSkeletonProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading statistics"
      style={[
        styles.card,
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <SkeletonBox
            width={72}
            height={30}
            borderRadius={
              FixxamTokens.radius.sm
            }
          />

          <SkeletonBox
            width={92}
            height={14}
            borderRadius={
              FixxamTokens.radius.sm
            }
          />
        </View>

        <SkeletonBox
          width={52}
          height={52}
          borderRadius={
            FixxamTokens.radius.lg
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    minWidth: 0,

    backgroundColor:
      Colors.surface,

    borderRadius:
      FixxamTokens.radius.card,

    padding:
      FixxamTokens.spacing.card,

    borderWidth:
      StyleSheet.hairlineWidth,

    borderColor:
      Colors.border,
  },

  row: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  content: {
    flex: 1,

    marginRight:
      FixxamTokens.spacing.md,

    gap:
      FixxamTokens.spacing.sm,
  },
});

export default memo(StatCardSkeleton);