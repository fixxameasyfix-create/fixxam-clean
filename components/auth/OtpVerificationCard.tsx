import React, { memo, useCallback } from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
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

  onChangeOtp: (value: string) => void;

  onVerify: () => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  error?: string;
}

function OtpVerificationCard({
  otp,
  loading,
  verified,

  onChangeOtp,
  onVerify,

  role = "customer",
  variant,

  error,
}: OtpVerificationCardProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const complete =
    otp.replace(/\D/g, "").length === 6;

  const handleComplete = useCallback(() => {
    if (
      !verified &&
      !loading
    ) {
      onVerify();
    }
  }, [
    loading,
    onVerify,
    verified,
  ]);

  return (
    <View style={styles.container}>
      <OtpBoxes
        value={otp}
        onChange={onChangeOtp}
        onComplete={handleComplete}
        role={resolvedRole}
        editable={
          !loading &&
          !verified
        }
        error={error}
      />

      {verified ? (
        <AppText
          variant="bodyMedium"
          tone="success"
          center
          style={styles.verifiedText}
        >
          Code verified successfully
        </AppText>
      ) : null}

      <AppButton
        title={
          verified
            ? "Verified"
            : "Verify Code"
        }
        role={resolvedRole}
        leftIconName={
          verified
            ? "success"
            : "check"
        }
        loading={loading}
        disabled={
          verified ||
          !complete
        }
        onPress={onVerify}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  verifiedText: {
    marginTop:
      FixxamTokens.spacing.sm,
  },

  button: {
    width: "100%",

    marginTop:
      FixxamTokens.spacing.lg,
  },
});

export default memo(OtpVerificationCard);