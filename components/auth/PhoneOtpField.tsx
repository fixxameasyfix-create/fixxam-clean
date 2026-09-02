import React from "react";
import { View } from "react-native";

import {
  AppInput,
  AppText,
} from "@/components/ui";

import OtpVerification from "@/components/auth/OtpVerification";

type Props = {
  phone: string;
  otp: string;

  onPhoneChange: (value: string) => void;
  onOtpChange: (value: string) => void;

  variant?: "customer" | "worker";

  isVerified?: boolean;
  onVerifiedChange?: (
    value: boolean
  ) => void;
};

export default function PhoneOtpField({
  phone,
  otp,
  onPhoneChange,
  onOtpChange,
  variant = "customer",
  isVerified = false,
  onVerifiedChange,
}: Props) {
  return (
    <View>
      <AppInput
        label="Phone Number"
        placeholder="08012345678"
        keyboardType="number-pad"
        value={phone}
        onChangeText={(value) => {
          const cleaned = value
            .replace(/\D/g, "")
            .slice(0, 11);

          onPhoneChange(cleaned);

          if (isVerified) {
            onVerifiedChange?.(false);
          }
        }}
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
        type="phone"
        value={phone}
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