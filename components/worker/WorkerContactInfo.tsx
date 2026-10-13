import React, { memo, useCallback } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";

import OtpVerification from "@/components/auth/OtpVerification";

import { FixxamTokens } from "@/theme";

type Props = {
  email: string;
  emailOtp: string;
  emailVerified: boolean;

  setEmail: (value: string) => void;
  setEmailOtp: (value: string) => void;
  setEmailVerified: (value: boolean) => void;

  onOtpSent?: () => void;
  onExistingAccount?: (email: string) => void;
};

function WorkerContactInfo({
  email,
  emailOtp,
  emailVerified,
  setEmail,
  setEmailOtp,
  setEmailVerified,
  onOtpSent,
  onExistingAccount,
}: Props) {
  const handleEmailChange = useCallback(
    (value: string) => {
      const normalizedValue = value.trim();

      if (normalizedValue !== email) {
        setEmailVerified(false);
        setEmailOtp("");
      }

      setEmail(normalizedValue);
    },
    [email, setEmail, setEmailOtp, setEmailVerified],
  );

  const handleOtpSent = useCallback(() => {
    onOtpSent?.();
  }, [onOtpSent]);

  const handleExistingAccount = useCallback(
    (existingEmail: string) => {
      onExistingAccount?.(existingEmail);
    },
    [onExistingAccount],
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <AppInput
          placeholder="Enter your email"
          value={email}
          onChangeText={handleEmailChange}
          variant="worker"
          leftIconName="mail"
          keyboardType="email-address"
          inputMode="email"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!emailVerified}
          accessibilityLabel="Email address"
        />
      </View>

      {!emailVerified && (
        <View style={styles.actionSection}>
          <OtpVerification
            type="email"
            value={email}
            otp={emailOtp}
            onOtpChange={setEmailOtp}
            variant="worker"
            verified={emailVerified}
            onVerified={setEmailVerified}
            mode="send"
            onOtpSent={handleOtpSent}
            onExistingAccount={handleExistingAccount}
          />
        </View>
      )}

      {emailVerified && (
        <AppText
          variant="body"
          tone="success"
          style={styles.verifiedText}
        >
          Email verified successfully.
        </AppText>
      )}
    </View>
  );
}

export default memo(WorkerContactInfo);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: FixxamTokens.spacing.sm,
  },

  inputSection: {
    width: "100%",
  },

  actionSection: {
    width: "100%",
    marginTop: FixxamTokens.spacing.lg,
    paddingBottom: FixxamTokens.spacing.md,
  },

  verifiedText: {
    marginTop: FixxamTokens.spacing.sm,
  },
});