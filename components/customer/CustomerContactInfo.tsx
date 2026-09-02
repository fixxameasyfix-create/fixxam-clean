import React from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";

import { CustomerColors } from "@/theme";

import EmailOtpField from "@/components/auth/EmailOtpField";
import PhoneOtpField from "@/components/auth/PhoneOtpField";

type Props = {
  email: string;
  emailOtp: string;
  phone: string;
  otp: string;

  emailVerified: boolean;
  phoneVerified: boolean;

  setEmail: (value: string) => void;
  setEmailOtp: (value: string) => void;
  setPhone: (value: string) => void;
  setOtp: (value: string) => void;

  setEmailVerified: (value: boolean) => void;
  setPhoneVerified: (value: boolean) => void;
};

export default function CustomerContactInfo({
  email,
  emailOtp,
  phone,
  otp,
  emailVerified,
  phoneVerified,
  setEmail,
  setEmailOtp,
  setPhone,
  setOtp,
  setEmailVerified,
  setPhoneVerified,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        How can we reach you?
      </AppText>

      <AppText style={styles.subtitle}>
        Add your contact details. Verify at least
        one to continue.
      </AppText>

      {/* Email */}

      <View style={styles.emailSection}>
        <EmailOtpField
          email={email}
          otp={emailOtp}
          onEmailChange={setEmail}
          onOtpChange={setEmailOtp}
          variant="customer"
          isVerified={emailVerified}
          onVerifiedChange={
            setEmailVerified
          }
        />
      </View>

      {/* Phone */}

      <View style={styles.phoneSection}>
        <PhoneOtpField
          phone={phone}
          otp={otp}
          onPhoneChange={setPhone}
          onOtpChange={setOtp}
          variant="customer"
          isVerified={phoneVerified}
          onVerifiedChange={
            setPhoneVerified
          }
        />
      </View>

      <AppText style={styles.securityText}>
        Your contact details are kept secure.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 4,
    paddingTop: 28,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    color: CustomerColors.textPrimary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: CustomerColors.textSecondary,
    marginBottom: 22,
    maxWidth: 340,
  },

  emailSection: {
    marginBottom: 20,
  },

  phoneSection: {
    marginBottom: 6,
  },

  securityText: {
    fontSize: 12,
    lineHeight: 17,
    color: CustomerColors.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
});