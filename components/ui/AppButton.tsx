import type { ReactNode } from "react";
import React from "react";

import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import AppText from "./AppText";

import {
  CustomerColors,
  FIXXAM,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

interface AppButtonProps {
  title: string;

  onPress: () => void;

  loading?: boolean;

  disabled?: boolean;

  variant?:
    | "customer"
    | "worker"
    | "outline";

  leftIcon?: ReactNode;

  rightIcon?: ReactNode;

  style?: StyleProp<ViewStyle>;

  textStyle?: StyleProp<TextStyle>;
}

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "customer",
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: AppButtonProps) {
  const isDisabled =
    disabled || loading;

  const isOutline =
    variant === "outline";

  const backgroundColor =
    isOutline
      ? CustomerColors.white
      : variant === "worker"
        ? WorkerColors.primary
        : CustomerColors.primary;

  const borderColor =
    isOutline
      ? CustomerColors.primary
      : "transparent";

  const textColor =
    isOutline
      ? CustomerColors.primary
      : CustomerColors.white;

  const disabledBackground =
    isOutline
      ? CustomerColors.card
      : variant === "worker"
        ? "#FDBA74"
        : "#93C5FD";

  return (
    <TouchableOpacity
      activeOpacity={
        FIXXAM.PRESSED_OPACITY
      }
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor:
            isDisabled
              ? disabledBackground
              : backgroundColor,

          borderWidth:
            isOutline ? 1.5 : 0,

          borderColor,

          opacity:
            isDisabled
              ? FIXXAM.DISABLED_OPACITY
              : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon ? (
            <View
              style={
                styles.iconLeft
              }
            >
              {leftIcon}
            </View>
          ) : null}

          <AppText
            weight="bold"
            color={textColor}
            style={[
              styles.text,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </AppText>

          {rightIcon ? (
            <View
              style={
                styles.iconRight
              }
            >
              {rightIcon}
            </View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles =
  StyleSheet.create({
    button: {
      minHeight: 54,

      borderRadius: 16,

      paddingHorizontal: 18,

      alignItems: "center",

      justifyContent:
        "center",

      overflow: "hidden",

      ...FixxamTokens.shadow
        .button,
    },

    content: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",
    },

    iconLeft: {
      marginRight: 10,

      alignItems: "center",

      justifyContent:
        "center",
    },

    iconRight: {
      marginLeft: 10,

      alignItems: "center",

      justifyContent:
        "center",
    },

    text: {
      fontSize: 15,

      letterSpacing: 0.2,

      textAlign: "center",
    },
  });