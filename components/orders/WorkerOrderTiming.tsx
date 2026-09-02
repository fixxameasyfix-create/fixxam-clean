import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  urgent: boolean;
  date?: string | null;
  time?: string | null;
};

const WorkerOrderTiming = memo(
  function WorkerOrderTiming({
    urgent,
    date,
    time,
  }: Props) {
    return (
      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <View style={styles.info}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            {urgent
              ? "AS SOON AS POSSIBLE"
              : date ||
                "Scheduled service"}
          </AppText>

          <AppText
            style={styles.subtitle}
          >
            {urgent
              ? "Customer needs the service as soon as possible."
              : time ||
                "Scheduled time unavailable"}
          </AppText>
        </View>
      </View>
    );
  },
);

WorkerOrderTiming.displayName =
  "WorkerOrderTiming";

export default WorkerOrderTiming;

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    padding: 11,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontSize: 11.5,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 9.5,
    lineHeight: 15,
    color: "#64748B",
  },
});