import React, {
  memo,
  useCallback,
} from "react";

import { StyleSheet, View } from "react-native";

import AppInput from "@/components/ui/AppInput";

import OtpVerification from "@/components/auth/OtpVerification";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

const MAX_PHONE_LENGTH = 11;

export interface PhoneOtpFieldProps {
  phone: string;

  otp: string;

  onPhoneChange: (value: string) => void;

  onOtpChange: (value: string) => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  isVerified?: boolean;

  onVerifiedChange?: (
    value: boolean
  ) => void;

  error?: string;

  disabled?: boolean;
}

function PhoneOtpField({
  phone,
  otp,

  onPhoneChange,
  onOtpChange,

  role = "customer",
  variant,

  isVerified = false,
  onVerifiedChange,

  error,

  disabled = false,
}: PhoneOtpFieldProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const handlePhoneChange = useCallback(
    (value: string) => {
      const cleaned = value
        .replace(/\D/g, "")
        .slice(0, MAX_PHONE_LENGTH);

      /*
       * Do nothing when the cleaned
       * value has not actually changed.
       */
      if (cleaned === phone) {
        return;
      }

      onPhoneChange(cleaned);

      /*
       * A previously verified number
       * must become unverified whenever
       * the phone number changes.
       */
      if (isVerified) {
        onVerifiedChange?.(false);
      }
    },
    [
      isVerified,
      onPhoneChange,
      onVerifiedChange,
      phone,
    ],
  );

  return (
    <View style={styles.container}>
      <AppInput
        role={resolvedRole}
        label="Phone Number"
        placeholder="08012345678"
        value={phone}
        onChangeText={handlePhoneChange}
        editable={!disabled}
        keyboardType="phone-pad"
        inputMode="tel"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={MAX_PHONE_LENGTH}
        leftIconName="phone"
        helperText="Optional (Email or Phone required)"
        error={error}
        accessibilityLabel="Phone number"
      />

      <View style={styles.verification}>
        <OtpVerification
          type="phone"
          value={phone}
          otp={otp}
          onOtpChange={onOtpChange}
          variant={resolvedRole}
          verified={isVerified}
          onVerified={(value) =>
            onVerifiedChange?.(value)
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  verification: {
    marginTop:
      FixxamTokens.spacing.md,
  },
});

export default memo(PhoneOtpField);