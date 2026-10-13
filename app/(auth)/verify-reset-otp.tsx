import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppCard,
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import OtpBoxes from "@/components/auth/OtpBoxes";

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

const VERIFY_OTP_URL =
  "https://verifypasswordresetotp-yrig53veoq-uc.a.run.app";

const SEND_OTP_URL =
  "https://sendpasswordresetotp-yrig53veoq-uc.a.run.app";

const OTP_LENGTH =
  6;

const OTP_TTL_SECONDS =
  180;

const MAX_RESENDS =
  10;

const RESEND_LOCK_SECONDS =
  60 * 60;

const REQUEST_TIMEOUT_MS =
  15_000;

const SENT_STATE_DURATION_MS =
  5_000;

const SUCCESS_REDIRECT_DELAY_MS =
  1_000;

/* ============================================================
   TYPES
============================================================ */

type VerifyResetOtpParams = {
  email?:
    | string
    | string[];
};

type ApiResponse = {
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

function maskEmail(
  value: string,
): string {
  const normalized =
    normalizeEmail(
      value,
    );

  const atIndex =
    normalized.indexOf(
      "@",
    );

  if (
    atIndex <= 0
  ) {
    return normalized;
  }

  const name =
    normalized.slice(
      0,
      atIndex,
    );

  const domain =
    normalized.slice(
      atIndex + 1,
    );

  if (!domain) {
    return normalized;
  }

  const visibleLength =
    Math.min(
      2,
      name.length,
    );

  const visible =
    name.slice(
      0,
      visibleLength,
    );

  const hidden =
    "*".repeat(
      Math.max(
        name.length -
          visibleLength,
        4,
      ),
    );

  return `${visible}${hidden}@${domain}`;
}

function formatTime(
  totalSeconds: number,
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(
        totalSeconds,
      ),
    );

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const seconds =
    safeSeconds % 60;

  return `${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

function isValidOtp(
  value: string,
): boolean {
  return new RegExp(
    `^\\d{${OTP_LENGTH}}$`,
  ).test(value);
}

async function parseResponse(
  response: Response,
): Promise<ApiResponse | null> {
  try {
    return (
      await response.json()
    ) as ApiResponse;
  } catch {
    return null;
  }
}

function getNetworkErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.name ===
      "AbortError"
  ) {
    return "The request took too long. Please check your connection and try again.";
  }

  return "Please check your connection and try again.";
}

/* ============================================================
   SCREEN
============================================================ */

export default function VerifyResetOtpScreen() {
  const params =
    useLocalSearchParams<VerifyResetOtpParams>();

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

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    otp,
    setOtp,
  ] =
    useState("");

  const [
    verified,
    setVerified,
  ] =
    useState(false);

  const [
    verifying,
    setVerifying,
  ] =
    useState(false);

  const [
    resending,
    setResending,
  ] =
    useState(false);

  const [
    resendCount,
    setResendCount,
  ] =
    useState(0);

  const [
    otpSeconds,
    setOtpSeconds,
  ] =
    useState(
      OTP_TTL_SECONDS,
    );

  const [
    resendLockSeconds,
    setResendLockSeconds,
  ] =
    useState(0);

  const [
    buttonState,
    setButtonState,
  ] =
    useState<
      "sent" |
      "resend"
    >("resend");

  /* ==========================================================
     REFS
  ========================================================== */

  const verifyInFlight =
    useRef(false);

  const resendInFlight =
    useRef(false);

  const expiryNotified =
    useRef(false);

  const redirectTimer =
    useRef<
      ReturnType<typeof setTimeout>
      | null
    >(null);

  const sentStateTimer =
    useRef<
      ReturnType<typeof setTimeout>
      | null
    >(null);

  /* ==========================================================
     DERIVED STATE
  ========================================================== */

  const resendLocked =
    resendLockSeconds > 0;

  const otpExpired =
    otpSeconds <= 0;

  const maskedEmail =
    useMemo(
      () =>
        maskEmail(
          email,
        ),
      [
        email,
      ],
    );

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

      if (
        sentStateTimer.current
      ) {
        clearTimeout(
          sentStateTimer.current,
        );
      }
    };
  }, []);

  /* ==========================================================
     OTP COUNTDOWN
  ========================================================== */

  useEffect(() => {
    if (
      verified ||
      otpSeconds <= 0
    ) {
      return;
    }

    const timer =
      setTimeout(
        () => {
          setOtpSeconds(
            current =>
              Math.max(
                0,
                current - 1,
              ),
          );
        },
        1_000,
      );

    return () => {
      clearTimeout(
        timer,
      );
    };
  }, [
    otpSeconds,
    verified,
  ]);

  /* ==========================================================
     OTP EXPIRED
  ========================================================== */

  useEffect(() => {
    if (
      verified ||
      verifying ||
      otpSeconds !== 0 ||
      expiryNotified.current
    ) {
      return;
    }

    expiryNotified.current =
      true;

    showError(
      "OTP Expired",
      "Request a new verification code.",
    );
  }, [
    otpSeconds,
    verified,
    verifying,
  ]);

  /* ==========================================================
     RESEND LOCK COUNTDOWN
  ========================================================== */

  useEffect(() => {
    if (
      resendLockSeconds <= 0
    ) {
      return;
    }

    const timer =
      setTimeout(
        () => {
          setResendLockSeconds(
            current =>
              Math.max(
                0,
                current - 1,
              ),
          );
        },
        1_000,
      );

    return () => {
      clearTimeout(
        timer,
      );
    };
  }, [
    resendLockSeconds,
  ]);

  /* ==========================================================
     RESET LOCAL RESEND LIMIT
  ========================================================== */

  useEffect(() => {
    if (
      resendCount >=
        MAX_RESENDS &&
      resendLockSeconds === 0
    ) {
      setResendCount(
        0,
      );
    }
  }, [
    resendCount,
    resendLockSeconds,
  ]);

  /* ==========================================================
     VERIFY OTP
  ========================================================== */

  const handleVerifyOtp =
    useCallback(async () => {
      if (
        verifyInFlight.current ||
        resendInFlight.current ||
        verifying ||
        resending ||
        verified
      ) {
        return;
      }

      if (!email) {
        showError(
          "Invalid Request",
          "Your email address is missing. Please restart the password reset process.",
        );

        return;
      }

      const normalizedOtp =
        otp.trim();

      if (
        !isValidOtp(
          normalizedOtp,
        )
      ) {
        showError(
          "Invalid Code",
          "Please enter the 6-digit verification code.",
        );

        return;
      }

      if (otpExpired) {
        showError(
          "OTP Expired",
          "Request a new verification code.",
        );

        return;
      }

      const controller =
        new AbortController();

      const timeoutId =
        setTimeout(
          () => {
            controller.abort();
          },
          REQUEST_TIMEOUT_MS,
        );

      verifyInFlight.current =
        true;

      setVerifying(
        true,
      );

      try {
        const response =
          await fetch(
            VERIFY_OTP_URL,
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
                  otp:
                    normalizedOtp,
                }),

              signal:
                controller.signal,
            },
          );

        const data =
          await parseResponse(
            response,
          );

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
              "Too Many Attempts",
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
              "The verification service is temporarily unavailable. Please try again.",
            );

            return;
          }

          showError(
            "Verification Failed",
            "The verification code is invalid or expired.",
          );

          return;
        }

        setVerified(
          true,
        );

        showSuccess(
          "Verification Successful",
          "OTP verified successfully.",
        );

        redirectTimer.current =
          setTimeout(
            () => {
              router.replace({
                pathname:
                  "/(auth)/reset-password",

                params: {
                  email,
                },
              });
            },
            SUCCESS_REDIRECT_DELAY_MS,
          );
      } catch (
        error: unknown
      ) {
        console.error(
          "VERIFY_PASSWORD_RESET_OTP_ERROR:",
          error,
        );

        showError(
          "Verification Failed",
          getNetworkErrorMessage(
            error,
          ),
        );
      } finally {
        clearTimeout(
          timeoutId,
        );

        verifyInFlight.current =
          false;

        setVerifying(
          false,
        );
      }
    }, [
      email,
      otp,
      otpExpired,
      resending,
      verified,
      verifying,
    ]);

  /* ==========================================================
     AUTO VERIFY
  ========================================================== */

  useEffect(() => {
    if (
      otp.length !==
        OTP_LENGTH ||
      verified ||
      verifying ||
      resending ||
      otpExpired
    ) {
      return;
    }

    void handleVerifyOtp();
  }, [
    handleVerifyOtp,
    otp,
    otpExpired,
    resending,
    verified,
    verifying,
  ]);

  /* ==========================================================
     RESEND OTP
  ========================================================== */

  const handleResendOtp =
    useCallback(async () => {
      if (
        resendInFlight.current ||
        verifyInFlight.current ||
        resending ||
        verifying ||
        verified ||
        resendLocked ||
        buttonState ===
          "sent"
      ) {
        return;
      }

      if (!email) {
        showError(
          "Invalid Request",
          "Your email address is missing. Please restart the password reset process.",
        );

        return;
      }

      if (
        resendCount >=
        MAX_RESENDS
      ) {
        setResendLockSeconds(
          RESEND_LOCK_SECONDS,
        );

        showError(
          "Too Many Attempts",
          "Please try again after 1 hour.",
        );

        return;
      }

      const controller =
        new AbortController();

      const timeoutId =
        setTimeout(
          () => {
            controller.abort();
          },
          REQUEST_TIMEOUT_MS,
        );

      resendInFlight.current =
        true;

      setResending(
        true,
      );

      try {
        const response =
          await fetch(
            SEND_OTP_URL,
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
                }),

              signal:
                controller.signal,
            },
          );

        const data =
          await parseResponse(
            response,
          );

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
              "Please wait before requesting another verification code.",
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

          showError(
            "Unable to Resend Code",
            "A new verification code could not be sent. Please try again.",
          );

          return;
        }

        const nextCount =
          resendCount + 1;

        setOtp(
          "",
        );

        setOtpSeconds(
          OTP_TTL_SECONDS,
        );

        expiryNotified.current =
          false;

        setResendCount(
          nextCount,
        );

        setButtonState(
          "sent",
        );

        showSuccess(
          "OTP Sent",
          "A new verification code has been sent.",
        );

        if (
          sentStateTimer.current
        ) {
          clearTimeout(
            sentStateTimer.current,
          );
        }

        sentStateTimer.current =
          setTimeout(
            () => {
              setButtonState(
                "resend",
              );
            },
            SENT_STATE_DURATION_MS,
          );

        /*
         * The newly sent OTP can still be verified,
         * but additional resends are locally locked.
         */
        if (
          nextCount >=
          MAX_RESENDS
        ) {
          setResendLockSeconds(
            RESEND_LOCK_SECONDS,
          );
        }
      } catch (
        error: unknown
      ) {
        console.error(
          "RESEND_PASSWORD_RESET_OTP_ERROR:",
          error,
        );

        showError(
          "Unable to Resend Code",
          getNetworkErrorMessage(
            error,
          ),
        );
      } finally {
        clearTimeout(
          timeoutId,
        );

        resendInFlight.current =
          false;

        setResending(
          false,
        );
      }
    }, [
      buttonState,
      email,
      resendCount,
      resendLocked,
      resending,
      verified,
      verifying,
    ]);

  /* ==========================================================
     MISSING EMAIL
  ========================================================== */

  if (!email) {
    return (
      <AppScreen
        role="customer"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.stateIcon
          }
        >
          <AppIcon
            name="error"
            size="lg"
            color={
              Colors.error
            }
          />
        </View>

        <AppText
          variant="heading3"
          weight="bold"
          center
          style={
            styles.stateTitle
          }
        >
          Reset request unavailable
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
          }
        >
          Please restart the password reset process.
        </AppText>

        <Pressable
          onPress={() => {
            router.back();
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({
            pressed,
          }) => [
            styles.stateButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="body"
            weight="bold"
            style={
              styles.stateButtonText
            }
          >
            Go Back
          </AppText>
        </Pressable>
      </AppScreen>
    );
  }

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
            name="mail"
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
          Check Your Email
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.subtitle
          }
        >
          We've sent a 6-digit verification code to your email address.
        </AppText>

        <AppText
          variant="body"
          weight="bold"
          center
          style={
            styles.email
          }
        >
          {maskedEmail}
        </AppText>

        <Pressable
          onPress={() => {
            if (
              !verifying &&
              !resending
            ) {
              router.back();
            }
          }}
          disabled={
            verifying ||
            resending
          }
          accessibilityRole="button"
          accessibilityLabel="Edit email address"
          style={({
            pressed,
          }) => [
            styles.editButton,

            pressed
              ? styles.linkPressed
              : null,
          ]}
        >
          <AppText
            variant="bodyMedium"
            role="customer"
            tone="primary"
            weight="bold"
          >
            Edit
          </AppText>
        </Pressable>
      </View>

      {/* ======================================================
          OTP CARD
      ====================================================== */}

      <AppCard
        style={
          styles.card
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          center
          style={
            styles.cardTitle
          }
        >
          Enter Verification Code
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.cardSubtitle
          }
        >
          Enter the 6-digit verification code.
        </AppText>

        <OtpBoxes
          value={
            otp
          }
          onChange={
            setOtp
          }
          onComplete={
            handleVerifyOtp
          }
          editable={
            !verifying &&
            !verified
          }
        />

        {/* ====================================================
            VERIFYING
        ==================================================== */}

        {verifying ? (
          <View
            style={
              styles.verifying
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              center
            >
              Verifying code...
            </AppText>
          </View>
        ) : null}

        {/* ====================================================
            ACTIVE OTP
        ==================================================== */}

        {!verified ? (
          <>
            <View
              style={[
                styles.timerBadge,

                otpSeconds > 60
                  ? styles.timerSafe
                  : otpSeconds > 20
                    ? styles.timerWarning
                    : styles.timerDanger,
              ]}
            >
              <AppIcon
                name="clock"
                size="xs"
                color={
                  otpSeconds > 60
                    ? Colors.success
                    : otpSeconds > 20
                      ? Colors.warning
                      : Colors.error
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={[
                  styles.timerText,

                  otpSeconds > 60
                    ? styles.timerTextSafe
                    : otpSeconds > 20
                      ? styles.timerTextWarning
                      : styles.timerTextDanger,
                ]}
              >
                {otpExpired
                  ? "Code expired"
                  : `Code expires in ${formatTime(
                      otpSeconds,
                    )}`}
              </AppText>
            </View>

            <Pressable
              disabled={
                resendLocked ||
                resending ||
                verifying ||
                buttonState ===
                  "sent"
              }
              onPress={() => {
                void handleResendOtp();
              }}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
              accessibilityState={{
                disabled:
                  resendLocked ||
                  resending ||
                  verifying ||
                  buttonState ===
                    "sent",

                busy:
                  resending,
              }}
              style={({
                pressed,
              }) => [
                styles.resendButton,

                resendLocked
                  ? styles.resendDisabled
                  : null,

                pressed
                  ? styles.linkPressed
                  : null,
              ]}
            >
              <AppText
                variant="bodyMedium"
                weight="bold"
                center
                style={[
                  styles.resend,

                  resendLocked
                    ? styles.resendLocked
                    : null,
                ]}
              >
                {resending
                  ? "Sending..."
                  : resendLocked
                    ? `Try again in ${formatTime(
                        resendLockSeconds,
                      )}`
                    : buttonState ===
                        "sent"
                      ? "Code Sent"
                      : `Resend Code (${resendCount}/${MAX_RESENDS})`}
              </AppText>
            </Pressable>
          </>
        ) : (
          /* ==================================================
             SUCCESS
          ================================================== */

          <View
            style={
              styles.success
            }
          >
            <AppIcon
              name="success"
              size="sm"
              color={
                Colors.success
              }
            />

            <AppText
              variant="body"
              weight="bold"
              style={
                styles.successText
              }
            >
              OTP Verified Successfully
            </AppText>
          </View>
        )}
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
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    email: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    editButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",
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

    cardTitle: {
      color:
        Colors.textPrimary,
    },

    cardSubtitle: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.xl,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       VERIFYING
    ======================================================== */

    verifying: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       TIMER
    ======================================================== */

    timerBadge: {
      alignSelf:
        "center",

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    timerSafe: {
      backgroundColor:
        Colors.successSoft,
    },

    timerWarning: {
      backgroundColor:
        Colors.warningSoft,
    },

    timerDanger: {
      backgroundColor:
        Colors.errorSoft,
    },

    timerText: {
      textAlign:
        "center",
    },

    timerTextSafe: {
      color:
        Colors.success,
    },

    timerTextWarning: {
      color:
        Colors.warning,
    },

    timerTextDanger: {
      color:
        Colors.error,
    },

    /* ========================================================
       RESEND
    ======================================================== */

    resendButton: {
      alignSelf:
        "center",

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    resend: {
      color:
        CustomerColors.primary,
    },

    resendDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    resendLocked: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       SUCCESS
    ======================================================== */

    success: {
      marginTop:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    successText: {
      color:
        Colors.success,
    },

    /* ========================================================
       MISSING STATE
    ======================================================== */

    stateScreen: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    stateIcon: {
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
        Colors.errorSoft,
    },

    stateTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    stateText: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    stateButton: {
      minHeight:
        FixxamTokens.size.buttonHeight,

      marginTop:
        FixxamTokens.spacing.lg,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    stateButtonText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       PRESS
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },

    linkPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },
  });