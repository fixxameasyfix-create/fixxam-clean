import React, { memo } from "react";

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

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  /*
   * Controls resend cooldown.
   */
  resendDisabled?: boolean;

  /*
   * Custom resend label.
   * Example: "Resend in 0:25"
   */
  resendLabel?: string;
}

function formatTime(
  seconds: number,
): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(seconds),
  );

  const minutes = Math.floor(
    safeSeconds / 60,
  );

  const remainingSeconds =
    safeSeconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
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
  resendLabel = "Resend Code",
}: OtpResendCardProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const safeResendCount = Math.min(
    MAX_RESEND_COUNT,
    Math.max(
      0,
      Math.floor(resendCount),
    ),
  );

  if (locked) {
    return (
      <View style={styles.container}>
        <AppText
          variant="caption"
          tone="warning"
          center
          style={styles.message}
        >
          Too many resend attempts. Please wait before trying again.
        </AppText>

        <AppButton
          title={`Retry in ${formatTime(
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

  if (!otpSent) {
    return (
      <View style={styles.container}>
        <AppButton
          title="Send Code"
          role={resolvedRole}
          leftIconName="messages"
          loading={loading}
          disabled={loading}
          onPress={onSend}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sentRow}>
        <AppText
          variant="bodyMedium"
          tone="success"
        >
          Verification code sent
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
        >
          {safeResendCount}/{MAX_RESEND_COUNT}
        </AppText>
      </View>

      <AppButton
        title={resendLabel}
        role={resolvedRole}
        variant="outline"
        loading={resending}
        disabled={
          resending ||
          resendDisabled ||
          safeResendCount >=
            MAX_RESEND_COUNT
        }
        onPress={onResend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    marginBottom:
      FixxamTokens.spacing.xl,
  },

  sentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  message: {
    marginBottom:
      FixxamTokens.spacing.md,
  },
});

export default memo(OtpResendCard);