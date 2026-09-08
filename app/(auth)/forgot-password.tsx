import React, {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppButton,
  AppInput,
  AppScreen,
  AppText,
} from "@/components/ui";

import AuthHeader from "@/components/auth/AuthHeader";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   CONSTANTS
============================================================ */

const PASSWORD_RESET_OTP_URL =
  "https://sendpasswordresetotp-yrig53veoq-uc.a.run.app";

const REQUEST_TIMEOUT_MS =
  15_000;

const MAX_EMAIL_LENGTH =
  254;

/* ============================================================
   TYPES
============================================================ */

interface ResetOtpResponse {
  success?: boolean;

  message?: string;
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

function isValidEmail(
  value: string,
): boolean {
  if (
    !value ||
    value.length >
      MAX_EMAIL_LENGTH
  ) {
    return false;
  }

  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
    value,
  );
}

async function parseResponse(
  response: Response,
): Promise<ResetOtpResponse | null> {
  try {
    return (
      await response.json()
    ) as ResetOtpResponse;
  } catch {
    return null;
  }
}

function getRequestErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.name ===
      "AbortError"
  ) {
    return "The request took too long. Please check your connection and try again.";
  }

  return "We could not send the verification code. Please try again.";
}

/* ============================================================
   SCREEN
============================================================ */

export default function ForgotPasswordScreen() {
  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const requestInFlight =
    useRef(false);

  /* ==========================================================
     SEND RESET OTP
  ========================================================== */

  const handleResetPassword =
    useCallback(async () => {
      if (
        requestInFlight.current ||
        loading
      ) {
        return;
      }

      const normalizedEmail =
        normalizeEmail(
          email,
        );

      /* ======================================================
         VALIDATION
      ====================================================== */

      if (!normalizedEmail) {
        showError(
          "Email Required",
          "Please enter your email address.",
        );

        return;
      }

      if (
        normalizedEmail.length >
        MAX_EMAIL_LENGTH
      ) {
        showError(
          "Invalid Email",
          "Please enter a valid email address.",
        );

        return;
      }

      if (
        !isValidEmail(
          normalizedEmail,
        )
      ) {
        showError(
          "Invalid Email",
          "Please enter a valid email address.",
        );

        return;
      }

      /* ======================================================
         REQUEST
      ====================================================== */

      const controller =
        new AbortController();

      const timeoutId =
        setTimeout(
          () => {
            controller.abort();
          },
          REQUEST_TIMEOUT_MS,
        );

      requestInFlight.current =
        true;

      setLoading(
        true,
      );

      try {
        const response =
          await fetch(
            PASSWORD_RESET_OTP_URL,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  email:
                    normalizedEmail,
                }),

              signal:
                controller.signal,
            },
          );

        const data =
          await parseResponse(
            response,
          );

        /* ====================================================
           RESPONSE VALIDATION
        ==================================================== */

        if (
          !response.ok ||
          data?.success !==
            true
        ) {
          if (
            response.status ===
            429
          ) {
            showError(
              "Too Many Requests",
              "Please wait a moment before requesting another verification code.",
            );

            return;
          }

          if (
            response.status >=
            500
          ) {
            showError(
              "Service Unavailable",
              "The verification service is temporarily unavailable. Please try again.",
            );

            return;
          }

          /*
           * Do not display arbitrary backend
           * error messages directly to the user.
           */
          showError(
            "Unable to Send Code",
            "We could not send the verification code. Please try again.",
          );

          return;
        }

        /* ====================================================
           SUCCESS
        ==================================================== */

        showSuccess(
          "Code Sent",
          "A verification code has been sent to your email.",
        );

        router.push({
          pathname:
            "/(auth)/verify-reset-otp",

          params: {
            email:
              normalizedEmail,
          },
        });
      } catch (
        error: unknown
      ) {
        console.error(
          "PASSWORD_RESET_OTP_ERROR:",
          error,
        );

        showError(
          "Unable to Send Code",
          getRequestErrorMessage(
            error,
          ),
        );
      } finally {
        clearTimeout(
          timeoutId,
        );

        requestInFlight.current =
          false;

        setLoading(
          false,
        );
      }
    }, [
      email,
      loading,
    ]);

  /* ==========================================================
     FORM STATE
  ========================================================== */

  const normalizedEmail =
    normalizeEmail(
      email,
    );

  const canSubmit =
    normalizedEmail.length >
      0 &&
    normalizedEmail.length <=
      MAX_EMAIL_LENGTH &&
    !loading;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      scrollEnabled
      keyboardAvoiding
      contentContainerStyle={
        styles.screen
      }
    >
      <AuthHeader
        title="Forgot Password?"
        subtitle="Enter your email address and we'll send you a verification code."
        icon="lock"
        role="customer"
      />

      <View
        style={
          styles.form
        }
      >
        <AppInput
          role="customer"
          label="Email Address"
          placeholder="Enter your email address"
          value={
            email
          }
          onChangeText={
            setEmail
          }
          editable={
            !loading
          }
          maxLength={
            MAX_EMAIL_LENGTH
          }
          keyboardType="email-address"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect={
            false
          }
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={() => {
            if (
              canSubmit
            ) {
              void handleResetPassword();
            }
          }}
          leftIconName="mail"
          accessibilityLabel="Email address"
        />

        <AppButton
          title="Send Verification Code"
          role="customer"
          variant="primary"
          loading={
            loading
          }
          disabled={
            !canSubmit
          }
          onPress={() => {
            void handleResetPassword();
          }}
          style={
            styles.button
          }
        />

        <AppText
          variant="bodyMedium"
          role="customer"
          tone="primary"
          center
          accessibilityRole="link"
          accessibilityLabel="Back to login"
          onPress={() => {
            if (
              !loading
            ) {
              router.back();
            }
          }}
          style={
            styles.backToLogin
          }
        >
          Back to Login
        </AppText>
      </View>
    </AppScreen>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    screen: {
      flexGrow: 1,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    form: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    button: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,
    },

    backToLogin: {
      marginTop:
        FixxamTokens.spacing.lg,
    },
  });