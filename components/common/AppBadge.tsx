import React, { memo } from "react";
import {
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

type BadgeVariant =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface AppBadgeProps {
  label: string;

  role?: FixxamRole;

  variant?: BadgeVariant;

  icon?: AppIconName;

  /*
   * Legacy/custom overrides.
   */
  color?: string;

  backgroundColor?: string;
}

function AppBadge({
  label,
  role = "customer",
  variant = "primary",
  icon,
  color,
  backgroundColor,
}: AppBadgeProps) {
  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const palette = {
    primary: {
      text: roleColors.primary,
      background: roleColors.primarySoft,
    },

    neutral: {
      text: Colors.textSecondary,
      background: Colors.iconBackground,
    },

    success: {
      text: Colors.success,
      background: Colors.successSoft,
    },

    warning: {
      text: Colors.warning,
      background: Colors.warningSoft,
    },

    error: {
      text: Colors.error,
      background: Colors.errorSoft,
    },

    info: {
      text: Colors.info,
      background: Colors.infoSoft,
    },
  } as const;

  const current = palette[variant];

  const resolvedTextColor =
    color ?? current.text;

  const resolvedBackground =
    backgroundColor ??
    current.background;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            resolvedBackground,
        },
      ]}
    >
      {icon ? (
        <AppIcon
          name={icon}
          role={role}
          size="xs"
          color={resolvedTextColor}
          strokeWidth="medium"
        />
      ) : null}

      <AppText
        variant="caption"
        color={resolvedTextColor}
        style={styles.text}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",

    minHeight: 28,

    flexDirection: "row",
    alignItems: "center",

    gap: FixxamTokens.spacing.xs,

    paddingHorizontal:
      FixxamTokens.spacing.sm,

    paddingVertical:
      FixxamTokens.spacing.xs,

    borderRadius:
      FixxamTokens.radius.badge,
  },

  text: {
    fontWeight: "600",
  },
});

export default memo(AppBadge);