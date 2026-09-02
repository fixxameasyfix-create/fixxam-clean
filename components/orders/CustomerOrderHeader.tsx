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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  orderId: string;
  status: BookingStatus;
  onBack: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function CustomerOrderHeader({
  orderId,
  status,
  onBack,
}: Props) {
  const config =
    getStatusConfig(status);

  return (
    <View style={styles.container}>
      {/* BACK */}

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

      {/* TITLE */}

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          Order Details
        </AppText>

        <AppText
          style={styles.subtitle}
          numberOfLines={1}
        >
          #{orderId}
        </AppText>
      </View>

      {/* STATUS */}

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
            styles.statusText,
            config.text,
          ]}
        >
          {config.label}
        </AppText>
      </View>
    </View>
  );
}

/* ============================================================
   STATUS CONFIG
============================================================ */

function getStatusConfig(
  status: BookingStatus,
) {
  switch (status) {
    case "pending":
      return {
        label: "PENDING",
        background: styles.pending,
        dot: styles.dotPending,
        text: styles.textPending,
      };

    case "accepted":
      return {
        label: "ACCEPTED",
        background: styles.accepted,
        dot: styles.dotAccepted,
        text: styles.textAccepted,
      };

    case "in-progress":
      return {
        label: "IN PROGRESS",
        background: styles.progress,
        dot: styles.dotProgress,
        text: styles.textProgress,
      };

    case "completed":
      return {
        label: "COMPLETED",
        background: styles.completed,
        dot: styles.dotCompleted,
        text: styles.textCompleted,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        background: styles.cancelled,
        dot: styles.dotCancelled,
        text: styles.textCancelled,
      };

    case "expired":
      return {
        label: "EXPIRED",
        background: styles.expired,
        dot: styles.dotExpired,
        text: styles.textExpired,
      };

    default:
      return {
        label: "PENDING",
        background: styles.pending,
        dot: styles.dotPending,
        text: styles.textPending,
      };
  }
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  CustomerOrderHeader,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
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

    pressed: {
      opacity: 0.7,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    content: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
      minWidth: 0,
    },

    title: {
      fontSize: 19,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      fontSize: 9.5,
      color: "#64748B",
    },

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

    statusText: {
      fontSize: 7.5,
    },

    /* PENDING */

    pending: {
      backgroundColor: "#FFF7E8",
    },

    dotPending: {
      backgroundColor: "#F59E0B",
    },

    textPending: {
      color: "#D97706",
    },

    /* ACCEPTED */

    accepted: {
      backgroundColor: "#EFF6FF",
    },

    dotAccepted: {
      backgroundColor: "#2563EB",
    },

    textAccepted: {
      color: "#1D4ED8",
    },

    /* IN PROGRESS */

    progress: {
      backgroundColor: "#F3E8FF",
    },

    dotProgress: {
      backgroundColor: "#7C3AED",
    },

    textProgress: {
      color: "#6D28D9",
    },

    /* COMPLETED */

    completed: {
      backgroundColor: "#ECFDF5",
    },

    dotCompleted: {
      backgroundColor: "#16A34A",
    },

    textCompleted: {
      color: "#15803D",
    },

    /* CANCELLED */

    cancelled: {
      backgroundColor: "#FEF2F2",
    },

    dotCancelled: {
      backgroundColor: "#DC2626",
    },

    textCancelled: {
      color: "#B91C1C",
    },

    /* EXPIRED */

    expired: {
      backgroundColor: "#F1F5F9",
    },

    dotExpired: {
      backgroundColor: "#64748B",
    },

    textExpired: {
      color: "#475569",
    },
  });