import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import { Booking } from "@/types/booking";

type Props = {
  booking: Booking;
};

export default function PaymentCard({
  booking,
}: Props) {
  /* ============================================================
     AMOUNT
  ============================================================ */

  const amount =
    booking.offerAmount ??
    booking.amount ??
    0;

  /* ============================================================
     PAYMENT STATUS
  ============================================================ */

  const paymentStatus =
    booking.paymentStatus ?? "pending";

  const paid =
    paymentStatus === "paid";

  const statusText =
    paymentStatus === "pending"
      ? "Payment Pending"
      : paymentStatus === "cash"
      ? "Cash Payment"
      : paymentStatus === "paid"
      ? "Payment Confirmed"
      : paymentStatus === "failed"
      ? "Payment Failed"
      : paymentStatus === "refunded"
      ? "Payment Refunded"
      : "Payment Pending";

  /* ============================================================
     STATUS COLORS
  ============================================================ */

  const statusColor =
    paymentStatus === "paid"
      ? "#16A34A"
      : paymentStatus === "failed"
      ? "#DC2626"
      : paymentStatus === "refunded"
      ? "#7C3AED"
      : "#F59E0B";

  const badgeColor =
    paymentStatus === "paid"
      ? "#F0FDF4"
      : paymentStatus === "failed"
      ? "#FEF2F2"
      : paymentStatus === "refunded"
      ? "#F5F3FF"
      : "#FEF3C7";

  /* ============================================================
     STATUS ICON
  ============================================================ */

  const iconName =
    paymentStatus === "paid"
      ? "checkmark-circle"
      : paymentStatus === "pending"
      ? "hourglass-outline"
      : paymentStatus === "cash"
      ? "cash-outline"
      : paymentStatus === "failed"
      ? "alert-circle-outline"
      : paymentStatus === "refunded"
      ? "refresh-circle-outline"
      : "cash-outline";

  /* ============================================================
     PAYMENT INFORMATION
  ============================================================ */

  const infoText =
    paymentStatus === "pending"
      ? "Payment is still pending. Please follow the payment instructions for this booking."
      : paymentStatus === "cash"
      ? "Please pay the agreed amount directly to the worker."
      : paymentStatus === "paid"
      ? "Payment has been confirmed successfully."
      : paymentStatus === "failed"
      ? "The payment failed. Please try again or choose another payment method."
      : paymentStatus === "refunded"
      ? "This payment has been refunded."
      : "Payment status is currently pending.";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <AppCard style={styles.card}>
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View style={styles.header}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Payment
        </AppText>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                badgeColor,
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={15}
            color={statusColor}
          />

          <AppText
            weight="bold"
            style={[
              styles.statusText,
              {
                color: statusColor,
              },
            ]}
          >
            {statusText}
          </AppText>
        </View>
      </View>

      {/* ========================================================
          AMOUNT
      ======================================================== */}

      <View style={styles.amountCard}>
        <AppText style={styles.label}>
          Agreed Amount
        </AppText>

        <AppText
          weight="bold"
          style={styles.amount}
        >
          ₦{amount.toLocaleString()}
        </AppText>
      </View>

      {/* ========================================================
          PAYMENT INFORMATION
      ======================================================== */}

      <View style={styles.infoBox}>
        <View style={styles.infoIcon}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#64748B"
          />
        </View>

        <AppText style={styles.infoText}>
          {infoText}
        </AppText>
      </View>
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,

    padding: 20,

    borderRadius: 22,
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 18,
  },

  title: {
    fontSize: 18,

    color: "#0F172A",
  },

  statusBadge: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 999,

    gap: 6,
  },

  statusText: {
    fontSize: 13,
  },

  /* ============================================================
     AMOUNT
  ============================================================ */

  amountCard: {
    backgroundColor: "#FFF7ED",

    borderRadius: 18,

    padding: 18,

    borderWidth: 1,

    borderColor: "#FED7AA",

    marginBottom: 14,
  },

  label: {
    fontSize: 13,

    color: "#64748B",

    marginBottom: 8,
  },

  amount: {
    fontSize: 30,

    color: "#FF6B00",
  },

  /* ============================================================
     INFO
  ============================================================ */

  infoBox: {
    flexDirection: "row",

    alignItems: "flex-start",

    backgroundColor: "#F8FAFC",

    borderRadius: 14,

    padding: 14,
  },

  infoIcon: {
    marginTop: 1,

    marginRight: 8,
  },

  infoText: {
    flex: 1,

    fontSize: 13,

    color: "#475569",

    lineHeight: 20,
  },
});