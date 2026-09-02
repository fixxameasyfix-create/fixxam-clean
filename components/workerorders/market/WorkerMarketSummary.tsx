import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

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
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return 0;
}

function formatMoney(
  value: number,
): string {
  return `₦${safeMoney(
    value,
  ).toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.row}
    >
      <AppText
        style={styles.label}
      >
        {label}
      </AppText>

      <AppText
        weight="bold"
        style={styles.value}
      >
        {value}
      </AppText>
    </View>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketSummary({
  subtotal,
  deliveryFee,
  total,
}: Props) {
  const safeSubtotal =
    safeMoney(subtotal);

  const safeDeliveryFee =
    safeMoney(deliveryFee);

  const safeTotal =
    safeMoney(total);

  const calculatedTotal =
    safeSubtotal +
    safeDeliveryFee;

  const displayTotal =
    safeTotal > 0 ||
    calculatedTotal === 0
      ? safeTotal
      : calculatedTotal;

  return (
    <View
      style={styles.card}
    >
      <AppText
        weight="bold"
        style={styles.title}
      >
        Order Summary
      </AppText>

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

      <View
        style={styles.divider}
      />

      <View
        style={styles.totalRow}
      >
        <AppText
          weight="bold"
          style={styles.totalLabel}
        >
          Total
        </AppText>

        <AppText
          weight="bold"
          style={styles.totalValue}
        >
          {formatMoney(
            displayTotal,
          )}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  WorkerMarketSummary,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    title: {
      fontSize: 16,
      color: "#0F172A",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginTop: 11,
    },

    label: {
      fontSize: 12,
      color: "#64748B",
    },

    value: {
      fontSize: 12,
      color: "#334155",
    },

    divider: {
      height: 1,
      backgroundColor: "#E2E8F0",
      marginVertical: 15,
    },

    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    totalLabel: {
      fontSize: 15,
      color: "#0F172A",
    },

    totalValue: {
      fontSize: 22,
      color: "#2563EB",
    },
  });