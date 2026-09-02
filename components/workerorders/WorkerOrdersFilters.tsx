import React, { memo } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import type {
  WorkerFilterType,
  WorkerOrderCounts,
} from "@/types/workerOrders";

type Props = {
  selectedFilter: WorkerFilterType;
  counts: WorkerOrderCounts;
  totalJobs: number;
  onChange: (
    filter: WorkerFilterType,
  ) => void;
};

const FILTERS: {
  key: WorkerFilterType;
  label: string;
}[] = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "pending",
    label: "New Requests",
  },
  {
    key: "active",
    label: "Active",
  },
  {
    key: "completed",
    label: "Done",
  },
  {
    key: "cancelled",
    label: "Cancelled",
  },
];

function WorkerOrdersFilters({
  selectedFilter,
  counts,
  totalJobs,
  onChange,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={
        styles.container
      }
    >
      {FILTERS.map((filter) => {
        const active =
          selectedFilter ===
          filter.key;

        const count =
          getFilterCount(
            filter.key,
            counts,
            totalJobs,
          );

        return (
          <Pressable
            key={filter.key}
            onPress={() =>
              onChange(
                filter.key,
              )
            }
            accessibilityRole="button"
            accessibilityState={{
              selected: active,
            }}
            style={[
              styles.button,
              active &&
                styles.buttonActive,
            ]}
          >
            <AppText
              weight={
                active
                  ? "bold"
                  : "regular"
              }
              style={[
                styles.text,
                active &&
                  styles.textActive,
              ]}
            >
              {filter.label}
            </AppText>

            <View
              style={[
                styles.count,
                active &&
                  styles.countActive,
              ]}
            >
              <AppText
                weight="bold"
                style={[
                  styles.countText,
                  active &&
                    styles.countTextActive,
                ]}
              >
                {count}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function getFilterCount(
  filter: WorkerFilterType,
  counts: WorkerOrderCounts,
  totalJobs: number,
): number {
  switch (filter) {
    case "pending":
      return counts.pending;

    case "active":
      return counts.active;

    case "completed":
      return counts.completed;

    case "cancelled":
      return counts.cancelled;

    case "all":
    default:
      return totalJobs;
  }
}

export default memo(
  WorkerOrdersFilters,
);

const styles = StyleSheet.create({
  container: {
    gap: 7,
    paddingTop: 11,
    paddingBottom: 12,
  },

  button: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  buttonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  text: {
    fontSize: 10,
    color: "#334155",
  },

  textActive: {
    color: "#FFFFFF",
  },

  count: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  countActive: {
    backgroundColor:
      "rgba(255,255,255,0.20)",
  },

  countText: {
    fontSize: 8,
    color: "#64748B",
  },

  countTextActive: {
    color: "#FFFFFF",
  },
});