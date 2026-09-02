import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import {
  WorkerBadges,
  WorkerFooter,
  WorkerHeader,
  WorkerLocation,
} from "./";

import type {
  WorkerCardData,
} from "./types";

type Props = {
  worker: WorkerCardData;
  onProfilePress: () => void;
  onBookPress: () => void;
};

export default function WorkerCard({
  worker,
  onProfilePress,
  onBookPress,
}: Props) {
  return (
    <View style={styles.card}>

      {/* NAME + PHOTO */}
      <WorkerHeader
        worker={worker}
        onProfilePress={onProfilePress}
      />

      {/* LOCATION — KAR A TAƁA */}
      <WorkerLocation
        worker={worker}
      />

      {/* JOBS / AVAILABLE / REVIEWS */}
      <WorkerBadges
        worker={worker}
      />

      {/* HOURLY RATE */}
      <WorkerFooter
        hourlyRate={
          Number(
            worker.workerProfile?.hourlyRate ?? 0,
          )
        }
        onBook={onBookPress}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,

    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },
});