import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  status: string;
};

const statusColor = {
  pending: "#F59E0B",
  pending_estimate: "#F59E0B",
  negotiating: "#FB923C",
  accepted: "#2563EB",
  started: "#2563EB",
  in_progress: "#2563EB",
  completed: "#22C55E",
  cancelled: "#EF4444",
} as const;

function getStatusLabel(
  status: string,
) {
  switch (status) {
    case "pending_estimate":
      return "Waiting Estimate";

    case "pending":
      return "Pending";

    case "negotiating":
      return "Negotiating";

    case "accepted":
      return "Accepted";

    case "in_progess":
    case "in_progress":
      return "In Progress";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function getStatusIcon(
  status: string,
) {
  switch (status) {
    case "completed":
      return "checkmark-circle";

    case "accepted":
      return "checkmark-done-circle";

    case "negotiating":
      return "swap-horizontal";

    case "pending":
    case "pending_estimate":
      return "time";

    case "started":
    case "in_progress":
      return "construct";

    case "cancelled":
      return "close-circle";

    default:
      return "ellipse";
  }
}

export default function OrderStatusBadge({
  status,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            statusColor[
              status as keyof typeof statusColor
            ] || "#CBD5E1",
        },
      ]}
    >
      <Ionicons
        name={
          getStatusIcon(status) as any
        }
        size={12}
        color="#FFFFFF"
      />

      <AppText style={styles.text}>
        {getStatusLabel(status)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 999,
  },

  text: {
    marginLeft: 5,

    color: "#FFFFFF",

    fontSize: 11,

    fontWeight: "700",
  },
});