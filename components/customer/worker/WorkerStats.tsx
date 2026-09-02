import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  experience: string;
  state: string;
  lga: string;
  hourlyRate: number;
  completedJobs?: number;
};

type StatItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  value: string;
};

function StatItem({
  icon,
  color,
  title,
  value,
}: StatItemProps) {
  return (
    <View style={styles.item}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${color}15`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={15}
          color={color}
        />
      </View>

      <AppText
        weight="semibold"
        style={styles.title}
        numberOfLines={1}
      >
        {title}
      </AppText>

      <AppText
        weight="bold"
        style={styles.value}
        numberOfLines={1}
      >
        {value}
      </AppText>
    </View>
  );
}

export default function WorkerStats({
  experience,
  state,
  lga,
  hourlyRate,
  completedJobs = 0,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <StatItem
          icon="briefcase-outline"
          color="#2563EB"
          title="Experience"
          value={experience || "0"}
        />

        <View style={styles.divider} />

        <StatItem
          icon="cash-outline"
          color="#F97316"
          title="Rate"
          value={`₦${hourlyRate.toLocaleString()}/hr`}
        />

        <View style={styles.divider} />

        <StatItem
          icon="checkmark-done-circle-outline"
          color="#22C55E"
          title="Jobs"
          value={`${completedJobs}`}
        />

        <View style={styles.divider} />

        <StatItem
          icon="location-outline"
          color="#8B5CF6"
          title="Location"
          value={lga || state || "-"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginTop: -22,
    marginBottom: 10,
    zIndex: 10,
  },

  card: {
    minHeight: 72,

    flexDirection: "row",
    alignItems: "stretch",

    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  item: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 8,
    paddingHorizontal: 3,
  },

  divider: {
    width: 1,
    marginVertical: 12,
    backgroundColor: "#E5E7EB",
  },

  iconContainer: {
    width: 28,
    height: 28,

    borderRadius: 9,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 4,
  },

  title: {
    maxWidth: "100%",

    fontSize: 8.5,
    lineHeight: 11,

    color: "#64748B",

    textAlign: "center",
  },

  value: {
    maxWidth: "100%",

    marginTop: 2,

    fontSize: 10.5,
    lineHeight: 14,

    color: "#0F172A",

    textAlign: "center",
  },
});