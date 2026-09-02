import React, { memo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import type {
  WorkerOrderCounts,
} from "@/types/workerOrders";

type Props = {
  counts: WorkerOrderCounts;
  onManage: () => void;
};

type StatTone =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type OverviewStatProps = {
  label: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone: StatTone;
};

const OverviewStat = memo(
  function OverviewStat({
    label,
    count,
    icon,
    tone,
  }: OverviewStatProps) {
    const iconColor =
      tone === "pending"
        ? "#D97706"
        : tone === "active"
          ? "#2563EB"
          : tone === "completed"
            ? "#16A34A"
            : "#DC2626";

    return (
      <View style={styles.stat}>
        <View
          style={[
            styles.statIcon,
            tone === "pending" &&
              styles.statPending,
            tone === "active" &&
              styles.statActive,
            tone === "completed" &&
              styles.statCompleted,
            tone === "cancelled" &&
              styles.statCancelled,
          ]}
        >
          <Ionicons
            name={icon}
            size={17}
            color={iconColor}
          />
        </View>

        <AppText
          weight="bold"
          style={styles.statValue}
        >
          {count}
        </AppText>

        <AppText
          numberOfLines={1}
          style={styles.statLabel}
        >
          {label}
        </AppText>
      </View>
    );
  },
);

function WorkerOrdersOverview({
  counts,
  onManage,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Job overview
          </AppText>

          <AppText style={styles.subtitle}>
            Your service activity
          </AppText>
        </View>

        <Pressable
          onPress={onManage}
          accessibilityRole="button"
          accessibilityLabel="Manage jobs"
          style={({ pressed }) => [
            styles.manageButton,
            pressed &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="settings-outline"
            size={17}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={styles.manageText}
          >
            MANAGE
          </AppText>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <OverviewStat
          label="Requests"
          count={counts.pending}
          icon="time-outline"
          tone="pending"
        />

        <OverviewStat
          label="Active"
          count={counts.active}
          icon="play-circle-outline"
          tone="active"
        />

        <OverviewStat
          label="Done"
          count={counts.completed}
          icon="checkmark-circle-outline"
          tone="completed"
        />

        <OverviewStat
          label="Cancelled"
          count={counts.cancelled}
          icon="close-circle-outline"
          tone="cancelled"
        />
      </View>
    </View>
  );
}

export default memo(
  WorkerOrdersOverview,
);

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 15,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 1,
    fontSize: 9,
    color: "#94A3B8",
  },

  manageButton: {
    height: 37,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  manageText: {
    fontSize: 9,
    color: "#2563EB",
  },

  stats: {
    flexDirection: "row",
    gap: 7,
    marginTop: 11,
  },

  stat: {
    flex: 1,
    minHeight: 77,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  statPending: {
    backgroundColor: "#FFF7E8",
  },

  statActive: {
    backgroundColor: "#EFF6FF",
  },

  statCompleted: {
    backgroundColor: "#ECFDF5",
  },

  statCancelled: {
    backgroundColor: "#FEF2F2",
  },

  statValue: {
    marginTop: 4,
    fontSize: 16,
    lineHeight: 19,
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 1,
    fontSize: 8.5,
    color: "#94A3B8",
  },

  pressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});