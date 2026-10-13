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
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  completedOrders: number;
};

type MetricProps = {
  icon: "shop" | "jobs" | "check";
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
      <View
        style={
          styles.metric
        }
      >
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
          style={
            styles.value
          }
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

function OrderPerformanceOverview({
  totalOrders,
  pendingOrders,
  activeOrders,
  completedOrders,
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
        Order Overview
      </AppText>

      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.row
          }
        >
          <Metric
            icon="shop"
            label="Total Orders"
            value={
              totalOrders
            }
          />

          <View
            style={
              styles.verticalDivider
            }
          />

          <Metric
            icon="jobs"
            label="Pending"
            value={
              pendingOrders
            }
          />
        </View>

        <View
          style={
            styles.horizontalDivider
          }
        />

        <View
          style={
            styles.row
          }
        >
          <Metric
            icon="jobs"
            label="Active"
            value={
              activeOrders
            }
          />

          <View
            style={
              styles.verticalDivider
            }
          />

          <Metric
            icon="check"
            label="Completed"
            value={
              completedOrders
            }
          />
        </View>
      </View>
    </View>
  );
}

export default memo(
  OrderPerformanceOverview,
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
      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    row: {
      minHeight:
        108,

      flexDirection:
        "row",

      alignItems:
        "stretch",
    },

    metric: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        FixxamTokens.spacing.md,
    },

    iconContainer: {
      width:
        32,

      height:
        32,

      alignItems:
        "center",

      justifyContent:
        "center",

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
      width:
        1,

      marginVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.border,
    },

    horizontalDivider: {
      height:
        1,

      marginHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.border,
    },
  });