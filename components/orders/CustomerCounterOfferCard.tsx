import React, { memo, useCallback } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

/* ==============================================================
   TYPES
============================================================== */

type CustomerCounterOfferCardProps = {
  amount: number;
  message?: string | null;

  onAccept: () => void;
  onCounter: () => void;
  onDecline: () => void;

  disabled?: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function formatAmount(
  amount: number,
): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerCounterOfferCard({
  amount,
  message,
  onAccept,
  onCounter,
  onDecline,
  disabled = false,
}: CustomerCounterOfferCardProps) {
  const handleAccept = useCallback(() => {
    if (disabled) {
      return;
    }

    onAccept();
  }, [disabled, onAccept]);

  const handleCounter = useCallback(() => {
    if (disabled) {
      return;
    }

    onCounter();
  }, [disabled, onCounter]);

  const handleDecline = useCallback(() => {
    if (disabled) {
      return;
    }

    onDecline();
  }, [disabled, onDecline]);

  return (
    <View style={styles.card}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="swap-horizontal-outline"
            size={24}
            color="#2563EB"
          />
        </View>

        <View style={styles.headerContent}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            COUNTER OFFER RECEIVED
          </AppText>

          <AppText style={styles.subtitle}>
            Worker has responded to your offer.
          </AppText>
        </View>
      </View>

      {/* ======================================================
          OFFER
      ====================================================== */}

      <View style={styles.offerBox}>
        <AppText style={styles.offerLabel}>
          WORKER COUNTER OFFER
        </AppText>

        <AppText
          weight="bold"
          style={styles.amount}
        >
          {formatAmount(amount)}
        </AppText>

        {message?.trim() ? (
          <View style={styles.messageBox}>
            <Ionicons
              name="chatbubble-outline"
              size={17}
              color="#64748B"
            />

            <AppText style={styles.message}>
              "{message.trim()}"
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ======================================================
          ACCEPT
      ====================================================== */}

      <Pressable
        onPress={handleAccept}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Accept worker counter offer of ${formatAmount(
          amount,
        )}`}
        style={({ pressed }) => [
          styles.acceptButton,
          disabled && styles.disabledButton,
          pressed &&
            !disabled &&
            styles.pressedButton,
        ]}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={20}
          color="#FFFFFF"
        />

        <AppText
          weight="bold"
          style={styles.acceptText}
        >
          ACCEPT {formatAmount(amount)}
        </AppText>
      </Pressable>

      {/* ======================================================
          SECONDARY ACTIONS
      ====================================================== */}

      <View style={styles.secondaryActions}>
        <Pressable
          onPress={handleCounter}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Send counter offer"
          style={({ pressed }) => [
            styles.counterButton,
            disabled && styles.disabledButton,
            pressed &&
              !disabled &&
              styles.pressedButton,
          ]}
        >
          <Ionicons
            name="swap-horizontal-outline"
            size={18}
            color="#2563EB"
          />

          <AppText
            weight="bold"
            style={styles.counterText}
          >
            COUNTER
          </AppText>
        </Pressable>

        <Pressable
          onPress={handleDecline}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Decline worker counter offer"
          style={({ pressed }) => [
            styles.declineButton,
            disabled && styles.disabledButton,
            pressed &&
              !disabled &&
              styles.pressedButton,
          ]}
        >
          <Ionicons
            name="close-circle-outline"
            size={18}
            color="#DC2626"
          />

          <AppText
            weight="bold"
            style={styles.declineText}
          >
            DECLINE
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default memo(
  CustomerCounterOfferCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F8FAFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontSize: 12,
    color: "#2563EB",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#64748B",
  },

  /* ============================================================
     OFFER
  ============================================================ */

  offerBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  offerLabel: {
    fontSize: 8.5,
    letterSpacing: 0.8,
    color: "#94A3B8",
  },

  amount: {
    marginTop: 5,
    fontSize: 25,
    color: "#0F172A",
  },

  messageBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  message: {
    flex: 1,
    marginLeft: 7,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#475569",
  },

  /* ============================================================
     ACCEPT
  ============================================================ */

  acceptButton: {
    height: 49,
    marginTop: 13,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  acceptText: {
    fontSize: 10.5,
    color: "#FFFFFF",
  },

  /* ============================================================
     SECONDARY
  ============================================================ */

  secondaryActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },

  counterButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  counterText: {
    fontSize: 9.5,
    color: "#2563EB",
  },

  declineButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  declineText: {
    fontSize: 9.5,
    color: "#DC2626",
  },

  /* ============================================================
     STATES
  ============================================================ */

  disabledButton: {
    opacity: 0.45,
  },

  pressedButton: {
    opacity: 0.85,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});