import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
} from "react-native";

import { AppButton } from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
  FIXXAM,
} from "@/theme";

interface Props {
  otp: string;
  loading: boolean;
  verified: boolean;
  onChangeOtp: (value: string) => void;
  onVerify: () => void;
}

export default function OtpVerificationCard({
  otp,
  loading,
  verified,
  onChangeOtp,
  onVerify,
}: Props) {
  const inputRefs =
    useRef<Array<TextInput | null>>([]);

  const otpArray = otp.padEnd(6).split("");

  const handleChange = (
    value: string,
    index: number
  ) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpArray];
    newOtp[index] = value;

    const code = newOtp.join("").trim();

    onChangeOtp(code);

    if (code.length === 6) {
      setTimeout(() => {
        onVerify();
      }, 200);
    }

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <View style={styles.otpRow}>
        {otpArray.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit === " " ? "" : digit}
            onChangeText={(text) =>
              handleChange(text, index)
            }
            onKeyPress={({ nativeEvent }) => {
              if (
                nativeEvent.key === "Backspace" &&
                !otpArray[index] &&
                index > 0
              ) {
                inputRefs.current[index - 1]?.focus();
              }
            }}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
            selectTextOnFocus
            textAlign="center"
            style={styles.otpBox}
          />
        ))}
      </View>

      <AppButton
        title={
          verified
            ? "Verified ✓"
            : "Verify Code"
        }
        variant="worker"
        loading={loading}
        disabled={verified}
        onPress={onVerify}
      />
    </>
  );
}

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: FixxamTokens.spacing.xl,
  },

  otpBox: {
    width: FIXXAM.OTP_BOX_SIZE,
    height: FIXXAM.OTP_BOX_SIZE,

    borderWidth: 1,
    borderColor: CustomerColors.primary,

    borderRadius:
      FixxamTokens.radius.md,

    backgroundColor: "#FFFFFF",

    fontSize: FIXXAM.FONT_LG,
    fontWeight: "700",
    color: CustomerColors.textPrimary,

    ...FixxamTokens.shadow.card,
  },
});