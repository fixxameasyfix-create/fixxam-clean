import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import WorkerBadges from "./WorkerBadges";
import WorkerFooter from "./WorkerFooter";
import WorkerHeader from "./WorkerHeader";
import WorkerLocation from "./WorkerLocation";

import type {
  WorkerCardData,
} from "./types";

type Props = {
  worker: WorkerCardData;

  onProfilePress: () => void;

  onBookPress: () => void;
};

function WorkerCard({
  worker,
  onProfilePress,
  onBookPress,
}: Props) {
  const hourlyRate =
    Number.isFinite(
      worker.workerProfile.hourlyRate,
    ) &&
    worker.workerProfile.hourlyRate > 0
      ? worker.workerProfile.hourlyRate
      : undefined;

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

      {/* JOBS / AVAILABILITY / REVIEWS */}

      <WorkerBadges
        worker={worker}
      />

      {/* HOURLY RATE */}

      <WorkerFooter
        hourlyRate={hourlyRate}
        onBook={onBookPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal:
      FixxamTokens.spacing.lg,

    marginVertical:
      FixxamTokens.spacing.sm,

    padding:
      FixxamTokens.spacing.lg,

    borderWidth: 1,

    borderColor:
      Colors.border,

    borderRadius:
      FixxamTokens.radius.lg,

    backgroundColor:
      Colors.surface,

    ...FixxamTokens.shadow.card,
  },
});

export default memo(
  WorkerCard,
);