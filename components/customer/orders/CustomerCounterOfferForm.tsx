import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

import { addOffer } from "@/firebase/queries/bookings/addOffer";

type Props = {
  bookingId: string;
  currentPrice?: number | null;
  onSuccess?: () => void;
};

export default function CustomerCounterOfferForm({
  bookingId,
  currentPrice,
  onSuccess,
}: Props) {
  const [price, setPrice] = useState(
    currentPrice ? String(currentPrice) : "",
  );

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);

  async function handleSend() {
    if (sending) {
      return;
    }

    const cleanBookingId =
      bookingId.trim();

    if (!cleanBookingId) {
      Alert.alert(
        "Unable to send offer",
        "Booking ID is missing.",
      );
      return;
    }

    const cleanPrice = price.trim();

    if (!cleanPrice) {
      Alert.alert(
        "Price required",
        "Please enter your counter offer.",
      );
      return;
    }

    const amount = Number(cleanPrice);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      Alert.alert(
        "Invalid price",
        "Please enter a valid amount greater than zero.",
      );
      return;
    }

    const cleanMessage =
      message.trim();

    if (cleanMessage.length > 500) {
      Alert.alert(
        "Message too long",
        "Please keep your message below 500 characters.",
      );
      return;
    }

    setSending(true);

    try {
      await addOffer({
        bookingId: cleanBookingId,
        sender: "customer",
        amount,
        message: cleanMessage,
      });

      setMessage("");

      onSuccess?.();

      Alert.alert(
        "Counter Offer Sent",
        "Your new price has been sent to the worker.",
      );
    } catch (error) {
      console.error(
        "SEND_CUSTOMER_COUNTER_OFFER_ERROR",
        error,
      );

      Alert.alert(
        "Unable to send offer",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Make a Counter Offer
      </AppText>

      <AppText
        style={styles.description}
      >
        Enter the price you are willing to
        pay for this service.
      </AppText>

      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Enter your price"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        editable={!sending}
        style={styles.input}
      />

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Message to worker (optional)"
        placeholderTextColor="#94A3B8"
        multiline
        maxLength={500}
        editable={!sending}
        textAlignVertical="top"
        style={[
          styles.input,
          styles.messageInput,
        ]}
      />

      <AppText style={styles.counter}>
        {message.length}/500
      </AppText>

      <Pressable
        onPress={handleSend}
        disabled={sending}
        style={[
          styles.button,
          sending &&
            styles.buttonDisabled,
        ]}
      >
        {sending ? (
          <>
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <AppText
              weight="bold"
              style={styles.buttonText}
            >
              Sending...
            </AppText>
          </>
        ) : (
          <AppText
            weight="bold"
            style={styles.buttonText}
          >
            Send Counter Offer
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  title: {
    fontSize: 16,
    color: "#0F172A",
  },

  description: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  input: {
    marginTop: 13,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },

  messageInput: {
    height: 85,
    textAlignVertical: "top",
  },

  counter: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 11,
    color: "#94A3B8",
  },

  button: {
    minHeight: 48,
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
  },
});