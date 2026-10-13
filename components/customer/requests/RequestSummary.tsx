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
  cancelled: number;
};

type RowProps = {
  icon: "jobs" | "check";
  label: string;
  value: number;
  divider?: boolean;
};

/* ============================================================
   ROW
============================================================ */

const SummaryRow = memo(
  function SummaryRow({
    icon,
    label,
    value,
    divider = true,
  }: RowProps) {
    return (
      <>
        <View style={styles.row}>
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
              style={styles.label}
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

SummaryRow.displayName =
  "SummaryRow";

/* ============================================================
   COMPONENT
============================================================ */

function RequestSummary({
  total,
  pending,
  active,
  completed,
  cancelled,
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
        Request Summary
      </AppText>

      <View style={styles.card}>
        <SummaryRow
          icon="jobs"
          label="Total Requests"
          value={total}
        />

        <SummaryRow
          icon="jobs"
          label="Pending Requests"
          value={pending}
        />

        <SummaryRow
          icon="jobs"
          label="Active Requests"
          value={active}
        />

        <SummaryRow
          icon="check"
          label="Completed Requests"
          value={completed}
        />

        <SummaryRow
          icon="jobs"
          label="Cancelled Requests"
          value={cancelled}
          divider={false}
        />
      </View>
    </View>
  );
}

export default memo(
  RequestSummary,
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
      minHeight: 58,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    rowLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",

      gap:
        FixxamTokens.spacing.sm,

      paddingRight:
        FixxamTokens.spacing.md,
    },

    rowIcon: {
      width: 32,

      height: 32,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    label: {
      flex: 1,

      color:
        Colors.textPrimary,
    },

    rowValue: {
      flexShrink: 0,

      color:
        Colors.textPrimary,
    },

    divider: {
      height: 1,

      marginLeft:
        FixxamTokens.spacing.md +
        32 +
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.border,
    },
  });