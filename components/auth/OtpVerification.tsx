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
  type ConfirmationResult,
  signInWithPhoneNumber,
} from "@/firebase/firebaseAuth";

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

import { auth } from "@/firebase/config";

import {
  FixxamTokens,
  type FixxamRole,
} from "@/theme";

const OTP_LENGTH = 6;

const OTP_EXPIRY_SECONDS =
  3 * 60;

const RESEND_COOLDOWN_SECONDS =
  30;

const MAX_OTP_REQUESTS = 10;

const OTP_LOCK_SECONDS =
  60 * 60;

const EMAIL_OTP_SEND_URL =
  "https://sendsignupemailotp-yrig53veoq-uc.a.run.app";

const EMAIL_OTP_VERIFY_URL =
  "https://us-central1-fixxam-clean.cloudfunctions.net/verifySignupEmailOtp";

interface OtpApiResponse {
  success?: boolean;
  message?: string;
}

export interface OtpVerificationProps {
  type: "email" | "phone";

  value: string;

  otp: string;

  onOtpChange: (
    value: string,
  ) => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  verified?: boolean;

  onVerified: (
    value: boolean,
  ) => void;
}

function normalizeIdentifier(
  type: "email" | "phone",
  value: string,
): string {
  if (type === "email") {
    return value
      .trim()
      .toLowerCase();
  }

  return value.replace(/\D/g, "");
}

function formatPhone(
  phone: string,
): string | null {
  const cleaned =
    phone.replace(/\D/g, "");

  if (
    cleaned.length === 11 &&
    cleaned.startsWith("0")
  ) {
    return `+234${cleaned.slice(1)}`;
  }

  return null;
}

