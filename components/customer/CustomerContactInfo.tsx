import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppInput,
  AppText,
} from "@/components/ui";

import OtpVerification from "@/components/auth/OtpVerification";

import {
  FixxamTokens,
} from "@/theme";

export type CustomerRegistrationSource =
  | "new"
  | "worker";

export type CustomerPrefillMode =
  | "worker"
  | "blank";

type Props = {
  email: string;

  emailOtp: string;

  emailVerified: boolean;

  setEmail: (
    value: string,
  ) => void;

  setEmailOtp: (
    value: string,
  ) => void;

  setEmailVerified: (
    value: boolean,
  ) => void;

  onExistingAccount?: (
    email: string,
  ) => void;

  onOtpSent?: () => void;

  registrationSource?: CustomerRegistrationSource;

  prefillMode?: CustomerPrefillMode;
};

function CustomerContactInfo({
  email,
  emailOtp,
  emailVerified,
  setEmail,
  setEmailOtp,
  setEmailVerified,
  onExistingAccount,
  onOtpSent,
  registrationSource = "new",
  prefillMode = "blank",
}: Props) {
  const isWorkerRegistration =
    registrationSource === "worker";

  const isWorkerPrefill =
    isWorkerRegistration &&
    prefillMode === "worker";

  /* ============================================================
     EMAIL CHANGE
  ============================================================ */

  const handleEmailChange =
    useCallback(
      (value: string) => {
        /*
         * Worker-detail registration uses the
         * authenticated Firebase account email.
         *
         * It must not be changed from this screen.
         */
        if (isWorkerPrefill) {
          return;
        }

        const normalizedValue =
          value.trim();

        /*
         * Changing the email invalidates
         * the previous verification state.
         */
        if (
          normalizedValue !==
          email
        ) {
          setEmailVerified(false);
          setEmailOtp("");
        }

        setEmail(
          normalizedValue,
        );
      },
      [
        email,
        isWorkerPrefill,
        setEmail,
        setEmailOtp,
        setEmailVerified,
      ],
    );

  /* ============================================================
     OTP SENT
  ============================================================ */

  const handleOtpSent =
    useCallback(() => {
      onOtpSent?.();
    }, [onOtpSent]);

  /* ============================================================
     EXISTING ACCOUNT
  ============================================================ */

  const handleExistingAccount =
    useCallback(
      (existingEmail: string) => {
        /*
         * Existing-account handling only applies
         * to the normal customer registration flow.
         */
        if (isWorkerRegistration) {
          return;
        }

        /*
         * Do not navigate here.
         *
         * CustomerSignup owns the decision screen.
         */
        onExistingAccount?.(
          existingEmail,
        );
      },
      [
        isWorkerRegistration,
        onExistingAccount,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.inputSection}
      >
        <AppInput
          label="Email address"
          placeholder="Enter your email"
          value={email}
          onChangeText={
            handleEmailChange
          }
          variant="customer"
          leftIconName="mail"
          keyboardType="email-address"
          inputMode="email"
          autoComplete="email"
          textContentType="emailAddress"
          autoCapitalize="none"
          autoCorrect={false}
          editable={
            !emailVerified &&
            !isWorkerPrefill
          }
          accessibilityLabel="Email address"
        />
      </View>

      {isWorkerPrefill ? (
        <View
          style={styles.workerNotice}
        >
          <AppText
            variant="caption"
            tone="secondary"
            style={styles.workerNoticeText}
          >
            Your worker account email is
            being used for your customer
            profile. Your customer profile
            will remain separate after
            registration.
          </AppText>
        </View>
      ) : null}

      {!emailVerified &&
      !isWorkerPrefill ? (
        <View
          style={
            styles.actionSection
          }
        >
          <OtpVerification
            type="email"
            value={email}
            otp={emailOtp}
            onOtpChange={
              setEmailOtp
            }
            variant="customer"
            verified={
              emailVerified
            }
            onVerified={
              setEmailVerified
            }
            mode="send"
            onOtpSent={
              handleOtpSent
            }
            onExistingAccount={
              handleExistingAccount
            }
          />
        </View>
      ) : null}
    </View>
  );
}

export default memo(
  CustomerContactInfo,
);

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingTop:
        FixxamTokens.spacing.sm,
    },

    inputSection: {
      width: "100%",
    },

    actionSection: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.md,
    },

    workerNotice: {
      marginTop:
        FixxamTokens.spacing.sm,
      paddingHorizontal:
        FixxamTokens.spacing.xs,
    },

    workerNoticeText: {
      lineHeight: 18,
    },
  });