import type { ReactNode } from "react";
import React, { memo } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import AppIcon from "./AppIcon";
import type { AppIconName } from "./AppIcon";
import AppText from "./AppText";

import {
  CustomerColors,
  FixxamTokens,
  Typography,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  // Legacy support
  | "customer"
  | "worker";

type ButtonSize = "sm" | "md";

export interface AppButtonProps {
  title: string;

  onPress: () => void;

  role?: FixxamRole;

  variant?: ButtonVariant;

  size?: ButtonSize;

  loading?: boolean;

  disabled?: boolean;

  /*
   * Preferred icon API
   */
  leftIconName?: AppIconName;
  rightIconName?: AppIconName;

  /*
   * Legacy/custom icon support
   */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  accessibilityLabel?: string;

  style?: StyleProp<ViewStyle>;

  textStyle?: StyleProp<TextStyle>;
}

function AppButton({
  title,
  onPress,
  role = "customer",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIconName,
  rightIconName,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  style,
  textStyle,
}: AppButtonProps) {
  /*
   * Keep old usage working:
   *
   * variant="customer"
   * variant="worker"
   */
  const resolvedRole: FixxamRole =
    variant === "worker"
      ? "worker"
      : variant === "customer"
        ? "customer"
        : role;

  const resolvedVariant =
    variant === "customer" || variant === "worker"
      ? "primary"
      : variant;

  const colors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  const isDisabled = disabled || loading;

  const palette = {
    primary: {
      background: colors.primary,
      pressed: colors.primaryPressed,
      text: colors.white,
      border: "transparent",
    },

    secondary: {
      background: colors.primarySoft,
      pressed: colors.primarySoft,
      text: colors.primary,
      border: "transparent",
    },

    outline: {
      background: colors.surface,
      pressed: colors.primarySoft,
      text: colors.primary,
      border: colors.primary,
    },

    ghost: {
      background: "transparent",
      pressed: colors.primarySoft,
      text: colors.primary,
      border: "transparent",
    },

    danger: {
      background: colors.error,
      pressed: colors.error,
      text: colors.white,
      border: "transparent",
    },
  } as const;

  const current = palette[resolvedVariant];

  const height =
    size === "sm"
      ? FixxamTokens.size.buttonSmallHeight
      : FixxamTokens.size.buttonHeight;

  const iconSize =
    size === "sm"
      ? "sm"
      : "md";

  const showShadow =
    resolvedVariant === "primary" &&
    !isDisabled;

  const renderLeftIcon = () => {
    if (leftIcon) {
      return leftIcon;
    }

    if (!leftIconName) {
      return null;
    }

    return (
      <AppIcon
        name={leftIconName}
        role={resolvedRole}
        size={iconSize}
        color={current.text}
      />
    );
  };

  const renderRightIcon = () => {
    if (rightIcon) {
      return rightIcon;
    }

    if (!rightIconName) {
      return null;
    }

    return (
      <AppIcon
        name={rightIconName}
        role={resolvedRole}
        size={iconSize}
        color={current.text}
      />
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? title
      }
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,

        {
          minHeight: height,

          backgroundColor: isDisabled
            ? resolvedVariant === "outline" ||
              resolvedVariant === "ghost"
              ? colors.disabledBackground
              : colors.primaryDisabled
            : pressed
              ? current.pressed
              : current.background,

          borderColor: isDisabled
            ? colors.disabled
            : current.border,

          borderWidth:
            resolvedVariant === "outline"
              ? StyleSheet.hairlineWidth * 2
              : 0,

          opacity: isDisabled
            ? FixxamTokens.motion.disabledOpacity
            : pressed
              ? FixxamTokens.motion.pressedOpacity
              : 1,

          transform: [
            {
              scale:
                pressed && !isDisabled
                  ? FixxamTokens.motion.scalePressed
                  : 1,
            },
          ],
        },

        showShadow
          ? FixxamTokens.shadow.button
          : null,

        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            resolvedVariant === "secondary" ||
            resolvedVariant === "outline" ||
            resolvedVariant === "ghost"
              ? colors.primary
              : colors.white
          }
        />
      ) : (
        <View style={styles.content}>
          {renderLeftIcon() ? (
            <View style={styles.iconLeft}>
              {renderLeftIcon()}
            </View>
          ) : null}

          <AppText
            color={
              isDisabled
                ? colors.textMuted
                : current.text
            }
            style={[
              styles.text,
              Typography.styles.button,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </AppText>

          {renderRightIcon() ? (
            <View style={styles.iconRight}>
              {renderRightIcon()}
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: FixxamTokens.radius.button,

    paddingHorizontal:
      FixxamTokens.spacing.lg,

    alignItems: "center",

    justifyContent: "center",
  },

  content: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  iconLeft: {
    marginRight: FixxamTokens.spacing.sm,

    alignItems: "center",

    justifyContent: "center",
  },

  iconRight: {
    marginLeft: FixxamTokens.spacing.sm,

    alignItems: "center",

    justifyContent: "center",
  },

  text: {
    textAlign: "center",
  },
});

export default memo(AppButton);