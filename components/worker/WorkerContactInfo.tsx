import React, {
  memo,
} from "react";

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

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   COMPONENT
============================================================ */

function WorkerContactInfo({
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
    <AppCard
      role="worker"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <AppText
        variant="heading3"
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

      {/* ==================================================
          EMAIL
      ================================================== */}

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
          variant="worker"
          isVerified={
            emailVerified
          }
          onVerifiedChange={
            setEmailVerified
          }
        />
      </View>

      {/* ==================================================
          PHONE
      ================================================== */}

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
          variant="worker"
          isVerified={
            phoneVerified
          }
          onVerifiedChange={
            setPhoneVerified
          }
        />
      </View>

      {/* ==================================================
          SECURITY HINT
      ================================================== */}

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.hint
        }
      >
        Your contact details are kept secure.
      </AppText>
    </AppCard>
  );
}

export default memo(
  WorkerContactInfo,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginTop:
        FixxamTokens.spacing.xxxl,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginBottom:
        FixxamTokens.spacing.lg,

      color:
        Colors.textSecondary,
    },

    emailSection: {
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    phoneSection: {
      width:
        "100%",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    hint: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },
  });