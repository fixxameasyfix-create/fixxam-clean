import React, { memo } from "react";

import {
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from "react-native";

import {
  Colors,
  CustomerColors,
  Typography,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

type TypographyVariant =
  keyof typeof Typography.styles;

type TextTone =
  | "default"
  | "secondary"
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "inverse";

export interface AppTextProps
  extends Omit<TextProps, "role"> {
  children: React.ReactNode;

  /*
   * Preferred semantic typography.
   */
  variant?: TypographyVariant;

  /*
   * Legacy compatibility.
   */
  size?: keyof typeof Typography.fontSize;

  weight?: keyof typeof Typography.fontWeight;

  /*
   * Semantic text color.
   */
  tone?: TextTone;

  /*
   * Customer blue / Worker orange
   * when tone="primary".
   */
  role?: FixxamRole;

  /*
   * Explicit color override.
   */
  color?: string;

  center?: boolean;

  align?: TextStyle["textAlign"];
}

function AppText({
  children,
  variant,
  size = "md",
  weight = "regular",
  tone = "default",
  role = "customer",
  color,
  center = false,
  align,
  style,
  ...props
}: AppTextProps) {
  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const toneColors: Record<TextTone, string> = {
    default: Colors.textPrimary,
    secondary: Colors.textSecondary,
    muted: Colors.textMuted,

    primary: roleColors.primary,

    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,

    inverse: Colors.textInverse,
  };

  const resolvedColor =
    color ?? toneColors[tone];

  const resolvedAlignment =
    align ?? (center ? "center" : "left");

  return (
    <Text
      {...props}
      style={[
        styles.base,

        variant
          ? Typography.styles[variant]
          : {
              fontSize:
                Typography.fontSize[size],

              fontWeight:
                Typography.fontWeight[
                  weight
                ],
            },

        {
          color: resolvedColor,
          textAlign:
            resolvedAlignment,
        },

        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});

export default memo(AppText);