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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  subtotal: number;

  deliveryFee: number;

  total: number;
};

/* ============================================================
   MONEY FORMATTER
============================================================ */

function formatMoney(
  value: number,
): string {
  const safeValue =
    Number.isFinite(value)
      ? Math.max(0, value)
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderPrice({
  subtotal,
  deliveryFee,
  total,
}: Props) {
  return (
    <View
      style={
        styles.card
      }
      accessibilityLabel={`Price breakdown. Subtotal ${formatMoney(
        subtotal,
      )}. Delivery fee ${formatMoney(
        deliveryFee,
      )}. Total amount ${formatMoney(
        total,
      )}.`}
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="body"
        weight="bold"
        style={
          styles.title
        }
      >
        Price Breakdown
      </AppText>

      {/* ======================================================
          SUBTOTAL
      ====================================================== */}

      <PriceRow
        label="Subtotal"
        value={
          subtotal
        }
      />

      {/* ======================================================
          DELIVERY
      ====================================================== */}

      <PriceRow
        label="Delivery Fee"
        value={
          deliveryFee
        }
      />

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
          variant="body"
          weight="bold"
          style={
            styles.totalLabel
          }
        >
          Total Amount
        </AppText>

        <AppText
          variant="heading3"
          weight="bold"
          numberOfLines={1}
          style={
            styles.totalAmount
          }
        >
          {formatMoney(
            total,
          )}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderPrice =
  memo(
    MarketOrderPrice,
  );

MemoizedMarketOrderPrice.displayName =
  "MarketOrderPrice";

export default MemoizedMarketOrderPrice;

/* ============================================================
   PRICE ROW
============================================================ */

const PriceRow =
  memo(
    function PriceRow({
      label,
      value,
    }: {
      label: string;

      value: number;
    }) {
      return (
        <View
          style={
            styles.priceRow
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.priceLabel
            }
          >
            {label}
          </AppText>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.priceValue
            }
          >
            {formatMoney(
              value,
            )}
          </AppText>
        </View>
      );
    },
  );

PriceRow.displayName =
  "PriceRow";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

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
       TITLE
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       PRICE ROW
    ======================================================== */

    priceRow: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    priceLabel: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    priceValue: {
      flexShrink: 0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height: 1,

      marginTop:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       TOTAL
    ======================================================== */

    totalRow: {
      marginTop:
        FixxamTokens.spacing.md,

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
      flex: 1,

      color:
        Colors.textPrimary,
    },

    totalAmount: {
      flexShrink: 0,

      color:
        CustomerColors.primary,
    },
  });