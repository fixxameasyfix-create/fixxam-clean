import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import { Booking } from "@/types/booking";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  status: Booking["status"];

  onCall?: () => void;

  onChat?: () => void;

  onCancel?: () => void;

  onBookAgain?: () => void;

  onReview?: () => void;

  onConfirmPayment?: () => void;
};

type ButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;

  text: string;

  color: string;

  background: string;

  onPress?: () => void;
};

/* ============================================================
   STATUS GROUPS
============================================================ */

/*
 * These are intentionally kept as strings here.
 *
 * Booking["status"] may currently come from an older
 * central status union, while the order flow already
 * supports these newer payment statuses.
 */

const CANCELLABLE_STATUSES: readonly string[] = [
  "pending_estimate",
  "negotiating",
];

const ACTIVE_STATUSES: readonly string[] = [
  "accepted",
  "on_the_way",
  "arrived",
  "in_progress",
  "awaiting_cash",
  "payment_pending_confirmation",
];

/* ============================================================
   COMPONENT
============================================================ */

function OrderActions({
  status,
  onCall,
  onChat,
  onCancel,
  onBookAgain,
  onReview,
  onConfirmPayment,
}: Props) {
  /*
   * Normalize to string so this component can support
   * the latest order statuses without fighting an older
   * Booking status union.
   */
  const currentStatus: string = status;

  const isCancellable =
    CANCELLABLE_STATUSES.includes(
      currentStatus,
    );

  const isActive =
    ACTIVE_STATUSES.includes(
      currentStatus,
    );

  const isPaymentPendingConfirmation =
    currentStatus ===
    "payment_pending_confirmation";

  const isAwaitingCash =
    currentStatus ===
    "awaiting_cash";

  const isCompleted =
    currentStatus ===
    "completed";

  /*
   * Nothing to show.
   */
  if (
    !isCancellable &&
    !isActive &&
    !isCompleted
  ) {
    return null;
  }

  return (
    <AppCard style={styles.card}>
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        Actions
      </AppText>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <View style={styles.row}>
        {/* ====================================================
            PENDING / NEGOTIATING
        ==================================================== */}

        {isCancellable && (
          <>
            <ActionButton
              icon="close-circle"
              text="Cancel"
              color="#EF4444"
              background="#FEF2F2"
              onPress={onCancel}
            />

            <ActionButton
              icon="call"
              text="Call"
              color="#2563EB"
              background="#EFF6FF"
              onPress={onCall}
            />
          </>
        )}

        {/* ====================================================
            ACTIVE ORDER
        ==================================================== */}

        {isActive && (
          <>
            <ActionButton
              icon="call"
              text="Call"
              color="#2563EB"
              background="#EFF6FF"
              onPress={onCall}
            />

            <ActionButton
              icon="chatbubble"
              text="Chat"
              color="#16A34A"
              background="#F0FDF4"
              onPress={onChat}
            />

            {/* ================================================
                PAYMENT CONFIRMATION
            ================================================ */}

            {isPaymentPendingConfirmation && (
              <ActionButton
                icon="time-outline"
                text="Waiting for Confirmation"
                color="#F59E0B"
                background="#FEF3C7"
              />
            )}

            {/* ================================================
                CASH PAYMENT
            ================================================ */}

            {isAwaitingCash && (
              <ActionButton
                icon="cash-outline"
                text="I've Paid"
                color="#16A34A"
                background="#F0FDF4"
                onPress={
                  onConfirmPayment
                }
              />
            )}
          </>
        )}

        {/* ====================================================
            COMPLETED
        ==================================================== */}

        {isCompleted && (
          <>
            <ActionButton
              icon="star"
              text="Review"
              color="#F59E0B"
              background="#FEFCE8"
              onPress={onReview}
            />

            <ActionButton
              icon="refresh"
              text="Book Again"
              color="#FF6B00"
              background="#FFF7ED"
              onPress={onBookAgain}
            />
          </>
        )}
      </View>
    </AppCard>
  );
}

/* ============================================================
   ACTION BUTTON
============================================================ */

const ActionButton = memo(
  function ActionButton({
    icon,
    text,
    color,
    background,
    onPress,
  }: ButtonProps) {
    const disabled = !onPress;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text}
        accessibilityState={{
          disabled,
        }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor:
              background,
          },
          disabled &&
            styles.buttonDisabled,
          pressed &&
            !disabled &&
            styles.buttonPressed,
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              opacity: disabled
                ? 0.65
                : 1,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={color}
          />
        </View>

        <AppText
          weight="bold"
          style={[
            styles.buttonText,
            {
              opacity: disabled
                ? 0.65
                : 1,
            },
          ]}
        >
          {text}
        </AppText>
      </Pressable>
    );
  },
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  card: {
    padding: 14,

    borderRadius: 18,

    marginBottom: 16,
  },

  title: {
    fontSize: 16,

    color: "#0F172A",

    marginBottom: 12,
  },

  row: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 10,
  },

  button: {
    flexGrow: 1,

    flexBasis: "30%",

    minWidth: 100,

    borderRadius: 14,

    paddingVertical: 12,

    paddingHorizontal: 8,

    alignItems: "center",

    justifyContent: "center",
  },

  buttonPressed: {
    opacity: 0.78,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  buttonDisabled: {
    opacity: 0.82,
  },

  iconContainer: {
    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 6,
  },

  buttonText: {
    fontSize: 12,

    color: "#0F172A",

    textAlign: "center",

    lineHeight: 16,
  },
});

export default memo(
  OrderActions,
);