import React from "react";

import {
  ActivityIndicator,
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

export type WorkerOfferState =
  | "none"
  | "sent"
  | "counter";

type WorkerOfferSectionProps = {
  state: WorkerOfferState;

  offerAmount?: number | null;
  offerMessage?: string | null;

  counterOfferAmount?: number | null;
  counterOfferMessage?: string | null;

  onSendOffer: () => void;
  onAcceptCounter: () => void;
  onCounter: () => void;
  onDeclineCounter: () => void;

  loading?: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function formatAmount(
  amount?: number | null,
): string {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return "₦0";
  }

  return `₦${amount.toLocaleString(
    "en-NG",
  )}`;
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function WorkerOfferSection({
  state,
  offerAmount,
  offerMessage,
  counterOfferAmount,
  counterOfferMessage,
  onSendOffer,
  onAcceptCounter,
  onCounter,
  onDeclineCounter,
  loading = false,
}: WorkerOfferSectionProps) {
  /* ============================================================
     NO OFFER
  ============================================================ */

  if (state === "none") {
    return (
      <View style={styles.card}>
        <View style={styles.compactHeader}>
          <View style={styles.icon}>
            <Ionicons
              name="paper-plane-outline"
              size={18}
              color="#2563EB"
            />
          </View>

          <View style={styles.headerContent}>
            <AppText
              weight="bold"
              style={styles.title}
            >
              Send your offer
            </AppText>

            <AppText
              style={styles.subtitle}
            >
              Set your price and send it to the customer.
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={onSendOffer}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Send offer"
          style={({ pressed }) => [
            styles.primaryButton,

            loading &&
              styles.disabled,

            pressed &&
              !loading &&
              styles.pressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="paper-plane-outline"
              size={17}
              color="#FFFFFF"
            />
          )}

          <AppText
            weight="bold"
            style={styles.primaryText}
          >
            {loading
              ? "SENDING..."
              : "SEND OFFER"}
          </AppText>

          {!loading && (
            <Ionicons
              name="arrow-forward"
              size={17}
              color="#FFFFFF"
            />
          )}
        </Pressable>
      </View>
    );
  }

  /* ============================================================
     OFFER SENT
  ============================================================ */

  if (state === "sent") {
    return (
      <View style={styles.card}>
        <View style={styles.compactHeader}>
          <View style={styles.sentIcon}>
            <Ionicons
              name="checkmark"
              size={18}
              color="#16A34A"
            />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <AppText
                weight="bold"
                style={styles.title}
              >
                Offer Sent
              </AppText>

              <View style={styles.sentBadge}>
                <AppText
                  weight="bold"
                  style={styles.sentBadgeText}
                >
                  SENT
                </AppText>
              </View>
            </View>

            <AppText
              style={styles.subtitle}
            >
              Waiting for the customer to respond.
            </AppText>
          </View>
        </View>

        <View style={styles.amountRow}>
          <AppText style={styles.amountLabel}>
            Your offer
          </AppText>

          <AppText
            weight="bold"
            style={styles.amount}
          >
            {formatAmount(
              offerAmount,
            )}
          </AppText>
        </View>

        {!!offerMessage?.trim() && (
          <View style={styles.messageBox}>
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color="#64748B"
            />

            <AppText
              numberOfLines={2}
              style={styles.message}
            >
              {offerMessage.trim()}
            </AppText>
          </View>
        )}
      </View>
    );
  }

  /* ============================================================
     CUSTOMER COUNTER OFFER
  ============================================================ */

  return (
    <View style={styles.counterCard}>
      <View style={styles.compactHeader}>
        <View style={styles.counterIcon}>
          <Ionicons
            name="swap-horizontal-outline"
            size={19}
            color="#D97706"
          />
        </View>

        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <AppText
              weight="bold"
              style={styles.title}
            >
              Customer Counter Offer
            </AppText>

            <View style={styles.counterBadge}>
              <AppText
                weight="bold"
                style={styles.counterBadgeText}
              >
                NEW
              </AppText>
            </View>
          </View>

          <AppText
            style={styles.subtitle}
          >
            Review the customer's new price.
          </AppText>
        </View>
      </View>

      <View style={styles.counterAmountBox}>
        <AppText style={styles.amountLabel}>
          Customer offers
        </AppText>

        <AppText
          weight="bold"
          style={styles.counterAmount}
        >
          {formatAmount(
            counterOfferAmount,
          )}
        </AppText>
      </View>

      {!!counterOfferMessage?.trim() && (
        <View style={styles.messageBox}>
          <Ionicons
            name="chatbubble-outline"
            size={14}
            color="#64748B"
          />

          <AppText
            numberOfLines={3}
            style={styles.message}
          >
            {counterOfferMessage.trim()}
          </AppText>
        </View>
      )}

      <View style={styles.counterActions}>
        <Pressable
          onPress={onAcceptCounter}
          disabled={loading}
          style={({ pressed }) => [
            styles.acceptButton,

            loading &&
              styles.disabled,

            pressed &&
              !loading &&
              styles.pressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="checkmark"
              size={17}
              color="#FFFFFF"
            />
          )}

          <AppText
            weight="bold"
            style={styles.acceptText}
          >
            ACCEPT
          </AppText>
        </Pressable>

        <Pressable
          onPress={onCounter}
          disabled={loading}
          style={({ pressed }) => [
            styles.counterButton,

            loading &&
              styles.disabled,

            pressed &&
              !loading &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="swap-horizontal-outline"
            size={17}
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
          onPress={onDeclineCounter}
          disabled={loading}
          style={({ pressed }) => [
            styles.declineButton,

            loading &&
              styles.disabled,

            pressed &&
              !loading &&
              styles.pressed,
          ]}
        >
          <Ionicons
            name="close"
            size={17}
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

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  /* ==========================================================
     CARD
  ========================================================== */

  card: {
    width: "100%",
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  counterCard: {
    width: "100%",
    padding: 11,
    borderRadius: 15,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  sentIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },

  counterIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  title: {
    flexShrink: 1,
    fontSize: 12.5,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#64748B",
  },

  /* ==========================================================
     BADGES
  ========================================================== */

  sentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#DCFCE7",
  },

  sentBadgeText: {
    fontSize: 7,
    color: "#15803D",
  },

  counterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#FDE68A",
  },

  counterBadgeText: {
    fontSize: 7,
    color: "#92400E",
  },

  /* ==========================================================
     AMOUNT
  ========================================================== */

  amountRow: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  amountLabel: {
    fontSize: 9.5,
    color: "#64748B",
  },

  amount: {
    fontSize: 16,
    color: "#2563EB",
  },

  counterAmountBox: {
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  counterAmount: {
    fontSize: 17,
    color: "#D97706",
  },

  /* ==========================================================
     MESSAGE
  ========================================================== */

  messageBox: {
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  message: {
    flex: 1,
    marginLeft: 6,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#475569",
  },

  /* ==========================================================
     SEND
  ========================================================== */

  primaryButton: {
    minHeight: 42,
    marginTop: 10,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  primaryText: {
    fontSize: 10.5,
    color: "#FFFFFF",
  },

  /* ==========================================================
     COUNTER ACTIONS
  ========================================================== */

  counterActions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 6,
  },

  acceptButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  acceptText: {
    fontSize: 9,
    color: "#FFFFFF",
  },

  counterButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  counterText: {
    fontSize: 9,
    color: "#2563EB",
  },

  declineButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  declineText: {
    fontSize: 9,
    color: "#DC2626",
  },

  /* ==========================================================
     STATES
  ========================================================== */

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});