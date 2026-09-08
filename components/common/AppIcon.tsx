import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import UiAppIcon from "@/components/ui/AppIcon";

import {
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type IconState =
  | "default"
  | "active"
  | "muted"
  | "success"
  | "warning"
  | "error";

export interface AppIconProps {
  /*
   * Dynamic / legacy icon name.
   *
   * Most category/service icons stored
   * in Firebase use MaterialCommunityIcons.
   */
  icon?: string;

  role?: FixxamRole;

  state?: IconState;

  color?: string;

  backgroundColor?: string;

  size?: number;

  containerSize?: number;

  borderRadius?: number;
}

/* ============================================================
   SEMANTIC ALIASES
============================================================ */

/*
 * These aliases are only used when the
 * supplied icon is NOT a valid
 * MaterialCommunityIcons icon.
 *
 * This lets older semantic values still
 * use the official Fixxam AppIcon system.
 */
const legacyIconAliases = {
  service: "service",

  profile: "profile",

  search: "search",

  notifications: "notifications",

  jobs: "jobs",

  messages: "messages",

  location: "location",

  camera: "camera",

  settings: "settings",

  wallet: "wallet",

  check: "check",

  close: "close",

  back: "back",

  next: "next",

  down: "down",

  warning: "warning",

  info: "info",

  star: "star",

  heart: "heart",

  verified: "verified",
} as const;

/* ============================================================
   HELPERS
============================================================ */

function cleanIconName(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isMaterialCommunityIcon(
  icon: string,
): icon is keyof typeof MaterialCommunityIcons.glyphMap {
  if (!icon) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(
    MaterialCommunityIcons.glyphMap,
    icon,
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function AppIcon({
  icon = "shape-outline",
  role = "customer",
  state = "active",
  color,
  backgroundColor,
  size = FixxamTokens.size.iconMd,
  containerSize =
    FixxamTokens.size.iconBox,
  borderRadius =
    FixxamTokens.radius.md,
}: AppIconProps) {
  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const safeIcon =
    useMemo(
      () =>
        cleanIconName(icon) ||
        "shape-outline",
      [icon],
    );

  const isMciIcon =
    useMemo(
      () =>
        isMaterialCommunityIcon(
          safeIcon,
        ),
      [safeIcon],
    );

  const resolvedBackgroundColor =
    backgroundColor ??
    roleColors.primarySoft;

  const resolvedIconColor =
    color ??
    roleColors.primary;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={[
        styles.container,
        {
          width:
            containerSize,

          height:
            containerSize,

          borderRadius,

          backgroundColor:
            resolvedBackgroundColor,
        },
      ]}
    >
      {isMciIcon ? (
        /*
         * =====================================================
         * MATERIAL COMMUNITY ICON
         * =====================================================
         *
         * Category/service icons coming from
         * Firebase are rendered exactly as
         * stored.
         *
         * Example:
         *
         * hammer-wrench
         * lightning-bolt
         * car-wrench
         * laptop
         * shield-check
         * scissors-cutting
         */
        <MaterialCommunityIcons
  name={
    safeIcon as keyof typeof MaterialCommunityIcons.glyphMap
  }
  size={size}
  color={resolvedIconColor}
/>
      ) : (
        /*
         * =====================================================
         * FIXXAM SEMANTIC FALLBACK
         * =====================================================
         */
        <UiAppIcon
          name={
            legacyIconAliases[
              safeIcon as keyof typeof legacyIconAliases
            ] ?? "service"
          }
          role={role}
          state={state}
          size={size}
          color={
            resolvedIconColor
          }
        />
      )}
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      alignItems: "center",

      justifyContent:
        "center",
    },
  });

export default memo(AppIcon);