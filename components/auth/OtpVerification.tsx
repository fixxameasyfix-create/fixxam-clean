import React, {
  memo,
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
  AppIcon,
  AppText,
} from "@/components/ui";

import OtpResendCard from "./OtpResendCard";
import OtpVerificationCard from "./OtpVerificationCard";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

/* ==============================================================
   CONFIG
============================================================== */

const OTP_LENGTH = 6;

const OTP_EXPIRY_SECONDS =
  3 * 60;

const RESEND_COOLDOWN_SECONDS =
  5;

const MAX_OTP_REQUESTS = 10;

const OTP_REQUEST_LOCK_SECONDS =
  60 * 60;

/* ==============================================================
   EXISTING EMAIL OTP CLOUD FUNCTIONS
============================================================== */

const EMAIL_OTP_SEND_URL =
  "https://sendsignupemailotp-yrig53veoq-uc.a.run.app";

const EMAIL_OTP_VERIFY_URL =
  "https://verifysignupemailotp-yrig53veoq-uc.a.run.app"

/* ==============================================================
   TYPES
============================================================== */

interface OtpApiResponse {
  success?: boolean;

  code?: string;

  message?: string;
}

export interface OtpVerificationProps {
  type: "email";

  value: string;

  otp: string;

  onOtpChange: (
    value: string,
  ) => void;

  role?: FixxamRole;

  variant?: "customer" | "worker";

  verified?: boolean;

  onVerified: (
    value: boolean,
  ) => void;

  mode?: "send" | "verify";

  initialOtpSent?: boolean;

  onOtpSent?: () => void;

  onExistingAccount?: (
    email: string,
  ) => void;
}

/* ==============================================================
   ERRORS
============================================================== */

class OtpRequestError extends Error {
  code?: string;

  constructor(
    message: string,
    code?: string,
  ) {
    super(message);

    this.name =
      "OtpRequestError";

    this.code = code;
  }
}

/* ==============================================================
   HELPERS
============================================================== */

function normalizeEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

/**
 * Accept supported/valid email domains.
 *
 * We intentionally do not whitelist providers such as:
 * Gmail, Yahoo, Outlook, Hotmail, iCloud, Proton, etc.
 *
 * vmail.com is explicitly blocked.
 */
function isValidEmail(
  email: string,
): boolean {
  return (
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      email,
    ) &&
    !/@vmail\.com$/i.test(
      email,
    )
  );
}

