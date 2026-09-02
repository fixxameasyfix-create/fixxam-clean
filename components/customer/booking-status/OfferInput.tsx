import React, { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import { addOffer } from "@/firebase/queries/bookings/addOffer";

type Props = {
  bookingId: string;
};

export default function OfferInput({
  bookingId,
}: Props) {
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const numericPrice = Number(
    price.replace(/[^0-9]/g, ""),
  );

  async function handleSend() {
    if (
      sending ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      return;
    }

    try {
      setSending(true);

      await addOffer({
        bookingId,
        sender: "customer",
        amount: numericPrice,
        message: message.trim(),
      });

      setPrice("");
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  const canSend =
    numericPrice > 0 && !sending;

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons
            name="pricetag-outline"
            size={20}
            color="#2563EB"
          />
        </View>

        <View style={styles.headerContent}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Make an Offer
          </AppText>

          <AppText style={styles.subtitle}>
            Tell the worker how much you can pay.
          </AppText>
        </View>
      </View>

      {/* PRICE */}

      <View style={styles.priceBox}>
        <AppText style={styles.priceLabel}>
          Your price
        </AppText>

        <View style={styles.priceRow}>
          <AppText
            weight="bold"
            style={styles.currency}
          >
            ₦
          </AppText>

          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor="#CBD5E1"
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={9}
            style={styles.priceInput}
          />
        </View>
      </View>

      {/* MESSAGE */}

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Message (optional)"
        placeholderTextColor="#94A3B8"
        multiline
        maxLength={200}
        textAlignVertical="top"
        style={styles.messageInput}
      />

      {/* SEND */}

      <Pressable
        disabled={!canSend}
        onPress={handleSend}
        accessibilityRole="button"
        accessibilityLabel="Send offer"
        style={({ pressed }) => [
          styles.button,
          !canSend && styles.buttonDisabled,
          pressed && canSend && styles.pressed,
        ]}
      >
        {sending ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <>
            <Ionicons
              name="send-outline"
              size={18}
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={styles.buttonText}
            >
              Send Offer
            </AppText>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 4,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontSize: 15,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: "#94A3B8",
  },

  priceBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  priceLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },

  currency: {
    fontSize: 24,
    color: "#F97316",
  },

  priceInput: {
    flex: 1,
    padding: 0,
    marginLeft: 5,
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "800",
  },

  messageInput: {
    minHeight: 48,
    maxHeight: 90,
    marginTop: 8,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#0F172A",
    fontSize: 13,
  },

  button: {
    height: 46,
    marginTop: 9,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonDisabled: {
    backgroundColor: "#CBD5E1",
  },

  pressed: {
    opacity: 0.82,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});