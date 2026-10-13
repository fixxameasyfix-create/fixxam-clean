import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import type {
  WorkerOrderCounts,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  counts: WorkerOrderCounts;

  /**
   * @deprecated
   * Job management now lives in WorkerOrdersHeader.
   * Kept temporarily to avoid breaking existing callers.
   */
  onManage?: () => void;
};

type StatItemProps = {
  label: string;
  count: number;
  color: string;
};

/* ==============================================================
   STAT ITEM
============================================================== */

const StatItem = memo(
  function StatItem({
    label,
    count,
    color,
  }: StatItemProps) {
    return (
      <View
        style={styles.statItem}
        accessibilityLabel={`${count} ${label}`}
      >
        <View
          style={[
            styles.dot,
            {
              backgroundColor: color,
            },
          ]}
        />

        <AppText
          variant="body"
          weight="semibold"
          style={[
            styles.statCount,
            {
              color,
            },
          ]}
        >
          {count}
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          numberOfLines={1}
          style={styles.statLabel}
        >
          {label}
        </AppText>
      </View>
    );
  },
);

StatItem.displayName =
  "WorkerOrdersOverviewStatItem";

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrdersOverview({
  counts,
}: Props) {
  const totalJobs =
    counts.pending +
    counts.active +
    counts.completed +
    counts.cancelled;

  return (
    <View style={styles.container}>
      {/* ========================================================
          TOTAL
      ======================================================== */}

      <AppText
        variant="heading3"
        weight="semibold"
        style={styles.total}
        accessibilityLabel={`${totalJobs} total jobs`}
      >
        {totalJobs} jobs
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.subtitle}
      >
        Your service activity
      </AppText>

      {/* ========================================================
          STATUS SUMMARY
      ======================================================== */}

      <View style={styles.stats}>
        <StatItem
          label="New requests"
          count={counts.pending}
          color={Colors.warning}
        />

        <StatItem
          label="Active"
          count={counts.active}
          color={Colors.info}
        />

        <StatItem
          label="Completed"
          count={counts.completed}
          color={Colors.success}
        />

        <StatItem
          label="Cancelled"
          count={counts.cancelled}
          color={Colors.error}
        />
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerOrdersOverview.displayName =
  "WorkerOrdersOverview";

export default memo(
  WorkerOrdersOverview,
);

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    width: "100%",

    paddingVertical:
      FixxamTokens.spacing.sm,
  },

  total: {
    color:
      Colors.textPrimary,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.xxs,

    color:
      Colors.textSecondary,
  },

  stats: {
    marginTop:
      FixxamTokens.spacing.md,

    flexDirection: "row",

    flexWrap: "wrap",

    rowGap:
      FixxamTokens.spacing.sm,
  },

  statItem: {
    width: "50%",

    minHeight:
      FixxamTokens.size.minimumTouchTarget,

    paddingRight:
      FixxamTokens.spacing.sm,

    flexDirection: "row",

    alignItems: "center",
  },

  dot: {
    width: 8,

    height: 8,

    flexShrink: 0,

    borderRadius: 4,
  },

  statCount: {
    marginLeft:
      FixxamTokens.spacing.xs,

    flexShrink: 0,
  },

  statLabel: {
    marginLeft:
      FixxamTokens.spacing.xs,

    flexShrink: 1,

    color:
      Colors.textSecondary,
  },
});