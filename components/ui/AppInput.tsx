import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
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

export interface AppInputProps
  extends Omit<
    TextInputProps,
    "style" | "role"
  > {
  label?: string;

  error?: string;

  helperText?: string;

  required?: boolean;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  /*
   * Preferred left icon API.
   */
  leftIconName?: AppIconName;

  /*
   * Legacy icon-name support.
   */
  leftIcon?: string;

  /*
   * Optional content rendered between
   * the left icon and the text input.
   *
   * Example:
   * +234
   */
  leftContent?: React.ReactNode;

  /*
   * Right-side action icon.
   */
  rightIconName?: AppIconName;

  onRightIconPress?: () => void;

  rightIconAccessibilityLabel?: string;

  containerStyle?: StyleProp<ViewStyle>;

  inputContainerStyle?: StyleProp<ViewStyle>;

  style?: StyleProp<TextStyle>;
}

function AppInput({
  label,
  error,
  helperText,

  required = false,

  role = "customer",
  variant,

  leftIconName,
  leftIcon,
  leftContent,

  rightIconName,
  onRightIconPress,
  rightIconAccessibilityLabel,

  containerStyle,
  inputContainerStyle,
  style,

  editable = true,

  onFocus,
  onBlur,

  accessibilityLabel,

  ...props
}: AppInputProps) {
  const [focused, setFocused] =
    useState(false);

  const resolvedRole: FixxamRole =
    variant ?? role;

  const colors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  const disabled =
    editable === false;

  const resolvedLeftIcon =
    leftIconName ?? leftIcon;

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.border;

  const backgroundColor =
    disabled
      ? colors.disabledBackground
      : colors.surface;

  const handleFocus: NonNullable<
    TextInputProps["onFocus"]
  > = useCallback(
    (event) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur: NonNullable<
    TextInputProps["onBlur"]
  > = useCallback(
    (event) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const iconState = error
    ? "error"
    : disabled
      ? "muted"
      : focused
        ? "active"
        : "default";

  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >
      {label ? (
        <View style={styles.labelRow}>
          <AppText
            style={[
              Typography.styles.label,
              {
                color: disabled
                  ? colors.textMuted
                  : colors.textPrimary,
              },
            ]}
          >
            {label}
          </AppText>

          {required ? (
            <AppText
              style={[
                Typography.styles.label,
                {
                  color: colors.error,
                },
              ]}
            >
              {" *"}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
          },
          inputContainerStyle,
        ]}
      >
        {resolvedLeftIcon ? (
          <View style={styles.leftIcon}>
            <AppIcon
              name={resolvedLeftIcon}
              role={resolvedRole}
              size="sm"
              state={iconState}
            />
          </View>
        ) : null}

        {leftContent ? (
          <View
            style={styles.leftContent}
            pointerEvents="none"
          >
            {leftContent}
          </View>
        ) : null}

        <TextInput
          {...props}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={
            accessibilityLabel ?? label
          }
          accessibilityState={{
            disabled,
          }}
          placeholderTextColor={
            colors.textMuted
          }
          selectionColor={
            colors.primary
          }
          style={[
            styles.input,
            Typography.styles.bodyLarge,
            {
              color: disabled
                ? colors.textMuted
                : colors.textPrimary,
            },
            style,
          ]}
        />

        {rightIconName ? (
          <Pressable
            accessibilityRole={
              onRightIconPress
                ? "button"
                : undefined
            }
            accessibilityLabel={
              rightIconAccessibilityLabel
            }
            disabled={
              disabled ||
              !onRightIconPress
            }
            hitSlop={8}
            onPress={
              onRightIconPress
            }
            style={({ pressed }) => [
              styles.rightIcon,

              pressed &&
              onRightIconPress &&
              !disabled
                ? styles.iconPressed
                : null,
            ]}
          >
            <AppIcon
              name={rightIconName}
              role={resolvedRole}
              size="sm"
              state={iconState}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View
          style={styles.supportingRow}
        >
          <AppIcon
            name="error"
            role={resolvedRole}
            size="xs"
            state="error"
          />

          <AppText
            style={[
              Typography.styles.caption,
              {
                color: colors.error,
              },
            ]}
          >
            {error}
          </AppText>
        </View>
      ) : helperText ? (
        <AppText
          style={[
            styles.helperText,
            Typography.styles.caption,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom:
      FixxamTokens.spacing.sm,
  },

  inputContainer: {
    minHeight:
      FixxamTokens.size.inputHeight,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.input,

    paddingHorizontal:
      FixxamTokens.spacing.md,
  },

  input: {
    flex: 1,

    minHeight:
      FixxamTokens.size.inputHeight,

    paddingVertical: 0,
  },

  leftIcon: {
    flexShrink: 0,

    marginRight:
      FixxamTokens.spacing.sm,

    alignItems: "center",
    justifyContent: "center",
  },

  leftContent: {
    flexShrink: 0,

    marginRight:
      FixxamTokens.spacing.sm,

    paddingRight:
      FixxamTokens.spacing.sm,

    borderRightWidth:
      StyleSheet.hairlineWidth,

    borderRightColor:
      "#D1D5DB",

    alignItems: "center",
    justifyContent: "center",
  },

  rightIcon: {
    flexShrink: 0,

    width:
      FixxamTokens.size
        .minimumTouchTarget,

    height:
      FixxamTokens.size
        .minimumTouchTarget,

    marginLeft:
      FixxamTokens.spacing.xs,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius
        .iconButton,
  },

  iconPressed: {
    opacity:
      FixxamTokens.motion
        .pressedOpacity,
  },

  supportingRow: {
    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.xs,

    marginTop:
      FixxamTokens.spacing.xs,
  },

  helperText: {
    marginTop:
      FixxamTokens.spacing.xs,
  },
});

export default memo(AppInput);