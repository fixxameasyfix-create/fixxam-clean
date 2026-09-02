import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import {
  CustomerColors,
  WorkerColors,
  Spacing,
} from "@/theme";

type Props = {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "customer" | "worker";
};

export default function AuthHeader({
  title,
  subtitle,
  icon = "person-circle",
  variant = "customer",
}: Props) {
  const primaryColor =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  const secondaryColor =
    variant === "worker"
      ? WorkerColors.textSecondary
      : CustomerColors.textSecondary;

  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={70}
        color={primaryColor}
      />

      <AppText
        size="xxl"
        weight="bold"
        center
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText
        center
        color={secondaryColor}
      >
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },

  title: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
});