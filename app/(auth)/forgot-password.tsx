import React, { useState } from "react";
import { router } from "expo-router";

import {
  AppScreen,
  AppCard,
  AppText,
  AppInput,
  AppButton,
} from "@/components/ui";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!identifier.trim()) {
      showError(
        "Email Required",
        "Please enter your email address or phone number."
      );
      return;
    }

    const emailOrPhoneRegex =
      /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\+?\d{10,15})$/;

    if (!emailOrPhoneRegex.test(identifier.trim())) {
      showError(
        "Invalid Input",
        "Please enter a valid email or phone number."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://sendpasswordresetotp-yrig53veoq-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: identifier.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to send OTP"
        );
      }

      showSuccess(
        "OTP Sent",
        "Verification code sent successfully."
      );

      router.push({
        pathname: "/(auth)/verify-reset-otp",
        params: {
          email: identifier.trim(),
        },
      });

    } catch (error: any) {
      showError(
        "Failed",
        error?.message ||
          "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AppScreen>
      <AppText
        size="xl"
        weight="bold"
        center
        style={styles.title}
      >
        Forgot Password?
      </AppText>

      <AppText
        center
        style={styles.subtitle}
      >
        Enter your email address or phone number
        and we'll send you a verification code.
      </AppText>

      <AppCard style={styles.card}>
        <AppInput
          label="Email / Phone Number"
          leftIcon="mail-outline"
          placeholder="Enter your email or phone number"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="default"
          autoCapitalize="none"
        />
      </AppCard>

      <View style={styles.button}>
  <AppButton
    title="Send"
    loading={loading}
    variant="customer"
    onPress={handleResetPassword}
  />
</View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#0B1F4D",
    marginTop: 40,
    marginBottom: 8,
    fontSize: 28,
  },

  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 18,
  },

  card: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
    marginBottom: 16,
  },

  button: {
    marginHorizontal: 16,
  },
});