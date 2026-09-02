import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppButton,
  AppText,
} from "@/components/ui";

type Props = {
  loading?: boolean;

  onAccept: () => void;

  onReject: () => void;

  onCounterOffer?: () => void;

  showCounterOffer?: boolean;
};

export default function CustomerOfferActions({
  loading = false,
  onAccept,
  onReject,
  onCounterOffer,
  showCounterOffer = false,
}: Props) {
  return (
    <View style={styles.container}>
      {/* MAIN ACTION */}

      <AppButton
        title="Accept Offer"
        loading={loading}
        onPress={onAccept}
      />

      {/* CHANGE PRICE */}

      {showCounterOffer &&
        onCounterOffer && (
          <Pressable
            disabled={loading}
            onPress={onCounterOffer}
            style={({ pressed }) => [
              styles.counterButton,
              pressed && !loading && styles.pressed,
              loading && styles.disabled,
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
              Change Price
            </AppText>
          </Pressable>
        )}

      {/* REJECT */}

      <Pressable
        disabled={loading}
        onPress={onReject}
        style={({ pressed }) => [
          styles.rejectButton,
          pressed && !loading && styles.pressed,
          loading && styles.disabled,
        ]}
      >
        <AppText
          weight="bold"
          style={styles.rejectText}
        >
          Reject Offer
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },

  counterButton: {
    height: 44,
    marginTop: 8,

    borderRadius: 14,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  counterText: {
    color: "#2563EB",
    fontSize: 13,
  },

  rejectButton: {
    alignSelf: "center",

    marginTop: 10,

    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  rejectText: {
    color: "#EF4444",
    fontSize: 12,
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.5,
  },
});