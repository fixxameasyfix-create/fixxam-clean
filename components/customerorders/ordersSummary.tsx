import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export type OrderCounts = {
  pending: number;

  active: number;

  completed: number;

  cancelled: number;
};

type Props = {
  counts: OrderCounts;

  authenticated: boolean;

  onManage: () => void;
};

type StatTone =
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

type StatProps = {
  label: string;

  value: number;

  tone: StatTone;
};

/* ==============================================================
   HELPERS
============================================================== */

function safeCount(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      value,
    ),
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function OrderSummary({
  counts,
}: Props) {
  const safeCounts =
    useMemo(
      () => ({
        pending:
          safeCount(
            counts.pending,
          ),

        active:
          safeCount(
            counts.active,
          ),

        completed:
          safeCount(
            counts.completed,
          ),

        cancelled:
          safeCount(
            counts.cancelled,
          ),
      }),
      [
        counts.active,
        counts.cancelled,
        counts.completed,
        counts.pending,
      ],
    );

  const total =
    useMemo(
      () =>
        safeCounts.pending +
        safeCounts.active +
        safeCounts.completed +
        safeCounts.cancelled,
      [
        safeCounts,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          TOTAL
      ====================================================== */}

      <View
        style={
          styles.heading
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
        >
          {total}{" "}
          {total === 1
            ? "order"
            : "orders"}
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.subtitle
          }
        >
          Your service requests
        </AppText>
      </View>

      {/* ======================================================
          COMPACT STATS
      ====================================================== */}

      <View
        style={
          styles.stats
        }
      >
        <Stat
          label="Pending"
          value={
            safeCounts.pending
          }
          tone="pending"
        />

        <Stat
          label="Active"
          value={
            safeCounts.active
          }
          tone="active"
        />

        <Stat
          label="Completed"
          value={
            safeCounts.completed
          }
          tone="completed"
        />

        <Stat
          label="Cancelled"
          value={
            safeCounts.cancelled
          }
          tone="cancelled"
        />
      </View>
    </View>
  );
}

export default memo(
  OrderSummary,
);

/* ==============================================================
   STAT
============================================================== */

const Stat =
  memo(
    function Stat({
      label,
      value,
      tone,
    }: StatProps) {
      const color =
        getToneColor(
          tone,
        );

      return (
        <View
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${label}: ${value}`}
          style={
            styles.stat
          }
        >
          <View
            style={[
              styles.dot,

              {
                backgroundColor:
                  color,
              },
            ]}
          />

          <AppText
            variant="caption"
            weight="bold"
            style={{
              color,
            }}
          >
            {value}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
          >
            {label}
          </AppText>
        </View>
      );
    },
  );

Stat.displayName =
  "OrderSummaryStat";

/* ==============================================================
   TONE
============================================================== */

function getToneColor(
  tone: StatTone,
): string {
  switch (tone) {
    case "pending":
      return Colors.warning;

    case "active":
      return CustomerColors.primary;

    case "completed":
      return Colors.success;

    case "cancelled":
    default:
      return Colors.error;
  }
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.xs,
    },

    heading: {
      width:
        "100%",
    },

    subtitle: {
      marginTop:
        2,
    },

    stats: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      columnGap:
        FixxamTokens.spacing.lg,

      rowGap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.md,
    },

    stat: {
      minWidth:
        "42%",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    dot: {
      width:
        7,

      height:
        7,

      flexShrink:
        0,

      borderRadius:
        FixxamTokens.radius.full,
    },
  });