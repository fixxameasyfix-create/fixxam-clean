import React from "react";
import {
  View,
  ViewProps,
  StyleSheet,
} from "react-native";

import {
  CustomerColors,
  FixxamColors,
  FixxamTokens,
} from "@/theme";

interface AppCardProps extends ViewProps {}

export default function AppCard({
  style,
  children,
  ...props
}: AppCardProps) {
  return (
    <View
      {...props}
      style={[styles.card, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FixxamColors.white,

    borderRadius: FixxamTokens.radius.md,

    paddingHorizontal: FixxamTokens.spacing.lg,
    paddingVertical: FixxamTokens.spacing.lg,

    borderWidth: 1,
    borderColor: CustomerColors.border,

    ...FixxamTokens.shadow.card,
  },
});