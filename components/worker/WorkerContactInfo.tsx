import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

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

export default function WorkerContactInfo({
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
    <AppCard style={styles.card}>
      {/* ==================================================
          HEADER
      ================================================== */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        How can we reach you?
      </AppText>

      <AppText style={styles.subtitle}>
        Add your contact details. Verify at
        least one to continue.
      </AppText>

      {/* ==================================================
          EMAIL
      ================================================== */}

      <View style={styles.emailSection}>
        <EmailOtpField
          email={email}
          otp={emailOtp}
          onEmailChange={setEmail}
          onOtpChange={setEmailOtp}
          variant="worker"
          isVerified={emailVerified}
          onVerifiedChange={
            setEmailVerified
          }
        />
      </View>

      {/* ==================================================
          PHONE
      ================================================== */}

      <View style={styles.phoneSection}>
        <PhoneOtpField
          phone={phone}
          otp={otp}
          onPhoneChange={setPhone}
          onOtpChange={setOtp}
          variant="worker"
          isVerified={phoneVerified}
          onVerifiedChange={
            setPhoneVerified
          }
        />
      </View>

      {/* ==================================================
          SECURITY HINT
      ================================================== */}

      <AppText style={styles.hint}>
        Your contact details are kept secure.
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 50,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    color: "#0F172A",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    marginBottom: 18,
  },

  emailSection: {
    width: "100%",
    marginBottom: 20,
  },

  phoneSection: {
    width: "100%",
    marginBottom: 6,
  },

  hint: {
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
    marginTop: 6,
  },
});