function formatTime(
  seconds: number,
): string {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(seconds),
    );

  const minutes =
    Math.floor(
      safeSeconds / 60,
    );

  const remainingSeconds =
    safeSeconds % 60;

  return `${minutes}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

async function postOtpRequest(
  url: string,
  body: Record<string, string>,
): Promise<OtpApiResponse> {
  const response =
    await fetch(
      url,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          body,
        ),
      },
    );

  let data:
    | OtpApiResponse
    | null = null;

  try {
    data =
      (await response.json()) as OtpApiResponse;
  } catch {
    data = null;
  }

  if (
    !response.ok ||
    !data?.success
  ) {
    throw new OtpRequestError(
      data?.message ||
        "Unable to process OTP request.",
      data?.code,
    );
  }

  return data;
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

/* ==============================================================
   COMPONENT
============================================================== */

function OtpVerification({
  value,
  otp,
  onOtpChange,
  role = "customer",
  variant,
  verified = false,
  onVerified,
  mode = "verify",
  initialOtpSent = false,
  onOtpSent,
  onExistingAccount,
}: OtpVerificationProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  /* ============================================================
     SEND STATE
  ============================================================ */

  const [
    otpSent,
    setOtpSent,
  ] = useState(
    initialOtpSent,
  );

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    resending,
    setResending,
  ] = useState(false);

  /* ============================================================
     VERIFY STATE
  ============================================================ */

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  /* ============================================================
     TIMER STATE
  ============================================================ */

  const [
    expiresIn,
    setExpiresIn,
  ] = useState(
    initialOtpSent
      ? OTP_EXPIRY_SECONDS
      : 0,
  );

  const [
    resendAvailableIn,
    setResendAvailableIn,
  ] = useState(0);

  const [
    resendCount,
    setResendCount,
  ] = useState(
    initialOtpSent
      ? 1
      : 0,
  );

  const [
    requestLocked,
    setRequestLocked,
  ] = useState(false);

  const [
    requestLockTimeLeft,
    setRequestLockTimeLeft,
  ] = useState(0);

  /* ============================================================
     SENT IDENTIFIER
  ============================================================ */

  const [
    sentIdentifier,
    setSentIdentifier,
  ] = useState<
    string | null
  >(
    initialOtpSent
      ? `email:${normalizeEmail(
          value,
        )}`
      : null,
  );

  /* ============================================================
     REQUEST GUARDS
  ============================================================ */

  const requestInFlightRef =
    useRef(false);

  const verifyInFlightRef =
    useRef(false);

  /* ============================================================
     DERIVED VALUES
  ============================================================ */

  const normalizedEmail =
    useMemo(
      () =>
        normalizeEmail(
          value,
        ),
      [value],
    );

  const identifierKey =
    useMemo(
      () =>
        `email:${normalizedEmail}`,
      [normalizedEmail],
    );

  const sanitizedOtp =
    useMemo(
      () =>
        otp
          .replace(/\D/g, "")
          .slice(
            0,
            OTP_LENGTH,
          ),
      [otp],
    );

  const expired =
    otpSent &&
    expiresIn <= 0;

  /* ============================================================
     EXPIRY TIMER
  ============================================================ */

  useEffect(() => {
    if (
      !otpSent ||
      verified ||
      expiresIn <= 0
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        setExpiresIn(
          current =>
            Math.max(
              0,
              current - 1,
            ),
        );
      }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    expiresIn,
    otpSent,
    verified,
  ]);

  /* ============================================================
     RESEND TIMER
  ============================================================ */

  useEffect(() => {
    if (
      resendAvailableIn <= 0
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        setResendAvailableIn(
          current =>
            Math.max(
              0,
              current - 1,
            ),
        );
      }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    resendAvailableIn,
  ]);

  /* ============================================================
     REQUEST LOCK TIMER
  ============================================================ */

  useEffect(() => {
    if (
      !requestLocked ||
      requestLockTimeLeft <= 0
    ) {
      if (
        requestLocked &&
        requestLockTimeLeft <= 0
      ) {
        setRequestLocked(false);
        setResendCount(0);
      }

      return;
    }

    const timer =
      setTimeout(() => {
        setRequestLockTimeLeft(
          current =>
            Math.max(
              0,
              current - 1,
            ),
        );
      }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    requestLocked,
    requestLockTimeLeft,
  ]);

  /* ============================================================
     INVALIDATE WHEN EMAIL CHANGES
  ============================================================ */

  useEffect(() => {
    if (
      !sentIdentifier ||
      sentIdentifier ===
        identifierKey
    ) {
      return;
    }

    setOtpSent(false);

    setSentIdentifier(null);

    setExpiresIn(0);

    setResendAvailableIn(0);

    onOtpChange("");

    onVerified(false);
  }, [
    identifierKey,
    onOtpChange,
    onVerified,
    sentIdentifier,
  ]);

  /* ============================================================
     VALIDATE EMAIL
  ============================================================ */

  const validateEmail =
    useCallback(() => {
      if (!normalizedEmail) {
        showError(
          "Email Required",
          "Enter your email address.",
        );

        return null;
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

        return null;
      }

      return normalizedEmail;
    }, [
      normalizedEmail,
    ]);

  /* ============================================================
     SEND / RESEND OTP
  ============================================================ */

  const requestOtp =
    useCallback(
      async (
        isResend: boolean,
      ): Promise<boolean> => {
        if (
          requestInFlightRef.current
        ) {
          return false;
        }

        if (requestLocked) {
          showError(
            "Too Many Requests",
            `Please try again in ${formatTime(
              requestLockTimeLeft,
            )}.`,
          );

          return false;
        }

        if (
          isResend &&
          resendAvailableIn > 0
        ) {
          return false;
        }

        const email =
          validateEmail();

        if (!email) {
          return false;
        }

        if (
          resendCount >=
          MAX_OTP_REQUESTS
        ) {
          setRequestLocked(true);

          setRequestLockTimeLeft(
            OTP_REQUEST_LOCK_SECONDS,
          );

          showError(
            "Limit Reached",
            "Too many code requests. Please try again in 1 hour.",
          );

          return false;
        }

        requestInFlightRef.current =
          true;

        if (isResend) {
          setResending(true);
        } else {
          setSending(true);
        }

        onOtpChange("");

        onVerified(false);

        try {
          await postOtpRequest(
            EMAIL_OTP_SEND_URL,
            {
              identifier: email,
            },
          );

          const nextCount =
            resendCount + 1;

          setResendCount(
            nextCount,
          );

          setSentIdentifier(
            `email:${email}`,
          );

          setOtpSent(true);

          setExpiresIn(
            OTP_EXPIRY_SECONDS,
          );

          setResendAvailableIn(
            RESEND_COOLDOWN_SECONDS,
          );

          showSuccess(
            isResend
              ? "OTP Resent"
              : "OTP Sent",
            "Verification code sent successfully.",
          );

          if (!isResend) {
            onOtpSent?.();
          }

          return true;
        } catch (
          error: unknown
        ) {
          /*
           * Backend is the source of truth
           * for existing Firebase accounts.
           */
          if (
            error instanceof
              OtpRequestError &&
            error.code ===
              "ACCOUNT_EXISTS"
          ) {
            onOtpChange("");

            onVerified(false);

            showError(
              "Account Already Exists",
              "This email is already registered. Please log in instead.",
            );

            onExistingAccount?.(
              email,
            );

            return false;
          }

          showError(
            "Unable to Send Code",
            getErrorMessage(
              error,
              "Unable to send the verification code. Please try again.",
            ),
          );

          return false;
        } finally {
          requestInFlightRef.current =
            false;

          setSending(false);

          setResending(false);
        }
      },
      [
        onExistingAccount,
        onOtpChange,
        onOtpSent,
        onVerified,
        requestLockTimeLeft,
        requestLocked,
        resendAvailableIn,
        resendCount,
        validateEmail,
      ],
    );

  /* ============================================================
     SEND
  ============================================================ */

  const handleSend =
    useCallback(() => {
      void requestOtp(false);
    }, [requestOtp]);

  /* ============================================================
     RESEND
  ============================================================ */

  const handleResend =
    useCallback(() => {
      void requestOtp(true);
    }, [requestOtp]);

  /* ============================================================
     VERIFY OTP
  ============================================================ */

  const handleVerifyOtp =
    useCallback(
      async (
        completeOtp?: string,
      ) => {
        if (
          verifyInFlightRef.current ||
          verified
        ) {
          return;
        }

        const codeToVerify =
          (
            completeOtp ??
            sanitizedOtp
          )
            .replace(/\D/g, "")
            .slice(
              0,
              OTP_LENGTH,
            );

        if (
          codeToVerify.length !==
          OTP_LENGTH
        ) {
          return;
        }

        if (
          !otpSent ||
          !sentIdentifier
        ) {
          showError(
            "OTP Required",
            "Request a verification code first.",
          );

          return;
        }

        if (expired) {
          showError(
            "Code Expired",
            "Request a new verification code.",
          );

          return;
        }

        if (
          sentIdentifier !==
          identifierKey
        ) {
          onOtpChange("");

          showError(
            "Email Changed",
            "Your email address changed. Request a new verification code.",
          );

          return;
        }

        const email =
          validateEmail();

        if (!email) {
          return;
        }

        verifyInFlightRef.current =
          true;

        setVerifying(true);

        try {
          await postOtpRequest(
            EMAIL_OTP_VERIFY_URL,
            {
              email,
              otp: codeToVerify,
            },
          );

          onVerified(true);

          setExpiresIn(0);

          showSuccess(
            "Verified",
            "Email verified successfully.",
          );
        } catch {
          onOtpChange("");

          showError(
            "Invalid OTP",
            "The verification code is not correct. Please try again.",
          );
        } finally {
          verifyInFlightRef.current =
            false;

          setVerifying(false);
        }
      },
      [
        expired,
        identifierKey,
        onOtpChange,
        onVerified,
        otpSent,
        sanitizedOtp,
        sentIdentifier,
        validateEmail,
        verified,
      ],
    );

  /* ============================================================
     SEND MODE
  ============================================================ */

  if (mode === "send") {
    return (
      <View
        style={
          styles.container
        }
      >
        <OtpResendCard
          otpSent={false}
          loading={sending}
          resending={false}
          resendCount={0}
          locked={false}
          timeLeft={0}
          onSend={handleSend}
          onResend={() => {}}
          role={resolvedRole}
          resendDisabled={
            sending
          }
          resendLabel="Send Code"
        />
      </View>
    );
  }

  /* ============================================================
     VERIFY MODE
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {!verified ? (
        <>
          {otpSent &&
          !expired ? (
            <>
              <AppText
                variant="caption"
                tone={
                  expiresIn <=
                  30
                    ? "warning"
                    : "secondary"
                }
                center
                style={
                  styles.timer
                }
              >
                Code expires in{" "}
                {formatTime(
                  expiresIn,
                )}
              </AppText>

              <OtpVerificationCard
                otp={
                  sanitizedOtp
                }
                loading={
                  verifying
                }
                verified={
                  false
                }
                onChangeOtp={
                  onOtpChange
                }
                onVerify={
                  handleVerifyOtp
                }
                role={
                  resolvedRole
                }
              />

              <OtpResendCard
                otpSent={true}
                loading={false}
                resending={
                  resending
                }
                resendCount={
                  resendCount
                }
                locked={
                  requestLocked
                }
                timeLeft={
                  requestLocked
                    ? requestLockTimeLeft
                    : resendAvailableIn
                }
                onSend={() => {}}
                onResend={
                  handleResend
                }
                role={
                  resolvedRole
                }
                resendDisabled={
                  requestLocked ||
                  resendAvailableIn >
                    0 ||
                  resending ||
                  verifying
                }
                resendLabel={
                  resendAvailableIn >
                  0
                    ? `Resend in ${formatTime(
                        resendAvailableIn,
                      )}`
                    : "Resend Code"
                }
              />
            </>
          ) : null}

          {otpSent &&
          expired ? (
            <View
              style={
                styles.expiredContainer
              }
            >
              <View
                style={
                  styles.expiredRow
                }
              >
                <AppIcon
                  name="warning"
                  role={
                    resolvedRole
                  }
                  size="sm"
                  state="warning"
                />

                <AppText
                  variant="caption"
                  tone="warning"
                  style={
                    styles.expiredText
                  }
                >
                  This code has
                  expired. Request
                  a new
                  verification
                  code.
                </AppText>
              </View>

              <OtpResendCard
                otpSent={true}
                loading={false}
                resending={
                  resending
                }
                resendCount={
                  resendCount
                }
                locked={
                  requestLocked
                }
                timeLeft={
                  requestLocked
                    ? requestLockTimeLeft
                    : 0
                }
                onSend={() => {}}
                onResend={
                  handleResend
                }
                role={
                  resolvedRole
                }
                resendDisabled={
                  requestLocked ||
                  resending
                }
                resendLabel="Resend Code"
              />
            </View>
          ) : null}
        </>
      ) : (
        <View
          accessibilityRole="text"
          accessibilityLabel="Email verified successfully"
          style={
            styles.successRow
          }
        >
          <AppIcon
            name="success"
            role={
              resolvedRole
            }
            size="sm"
            state="success"
          />

          <AppText
            variant="bodyMedium"
            tone="success"
          >
            Email verified
            successfully
          </AppText>
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    timer: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    expiredContainer: {
      width: "100%",
      marginTop:
        FixxamTokens.spacing.sm,
    },

    expiredRow: {
      flexDirection: "row",
      alignItems: "center",
      gap:
        FixxamTokens.spacing.sm,
      marginBottom:
        FixxamTokens.spacing.md,
    },

    expiredText: {
      flex: 1,
    },

    successRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap:
        FixxamTokens.spacing.sm,
      marginTop:
        FixxamTokens.spacing.sm,
      marginBottom:
        FixxamTokens.spacing.xs,
    },
  });

export default memo(
  OtpVerification,
);