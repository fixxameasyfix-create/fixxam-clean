import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
} from "react-native";

import {
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
  subtotal?: number | null;

  deliveryFee?: number | null;

  total?: number | null;
};

type SummaryRowProps = {
  label: string;

  value: string;

  valueStyle?: StyleProp<TextStyle>;
};

/* ============================================================
   HELPERS
============================================================ */

function safeMoney(
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
    value,
  );
}

function formatMoney(
  value: unknown,
): string {
  const amount =
    typeof value === "number" &&
    Number.isFinite(value)
      ? value
      : 0;

  const absolute =
    Math.abs(
      amount,
    );

  const formatted =
    `₦${absolute.toLocaleString(
      "en-NG",
      {
        maximumFractionDigits:
          0,
      },
    )}`;

  return amount < 0
    ? `-${formatted}`
    : formatted;
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketSummary({
  subtotal,
  deliveryFee,
  total,
}: Props) {
  const values =
    useMemo(() => {
      const safeSubtotal =
        safeMoney(
          subtotal,
        );

      const safeDeliveryFee =
        safeMoney(
          deliveryFee,
        );

      const calculatedBeforeAdjustment =
        safeSubtotal +
        safeDeliveryFee;

      /*
       * If total is missing or invalid, use subtotal + delivery.
       * This avoids incorrectly displaying ₦0 for incomplete data.
       */
      const hasValidTotal =
        typeof total === "number" &&
        Number.isFinite(total) &&
        total >= 0;

      const safeTotal =
        hasValidTotal
          ? total
          : calculatedBeforeAdjustment;

      const adjustment =
        safeTotal -
        calculatedBeforeAdjustment;

      /*
       * Ignore insignificant floating-point differences.
       */
      const normalizedAdjustment =
        Math.abs(
          adjustment,
        ) < 0.01
          ? 0
          : adjustment;

      return {
        subtotal:
          safeSubtotal,

        deliveryFee:
          safeDeliveryFee,

        adjustment:
          normalizedAdjustment,

        total:
          safeTotal,
      };
    }, [
      subtotal,
      deliveryFee,
      total,
    ]);

  const hasAdjustment =
    values.adjustment !==
    0;

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="bodyLarge"
        weight="bold"
        style={
          styles.title
        }
      >
        Price
      </AppText>

      {/* ======================================================
          PRICE BREAKDOWN
      ====================================================== */}

      <View
        style={
          styles.breakdown
        }
      >
        <SummaryRow
          label="Subtotal"
          value={
            formatMoney(
              values.subtotal,
            )
          }
        />

        <SummaryRow
          label="Delivery"
          value={
            values.deliveryFee >
            0
              ? formatMoney(
                  values.deliveryFee,
                )
              : "Free"
          }
        />

        {hasAdjustment ? (
          <SummaryRow
            label="Adjustment"
            value={
              formatMoney(
                values.adjustment,
              )
            }
            valueStyle={
              values.adjustment <
              0
                ? styles.adjustmentNegative
                : styles.adjustmentPositive
            }
          />
        ) : null}
      </View>

      {/* ======================================================
          TOTAL
      ====================================================== */}

      <View
        style={
          styles.totalRow
        }
      >
        <View
          style={
            styles.totalText
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.totalLabel
            }
          >
            Total
          </AppText>

          <AppText
            variant="caption"
            style={
              styles.totalHint
            }
          >
            Order amount
          </AppText>
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={
            0.8
          }
          style={
            styles.totalValue
          }
        >
          {formatMoney(
            values.total,
          )}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerMarketSummary.displayName =
  "WorkerMarketSummary";

export default memo(
  WorkerMarketSummary,
);

/* ============================================================
   SUMMARY ROW
============================================================ */

const SummaryRow =
  memo(
    function SummaryRow({
      label,
      value,
      valueStyle,
    }: SummaryRowProps) {
      return (
        <View
          style={
            styles.row
          }
        >
          <AppText
            variant="caption"
            numberOfLines={1}
            style={
              styles.rowLabel
            }
          >
            {label}
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="medium"
            numberOfLines={1}
            style={[
              styles.rowValue,
              valueStyle,
            ]}
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

SummaryRow.displayName =
  "SummaryRow";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       BREAKDOWN
    ======================================================== */

    breakdown: {
      marginTop:
        FixxamTokens.spacing.xs,

      paddingBottom:
        FixxamTokens.spacing.xs,

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    row: {
      minHeight:
        26,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    rowLabel: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textSecondary,
    },

    rowValue: {
      flexShrink:
        0,

      textAlign:
        "right",

      color:
        Colors.textPrimary,
    },

    adjustmentNegative: {
      color:
        Colors.success,
    },

    adjustmentPositive: {
      color:
        Colors.warning,
    },

    /* ========================================================
       TOTAL
    ======================================================== */

    totalRow: {
      minHeight:
        50,

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    totalText: {
      flex:
        1,

      minWidth:
        0,
    },

    totalLabel: {
      color:
        Colors.textPrimary,
    },

    totalHint: {
      marginTop:
        1,

      color:
        Colors.textSecondary,
    },

    totalValue: {
      maxWidth:
        "58%",

      flexShrink:
        1,

      textAlign:
        "right",

      color:
        WorkerColors.primary,
    },
  });