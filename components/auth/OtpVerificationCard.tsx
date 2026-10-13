import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import OtpBoxes from "@/components/auth/OtpBoxes";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

export interface OtpVerificationCardProps {
  otp: string;

  loading: boolean;

  verified: boolean;

  onChangeOtp: (
    value: string,
  ) => void;

  onVerify: (
    otp?: string,
  ) => void;

  role?: FixxamRole;

  variant?: "customer" | "worker";

  error?: string;
}

function OtpVerificationCard({
  otp,
  loading,
  verified,
  onChangeOtp,
  onVerify,
  role,
  variant,
  error,
}: OtpVerificationCardProps) {
  const resolvedRole =
    variant ?? role;

  /* ============================================================
     OTP COMPLETE
     
     IMPORTANT:
     Pass the completed OTP directly.
     
     This prevents the common React state
     problem where the 6th digit has not
     reached parent state yet.
  ============================================================ */

  const handleComplete =
    useCallback(
      (completeOtp: string) => {
        if (
          verified ||
          loading
        ) {
          return;
        }

        const sanitizedOtp =
          completeOtp
            .replace(/\D/g, "")
            .slice(0, 6);

        if (
          sanitizedOtp.length !==
          6
        ) {
          return;
        }

        onVerify(
          sanitizedOtp,
        );
      },
      [
        loading,
        onVerify,
        verified,
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
      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.title
        }
      >
        Enter verification code
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Enter the 6-digit code sent to your email address.
      </AppText>

      <OtpBoxes
        value={otp}
        onChange={
          onChangeOtp
        }
        onComplete={
          handleComplete
        }
        role={
          resolvedRole
        }
        editable={
          !loading &&
          !verified
        }
        error={error}
      />
    </View>
  );
}

export default memo(
  OtpVerificationCard,
);

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    subtitle: {
      marginBottom:
        FixxamTokens.spacing.md,
    },
  });