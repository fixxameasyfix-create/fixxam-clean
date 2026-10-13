import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppText,
} from "@/components/ui";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

const MAX_RESEND_COUNT = 10;

function formatTime(
  seconds: number,
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(seconds),
    );

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const remainingSeconds =
    safeSeconds % 60;

  return `${minutes}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export interface OtpResendCardProps {
  otpSent: boolean;

  loading: boolean;

  resending: boolean;

  resendCount: number;

  locked: boolean;

  timeLeft: number;

  onSend: () => void;

  onResend: () => void;

  role?: FixxamRole;

  variant?: "customer" | "worker";

  resendDisabled?: boolean;

  resendLabel?: string;
}

function OtpResendCard({
  otpSent,
  loading,
  resending,
  resendCount,
  locked,
  timeLeft,
  onSend,
  onResend,

  role = "customer",
  variant,

  resendDisabled = false,
  resendLabel = "Resend code",
}: OtpResendCardProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const safeResendCount =
    Math.min(
      MAX_RESEND_COUNT,
      Math.max(
        0,
        Math.floor(
          resendCount,
        ),
      ),
    );

  const cooldownActive =
    timeLeft > 0;

  /* ============================================================
     LOCKED
  ============================================================ */

  if (locked) {
    return (
      <View
        style={styles.container}
      >
        <View
          style={styles.messageContainer}
        >
          <AppText
            variant="body"
            tone="warning"
            center
            style={styles.message}
          >
            You've requested too many
            codes. Please try again
            later.
          </AppText>
        </View>

        <AppButton
          title={`Try again in ${formatTime(
            timeLeft,
          )}`}
          role={resolvedRole}
          variant="outline"
          disabled
          onPress={onResend}
        />
      </View>
    );
  }

  /* ============================================================
     INITIAL SEND
  ============================================================ */

  if (!otpSent) {
    return (
      <View
        style={styles.container}
      >
        <AppButton
          title="Continue"
          role={resolvedRole}
          leftIconName="mail"
          loading={loading}
          disabled={loading}
          onPress={onSend}
        />
      </View>
    );
  }

  /* ============================================================
     OTP SENT / RESEND
  ============================================================ */

  return (
    <View
      style={styles.container}
    >
      <AppText
        variant="body"
        tone="success"
        center
        style={styles.sentText}
      >
        Verification code sent
      </AppText>

      <AppButton
        title={
          cooldownActive
            ? `Resend code in ${formatTime(
                timeLeft,
              )}`
            : resendLabel
        }
        role={resolvedRole}
        variant="outline"
        loading={resending}
        disabled={
          resending ||
          resendDisabled ||
          cooldownActive ||
          safeResendCount >=
            MAX_RESEND_COUNT
        }
        onPress={onResend}
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    messageContainer: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    message: {
      lineHeight: 22,
    },

    sentText: {
      marginBottom:
        FixxamTokens.spacing.sm,
    },
  });

export default memo(
  OtpResendCard,
);