import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  disabled: boolean;
  onPress: () => void;
};

export default function ContinueBookingButton({
  disabled,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        disabled && styles.disabled,
      ]}
    >
      <AppText
        weight="bold"
        style={styles.text}
      >
        Continue Booking
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    marginBottom: 40,

    height: 56,

    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FF6B00",

    elevation: 3,
  },

  disabled: {
    backgroundColor: "#CBD5E1",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 17,
  },
});