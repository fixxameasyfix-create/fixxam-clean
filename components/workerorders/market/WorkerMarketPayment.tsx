import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

export type WorkerMarketPaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | string;

type Props = {
  paymentMethod?: WorkerMarketPaymentMethod;
  paymentStatus?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function normalizeValue(
  value: unknown,
  fallback: string,
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

function getPaymentConfig(
  method: string,
): {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
} {
  switch (method.toLowerCase()) {
    case "cash":
      return {
        label: "Pay on Delivery",
        icon: "cash-outline",
      };

    case "card":
      return {
        label: "Card Payment",
        icon: "card-outline",
      };

    case "transfer":
      return {
        label: "Bank Transfer",
        icon: "business-outline",
      };

    default:
      return {
        label: "Payment Method",
        icon: "wallet-outline",
      };
  }
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketPayment({
  paymentMethod,
  paymentStatus,
}: Props) {
  const method = normalizeValue(
    paymentMethod,
    "cash",
  );

  const status = normalizeValue(
    paymentStatus,
    "pending",
  );

  const config =
    getPaymentConfig(method);

  const normalizedStatus =
    status.toLowerCase();

  const isPaid =
    normalizedStatus ===
      "paid" ||
    normalizedStatus ===
      "completed" ||
    normalizedStatus ===
      "success" ||
    normalizedStatus ===
      "successful";

  return (
    <View
      style={styles.card}
    >
      <AppText
        weight="bold"
        style={styles.title}
      >
        Payment
      </AppText>

      <View
        style={styles.row}
      >
        <View
          style={styles.iconBox}
        >
          <Ionicons
            name={config.icon}
            size={21}
            color="#2563EB"
          />
        </View>

        <View
          style={styles.content}
        >
          <AppText
            weight="bold"
            style={styles.method}
          >
            {config.label}
          </AppText>

          <View
            style={styles.statusRow}
          >
            <View
              style={[
                styles.statusDot,
                isPaid
                  ? styles.statusDotPaid
                  : styles.statusDotPending,
              ]}
            />

            <AppText
              style={[
                styles.statusText,
                isPaid
                  ? styles.statusPaid
                  : styles.statusPending,
              ]}
            >
              Payment:{" "}
              {isPaid
                ? "paid"
                : status}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

export default memo(
  WorkerMarketPayment,
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
      marginBottom: 13,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
    },

    iconBox: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      flex: 1,
      minWidth: 0,
      marginLeft: 11,
    },

    method: {
      fontSize: 13,
      color: "#0F172A",
    },

    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },

    statusDotPaid: {
      backgroundColor: "#16A34A",
    },

    statusDotPending: {
      backgroundColor: "#F59E0B",
    },

    statusText: {
      fontSize: 10,
    },

    statusPaid: {
      color: "#15803D",
    },

    statusPending: {
      color: "#64748B",
    },
  });