import React from "react";
import { View } from "react-native";

import {
  AppButton,
} from "@/components/ui";

type Props = {
  otpSent: boolean;
  loading: boolean;
  resending: boolean;
  resendCount: number;
  locked: boolean;
  timeLeft: number;
  onSend: () => void;
  onResend: () => void;
};

export default function OtpResendCard({
  otpSent,
  loading,
  resending,
  resendCount,
  locked,
  timeLeft,
  onSend,
  onResend,
}: Props) {
  const formatTime = (
    seconds: number
  ) => {
    const minutes =
      Math.floor(seconds / 60);

    const secs =
      seconds % 60;

    return `${minutes}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {!locked && (
        <View style={{ flex: 1 }}>
          <AppButton
            title={
              otpSent
                ? "Sent ✓"
                : "Send"
            }
            variant="worker"
            loading={loading}
            disabled={otpSent}
            onPress={onSend}
          />
        </View>
      )}

      {otpSent && !locked && (
        <View style={{ flex: 1 }}>
          <AppButton
            title={`Resend (${resendCount}/10)`}
            variant="customer"
            loading={resending}
            onPress={onResend}
          />
        </View>
      )}

      {locked && (
        <View style={{ flex: 1 }}>
          <AppButton
            title={`Retry In ${formatTime(
              timeLeft
            )}`}
            variant="customer"
            onPress={() => {}}
          />
        </View>
      )}
    </View>
  );
}