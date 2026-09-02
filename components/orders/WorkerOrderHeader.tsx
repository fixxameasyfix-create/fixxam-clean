import React, { memo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import type {
  BookingStatus,
} from "@/types/booking";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  orderId: string;
  status: BookingStatus;
  onBack: () => void;
};

/* ==============================================================
   STATUS CONFIG
============================================================== */

function getStatusConfig(
  status: BookingStatus,
) {
  switch (status) {
    case "accepted":
      return {
        label: "ACCEPTED",
        background: styles.statusAccepted,
        dot: styles.dotAccepted,
        text: styles.textAccepted,
      };

    case "in-progress":
      return {
        label: "IN PROGRESS",
        background: styles.statusProgress,
        dot: styles.dotProgress,
        text: styles.textProgress,
      };

    case "completed":
      return {
        label: "COMPLETED",
        background: styles.statusCompleted,
        dot: styles.dotCompleted,
        text: styles.textCompleted,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        background: styles.statusCancelled,
        dot: styles.dotCancelled,
        text: styles.textCancelled,
      };

    case "expired":
      return {
        label: "EXPIRED",
        background: styles.statusExpired,
        dot: styles.dotExpired,
        text: styles.textExpired,
      };

    case "pending":
    default:
      return {
        label: "PENDING",
        background: styles.statusPending,
        dot: styles.dotPending,
        text: styles.textPending,
      };
  }
}

/* ==============================================================
   STATUS BADGE
============================================================== */

const StatusBadge = memo(
  function StatusBadge({
    status,
  }: {
    status: BookingStatus;
  }) {
    const config =
      getStatusConfig(status);

    return (
      <View
        style={[
          styles.statusBadge,
          config.background,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            config.dot,
          ]}
        />

        <AppText
          weight="bold"
          style={[
            styles.statusBadgeText,
            config.text,
          ]}
        >
          {config.label}
        </AppText>
      </View>
    );
  },
);

/* ==============================================================
   COMPONENT
============================================================== */

const WorkerOrderHeader = memo(
  function WorkerOrderHeader({
    orderId,
    status,
    onBack,
  }: Props) {
    return (
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={21}
            color="#0F172A"
          />
        </Pressable>

        <View style={styles.headerText}>
          <AppText
            weight="bold"
            style={styles.headerTitle}
          >
            Order Details
          </AppText>

          <AppText
            style={styles.headerSubtitle}
            numberOfLines={1}
          >
            #{orderId}
          </AppText>
        </View>

        <StatusBadge
          status={status}
        />
      </View>
    );
  },
);

export default WorkerOrderHeader;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      minHeight: 60,
      flexDirection: "row",
      alignItems: "center",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#E2E8F0",
      alignItems: "center",
      justifyContent: "center",
    },

    headerText: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
    },

    headerTitle: {
      fontSize: 19,
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 9.5,
      color: "#64748B",
    },

    /* ==========================================================
       STATUS
    ========================================================== */

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 9,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    statusBadgeText: {
      fontSize: 7.5,
    },

    /* ==========================================================
       PENDING
    ========================================================== */

    statusPending: {
      backgroundColor: "#FFF7E8",
    },

    dotPending: {
      backgroundColor: "#F59E0B",
    },

    textPending: {
      color: "#D97706",
    },

    /* ==========================================================
       ACCEPTED
    ========================================================== */

    statusAccepted: {
      backgroundColor: "#EFF6FF",
    },

    dotAccepted: {
      backgroundColor: "#2563EB",
    },

    textAccepted: {
      color: "#1D4ED8",
    },

    /* ==========================================================
       IN PROGRESS
    ========================================================== */

    statusProgress: {
      backgroundColor: "#F3E8FF",
    },

    dotProgress: {
      backgroundColor: "#7C3AED",
    },

    textProgress: {
      color: "#6D28D9",
    },

    /* ==========================================================
       COMPLETED
    ========================================================== */

    statusCompleted: {
      backgroundColor: "#ECFDF5",
    },

    dotCompleted: {
      backgroundColor: "#16A34A",
    },

    textCompleted: {
      color: "#15803D",
    },

    /* ==========================================================
       CANCELLED
    ========================================================== */

    statusCancelled: {
      backgroundColor: "#FEF2F2",
    },

    dotCancelled: {
      backgroundColor: "#DC2626",
    },

    textCancelled: {
      color: "#B91C1C",
    },

    /* ==========================================================
       EXPIRED
    ========================================================== */

    statusExpired: {
      backgroundColor: "#F1F5F9",
    },

    dotExpired: {
      backgroundColor: "#64748B",
    },

    textExpired: {
      color: "#475569",
    },

    /* ==========================================================
       PRESS
    ========================================================== */

    pressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },
  });