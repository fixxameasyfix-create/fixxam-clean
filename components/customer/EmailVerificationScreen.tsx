import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import OtpVerification from "@/components/auth/OtpVerification";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

type Props = {
  email: string;

  otp: string;

  setOtp: (
    value: string,
  ) => void;

  onVerified: () => void;
};

function EmailVerificationScreen({
  email,
  otp,
  setOtp,
  onVerified,
}: Props) {
  return (
    <View
      style={styles.container}
    >
      <AppText
        variant="heading2"
        weight="bold"
        style={styles.title}
      >
        Verify your email
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={styles.subtitle}
      >
        Enter the 6-digit code we
        sent to {email}.
      </AppText>

      <OtpVerification
        type="email"
        mode="verify"
        initialOtpSent
        value={email}
        otp={otp}
        onOtpChange={
          setOtp
        }
        variant="customer"
        verified={false}
        onVerified={
          verified => {
            if (verified) {
              onVerified();
            }
          }
        }
      />
    </View>
  );
}

export default memo(
  EmailVerificationScreen,
);

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
      paddingTop:
        FixxamTokens.spacing.md,
    },

    title: {
      color: Colors.textPrimary,
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    subtitle: {
      maxWidth: 340,
      marginBottom:
        FixxamTokens.spacing.lg,
      color: Colors.textSecondary,
    },
  });