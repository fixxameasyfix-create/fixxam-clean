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
  cancelledOrders: number;
};

type RowProps = {
  icon: "shop" | "jobs" | "check";
  label: string;
  value: number;
  divider?: boolean;
};

/* ============================================================
   ROW
============================================================ */

const PerformanceRow = memo(
  function PerformanceRow({
    icon,
    label,
    value,
    divider = true,
  }: RowProps) {
    return (
      <>
        <View
          style={
            styles.row
          }
        >
          <View
            style={
              styles.rowLeft
            }
          >
            <View
              style={
                styles.rowIcon
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
              variant="body"
              weight="medium"
              numberOfLines={1}
              style={
                styles.label
              }
            >
              {label}
            </AppText>
          </View>

          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.rowValue
            }
          >
            {value.toLocaleString()}
          </AppText>
        </View>

        {divider ? (
          <View
            style={
              styles.divider
            }
          />
        ) : null}
      </>
    );
  },
);

PerformanceRow.displayName =
  "PerformanceRow";

/* ============================================================
   COMPONENT
============================================================ */

function OrderPerformanceCard({
  totalOrders,
  pendingOrders,
  activeOrders,
  completedOrders,
  cancelledOrders,
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
        Order Performance
      </AppText>

      <View
        style={
          styles.card
        }
      >
        <PerformanceRow
          icon="shop"
          label="Total Orders"
          value={
            totalOrders
          }
        />

        <PerformanceRow
          icon="jobs"
          label="New Requests"
          value={
            pendingOrders
          }
        />

        <PerformanceRow
          icon="jobs"
          label="Active Orders"
          value={
            activeOrders
          }
        />

        <PerformanceRow
          icon="check"
          label="Completed Orders"
          value={
            completedOrders
          }
        />

        <PerformanceRow
          icon="jobs"
          label="Cancelled Orders"
          value={
            cancelledOrders
          }
          divider={
            false
          }
        />
      </View>
    </View>
  );
}

export default memo(
  OrderPerformanceCard,
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
        58,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    rowLeft: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    rowIcon: {
      width:
        32,

      height:
        32,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    label: {
      flex:
        1,

      color:
        Colors.textPrimary,
    },

    rowValue: {
      flexShrink:
        0,

      color:
        Colors.textPrimary,
    },

    divider: {
      height:
        1,

      marginLeft:
        FixxamTokens.spacing.md +
        32 +
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.border,
    },
  });