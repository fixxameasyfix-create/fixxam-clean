import React from "react";
import { StyleSheet, View } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  verified: boolean;
  online: boolean;
  completedJobs?: number;
  arrivalTime?: string;
};

export default function WorkerBadges({
  verified,
  online,
  completedJobs,
  arrivalTime,
}: Props) {
  return (
    <View style={styles.container}>
      {verified && (
        <View style={[styles.badge, styles.verified]}>
          <Ionicons
            name="checkmark-circle"
            size={14}
            color="#16A34A"
          />

          <AppText style={styles.verifiedText}>
            Verified
          </AppText>
        </View>
      )}

      <View
        style={[
          styles.badge,
          online
            ? styles.available
            : styles.offline,
        ]}
      >
        <View
          style={[
            styles.dot,
            {
              backgroundColor: online
                ? "#22C55E"
                : "#EF4444",
            },
          ]}
        />

        <AppText
          style={[
            styles.statusText,
            {
              color: online
                ? "#166534"
                : "#991B1B",
            },
          ]}
        >
          {online ? "Available" : "Offline"}
        </AppText>
      </View>

      {arrivalTime && (
        <View style={[styles.badge, styles.arrival]}>
          <Ionicons
            name="time-outline"
            size={14}
            color="#2563EB"
          />

          <AppText style={styles.arrivalText}>
            {arrivalTime}
          </AppText>
        </View>
      )}

      {completedJobs !== undefined && (
        <View style={[styles.badge, styles.jobs]}>
          <Ionicons
            name="briefcase-outline"
            size={14}
            color="#7C3AED"
          />

          <AppText style={styles.jobsText}>
            {completedJobs} Jobs
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  verified: {
    backgroundColor: "#ECFDF5",
  },

  available: {
    backgroundColor: "#DCFCE7",
  },

  offline: {
    backgroundColor: "#FEE2E2",
  },

  arrival: {
    backgroundColor: "#DBEAFE",
  },

  jobs: {
    backgroundColor: "#F3E8FF",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  verifiedText: {
    color: "#16A34A",
    fontSize: 11,
  },

  statusText: {
    fontSize: 11,
  },

  arrivalText: {
    marginLeft: 4,
    color: "#2563EB",
    fontSize: 11,
  },

  jobsText: {
    marginLeft: 4,
    color: "#7C3AED",
    fontSize: 11,
  },
});