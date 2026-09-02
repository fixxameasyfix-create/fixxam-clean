import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  available?: boolean;
  rating?: number;
  location?: string;
};

type StatusChipProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
};

function StatusChip({
  icon,
  color,
  label,
}: StatusChipProps) {
  return (
    <View style={styles.chip}>
      <Ionicons
        name={icon}
        size={14}
        color={color}
      />

      <AppText
        weight="bold"
        style={styles.label}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}

export default function HeaderStatus({
  available = true,
  rating = 0,
  location = "Kano",
}: Props) {
  const safeRating =
    Number.isFinite(Number(rating))
      ? Math.min(
          5,
          Math.max(0, Number(rating)),
        )
      : 0;

  const safeLocation =
    typeof location === "string" &&
    location.trim()
      ? location.trim()
      : "Kano";

  return (
    <View style={styles.container}>
      <StatusChip
        icon="ellipse"
        color="#22C55E"
        label={
          available
            ? "Available"
            : "Offline"
        }
      />

      <StatusChip
        icon="star"
        color="#F59E0B"
        label={safeRating.toFixed(1)}
      />

      <StatusChip
        icon="location"
        color="#3B82F6"
        label={safeLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 7,

    marginTop: 8,
  },

  chip: {
    height: 36,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 11,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 2,
  },

  label: {
    marginLeft: 4,

    fontSize: 11,
    lineHeight: 14,

    color: "#0F172A",
  },
});