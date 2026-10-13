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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  total: number;
  pending: number;
  active: number;
  completed: number;
};

type MetricProps = {
  icon: "jobs" | "check";
  label: string;
  value: number;
};

/* ============================================================
   METRIC
============================================================ */

const Metric = memo(
  function Metric({
    icon,
    label,
    value,
  }: MetricProps) {
    return (
      <View style={styles.metric}>
        <View
          style={
            styles.iconContainer
          }
        >
          <AppIcon
            name={icon}
            role="customer"
            size="sm"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="semibold"
          style={styles.value}
        >
          {value.toLocaleString()}
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

Metric.displayName =
  "Metric";

/* ============================================================
   COMPONENT
============================================================ */

function RequestOverview({
  total,
  pending,
  active,
  completed,
}: Props) {
  return (
    <View>
      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.sectionTitle
        }
      >
        Request Overview
      </AppText>

      <View style={styles.card}>
        <View style={styles.row}>
          <Metric
            icon="jobs"
            label="Total Requests"
            value={total}
          />

          <View
            style={
              styles.verticalDivider
            }
          />

          <Metric
            icon="jobs"
            label="Pending"
            value={pending}
          />
        </View>

        <View
          style={
            styles.horizontalDivider
          }
        />

        <View style={styles.row}>
          <Metric
            icon="jobs"
            label="Active"
            value={active}
          />

          <View
            style={
              styles.verticalDivider
            }
          />

          <Metric
            icon="check"
            label="Completed"
            value={completed}
          />
        </View>
      </View>
    </View>
  );
}

export default memo(
  RequestOverview,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    sectionTitle: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    card: {
      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    row: {
      minHeight: 108,

      flexDirection: "row",

      alignItems: "stretch",
    },

    metric: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",

      padding:
        FixxamTokens.spacing.md,
    },

    iconContainer: {
      width: 32,

      height: 32,

      alignItems: "center",

      justifyContent: "center",

      marginBottom:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    value: {
      color:
        Colors.textPrimary,
    },

    verticalDivider: {
      width: 1,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.border,
    },

    horizontalDivider: {
      height: 1,

      marginHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.border,
    },
  });