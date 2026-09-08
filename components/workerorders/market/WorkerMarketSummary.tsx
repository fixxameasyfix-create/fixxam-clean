import React, {
  memo,
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
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  subtotal: number;

  deliveryFee: number;

  total: number;
};

type SummaryRowProps = {
  label: string;

  value: string;
};

/* ============================================================
   HELPERS
============================================================ */

function safeMoney(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value
        .replace(
          /[₦,\s]/g,
          "",
        )
        .trim();

    const parsed =
      Number(
        normalized,
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return 0;
}

function formatMoney(
  value: unknown,
): string {
  const amount =
    safeMoney(
      value,
    );

  return `₦${amount.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  )}`;
}

/* ============================================================
   SUMMARY ROW
============================================================ */

const SummaryRow =
  memo(
    function SummaryRow({
      label,
      value,
    }: SummaryRowProps) {
      return (
        <View
          style={
            styles.row
          }
        >
          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.label
            }
          >
            {label}
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.value
            }
          >
            {value}
          </AppText>
        </View>
      );
    },
  );

SummaryRow.displayName =
  "WorkerMarketSummaryRow";

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketSummary({
  subtotal,
  deliveryFee,
  total,
}: Props) {
  const safeSubtotal =
    safeMoney(
      subtotal,
    );

  const safeDeliveryFee =
    safeMoney(
      deliveryFee,
    );

  const safeTotal =
    safeMoney(
      total,
    );

  const calculatedTotal =
    safeSubtotal +
    safeDeliveryFee;

  /*
   * Preserve the existing behavior:
   * if total is zero but calculated values
   * contain an amount, use the calculated total.
   */
  const displayTotal =
    safeTotal > 0 ||
    calculatedTotal === 0
      ? safeTotal
      : calculatedTotal;

  return (
    <View
      style={
        styles.card
      }
      accessibilityLabel={`Order summary. Subtotal ${formatMoney(
        safeSubtotal,
      )}. Delivery fee ${formatMoney(
        safeDeliveryFee,
      )}. Total ${formatMoney(
        displayTotal,
      )}.`}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Order Summary
      </AppText>

      {/* ======================================================
          BREAKDOWN
      ====================================================== */}

      <View
        style={
          styles.breakdown
        }
      >
        <SummaryRow
          label="Subtotal"
          value={formatMoney(
            safeSubtotal,
          )}
        />

        <SummaryRow
          label="Delivery fee"
          value={formatMoney(
            safeDeliveryFee,
          )}
        />
      </View>

      {/* ======================================================
          DIVIDER
      ====================================================== */}

      <View
        style={
          styles.divider
        }
      />

      {/* ======================================================
          TOTAL
      ====================================================== */}

      <View
        style={
          styles.totalRow
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          style={
            styles.totalLabel
          }
        >
          Total
        </AppText>

        <AppText
          variant="heading2"
          weight="bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={
            styles.totalValue
          }
        >
          {formatMoney(
            displayTotal,
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
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

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

    /* ========================================================
       HEADER
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
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.md,
    },

    row: {
      minHeight: 28,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    label: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    value: {
      flexShrink: 0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height: 1,

      marginVertical:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       TOTAL
    ======================================================== */

    totalRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    totalLabel: {
      color:
        Colors.textPrimary,
    },

    totalValue: {
      flexShrink: 1,

      textAlign: "right",

      color:
        WorkerColors.primary,
    },
  });