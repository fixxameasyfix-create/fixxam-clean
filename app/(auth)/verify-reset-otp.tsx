import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppScreen,
  AppCard,
  AppText,
} from "@/components/ui";

import OtpBoxes from "@/components/auth/OtpBoxes";

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

export default function VerifyResetOtpScreen() {
  const { email } =
    useLocalSearchParams<{
      email: string;
    }>();

  const [otp, setOtp] =
    useState("");

  const [verified, setVerified] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [resendCount, setResendCount] =
    useState(0);

  const [locked, setLocked] =
    useState(false);

  const [buttonState, setButtonState] =
    useState<
      | "sent"
      | "resend"
    >("resend");

  const [seconds, setSeconds] =
    useState(180);


  const maskValue = (
    value: string
  ) => {
    if (!value) return "";

    if (value.includes("@")) {
      const [
        name,
        domain,
      ] = value.split("@");

      return (
        name.substring(0, 2) +
        "*".repeat(
          Math.max(
            name.length - 2,
            4
          )
        ) +
        "@" +
        domain
      );
    }

    return (
      value.substring(0, 5) +
      "*****" +
      value.substring(
        value.length - 2
      )
    );
  };

  useEffect(() => {
    if (
      verified ||
      locked
    )
      return;

    if (seconds <= 0) {
      setButtonState("resend");

      showError(
        "OTP Expired",
        "Request a new verification code."
      );

      return;
    }

    const timer =
      setInterval(() => {
        setSeconds(
          (prev) => prev - 1
        );
      }, 1000);

    return () =>
      clearInterval(timer);

  }, [
    seconds,
    verified,
    locked,
  ]);

  const formatTime = (
    total: number
  ) => {
    const minutes =
      Math.floor(total / 60);

    const secs =
      total % 60;

    return `${minutes}:${String(
      secs
    ).padStart(2, "0")}`;
  };
  const handleVerifyOtp = async () => {
  if (otp.length !== 6) {
    showError(
      "Invalid Code",
      "Please enter the 6-digit verification code."
    );
    return;
  }

  try {
    setVerifying(true);
    setSeconds(0)

    const response = await fetch(
      "https://verifypasswordresetotp-yrig53veoq-uc.a.run.app",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      }
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          "Verification failed."
      );
    }

    setVerified(true);

    showSuccess(
      "Verification Successful",
      "OTP verified successfully."
    );

    setTimeout(() => {
      router.replace({
        pathname:
          "/(auth)/reset-password",
        params: {
          email:
            email as string,
        },
      });
    }, 1000);

  } catch (error: any) {
    showError(
      "Verification Failed",
      error?.message ||
        "Unable to verify OTP."
    );
  } finally {
    setVerifying(false);
  }
};

const handleResendOtp = async () => {
  if (locked) return;

  if (resendCount >= 10) {
    setLocked(true);
    setSeconds(3600);

    showError(
      "Too Many Attempts",
      "Please try again after 1 hour."
    );

    return;
  }

  try {
    setResending(true);

    const response =
      await fetch(
        "https://sendpasswordresetotp-yrig53veoq-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          "Unable to resend OTP."
      );
    }

    setButtonState("sent");

    showSuccess(
      "OTP Sent",
      "A new verification code has been sent."
    );

    setSeconds(180);
    setOtp('')

    const count =
      resendCount + 1;

    setResendCount(count);

    setTimeout(() => {
      if (!verified) {
        setButtonState(
          "resend"
        );
      }
    }, 5000);

    if (count >= 10) {
      setLocked(true);
      setSeconds(3600);

      showError(
        "Too Many Attempts",
        "Resend locked for 1 hour."
      );
    }

  } catch (error: any) {
    showError(
      "Failed",
      error?.message ||
        "Unable to resend OTP."
    );
  } finally {
    setResending(false);
  }
};

useEffect(() => {
  if (
    otp.length === 6 &&
    !verified &&
    !verifying
  ) {
    handleVerifyOtp();
  }
}, [otp]);

return (
  <AppScreen>
    <View style={styles.header}>
      <AppText
        size="xl"
        weight="bold"
        center
        style={styles.title}
      >
        Check Your Messages
      </AppText>

      <AppText
        center
        style={styles.subtitle}
      >
        We've sent a verification code to your
        email address or phone number.
      </AppText>

      <AppText
        center
        weight="bold"
        style={styles.email}
      >
        {maskValue(email as string)}
      </AppText>

      <TouchableOpacity
        onPress={() => router.back()}
      >
        <AppText style={styles.edit}>
          Edit
        </AppText>
      </TouchableOpacity>
    </View>

    <AppCard style={styles.card}>
      <AppText
        weight="bold"
        style={styles.cardTitle}
      >
        Enter Verification Code
      </AppText>

      <AppText
        style={styles.cardSubtitle}
      >
        Enter the 6-digit verification code.
      </AppText>

      <OtpBoxes
  value={otp}
  onChange={setOtp}
  onComplete={handleVerifyOtp}
  editable={!verifying}
  variant="customer"
/>

      {!verified && (
        <>
          <AppText
            style={[
              styles.timer,
              {
                color:
                  seconds > 60
                    ? "#16A34A"
                    : seconds > 20
                    ? "#F59E0B"
                    : "#DC2626",
              },
            ]}
          >
            Code expires in{" "}
            {formatTime(seconds)}
          </AppText>

          <TouchableOpacity
            disabled={
              locked ||
              resending ||
              buttonState === "sent"
            }
            onPress={handleResendOtp}
          >
            <AppText
              style={styles.resend}
            >
              {locked
                ? `Try again in ${formatTime(
                    seconds
                  )}`
                : buttonState ===
                  "sent"
                ? "Sent ✓"
                : `Resend Code (${resendCount}/10)`}
            </AppText>
          </TouchableOpacity>
        </>
      )}

      {verified && (
        <AppText
          style={styles.success}
        >
          ✓ OTP Verified Successfully
        </AppText>
      )}
    </AppCard>
  </AppScreen>
);

}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 36,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  title: {
    color: "#0B1F4D",
    fontSize: 28,
    marginBottom: 6,
  },

  subtitle: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },

  email: {
    color: "#0B1F4D",
    fontSize: 15,
    marginBottom: 8,
  },

  edit: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },

  card: {
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 16,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardTitle: {
    textAlign: "center",
    color: "#0B1F4D",
    fontSize: 18,
    marginBottom: 6,
  },

  cardSubtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },

  timer: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 14,
  },

  resend: {
    textAlign: "center",
    color: "#F97316",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16,
  },

  success: {
    textAlign: "center",
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 18,
  },
});