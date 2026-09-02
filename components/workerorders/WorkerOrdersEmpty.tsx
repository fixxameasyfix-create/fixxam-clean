import React, { memo } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import type {
  WorkerFilterType,
} from "@/types/workerOrders";

type WorkerOrdersEmptyProps = {
  filter: WorkerFilterType;
};

function WorkerOrdersEmpty({
  filter,
}: WorkerOrdersEmptyProps) {
  const content =
    getEmptyContent(filter);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="briefcase-outline"
          size={26}
          color="#2563EB"
        />
      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        {content.title}
      </AppText>

      <AppText
        center
        style={styles.description}
      >
        {content.description}
      </AppText>
    </View>
  );
}

function getEmptyContent(
  filter: WorkerFilterType,
) {
  switch (filter) {
    case "pending":
      return {
        title: "No new requests",
        description:
          "New customer requests assigned to you will appear here.",
      };

    case "active":
      return {
        title: "No active jobs",
        description:
          "Accepted and ongoing jobs will appear here.",
      };

    case "completed":
      return {
        title: "No completed jobs",
        description:
          "Jobs you complete will appear here.",
      };

    case "cancelled":
      return {
        title: "No cancelled jobs",
        description:
          "Cancelled jobs will appear here.",
      };

    case "all":
    default:
      return {
        title: "No jobs yet",
        description:
          "Customer service requests assigned to you will appear here.",
      };
  }
}

export default memo(
  WorkerOrdersEmpty,
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 55,
    paddingHorizontal: 25,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 12,
    fontSize: 15,
    color: "#0F172A",
  },

  description: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 15,
    color: "#64748B",
  },
});