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
   HELPERS
============================================================ */

function normalizeAmount(
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
    value,
  );
}

function formatMoney(
  value: number,
): string {
  const amount =
    normalizeAmount(
      value,
    );

  return `₦${amount.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits:
        2,
    },
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
  const safeSubtotal =
    normalizeAmount(
      subtotal,
    );

  const safeDeliveryFee =
    normalizeAmount(
      deliveryFee,
    );

  const safeTotal =
    normalizeAmount(
      total,
    );

  return (
    <View
      accessible
      accessibilityLabel={`Price breakdown. Subtotal ${formatMoney(
        safeSubtotal,
      )}. Delivery fee ${formatMoney(
        safeDeliveryFee,
      )}. Total ${formatMoney(
        safeTotal,
      )}.`}
      style={
        styles.card
      }
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.title
        }
      >
        Price
      </AppText>

      {/* ======================================================
          BREAKDOWN
      ====================================================== */}

      <View
        style={
          styles.breakdown
        }
      >
        <PriceRow
          label="Subtotal"
          value={
            safeSubtotal
          }
        />

        <PriceRow
          label="Delivery"
          value={
            safeDeliveryFee
          }
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
        <View
          style={
            styles.totalContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.totalLabel
            }
          >
            Total
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.totalHint
            }
          >
            Order total
          </AppText>
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={
            styles.totalAmount
          }
        >
          {formatMoney(
            safeTotal,
          )}
        </AppText>
      </View>
    </View>
  );
}

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
            weight="semibold"
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

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

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
        FixxamTokens.spacing.sm,
    },

    priceRow: {
      minHeight:
        32,

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
      flex:
        1,

      minWidth:
        0,
    },

    priceValue: {
      flexShrink:
        0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       TOTAL
    ======================================================== */

    totalRow: {
      minHeight:
        58,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    totalContent: {
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
        2,
    },

    totalAmount: {
      maxWidth:
        "55%",

      flexShrink:
        0,

      color:
        CustomerColors.primary,
    },
  });