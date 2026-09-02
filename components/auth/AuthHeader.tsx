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
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: `${primaryColor}12`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={30}
          color={primaryColor}
        />
      </View>

      <AppText
        weight="bold"
        center
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText
        center
        style={[
          styles.subtitle,
          {
            color: secondaryColor,
          },
        ]}
      >
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",

    paddingTop: 6,
    paddingBottom: 18,

    paddingHorizontal: 20,
  },

  iconBox: {
    width: 56,
    height: 56,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",

    color: "#0B2D6B",

    textAlign: "center",

    letterSpacing: 0.3,

    marginBottom: 5,
  },

  subtitle: {
    fontSize: 13,

    lineHeight: 20,

    textAlign: "center",

    paddingHorizontal: 28,
  },
});