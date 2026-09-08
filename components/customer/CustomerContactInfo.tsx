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

import EmailOtpField from "@/components/auth/EmailOtpField";
import PhoneOtpField from "@/components/auth/PhoneOtpField";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  email: string;

  emailOtp: string;

  phone: string;

  otp: string;

  emailVerified: boolean;

  phoneVerified: boolean;

  setEmail: (
    value: string,
  ) => void;

  setEmailOtp: (
    value: string,
  ) => void;

  setPhone: (
    value: string,
  ) => void;

  setOtp: (
    value: string,
  ) => void;

  setEmailVerified: (
    value: boolean,
  ) => void;

  setPhoneVerified: (
    value: boolean,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerContactInfo({
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
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <AppText
        variant="heading2"
        weight="bold"
        style={
          styles.title
        }
      >
        How can we reach you?
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Add your contact details. Verify at least one to continue.
      </AppText>

      {/* ========================================================
          EMAIL
      ======================================================== */}

      <View
        style={
          styles.emailSection
        }
      >
        <EmailOtpField
          email={
            email
          }
          otp={
            emailOtp
          }
          onEmailChange={
            setEmail
          }
          onOtpChange={
            setEmailOtp
          }
          variant="customer"
          isVerified={
            emailVerified
          }
          onVerifiedChange={
            setEmailVerified
          }
        />
      </View>

      {/* ========================================================
          PHONE
      ======================================================== */}

      <View
        style={
          styles.phoneSection
        }
      >
        <PhoneOtpField
          phone={
            phone
          }
          otp={
            otp
          }
          onPhoneChange={
            setPhone
          }
          onOtpChange={
            setOtp
          }
          variant="customer"
          isVerified={
            phoneVerified
          }
          onVerifiedChange={
            setPhoneVerified
          }
        />
      </View>

      {/* ========================================================
          SECURITY NOTE
      ======================================================== */}

      <AppText
        accessibilityRole="text"
        variant="caption"
        tone="secondary"
        style={
          styles.securityText
        }
      >
        Your contact details are kept secure.
      </AppText>
    </View>
  );
}

export default memo(
  CustomerContactInfo,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingTop:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.xxs,
    },

    title: {
      color:
        Colors.textPrimary,

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    subtitle: {
      maxWidth: 340,

      marginBottom:
        FixxamTokens.spacing.xl,

      color:
        Colors.textSecondary,
    },

    emailSection: {
      marginBottom:
        FixxamTokens.spacing.lg,
    },

    phoneSection: {
      marginBottom:
        FixxamTokens.spacing.xs,
    },

    securityText: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginLeft:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },
  });