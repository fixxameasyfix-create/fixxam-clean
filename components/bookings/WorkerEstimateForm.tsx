import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  addOffer,
} from "@/firebase/queries/bookings/addOffer";

type Props = {
  bookingId: string;
  onSuccess?: () => void;
};

export default function WorkerEstimateForm({
  bookingId,
  onSuccess,
}: Props) {
  const [price, setPrice] =
    useState("");

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

    const cleanPrice =
      price.trim();

    if (!cleanPrice) {
      Alert.alert(
        "Price required",
        "Please enter your estimate.",
      );

      return;
    }

    const amount =
      Number(cleanPrice);

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
        bookingId:
          cleanBookingId,

        sender: "worker",

        amount,

        message:
          cleanMessage,
      });

      setPrice("");
      setMessage("");

      onSuccess?.();

      Alert.alert(
        "Offer Sent",
        "Your estimate has been sent to the customer.",
      );
    } catch (error) {
      console.error(
        "SEND_WORKER_OFFER_ERROR",
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
        Send Estimate
      </AppText>

      <AppText
        style={styles.description}
      >
        Enter the price you want to
        charge for this service.
      </AppText>

      <TextInput
        placeholder="Enter price"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
        editable={!sending}
        style={styles.input}
      />

      <TextInput
        placeholder="Message to customer (optional)"
        placeholderTextColor="#94A3B8"
        value={message}
        onChangeText={setMessage}
        editable={!sending}
        multiline
        maxLength={500}
        textAlignVertical="top"
        style={[
          styles.input,
          styles.message,
        ]}
      />

      <AppText
        style={styles.counter}
      >
        {message.length}/500
      </AppText>

      <Pressable
        disabled={sending}
        onPress={handleSend}
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
            Send Offer
          </AppText>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
  },

  description: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginTop: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  message: {
    height: 90,
    textAlignVertical: "top",
  },

  counter: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 11,
    color: "#94A3B8",
  },

  button: {
    minHeight: 50,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});