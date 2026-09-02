import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

type Props = {
  paymentMethod: string;
  paymentStatus: string;
};

function MarketOrderPayment({
  paymentMethod,
  paymentStatus,
}: Props) {
  const method =
    paymentMethod
      .toLowerCase()
      .trim();

  const status =
    paymentStatus
      .toLowerCase()
      .trim();

  const isPaid =
    status === "paid";

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
        Payment Information
      </AppText>

      <View
        style={
          styles.row
        }
      >
        {/* PAYMENT METHOD */}

        <View
          style={
            styles.column
          }
        >
          <AppText
            style={
              styles.label
            }
          >
            Payment Method
          </AppText>

          <View
            style={
              styles.valueRow
            }
          >
            <Ionicons
              name={getPaymentIcon(
                method,
              )}
              size={20}
              color="#16A34A"
            />

            <AppText
              weight="bold"
              style={
                styles.value
              }
            >
              {formatPaymentMethod(
                method,
              )}
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.divider
          }
        />

        {/* PAYMENT STATUS */}

        <View
          style={
            styles.column
          }
        >
          <AppText
            style={
              styles.label
            }
          >
            Payment Status
          </AppText>

          <View
            style={[
              styles.statusBadge,
              isPaid
                ? styles.paidBadge
                : styles.pendingBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isPaid
                  ? styles.paidDot
                  : styles.pendingDot,
              ]}
            />

            <AppText
              weight="bold"
              style={[
                styles.statusText,
                isPaid
                  ? styles.paidText
                  : styles.pendingText,
              ]}
            >
              {status
                ? status.toUpperCase()
                : "PENDING"}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

export default memo(
  MarketOrderPayment,
);

/* ==============================================================
   HELPERS
============================================================== */

function formatPaymentMethod(
  value: string,
): string {
  switch (value) {
    case "card":
      return "Card Payment";

    case "transfer":
      return "Bank Transfer";

    case "cash":
    default:
      return "Pay on Delivery";
  }
}

function getPaymentIcon(
  value: string,
): keyof typeof Ionicons.glyphMap {
  switch (value) {
    case "card":
      return "card-outline";

    case "transfer":
      return "business-outline";

    case "cash":
    default:
      return "cash-outline";
  }
}

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

    row: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
    },

    column: {
      flex: 1,
      minWidth: 0,
    },

    divider: {
      width: 1,
      height: 42,
      marginHorizontal: 10,
      backgroundColor:
        "#E2E8F0",
    },

    label: {
      fontSize: 8,
      color: "#94A3B8",
    },

    valueRow: {
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
    },

    value: {
      flex: 1,
      fontSize: 9.5,
      color: "#334155",
    },

    statusBadge: {
      alignSelf: "flex-start",
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },

    paidBadge: {
      backgroundColor:
        "#ECFDF5",
    },

    pendingBadge: {
      backgroundColor:
        "#FFF7E8",
    },

    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },

    paidDot: {
      backgroundColor:
        "#16A34A",
    },

    pendingDot: {
      backgroundColor:
        "#F59E0B",
    },

    statusText: {
      fontSize: 7.5,
      letterSpacing: 0.2,
    },

    paidText: {
      color: "#15803D",
    },

    pendingText: {
      color: "#D97706",
    },
  });