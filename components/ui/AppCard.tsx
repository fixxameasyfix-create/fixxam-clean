import type { ReactNode } from "react";
import React, { memo } from "react";

import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type CardVariant =
  | "default"
  | "outlined"
  | "elevated"
  | "accent";

export interface AppCardProps {
  children: ReactNode;

  role?: FixxamRole;

  variant?: CardVariant;

  onPress?: () => void;

  disabled?: boolean;

  accessibilityLabel?: string;

  style?: StyleProp<ViewStyle>;
}

function AppCard({
  children,
  role = "customer",
  variant = "default",
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
}: AppCardProps) {
  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const isInteractive =
    typeof onPress === "function";

  const variantStyle = {
    default: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
    },

    outlined: {
      backgroundColor: colors.card,
      borderColor: colors.borderStrong,
      borderWidth: 1,
    },

    elevated: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: StyleSheet.hairlineWidth,
    },

    accent: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
      borderWidth: 1,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole={
        isInteractive ? "button" : undefined
      }
      accessibilityLabel={
        accessibilityLabel
      }
      accessibilityState={{
        disabled:
          isInteractive
            ? disabled
            : undefined,
      }}
      disabled={
        disabled || !isInteractive
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,

        variantStyle,

        variant === "elevated"
          ? FixxamTokens.shadow.card
          : null,

        pressed &&
        isInteractive &&
        !disabled
          ? styles.pressed
          : null,

        disabled
          ? styles.disabled
          : null,

        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius:
      FixxamTokens.radius.card,

    padding:
      FixxamTokens.spacing.card,
  },

  pressed: {
    opacity:
      FixxamTokens.motion
        .pressedOpacity,

    transform: [
      {
        scale:
          FixxamTokens.motion
            .scalePressed,
      },
    ],
  },

  disabled: {
    opacity:
      FixxamTokens.motion
        .disabledOpacity,
  },
});

export default memo(AppCard);