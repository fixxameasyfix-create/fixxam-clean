import React, { memo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  amount: number;

  onAccept: () => void;
  onCounter: () => void;
  onDecline: () => void;

  loading?: boolean;
};

function WorkerOfferActions({
  amount,
  onAccept,
  onCounter,
  onDecline,
  loading = false,
}: Props) {
  const formattedAmount =
    amount.toLocaleString("en-NG");

  return (
    <View style={styles.container}>
      {/* =====================================================
          ACCEPT
      ===================================================== */}

      <Pressable
        disabled={loading}
        onPress={onAccept}
        accessibilityRole="button"
        accessibilityLabel={`Accept ₦${formattedAmount}`}
        accessibilityState={{
          disabled: loading,
          busy: loading,
        }}
        style={({ pressed }) => [
          styles.acceptButton,
          pressed &&
            !loading &&
            styles.pressed,
          loading &&
            styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <>
            <View style={styles.acceptIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.acceptText}
            >
              ACCEPT ₦{formattedAmount}
            </AppText>
          </>
        )}
      </Pressable>

      {/* =====================================================
          COUNTER + DECLINE
      ===================================================== */}

      <View style={styles.bottomRow}>
        {/* ---------------------------------------------------
            COUNTER
        --------------------------------------------------- */}

        <Pressable
          disabled={loading}
          onPress={onCounter}
          accessibilityRole="button"
          accessibilityLabel="Send counter offer"
          accessibilityState={{
            disabled: loading,
          }}
          style={({ pressed }) => [
            styles.counterButton,
            pressed &&
              !loading &&
              styles.pressed,
            loading &&
              styles.disabled,
          ]}
        >
          <View style={styles.counterIcon}>
            <Ionicons
              name="swap-horizontal-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.counterText}
          >
            COUNTER
          </AppText>
        </Pressable>

        {/* ---------------------------------------------------
            DECLINE
        --------------------------------------------------- */}

        <Pressable
          disabled={loading}
          onPress={onDecline}
          accessibilityRole="button"
          accessibilityLabel="Decline offer"
          accessibilityState={{
            disabled: loading,
          }}
          style={({ pressed }) => [
            styles.declineButton,
            pressed &&
              !loading &&
              styles.pressed,
            loading &&
              styles.disabled,
          ]}
        >
          <View style={styles.declineIcon}>
            <Ionicons
              name="close-circle-outline"
              size={19}
              color="#DC2626"
            />
          </View>

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
  WorkerOfferActions,
);

const styles = StyleSheet.create({
  container: {
    marginTop: 13,
    width: "100%",
  },

  /* =========================================================
     ACCEPT
  ========================================================= */

  acceptButton: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  acceptIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  acceptText: {
    fontSize: 10.5,
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },

  /* =========================================================
     BOTTOM ROW
  ========================================================= */

  bottomRow: {
    marginTop: 9,
    flexDirection: "row",
    gap: 10,
  },

  /* =========================================================
     COUNTER
  ========================================================= */

  counterButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  counterIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  counterText: {
    fontSize: 10,
    letterSpacing: 0.2,
    color: "#2563EB",
  },

  /* =========================================================
     DECLINE
  ========================================================= */

  declineButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  declineIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  declineText: {
    fontSize: 10,
    letterSpacing: 0.2,
    color: "#DC2626",
  },

  /* =========================================================
     STATES
  ========================================================= */

  pressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  disabled: {
    opacity: 0.45,
  },
});