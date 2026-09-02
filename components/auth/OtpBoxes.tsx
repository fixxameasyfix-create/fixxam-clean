import React, { useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
} from "react-native";

import {
  CustomerColors,
  WorkerColors,
  FIXXAM,
} from "@/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  variant?: "customer" | "worker";
  editable?: boolean;
};

export default function OtpBoxes({
  value,
  onChange,
  onComplete,
  variant = "customer",
  editable = true,
}: Props) {
  const inputs = useRef<TextInput[]>([]);

  const activeColor =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  const digits = Array.from({ length: 6 }, (_, index) =>
    value[index] || ""
  );

  const handleChange = (
    text: string,
    index: number
  ) => {
    const digit = text.replace(/\D/g, "").slice(-1);

    const otp = value.padEnd(6, " ").split("");

    otp[index] = digit;

    const newOtp = otp.join("").replace(/\s/g, "");

    onChange(newOtp);

    if (newOtp.length === 6) {
  onComplete?.(newOtp);
}

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    key: string,
    index: number
  ) => {
    if (
      key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) {
              inputs.current[index] = ref;
            }
          }}
          value={digit}
          editable={editable}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          style={[
            styles.box,
            {
              borderColor: activeColor,
            },
          ]}
          onChangeText={(text) =>
            handleChange(text, index)
          }
          onKeyPress={({ nativeEvent }) =>
            handleKeyPress(
              nativeEvent.key,
              index
            )
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 4,
    marginBottom: 6,
  },

  box: {
    width: 40,
    height: 40,

    borderWidth: 1.5,
    borderRadius: 12,

    fontSize: 20,
    fontWeight: "700",

    textAlign: "center",

    color: CustomerColors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
});