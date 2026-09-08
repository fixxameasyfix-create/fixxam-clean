import React, { memo } from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppIcon from "@/components/ui/AppIcon";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type FloatingButtonSize =
  | "md"
  | "lg";

export interface AppFloatingButtonProps {
  icon?: string;

  onPress: () => void;

  role?: FixxamRole;

  size?: FloatingButtonSize;

  disabled?: boolean;

  loading?: boolean;

  accessibilityLabel?: string;

  /*
   * Legacy/custom overrides.
   */
  color?: string;

  backgroundColor?: string;

  bottomOffset?: number;

  rightOffset?: number;

  respectSafeArea?: boolean;

  style?: StyleProp<ViewStyle>;
}

function AppFloatingButton({
  icon = "add",
  onPress,

  role = "customer",

  size = "md",

  disabled = false,
  loading = false,

  accessibilityLabel = "Action",

  color,
  backgroundColor,

  bottomOffset,
  rightOffset =
    FixxamTokens.spacing.xl,

  respectSafeArea = true,

  style,
}: AppFloatingButtonProps) {
  const insets = useSafeAreaInsets();

  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const isDisabled =
    disabled || loading;

  const buttonSize =
    size === "lg"
      ? FixxamTokens.size.fabLarge
      : FixxamTokens.size.fab;

  const resolvedBottom =
    bottomOffset ??
    FixxamTokens.spacing.xxl +
      (respectSafeArea
        ? insets.bottom
        : 0);

  const resolvedBackground =
    backgroundColor ??
    colors.primary;

  const resolvedIconColor =
    color ?? colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel
      }
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,

        {
          width: buttonSize,
          height: buttonSize,

          right: rightOffset,
          bottom: resolvedBottom,

          backgroundColor:
            isDisabled
              ? colors.primaryDisabled
              : resolvedBackground,

          opacity: isDisabled
            ? FixxamTokens.motion
                .disabledOpacity
            : pressed
              ? FixxamTokens.motion
                  .pressedOpacity
              : 1,

          transform: [
            {
              scale:
                pressed &&
                !isDisabled
                  ? FixxamTokens.motion
                      .scalePressed
                  : 1,
            },
          ],
        },

        !isDisabled
          ? FixxamTokens.shadow.floating
          : null,

        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={resolvedIconColor}
        />
      ) : (
        <AppIcon
          name={icon}
          role={role}
          size={
            size === "lg"
              ? "lg"
              : "md"
          }
          color={resolvedIconColor}
          strokeWidth="medium"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,

    zIndex: 20,
  },
});

export default memo(AppFloatingButton);