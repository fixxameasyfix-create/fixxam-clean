import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui";
import {
  CustomerColors,
  WorkerColors,
  FixxamTokens,
  FIXXAM,
  FixxamColors,
} from "@/theme";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  variant?: "customer" | "worker";
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export default function AppInput({
  label,
  error,
  required = false,
  variant = "customer",
  leftIcon,
  style,
  ...props
}: AppInputProps) {
  const activeColor =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <AppText
            weight="semibold"
            style={styles.label}
          >
            {label}
          </AppText>

          {required && (
            <AppText
              style={styles.required}
            >
              {" *"}
            </AppText>
          )}
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: activeColor,
          },
          error && styles.errorBorder,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={FIXXAM.ICON_SIZE_MD}
            color={activeColor}
            style={styles.icon}
          />
        )}

        <TextInput
          {...props}
          placeholderTextColor={
            CustomerColors.textSecondary
          }
          style={[
            styles.input,
            style,
          ]}
        />
      </View>

      {!!error && (
        <AppText
          style={styles.errorText}
        >
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: CustomerColors.textPrimary,
  },

  required: {
    fontSize: 12,
    color: CustomerColors.error,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",

    height: 48,

    borderWidth: 1,
    borderRadius: 14,

    backgroundColor: FixxamColors.white,

    paddingHorizontal: 12,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 1,
  },

  icon: {
    marginRight: 8,
  },

  input: {
    flex: 1,

    color: CustomerColors.textPrimary,

    fontSize: 15,

    paddingVertical: 0,
  },

  errorBorder: {
    borderColor: CustomerColors.error,
  },

  errorText: {
    marginTop: 3,
    fontSize: 11,
    color: CustomerColors.error,
  },
});