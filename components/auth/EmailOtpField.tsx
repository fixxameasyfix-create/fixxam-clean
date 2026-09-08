import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import AppInput from "@/components/ui/AppInput";

import OtpVerification from "@/components/auth/OtpVerification";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export interface EmailOtpFieldProps {
  email: string;

  otp: string;

  onEmailChange: (
    value: string,
  ) => void;

  onOtpChange: (
    value: string,
  ) => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  isVerified?: boolean;

  onVerifiedChange?: (
    value: boolean,
  ) => void;

  error?: string;

  disabled?: boolean;
}

function EmailOtpField({
  email,
  otp,

  onEmailChange,
  onOtpChange,

  role = "customer",
  variant,

  isVerified = false,
  onVerifiedChange,

  error,

  disabled = false,
}: EmailOtpFieldProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const handleEmailChange =
    useCallback(
      (value: string) => {
        if (value === email) {
          return;
        }

        onEmailChange(value);

        /*
         * Verification belongs to the
         * exact email address that was
         * verified. Editing it invalidates
         * the previous verification.
         */
        if (isVerified) {
          onVerifiedChange?.(false);
        }
      },
      [
        email,
        isVerified,
        onEmailChange,
        onVerifiedChange,
      ],
    );

  return (
    <View style={styles.container}>
      <AppInput
        role={resolvedRole}
        label="Email Address"
        placeholder="Enter your email address"
        value={email}
        onChangeText={
          handleEmailChange
        }
        editable={!disabled}
        keyboardType="email-address"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        leftIconName="mail"
        helperText="Optional (Email or Phone required)"
        error={error}
        accessibilityLabel="Email address"
      />

      <View style={styles.verification}>
        <OtpVerification
          type="email"
          value={email}
          otp={otp}
          onOtpChange={onOtpChange}
          role={resolvedRole}
          verified={isVerified}
          onVerified={(value) =>
            onVerifiedChange?.(
              value,
            )
          }
        />
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    verification: {
      marginTop:
        FixxamTokens.spacing.md,
    },
  });

export default memo(
  EmailOtpField,
);