import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  CustomerColors,
  WorkerColors,
  FixxamTokens,
  FIXXAM,
} from "@/theme";

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  variant?: "customer" | "worker";
};

export default function PasswordField({
  placeholder,
  value,
  onChangeText,
  variant = "customer",
}: Props) {
  const [secure, setSecure] = useState(true);

  const activeColor =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: activeColor,
        },
      ]}
    >
      <TextInput
        placeholder={placeholder}
        secureTextEntry={secure}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        placeholderTextColor={
          CustomerColors.textSecondary
        }
        style={styles.input}
      />

      <TouchableOpacity
        activeOpacity={FIXXAM.PRESSED_OPACITY}
        hitSlop={{
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
        }}
        onPress={() =>
          setSecure(!secure)
        }
      >
        <Ionicons
          name={
            secure
              ? "eye-off-outline"
              : "eye-outline"
          }
          size={FIXXAM.ICON_SIZE_MD}
          color={activeColor}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: FIXXAM.INPUT_HEIGHT,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 14,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderRadius:
      FIXXAM.BORDER_RADIUS_MD,

    ...FixxamTokens.shadow.card,
  },

  input: {
    flex: 1,

    color:
      CustomerColors.textPrimary,

    fontSize:
      FIXXAM.BODY_SIZE,

    paddingVertical: 0,
    paddingRight: 12,
  },
});