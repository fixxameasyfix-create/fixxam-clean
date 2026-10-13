import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  WorkerCardData,
} from "./types";

type Props = {
  worker: WorkerCardData;
};

function normalizeCount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

function normalizeRating(
  value: unknown,
): number | null {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return Math.min(
    5,
    Math.max(
      0,
      parsed,
    ),
  );
}

function WorkerBadges({
  worker,
}: Props) {
  const completedJobs =
    normalizeCount(
      worker.completedJobs,
    );

  const workerRating =
    normalizeRating(
      worker.rating,
    );

  return (
    <View style={styles.container}>
      {/* JOBS */}

      <View
        style={[
          styles.badge,
          styles.jobsBadge,
        ]}
      >
        <AppIcon
          name="jobs"
          role="customer"
          size="xs"
          state="active"
        />

        <AppText
          variant="caption"
          weight="semibold"
          numberOfLines={1}
          style={styles.jobsText}
        >
          {completedJobs}{" "}
          {completedJobs === 1
            ? "Job"
            : "Jobs"}
        </AppText>
      </View>

      {/* AVAILABILITY */}

      <View
        style={[
          styles.badge,
          worker.online
            ? styles.onlineBadge
            : styles.offlineBadge,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            worker.online
              ? styles.onlineDot
              : styles.offlineDot,
          ]}
        />

        <AppText
          variant="caption"
          weight="semibold"
          numberOfLines={1}
          style={
            worker.online
              ? styles.onlineText
              : styles.offlineText
          }
        >
          {worker.online
            ? "Available"
            : "Offline"}
        </AppText>
      </View>

      {/* WORKER RATING */}

      <View
        style={[
          styles.badge,
          styles.ratingBadge,
        ]}
      >
        <AppIcon
          name="star"
          role="customer"
          size="xs"
          color={Colors.warning}
        />

        <AppText
          variant="caption"
          weight="semibold"
          numberOfLines={1}
          style={styles.ratingText}
        >
          {workerRating !== null
            ? workerRating.toFixed(1)
            : "New"}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.xs,

    marginTop:
      FixxamTokens.spacing.md,
  },

  badge: {
    flex: 1,

    minWidth: 0,
    minHeight: 32,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    paddingVertical:
      FixxamTokens.spacing.xs,

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.chip,
  },

  /* JOBS */

  jobsBadge: {
    borderColor:
      Colors.border,

    backgroundColor:
      CustomerColors.primarySoft,
  },

  jobsText: {
    marginLeft:
      FixxamTokens.spacing.xs,

    color:
      CustomerColors.primary,
  },

  /* ONLINE */

  onlineBadge: {
    borderColor:
      Colors.successSoft,

    backgroundColor:
      Colors.successSoft,
  },

  onlineText: {
    marginLeft:
      FixxamTokens.spacing.xs,

    color:
      Colors.success,
  },

  onlineDot: {
    backgroundColor:
      Colors.success,
  },

  /* OFFLINE */

  offlineBadge: {
    borderColor:
      Colors.border,

    backgroundColor:
      Colors.disabledBackground,
  },

  offlineText: {
    marginLeft:
      FixxamTokens.spacing.xs,

    color:
      Colors.textSecondary,
  },

  offlineDot: {
    backgroundColor:
      Colors.textMuted,
  },

  statusDot: {
    width: 8,
    height: 8,

    borderRadius:
      FixxamTokens.radius.full,
  },

  /* RATING */

  ratingBadge: {
    borderColor:
      Colors.border,

    backgroundColor:
      Colors.warningSoft,
  },

  ratingText: {
    marginLeft:
      FixxamTokens.spacing.xs,

    color:
      Colors.textPrimary,
  },
});

export default memo(
  WorkerBadges,
);