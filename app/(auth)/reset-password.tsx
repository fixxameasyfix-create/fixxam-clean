import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppButton,
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import PasswordField from "@/components/auth/PasswordField";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   CONSTANTS
============================================================ */

const PASSWORD_RESET_URL =
  "https://resetpassword-yrig53veoq-uc.a.run.app";

const MIN_PASSWORD_LENGTH =
  6;

const MAX_PASSWORD_LENGTH =
  20;

const REQUEST_TIMEOUT_MS =
  15_000;

const SUCCESS_REDIRECT_DELAY_MS =
  1_500;

/* ============================================================
   TYPES
============================================================ */

type ResetPasswordParams = {
  email?:
    | string
    | string[];
};

type ResetPasswordResponse = {
  success?: boolean;

  message?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

async function parseResponse(
  response: Response,
): Promise<ResetPasswordResponse | null> {
  try {
    return (
      await response.json()
    ) as ResetPasswordResponse;
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

  return "We could not reset your password. Please try again.";
}

/* ============================================================
   SCREEN
============================================================ */

export default function ResetPasswordScreen() {
  const params =
    useLocalSearchParams<ResetPasswordParams>();

  const email =
    useMemo(
      () =>
        normalizeEmail(
          getParamString(
            params.email,
          ),
        ),
      [
        params.email,
      ],
    );

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const requestInFlight =
    useRef(false);

  const redirectTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  /* ==========================================================
     CLEANUP
  ========================================================== */

  useEffect(() => {
    return () => {
      if (
        redirectTimer.current
      ) {
        clearTimeout(
          redirectTimer.current,
        );
      }
    };
  }, []);

  /* ==========================================================
     PASSWORD STATE
  ========================================================== */

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password ===
      confirmPassword;

  const passwordLengthValid =
    password.length >=
      MIN_PASSWORD_LENGTH &&
    password.length <=
      MAX_PASSWORD_LENGTH;

  const canSubmit =
    Boolean(email) &&
    passwordLengthValid &&
    passwordsMatch &&
    !loading;

  /* ==========================================================
     RESET PASSWORD
  ========================================================== */

  const handleResetPassword =
    useCallback(async () => {
      if (
        requestInFlight.current ||
        loading
      ) {
        return;
      }

      /* ======================================================
         EMAIL
      ====================================================== */

      if (!email) {
        showError(
          "Invalid Reset Request",
          "Your email address is missing. Please restart the password reset process.",
        );

        return;
      }

      /* ======================================================
         PASSWORD
      ====================================================== */

      if (!password) {
        showError(
          "Password Required",
          "Please enter your new password.",
        );

        return;
      }

      if (
        password.length <
        MIN_PASSWORD_LENGTH
      ) {
        showError(
          "Invalid Password",
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        );

        return;
      }

      if (
        password.length >
        MAX_PASSWORD_LENGTH
      ) {
        showError(
          "Invalid Password",
          `Password cannot exceed ${MAX_PASSWORD_LENGTH} characters.`,
        );

        return;
      }

      if (!confirmPassword) {
        showError(
          "Confirm Password",
          "Please confirm your new password.",
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        showError(
          "Password Mismatch",
          "Passwords do not match.",
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
            PASSWORD_RESET_URL,
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
                  email,
                  password,
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
           RESPONSE
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
              "Please wait before trying again.",
            );

            return;
          }

          if (
            response.status >=
            500
          ) {
            showError(
              "Service Unavailable",
              "The password reset service is temporarily unavailable. Please try again.",
            );

            return;
          }

          /*
           * Do not show arbitrary backend
           * messages directly to the user.
           */
          showError(
            "Unable to Reset Password",
            "The password could not be reset. Please restart the password reset process and try again.",
          );

          return;
        }

        /* ====================================================
           SUCCESS
        ==================================================== */

        showSuccess(
          "Password Reset",
          "Your password has been reset successfully.",
        );

        redirectTimer.current =
          setTimeout(
            () => {
              router.replace({
                pathname:
                  "/(auth)/login",
              });
            },
            SUCCESS_REDIRECT_DELAY_MS,
          );
      } catch (
        error: unknown
      ) {
        console.error(
          "RESET_PASSWORD_ERROR:",
          error,
        );

        showError(
          "Unable to Reset Password",
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
      confirmPassword,
      email,
      loading,
      password,
    ]);

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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerIcon
          }
        >
          <AppIcon
            name="lock"
            role="customer"
            size="lg"
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading1"
          weight="bold"
          center
          style={
            styles.title
          }
        >
          Reset Password
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.subtitle
          }
        >
          Create a new password for your account.
        </AppText>
      </View>

      {/* ======================================================
          FORM
      ====================================================== */}

      <AppCard
        style={
          styles.card
        }
      >
        <AppText
          variant="body"
          weight="bold"
          style={
            styles.label
          }
        >
          New Password
        </AppText>

        <PasswordField
          placeholder="Enter your new password"
          value={
            password
          }
          onChangeText={
            setPassword
          }
          variant="customer"
        />

        <View
          style={
            styles.fieldSpacing
          }
        />

        <AppText
          variant="body"
          weight="bold"
          style={
            styles.label
          }
        >
          Confirm Password
        </AppText>

        <PasswordField
          placeholder="Confirm your new password"
          value={
            confirmPassword
          }
          onChangeText={
            setConfirmPassword
          }
          variant="customer"
        />

        {/* ====================================================
            REQUIREMENTS
        ==================================================== */}

        <View
          style={
            styles.rules
          }
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.rulesTitle
            }
          >
            Password Requirements
          </AppText>

          <View
            style={
              styles.ruleRow
            }
          >
            <AppIcon
              name={
                passwordLengthValid
                  ? "success"
                  : "info"
              }
              size="xs"
              color={
                passwordLengthValid
                  ? Colors.success
                  : Colors.textMuted
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.rule
              }
            >
              {MIN_PASSWORD_LENGTH}–
              {MAX_PASSWORD_LENGTH} characters
            </AppText>
          </View>

          {password.length >
            0 &&
          confirmPassword.length >
            0 ? (
            <View
              style={[
                styles.matchState,

                passwordsMatch
                  ? styles.matchSuccess
                  : styles.matchError,
              ]}
            >
              <AppIcon
                name={
                  passwordsMatch
                    ? "success"
                    : "error"
                }
                size="xs"
                color={
                  passwordsMatch
                    ? Colors.success
                    : Colors.error
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={[
                  styles.matchText,

                  passwordsMatch
                    ? styles.matchTextSuccess
                    : styles.matchTextError,
                ]}
              >
                {passwordsMatch
                  ? "Passwords match"
                  : "Passwords do not match"}
              </AppText>
            </View>
          ) : null}
        </View>

        {/* ====================================================
            SECURITY NOTICE
        ==================================================== */}

        <View
          style={
            styles.notice
          }
        >
          <View
            style={
              styles.noticeIcon
            }
          >
            <AppIcon
              name="shield"
              size="sm"
              color={
                Colors.warning
              }
            />
          </View>

          <View
            style={
              styles.noticeContent
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.noticeTitle
              }
            >
              For your security
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.noticeText
              }
            >
              Keep your password private and do not share it with anyone.
            </AppText>
          </View>
        </View>

        {/* ====================================================
            ACTION
        ==================================================== */}

        <AppButton
          title="Reset Password"
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
        />
      </AppCard>
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

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      alignItems:
        "center",

      paddingTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    headerIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 330,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
      padding:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.xl,

      ...FixxamTokens.shadow.card,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    fieldSpacing: {
      height:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       RULES
    ======================================================== */

    rules: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    rulesTitle: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    ruleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    rule: {
      flex: 1,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    matchState: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,
    },

    matchSuccess: {
      backgroundColor:
        Colors.successSoft,
    },

    matchError: {
      backgroundColor:
        Colors.errorSoft,
    },

    matchText: {
      flex: 1,
    },

    matchTextSuccess: {
      color:
        Colors.success,
    },

    matchTextError: {
      color:
        Colors.error,
    },

    /* ========================================================
       NOTICE
    ======================================================== */

    notice: {
      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },

    noticeIcon: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    noticeContent: {
      flex: 1,

      minWidth: 0,
    },

    noticeTitle: {
      color:
        Colors.warning,
    },

    noticeText: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },
  });