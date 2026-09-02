import React from "react";
import { View } from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import StatusHeader from "./StatusHeader";
import styles from "./styles";

type Props = {
  estimatedArrival?: string;
  arrived?: boolean;
};

export default function WorkerOnTheWay({
  estimatedArrival,
  arrived = false,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <StatusHeader
        icon={
          arrived
            ? "location-outline"
            : "car-outline"
        }
        color={
          arrived
            ? "#16A34A"
            : "#2563EB"
        }
        title={
          arrived
            ? "Worker has arrived"
            : "Worker is on the way"
        }
        description={
          arrived
            ? "The worker has arrived at your location and is ready to begin the job."
            : "The worker has started travelling to your location."
        }
      />

      {!arrived && estimatedArrival ? (
        <View style={styles.section}>
          <AppText style={styles.label}>
            Estimated Arrival
          </AppText>

          <AppText style={styles.message}>
            {estimatedArrival}
          </AppText>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: arrived
              ? "#DCFCE7"
              : "#DBEAFE",
          },
        ]}
      >
        <AppText
          style={[
            styles.statusText,
            {
              color: arrived
                ? "#15803D"
                : "#1D4ED8",
            },
          ]}
        >
          {arrived
            ? "The worker is waiting to begin the job."
            : "Please keep your phone nearby."}
        </AppText>
      </View>
    </AppCard>
  );
}