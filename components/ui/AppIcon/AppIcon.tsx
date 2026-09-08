// components/ui/AppIcon/AppIcon.tsx

import React, { memo } from "react";
import type { LucideIcon } from "lucide-react-native";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

import { resolveServiceIcon } from "./iconMap";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

type IconWeight =
  | "regular"
  | "medium"
  | "strong";

type IconState =
  | "default"
  | "active"
  | "muted"
  | "success"
  | "warning"
  | "error"
  | "inverse";

export type AppIconProps = {
  name?: string | null;

  /*
   * Semantic size is preferred.
   * Number remains supported for existing screens.
   */
  size?: IconSize | number;

  /*
   * Explicit color override.
   */
  color?: string;

  /*
   * Customer = blue
   * Worker = orange
   */
  role?: FixxamRole;

  /*
   * Semantic icon state.
   */
  state?: IconState;

  /*
   * Semantic weight is preferred.
   * Number remains supported for existing screens.
   */
  strokeWidth?: IconWeight | number;
};

const ICON_SIZES: Record<IconSize, number> = {
  xs: FixxamTokens.size.iconXs,
  sm: FixxamTokens.size.iconSm,
  md: FixxamTokens.size.iconMd,
  lg: FixxamTokens.size.iconLg,
  xl: FixxamTokens.size.iconXl,
};

const ICON_STROKES: Record<IconWeight, number> = {
  regular: 2,
  medium: 2.25,
  strong: 2.5,
};

function AppIcon({
  name,
  size = "md",
  color,
  role = "customer",
  state = "default",
  strokeWidth = "regular",
}: AppIconProps) {
  const Icon: LucideIcon = resolveServiceIcon(name);

  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const resolvedSize =
    typeof size === "number"
      ? size
      : ICON_SIZES[size];

  const resolvedStrokeWidth =
    typeof strokeWidth === "number"
      ? strokeWidth
      : ICON_STROKES[strokeWidth];

  const stateColors: Record<IconState, string> = {
    default: roleColors.icon,
    active: roleColors.primary,
    muted: roleColors.textMuted,
    success: roleColors.success,
    warning: roleColors.warning,
    error: roleColors.error,
    inverse: roleColors.white,
  };

  const resolvedColor =
    color ?? stateColors[state];

  return (
    <Icon
      size={resolvedSize}
      color={resolvedColor}
      strokeWidth={resolvedStrokeWidth}
    />
  );
}

export default memo(AppIcon);