import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  jobs?: number | null;

  completed?: number | null;

  rating?: number | null;

  earnings?: number | null;
};

type StatItem = {
  label: string;

  value: string;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeCount(
  value: number | null | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return Math.floor(value);
}

function normalizeRating(
  value: number | null | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 0;
  }

  return Math.min(
    5,
    value,
  );
}

function normalizeEarnings(
  value: number | null | undefined,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerStats({
  jobs,
  completed,
  rating,
  earnings,
}: Props) {
  const stats =
    useMemo<StatItem[]>(
      () => {
        const safeJobs =
          normalizeCount(
            jobs,
          );

        const safeCompleted =
          normalizeCount(
            completed,
          );

        const safeRating =
          normalizeRating(
            rating,
          );

        const safeEarnings =
          normalizeEarnings(
            earnings,
          );

        return [
          {
            label: "Jobs",

            value:
              safeJobs.toLocaleString(),
          },

          {
            label: "Completed",

            value:
              safeCompleted.toLocaleString(),
          },

          {
            label: "Rating",

            value:
              safeRating > 0
                ? safeRating.toFixed(
                    1,
                  )
                : "New",
          },

          {
            label: "Earnings",

            value: `₦${safeEarnings.toLocaleString()}`,
          },
        ];
      },
      [
        jobs,
        completed,
        rating,
        earnings,
      ],
    );

  return (
    <AppCard
      role="worker"
      style={styles.card}
    >
      {stats.map(
        (
          item,
          index,
        ) => (
          <React.Fragment
            key={item.label}
          >
            {index > 0 ? (
              <View
                style={
                  styles.divider
                }
              />
            ) : null}

            <View
              style={
                styles.item
              }
              accessible
              accessibilityLabel={`${item.label}: ${item.value}`}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.value
                }
              >
                {item.value}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.label
                }
              >
                {item.label}
              </AppText>
            </View>
          </React.Fragment>
        ),
      )}
    </AppCard>
  );
}

export default memo(
  WorkerStats,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginHorizontal: 0,

      marginTop: 0,

      marginBottom: 0,

      minHeight: 88,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       STAT
    ======================================================== */

    item: {
      flex: 1,

      minWidth: 0,

      alignItems: "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxs,
    },

    value: {
      textAlign: "center",

      color:
        WorkerColors.primary,
    },

    label: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign: "center",

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      width: 1,

      height: 38,

      backgroundColor:
        Colors.divider,
    },
  });