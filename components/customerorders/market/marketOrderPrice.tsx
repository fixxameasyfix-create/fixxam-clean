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

type Props = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};

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
    >
      <AppText
        weight="bold"
        style={
          styles.title
        }
      >
        Price Breakdown
      </AppText>

      <PriceRow
        label="Subtotal"
        value={subtotal}
      />

      <PriceRow
        label="Delivery Fee"
        value={deliveryFee}
      />

      <View
        style={
          styles.divider
        }
      />

      <View
        style={
          styles.totalRow
        }
      >
        <AppText
          weight="bold"
          style={
            styles.totalLabel
          }
        >
          Total Amount
        </AppText>

        <AppText
          weight="bold"
          style={
            styles.totalAmount
          }
        >
          ₦
          {total.toLocaleString(
            "en-NG",
          )}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  MarketOrderPrice,
);

/* ==============================================================
   PRICE ROW
============================================================== */

const PriceRow = memo(
  ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => {
    return (
      <View
        style={
          styles.priceRow
        }
      >
        <AppText
          style={
            styles.priceLabel
          }
        >
          {label}
        </AppText>

        <AppText
          weight="bold"
          style={
            styles.priceValue
          }
        >
          ₦
          {value.toLocaleString(
            "en-NG",
          )}
        </AppText>
      </View>
    );
  },
);

PriceRow.displayName =
  "PriceRow";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      marginTop: 10,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    title: {
      fontSize: 14,
      color: "#0F172A",
    },

    priceRow: {
      marginTop: 11,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    priceLabel: {
      fontSize: 9.5,
      color: "#64748B",
    },

    priceValue: {
      fontSize: 9.5,
      color: "#334155",
    },

    divider: {
      height: 1,
      marginTop: 12,
      backgroundColor:
        "#E2E8F0",
    },

    totalRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    totalLabel: {
      fontSize: 11,
      color: "#0F172A",
    },

    totalAmount: {
      fontSize: 18,
      color: "#2563EB",
    },
  });