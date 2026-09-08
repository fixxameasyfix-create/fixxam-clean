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

export interface JobCardSkeletonProps {
  style?: StyleProp<ViewStyle>;
}

function JobCardSkeleton({
  style,
}: JobCardSkeletonProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading job"
      style={[
        styles.card,
        style,
      ]}
    >
      <View style={styles.row}>
        <SkeletonBox
          width={56}
          height={56}
          borderRadius={
            FixxamTokens.radius.lg
          }
        />

        <View style={styles.content}>
          <SkeletonBox
            width="72%"
            height={18}
            borderRadius={
              FixxamTokens.radius.sm
            }
          />

          <SkeletonBox
            width="52%"
            height={14}
            borderRadius={
              FixxamTokens.radius.sm
            }
          />

          <SkeletonBox
            width={96}
            height={14}
            borderRadius={
              FixxamTokens.radius.sm
            }
          />
        </View>
      </View>

      <View style={styles.footer}>
        <SkeletonBox
          width="42%"
          height={14}
          borderRadius={
            FixxamTokens.radius.sm
          }
        />

        <SkeletonBox
          width={72}
          height={28}
          borderRadius={
            FixxamTokens.radius.badge
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",

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
    alignItems: "flex-start",
  },

  content: {
    flex: 1,

    marginLeft:
      FixxamTokens.spacing.md,

    gap:
      FixxamTokens.spacing.sm,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop:
      FixxamTokens.spacing.lg,
  },
});

export default memo(JobCardSkeleton);