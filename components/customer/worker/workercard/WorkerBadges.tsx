import React from "react";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import type { WorkerCardData } from "./types";

type Props = {
  worker: WorkerCardData;
};

export default function WorkerBadges({ worker }: Props) {
  return (
    <View style={styles.container}>
      <Badge
        icon="briefcase-outline"
        text={`${worker.completedJobs ?? 0} Jobs`}
      />

      <Badge
        icon="ellipse"
        text={worker.online ? "Available" : "Offline"}
        color={worker.online ? "#22C55E" : "#94A3B8"}
      />

      <Badge
        icon="star"
        text={`${worker.totalReviews ?? 0} Reviews`}
        color="#F59E0B"
      />
    </View>
  );
}

type BadgeProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
};

function Badge({
  icon,
  text,
  color = "#2563EB",
}: BadgeProps) {
  return (
    <View style={styles.badge}>
      <Ionicons
        name={icon}
        size={14}
        color={color}
      />

      <AppText style={styles.badgeText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    flex: 1,

    paddingVertical: 8,
    paddingHorizontal: 10,

    borderRadius: 999,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  badgeText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
});