function formatTime(
  seconds: number,
): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(seconds),
  );

  const minutes = Math.floor(
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
  const response = await fetch(
    url,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(body),
    },
  );

  let data: OtpApiResponse | null =
    null;

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
    throw new Error(
      data?.message ||
        "Unable to process OTP request.",
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

function OtpVerification({
  type,

  value,
  otp,

  onOtpChange,

  role = "customer",
  variant,

  verified = false,

  onVerified,
}: OtpVerificationProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const [otpSent, setOtpSent] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [
    expiresIn,
    setExpiresIn,
  ] = useState(
    OTP_EXPIRY_SECONDS,
  );

  const [
    resendAvailableIn,
    setResendAvailableIn,
  ] = useState(0);

  const [
    resendCount,
    setResendCount,
  ] = useState(0);

  const [locked, setLocked] =
    useState(false);

  const [
    lockTimeLeft,
    setLockTimeLeft,
  ] = useState(0);

  const [
    confirmation,
    setConfirmation,
  ] =
    useState<ConfirmationResult | null>(
      null,
    );

  /*
   * Identifier that actually received
   * the current OTP.
   *
   * This prevents an OTP sent to one
   * email/phone from verifying another
   * value after the user edits the field.
   */
  const [
    sentIdentifier,
    setSentIdentifier,
  ] =
    useState<string | null>(
      null,
    );

  const requestInFlightRef =
    useRef(false);

  const verifyInFlightRef =
    useRef(false);

  const normalizedIdentifier =
    useMemo(
      () =>
        normalizeIdentifier(
          type,
          value,
        ),
      [type, value],
    );

  const identifierKey =
    useMemo(
      () =>
        `${type}:${normalizedIdentifier}`,
      [
        normalizedIdentifier,
        type,
      ],
    );

  const sanitizedOtp =
    useMemo(
      () =>
        otp
          .replace(/\D/g, "")
          .slice(0, OTP_LENGTH),
      [otp],
    );

  const expired =
    otpSent &&
    expiresIn <= 0;

  /*
   * OTP expiry countdown.
   */
  useEffect(() => {
    if (
      !otpSent ||
      verified ||
      expiresIn <= 0
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setExpiresIn((current) =>
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

  /*
   * Resend cooldown countdown.
   */
  useEffect(() => {
    if (
      resendAvailableIn <= 0
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setResendAvailableIn(
        (current) =>
          Math.max(
            0,
            current - 1,
          ),
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [resendAvailableIn]);

  /*
   * One-hour client-side lock timer.
   *
   * Backend must also enforce OTP
   * throttling; client limits alone
   * are not a security boundary.
   */
  useEffect(() => {
    if (
      !locked ||
      lockTimeLeft <= 0
    ) {
      if (
        locked &&
        lockTimeLeft <= 0
      ) {
        setLocked(false);
        setResendCount(0);
      }

      return;
    }

    const timer = setTimeout(() => {
      setLockTimeLeft(
        (current) =>
          Math.max(
            0,
            current - 1,
          ),
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    locked,
    lockTimeLeft,
  ]);

  /*
   * Invalidate an existing OTP whenever
   * the email/phone value changes.
   */
  useEffect(() => {
    if (
      !sentIdentifier ||
      sentIdentifier ===
        identifierKey
    ) {
      return;
    }

    setOtpSent(false);

    setConfirmation(null);

    setSentIdentifier(null);

    setExpiresIn(
      OTP_EXPIRY_SECONDS,
    );

    setResendAvailableIn(0);

    onOtpChange("");

    onVerified(false);
  }, [
    identifierKey,
    onOtpChange,
    onVerified,
    sentIdentifier,
  ]);

  const validateIdentifier =
    useCallback(():
      | string
      | null => {
      if (!normalizedIdentifier) {
        showError(
          type === "email"
            ? "Email Required"
            : "Phone Required",
          type === "email"
            ? "Enter your email address."
            : "Enter your phone number.",
        );

        return null;
      }

      if (type === "email") {
        const emailRegex =
          /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (
          !emailRegex.test(
            normalizedIdentifier,
          )
        ) {
          showError(
            "Invalid Email",
            "Please enter a valid email address.",
          );

          return null;
        }

        return normalizedIdentifier;
      }

      if (
        normalizedIdentifier.length !==
          11 ||
        !normalizedIdentifier.startsWith(
          "0",
        )
      ) {
        showError(
          "Invalid Phone Number",
          "Enter a valid 11-digit phone number.",
        );

        return null;
      }

      return normalizedIdentifier;
    }, [
      normalizedIdentifier,
      type,
    ]);

  const requestOtp =
    useCallback(
      async (
        isResend: boolean,
      ) => {
        if (
          requestInFlightRef.current
        ) {
          return;
        }

        if (locked) {
          showError(
            "Too Many Requests",
            `Please try again in ${formatTime(
              lockTimeLeft,
            )}.`,
          );

          return;
        }

        if (
          isResend &&
          resendAvailableIn > 0
        ) {
          return;
        }

        const identifier =
          validateIdentifier();

        if (!identifier) {
          return;
        }

        if (
          resendCount >=
          MAX_OTP_REQUESTS
        ) {
          setLocked(true);

          setLockTimeLeft(
            OTP_LOCK_SECONDS,
          );

          showError(
            "Limit Reached",
            "You have reached the maximum OTP requests. Please wait 1 hour.",
          );

          return;
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
          if (type === "email") {
            await postOtpRequest(
              EMAIL_OTP_SEND_URL,
              {
                identifier,
              },
            );

            setConfirmation(null);
          } else {
            const formattedPhone =
              formatPhone(
                identifier,
              );

            if (!formattedPhone) {
              throw new Error(
                "Invalid phone number.",
              );
            }

            const result =
              await signInWithPhoneNumber(
                auth,
                formattedPhone,
              );

            setConfirmation(
              result,
            );
          }

          const nextCount =
            resendCount + 1;

          setResendCount(
            nextCount,
          );

          setSentIdentifier(
            `${type}:${identifier}`,
          );

          setOtpSent(true);

          setExpiresIn(
            OTP_EXPIRY_SECONDS,
          );

          setResendAvailableIn(
            RESEND_COOLDOWN_SECONDS,
          );

          /*
           * Allow the 10th request,
           * then prevent further requests.
           * The current OTP can still
           * be verified.
           */
          if (
            nextCount >=
            MAX_OTP_REQUESTS
          ) {
            setLocked(true);

            setLockTimeLeft(
              OTP_LOCK_SECONDS,
            );
          }

          showSuccess(
            isResend
              ? "OTP Resent"
              : "OTP Sent",
            "Verification code sent successfully.",
          );
        } catch (error: unknown) {
          showError(
            "Unable to Send Code",
            getErrorMessage(
              error,
              "Unable to send OTP.",
            ),
          );
        } finally {
          requestInFlightRef.current =
            false;

          setSending(false);

          setResending(false);
        }
      },
      [
        lockTimeLeft,
        locked,
        onOtpChange,
        onVerified,
        resendAvailableIn,
        resendCount,
        type,
        validateIdentifier,
      ],
    );

  const handleSend =
    useCallback(() => {
      void requestOtp(false);
    }, [requestOtp]);

  const handleResend =
    useCallback(() => {
      void requestOtp(true);
    }, [requestOtp]);

  const handleVerifyOtp =
    useCallback(async () => {
      if (
        verifyInFlightRef.current ||
        verified
      ) {
        return;
      }

      if (
        sanitizedOtp.length !==
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

      /*
       * Critical:
       * Verify only the exact identifier
       * that received this OTP.
       */
      if (
        sentIdentifier !==
        identifierKey
      ) {
        showError(
          "Details Changed",
          `The ${
            type === "email"
              ? "email address"
              : "phone number"
          } changed. Request a new verification code.`,
        );

        return;
      }

      verifyInFlightRef.current =
        true;

      setVerifying(true);

      try {
        if (type === "email") {
          await postOtpRequest(
            EMAIL_OTP_VERIFY_URL,
            {
              email:
                normalizedIdentifier,
              otp: sanitizedOtp,
            },
          );
        } else {
          if (!confirmation) {
            throw new Error(
              "Request a new verification code.",
            );
          }

          await confirmation.confirm(
            sanitizedOtp,
          );
        }

        onVerified(true);

        setExpiresIn(0);

        setConfirmation(null);

        showSuccess(
          "Verified",
          type === "email"
            ? "Email verified successfully."
            : "Phone verified successfully.",
        );
      } catch (error: unknown) {
        showError(
          "Verification Failed",
          getErrorMessage(
            error,
            "Invalid or expired OTP.",
          ),
        );
      } finally {
        verifyInFlightRef.current =
          false;

        setVerifying(false);
      }
    }, [
      confirmation,
      expired,
      identifierKey,
      normalizedIdentifier,
      onVerified,
      otpSent,
      sanitizedOtp,
      sentIdentifier,
      type,
      verified,
    ]);

  return (
    <View style={styles.container}>
      {!verified ? (
        <>
          <OtpResendCard
            otpSent={otpSent}
            loading={sending}
            resending={
              resending ||
              verifying
            }
            resendCount={
              resendCount
            }
            locked={locked}
            timeLeft={
              lockTimeLeft
            }
            onSend={handleSend}
            onResend={
              handleResend
            }
            role={resolvedRole}
            resendDisabled={
              resendAvailableIn >
                0 ||
              verifying
            }
            resendLabel={
              resendAvailableIn > 0
                ? `Resend in ${formatTime(
                    resendAvailableIn,
                  )}`
                : "Resend Code"
            }
          />

          {otpSent &&
          !expired ? (
            <>
              <AppText
                variant="caption"
                tone={
                  expiresIn <= 30
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
                otp={sanitizedOtp}
                loading={
                  verifying
                }
                verified={false}
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
            </>
          ) : null}

          {otpSent &&
          expired ? (
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
                expired. Request a
                new verification
                code.
              </AppText>
            </View>
          ) : null}
        </>
      ) : (
        <View
          accessibilityRole="text"
          accessibilityLabel={
            type === "email"
              ? "Email verified successfully"
              : "Phone verified successfully"
          }
          style={
            styles.successRow
          }
        >
          <AppIcon
            name="success"
            role={resolvedRole}
            size="sm"
            state="success"
          />

          <AppText
            variant="bodyMedium"
            tone="success"
          >
            {type === "email"
              ? "Email verified successfully"
              : "Phone verified successfully"}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    timer: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    expiredRow: {
      flexDirection: "row",
      alignItems: "center",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
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