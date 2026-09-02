import React, {
    useEffect,
    useState,
} from "react";

import {
    StyleSheet,
    View,
} from "react-native";

import {
    ConfirmationResult,
    signInWithPhoneNumber,
} from "@/firebase/firebaseAuth";

import {
    AppButton,
    AppText,
} from "@/components/ui";

import OtpBoxes from "./OtpBoxes";

import {
    showError,
    showSuccess,
} from "@/utils/showToast";

import { auth } from "@/firebase/config";

import {
    CustomerColors,
    FixxamTokens,
    WorkerColors,
} from "@/theme";

type Props = {
  type: "email" | "phone";

  value: string;
  otp: string;

  onOtpChange: (
    value: string
  ) => void;

  variant?: "customer" | "worker";

  verified?: boolean;

  onVerified: (
    value: boolean
  ) => void;
};

export default function OtpVerification({
  type,
  value,
  otp,
  onOtpChange,
  variant = "customer",
  verified = false,
  onVerified,
}: Props) {

  const activeColor =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  const [otpSent, setOtpSent] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [buttonState, setButtonState] =
    useState<
      | "send"
      | "sent"
      | "resend"
      | "verified"
    >("send");

  const [seconds, setSeconds] =
    useState(180);

  const [resendCount, setResendCount] =
    useState(0);

  const [locked, setLocked] =
    useState(false);

  const [
    confirmation,
    setConfirmation,
  ] =
    useState<ConfirmationResult | null>(
      null
    );

  useEffect(() => {
    if (
      !otpSent ||
      verified ||
      locked
    ) {
      return;
    }

    if (seconds <= 0) {
      setSeconds(0);
      setButtonState("resend");
      return;
    }
    if (
  seconds === 175 &&
  buttonState === "sent"
) {
  setButtonState("resend");
}

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);

  }, [
    otpSent,
    verified,
    seconds,
    locked,
  ]);

  const formatPhone = (
    phone: string
  ) => {
    const cleaned =
      phone.replace(/\D/g, "");

    if (
      cleaned.length === 11 &&
      cleaned.startsWith("0")
    ) {
      return `+234${cleaned.slice(1)}`;
    }

    return "";
  };
  const handleSendOtp = async () => {

  if (locked) {
    showError(
      "Too Many Requests",
      "Please wait before requesting another OTP."
    );
    return;
  }

  if (!value.trim()) {
    showError(
      type === "email"
        ? "Email Required"
        : "Phone Required",
      type === "email"
        ? "Enter your email address."
        : "Enter your phone number."
    );
    return;
  }

  // Email validation
  if (type === "email") {

    const email =
      value.trim().toLowerCase();

    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {
      showError(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

  }

  // Phone validation
  if (type === "phone") {

    const phone =
      value.replace(/\D/g, "");

    if (
      phone.length !== 11 ||
      !phone.startsWith("0")
    ) {
      showError(
        "Invalid Phone Number",
        "Enter a valid 11-digit phone number."
      );
      return;
    }

  }

  if (resendCount >= 10) {
    setLocked(true);

    showError(
      "Limit Reached",
      "You have reached the maximum OTP requests. Please wait 1 hour."
    );

    return;
  }

  try {

    setSending(true);

    onOtpChange("");

    onVerified(false);

    if (type === "email") {

      const response = await fetch(
         'https://sendsignupemailotp-yrig53veoq-uc.a.run.app',
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
  identifier: value.trim().toLowerCase(),
})
        }
      );

      const data =
        await response.json();

      if (!data.success) {
        throw new Error(
          data.message
        );
      }

    } else {

      const formatted =
        formatPhone(value);

      const result =
        await signInWithPhoneNumber(
          auth,
          formatted
        );

      setConfirmation(result);

    }

    setOtpSent(true);

    setButtonState("sent");

    setSeconds(180);

    setResendCount(
      (prev) => prev + 1
    );

    showSuccess(
      "OTP Sent",
      "Verification code sent successfully."
    );

  } catch (error: any) {

    showError(
      "Failed",
      error?.message ||
        "Unable to send OTP."
    );

  } finally {

    setSending(false);

  }

};

const handleVerifyOtp = async () => {

  if (otp.length !== 6) {
    return;
  }

  try {

    setVerifying(true);

    if (type === "email") {

      const response = await fetch(
        "https://us-central1-fixxam-clean.cloudfunctions.net/verifySignupEmailOtp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: value.trim().toLowerCase(),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

    } else {

      if (!confirmation) {
        throw new Error("OTP not sent.");
      }

      await confirmation.confirm(otp);

    }

    onVerified(true);

    setButtonState("verified");

    showSuccess(
      "Verified",
      type === "email"
        ? "Email verified successfully."
        : "Phone verified successfully."
    );

  } catch (error: any) {

    showError(
      "Verification Failed",
      error?.message || "Invalid OTP."
    );

  } finally {

    setVerifying(false);

  }

};

useEffect(() => {
  if (
    otpSent &&
    !verified &&
    otp.length === 6
  ) {
    handleVerifyOtp();
  }
}, [otp]);

return (
  <View>

    {!verified && (
      <>
        <View style={styles.buttonContainer}>
          <AppButton
            title={
              buttonState === "send"
                ? "Send OTP"
                : buttonState === "sent"
                ? "Sent ✓"
                : buttonState === "resend"
                ? "Resend OTP"
                : "Verified"
            }
            variant={variant}
            loading={sending || verifying}
            disabled={
              buttonState === "sent"
            }
            onPress={handleSendOtp}
          />
        </View>

        {otpSent && (
          <>
            <AppText
              style={styles.timer}
            >
              Expires in{" "}
              {`${Math.floor(seconds / 60)}:${String(
                seconds % 60
              ).padStart(2, "0")}`}
            </AppText>

            <OtpBoxes
              value={otp}
              onChange={onOtpChange}
              onComplete={handleVerifyOtp}
              variant={variant}
              editable={!verifying}
            />
          </>
        )}
      </>
    )}

    {verified && (
      <AppText
        style={styles.success}
      >
        ✓{" "}
        {type === "email"
          ? "Email verified successfully"
          : "Phone verified successfully"}
      </AppText>
    )}

  </View>
);

}

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: FixxamTokens.spacing.xs,
    marginBottom: FixxamTokens.spacing.sm,
  },

  timer: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
    marginBottom: FixxamTokens.spacing.sm,
  },

  success: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: FixxamTokens.spacing.sm,
    marginBottom: FixxamTokens.spacing.xs,
  },
});