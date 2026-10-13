import React, {
  useCallback,
  useState,
} from "react";

import { router } from "expo-router";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import AuthHeader from "@/components/auth/AuthHeader";

import CustomerSignupForm from "@/components/auth/CustomerSignupForm";

import {
  FixxamTokens,
} from "@/theme";

export default function CustomerSignup() {
  const [
    step,
    setStep,
  ] = useState(1);

  const [
    registrationMode,
    setRegistrationMode,
  ] = useState<
    "signup" | "resume" | "existing"
  >("signup");

  const [
    existingEmail,
    setExistingEmail,
  ] = useState("");

  const [
    resumeEmail,
    setResumeEmail,
  ] = useState("");

  const [
    resumeRequested,
    setResumeRequested,
  ] = useState(false);

  const [
    resetRequested,
    setResetRequested,
  ] = useState(false);

  /* ============================================================
     EXISTING ACCOUNT
  ============================================================ */

  const handleExistingAccount =
    useCallback(
      (email: string) => {
        setExistingEmail(email);
        setRegistrationMode(
          "existing",
        );
      },
      [],
    );

  /* ============================================================
     RESUME AVAILABLE
  ============================================================ */

  const handleResumeAvailable =
    useCallback(
      (email: string) => {
        setResumeEmail(email);
        setRegistrationMode(
          "resume",
        );
      },
      [],
    );

  /* ============================================================
     CONTINUE REGISTRATION
  ============================================================ */

  const handleContinueRegistration =
    useCallback(() => {
      setRegistrationMode(
        "signup",
      );

      setResumeRequested(true);
    }, []);

  /* ============================================================
     RESUME REQUEST HANDLED
  ============================================================ */

  const handleResumeHandled =
    useCallback(() => {
      setResumeRequested(false);
    }, []);

  /* ============================================================
     START OVER
  ============================================================ */

  const handleStartOver =
    useCallback(() => {
      setRegistrationMode(
        "signup",
      );

      setResumeEmail("");

      setResetRequested(true);

      setStep(1);
    }, []);

  /* ============================================================
     RESET REQUEST HANDLED
  ============================================================ */

  const handleResetHandled =
    useCallback(() => {
      setResetRequested(false);
    }, []);

  /* ============================================================
     LOGIN EXISTING ACCOUNT
  ============================================================ */

  const handleLoginExistingAccount =
    useCallback(() => {
      router.replace(
        `/(auth)/login?identifier=${encodeURIComponent(
          existingEmail,
        )}` as never,
      );
    }, [existingEmail]);

  /* ============================================================
     USE ANOTHER EMAIL
  ============================================================ */

  const handleUseAnotherEmail =
    useCallback(() => {
      setExistingEmail("");

      setRegistrationMode(
        "signup",
      );

      setStep(1);
    }, []);

  /* ============================================================
     RESUME SCREEN
  ============================================================ */

  if (
    registrationMode ===
    "resume"
  ) {
    return (
      <View
        style={[
          styles.screen,
          styles.resumeScreen,
        ]}
      >
        {/* ======================================================
            RESUME ICON
        ====================================================== */}

        <View
          style={
            styles.resumeIllustration
          }
        >
          <AppIcon
            name="refresh"
            role="customer"
            state="success"
            size="xl"
          />
        </View>

        {/* ======================================================
            RESUME TITLE — SINGLE LINE
        ====================================================== */}

        <AppText
          variant="heading1"
          center
          weight="bold"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.78}
          style={
            styles.resumeTitle
          }
        >
          Resume your registration?
        </AppText>

        {/* ======================================================
            RESUME SUBTITLE
        ====================================================== */}

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.resumeSubtitle
          }
        >
          We found an incomplete registration
          for this email address.
        </AppText>

        <View
          style={styles.resumeContent}
        >
          {/* ==================================================
              EMAIL CARD
          ================================================== */}

          <View
            style={
              styles.resumeEmailCard
            }
          >
            <AppIcon
              name="mail"
              role="customer"
              state="active"
              size="md"
            />

            <View
              style={
                styles.resumeEmailContent
              }
            >
              <AppText
                variant="body"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.resumeEmail
                }
              >
                {resumeEmail}
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={1}
                style={
                  styles.resumeEmailHint
                }
              >
                Continue from where you left off.
              </AppText>
            </View>
          </View>

          {/* ==================================================
              CONTINUE
          ================================================== */}

          <View
            style={
              styles.resumeButton
            }
          >
            <AppButton
              title="Continue Registration"
              variant="customer"
              onPress={
                handleContinueRegistration
              }
            />
          </View>

          {/* ==================================================
              START OVER
          ================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start over registration"
            hitSlop={10}
            onPress={
              handleStartOver
            }
            style={
              styles.startOverButton
            }
          >
            <AppIcon
              name="refresh"
              role="customer"
              state="active"
              size="sm"
            />

            <AppText
              variant="body"
              weight="medium"
              style={
                styles.startOverText
              }
            >
              Start Over
            </AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  /* ============================================================
     EXISTING ACCOUNT SCREEN
  ============================================================ */

  if (
    registrationMode ===
    "existing"
  ) {
    return (
      <View style={styles.screen}>
        <AuthHeader
          title="Account already exists"
          subtitle="This email address is already registered."
          icon="person"
          role="customer"
        />

        <View
          style={styles.existingContent}
        >
          <View
            style={
              styles.existingEmailCard
            }
          >
            <View
              style={
                styles.existingEmailIcon
              }
            >
              <AppIcon
                name="mail"
                role="customer"
                state="active"
                size="lg"
              />
            </View>

            <AppText
              variant="body"
              weight="bold"
              numberOfLines={1}
              style={
                styles.existingEmail
              }
            >
              {existingEmail}
            </AppText>
          </View>

          <AppButton
            title="Go to Login"
            variant="customer"
            leftIconName="next"
            onPress={
              handleLoginExistingAccount
            }
          />

          <View
            style={
              styles.resetPasswordContainer
            }
          >
            <AppButton
              title="Use Another Email"
              variant="outline"
              leftIconName="refresh"
              onPress={
                handleUseAnotherEmail
              }
            />
          </View>
        </View>
      </View>
    );
  }

  /* ============================================================
     SIGNUP SCREEN
  ============================================================ */

  return (
    <View style={styles.screen}>
      {/* ========================================================
          STEP 1
      ======================================================== */}

      {step === 1 && (
        <AuthHeader
          title="Let's get started"
          subtitle="Enter your email to create your Fixxam account."
          icon="mail"
          role="customer"
        />
      )}

      {/* ========================================================
          STEP 2
      ======================================================== */}

      {step === 2 && (
        <AuthHeader
          title="Check your email"
          subtitle="We sent a 6-digit code to your email address."
          icon="mail"
          role="customer"
        />
      )}

      {/* ========================================================
          STEP 3
      ======================================================== */}

      {step === 3 && (
        <AuthHeader
          title="Create your password"
          subtitle="Choose a strong password to keep your account secure."
          icon="lock"
          role="customer"
        />
      )}

      {/* ========================================================
          STEP 4
      ======================================================== */}

     {step === 4 && (
  <AuthHeader
    title="Add profile information"
    subtitle="Add your details to complete your profile."
    icon="person"
    role="customer"
    showIllustration={false}
  />
)}

      {/* ========================================================
          STEP 5
      ======================================================== */}

      {step === 5 && (
        <AuthHeader
          title="Almost there!"
          subtitle="Check your details before creating your account."
          icon="checkmark-circle"
          role="customer"
        />
      )}

      <View
        style={styles.formContainer}
      >
        <CustomerSignupForm
          step={step}
          setStep={setStep}
          onExistingAccount={
            handleExistingAccount
          }
          onResumeAvailable={
            handleResumeAvailable
          }
          resumeRequested={
            resumeRequested
          }
          onResumeHandled={
            handleResumeHandled
          }
          resetRequested={
            resetRequested
          }
          onResetHandled={
            handleResetHandled
          }
        />
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      backgroundColor:
        "#FFFFFF",

      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    /* ==========================================================
       RESUME SCREEN
    ========================================================== */

    resumeScreen: {
      paddingTop: 80,
    },

    resumeIllustration: {
      width: 64,
      height: 64,

      alignItems: "center",
      justifyContent: "center",

      alignSelf: "center",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    resumeTitle: {
      width: "100%",

      fontSize: 28,
      lineHeight: 34,

      color: "#172033",

      marginBottom:
        FixxamTokens.spacing.xs,
    },

    resumeSubtitle: {
      width: "100%",

      maxWidth: 350,

      lineHeight: 22,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    resumeContent: {
      width: "100%",

      alignItems: "center",
    },

    resumeEmailCard: {
      width: "100%",

      minHeight: 58,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius: 12,

      backgroundColor:
        "#EEF6FF",
    },

    resumeEmailContent: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    resumeEmail: {
      color: "#172033",

      marginBottom: 1,
    },

    resumeEmailHint: {
      lineHeight: 16,
    },

    resumeButton: {
      width: "100%",
    },

    startOverButton: {
      minHeight: 36,

      flexDirection: "row",

      alignItems: "center",
      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.xs,
    },

    startOverText: {
      color: "#2F80ED",

      marginLeft: 6,
    },

    /* ==========================================================
       EXISTING ACCOUNT
    ========================================================== */

    existingContent: {
      width: "100%",

      alignItems: "center",

      paddingTop:
        FixxamTokens.spacing.sm,
    },

    existingEmailCard: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.lg,

      borderRadius: 14,

      backgroundColor:
        "#EEF6FF",
    },

    existingEmailIcon: {
      width: 44,
      height: 44,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "#FFFFFF",

      marginRight:
        FixxamTokens.spacing.sm,
    },

    existingEmail: {
      flex: 1,

      color: "#172033",
    },

    resetPasswordContainer: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       FORM
    ========================================================== */

    formContainer: {
      flex: 1,

      width: "100%",
    },
  });