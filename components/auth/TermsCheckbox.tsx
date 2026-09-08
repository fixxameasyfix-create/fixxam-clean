import React, { memo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface TermsCheckboxProps {
  checked: boolean;

  onToggle: () => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";

  disabled?: boolean;

  error?: string;

  /*
   * Opens Terms & Conditions screen/page.
   */
  onTermsPress?: () => void;
}

function TermsCheckbox({
  checked,
  onToggle,

  role = "customer",
  variant,

  disabled = false,

  error,

  onTermsPress,
}: TermsCheckboxProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const colors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  const checkboxBorderColor = error
    ? colors.error
    : checked
      ? colors.primary
      : colors.borderStrong;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="Agree to Terms and Conditions"
          accessibilityState={{
            checked,
            disabled,
          }}
          disabled={disabled}
          hitSlop={8}
          onPress={onToggle}
          style={({ pressed }) => [
            styles.checkbox,

            {
              borderColor:
                checkboxBorderColor,

              backgroundColor: checked
                ? colors.primary
                : disabled
                  ? colors.disabledBackground
                  : colors.surface,
            },

            pressed && !disabled
              ? styles.pressed
              : null,

            disabled
              ? styles.disabled
              : null,
          ]}
        >
          {checked ? (
            <AppIcon
              name="check"
              role={resolvedRole}
              size="xs"
              color={colors.white}
              strokeWidth="strong"
            />
          ) : null}
        </Pressable>

        <View style={styles.textContainer}>
          <AppText
            variant="body"
            tone={
              disabled
                ? "muted"
                : "default"
            }
            onPress={
              disabled
                ? undefined
                : onToggle
            }
          >
            I agree to the{" "}
          </AppText>

          <AppText
            variant="bodyMedium"
            role={resolvedRole}
            tone={
              disabled
                ? "muted"
                : "primary"
            }
            accessibilityRole={
              onTermsPress
                ? "link"
                : undefined
            }
            onPress={
              disabled
                ? undefined
                : onTermsPress
            }
          >
            Terms & Conditions
          </AppText>
        </View>
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <AppIcon
            name="error"
            role={resolvedRole}
            size="xs"
            state="error"
          />

          <AppText
            variant="caption"
            tone="error"
          >
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  container: {
    width: "100%",

    flexDirection: "row",
    alignItems: "flex-start",
  },

  checkbox: {
    width: 24,
    height: 24,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1.5,

    borderRadius:
      FixxamTokens.radius.sm,

    marginTop: 1,
  },

  textContainer: {
    flex: 1,

    flexDirection: "row",
    flexWrap: "wrap",

    marginLeft:
      FixxamTokens.spacing.sm,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "center",

    gap:
      FixxamTokens.spacing.xs,

    marginTop:
      FixxamTokens.spacing.xs,

    marginLeft:
      24 +
      FixxamTokens.spacing.sm,
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

export default memo(TermsCheckbox);