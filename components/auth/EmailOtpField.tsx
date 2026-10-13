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

/* ==============================================================
   TYPES
============================================================== */

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

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_EMAIL_LENGTH = 254;

/* ==============================================================
   HELPERS
============================================================== */

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .slice(
      0,
      MAX_EMAIL_LENGTH,
    );
}

/* ==============================================================
   COMPONENT
============================================================== */

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

  /* ============================================================
     EMAIL CHANGE
  ============================================================ */

  const handleEmailChange =
    useCallback(
      (value: string) => {
        const normalizedEmail =
          normalizeEmail(
            value,
          );

        if (
          normalizedEmail ===
          email
        ) {
          return;
        }

        onEmailChange(
          normalizedEmail,
        );

        /*
         * Verification belongs to
         * the exact email address that
         * was previously verified.
         *
         * Editing the email invalidates
         * that verification state.
         */
        if (isVerified) {
          onVerifiedChange?.(
            false,
          );
        }
      },
      [
        email,
        isVerified,
        onEmailChange,
        onVerifiedChange,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      <AppInput
        role={
          resolvedRole
        }
        label="Email Address"
        placeholder="Enter your email address"
        value={email}
        onChangeText={
          handleEmailChange
        }
        editable={
          !disabled
        }
        keyboardType="email-address"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        maxLength={
          MAX_EMAIL_LENGTH
        }
        leftIconName="mail"
        error={error}
        accessibilityLabel="Email address"
      />

      {!disabled ? (
        <View
          style={
            styles.verification
          }
        >
          <OtpVerification
            type="email"
            value={email}
            otp={otp}
            onOtpChange={
              onOtpChange
            }
            role={
              resolvedRole
            }
            variant={
              variant
            }
            verified={
              isVerified
            }
            onVerified={
              onVerifiedChange ??
              (() => {})
            }
          />
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    verification: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },
  });

export default memo(
  EmailOtpField,
);