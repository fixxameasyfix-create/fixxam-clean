import React from "react";
import { View } from "react-native";

import {
  AppInput,
  AppText,
} from "@/components/ui";

import OtpVerification from "@/components/auth/OtpVerification";

type Props = {
  email: string;
  otp: string;

  onEmailChange: (value: string) => void;
  onOtpChange: (value: string) => void;

  variant?: "customer" | "worker";

  isVerified?: boolean;
  onVerifiedChange?: (
    value: boolean
  ) => void;
};

export default function EmailOtpField({
  email,
  otp,
  onEmailChange,
  onOtpChange,
  variant = "customer",
  isVerified = false,
  onVerifiedChange,
}: Props) {
  return (
    <View>
      <AppInput
        label="Email Address"
        placeholder="Enter your email address"
        value={email}
        onChangeText={(value) => {
          onEmailChange(value);

          if (isVerified) {
            onVerifiedChange?.(false);
          }
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        variant={variant}
      />

      <AppText
        size="sm"
        color="#6B7280"
        style={{
          marginTop: 2,
          marginBottom: 8,
        }}
      >
        Optional (Email or Phone required)
      </AppText>

      <OtpVerification
        type="email"
        value={email}
        otp={otp}
        onOtpChange={onOtpChange}
        variant={variant}
        verified={isVerified}
        onVerified={(value) =>
          onVerifiedChange?.(value)
        }
      />
    </View>
  );
}