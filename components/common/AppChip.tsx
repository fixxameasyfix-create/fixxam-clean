import React, { memo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppIcon from "@/components/ui/AppIcon";
import type { AppIconName } from "@/components/ui/AppIcon";
import AppText from "@/components/ui/AppText";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface AppChipProps {
  label: string;

  selected?: boolean;

  onPress?: () => void;

  role?: FixxamRole;

  disabled?: boolean;

  icon?: AppIconName;
}

function AppChip({
  label,
  selected = false,
  onPress,
  role = "customer",
  disabled = false,
  icon,
}: AppChipProps) {
  const colors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const interactive =
    typeof onPress === "function";

  return (
    <Pressable
      accessibilityRole={
        interactive ? "button" : undefined
      }
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={
        disabled || !interactive
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,

        {
          backgroundColor: selected
            ? colors.primarySoft
            : Colors.surface,

          borderColor: selected
            ? colors.primary
            : Colors.border,
        },

        pressed &&
        !disabled &&
        interactive
          ? styles.pressed
          : null,

        disabled
          ? styles.disabled
          : null,
      ]}
    >
      {icon ? (
        <View style={styles.icon}>
          <AppIcon
            name={icon}
            role={role}
            size="xs"
            state={
              selected
                ? "active"
                : "default"
            }
          />
        </View>
      ) : null}

      <AppText
        variant="bodyMedium"
        role={role}
        tone={
          selected
            ? "primary"
            : disabled
              ? "muted"
              : "secondary"
        }
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,

    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal:
      FixxamTokens.spacing.md,

    paddingVertical:
      FixxamTokens.spacing.sm,

    borderWidth: 1,

    borderRadius:
      FixxamTokens.radius.chip,
  },

  icon: {
    marginRight:
      FixxamTokens.spacing.xs,
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

export default memo(AppChip);