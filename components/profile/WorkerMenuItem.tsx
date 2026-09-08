import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  /*
   * Keep string compatibility because
   * existing callers may still pass
   * legacy Ionicons names.
   */
  icon: string;

  title: string;

  iconColor?: string;

  badge?: string | number;

  value?: string;

  onPress: () => void;
};

/* ============================================================
   LEGACY ICON ALIASES
============================================================ */

const ICON_ALIASES: Record<
  string,
  AppIconName
> = {
  /* PROFILE */
  person: "profile",
  "person-outline": "profile",
  "person-circle-outline": "profile",
  "people-outline": "users",

  /* JOBS / WORK */
  briefcase: "jobs",
  "briefcase-outline": "jobs",
  "construct-outline": "service",
  construct: "service",
  "hammer-outline": "service",
  "build-outline": "service",

  /* DOCUMENTS / ORDERS */
  receipt: "file",
  "receipt-outline": "file",
  document: "file",
  "document-outline": "file",
  "document-text-outline": "file",

  /* SAVED */
  bookmark: "heart",
  "bookmark-outline": "heart",
  heart: "heart",
  "heart-outline": "heart",

  /* LOCATION */
  location: "location",
  "location-outline": "location",
  navigate: "navigation",
  "navigate-outline": "navigation",

  /* PAYMENTS */
  card: "payment",
  "card-outline": "payment",
  cash: "payment",
  "cash-outline": "payment",
  wallet: "wallet",
  "wallet-outline": "wallet",

  /* NOTIFICATIONS */
  notifications: "notifications",
  "notifications-outline":
    "notifications",

  /* REVIEWS */
  star: "star",
  "star-outline": "star",

  /* MESSAGES */
  chatbubble: "messages",
  "chatbubble-outline": "messages",
  "chatbubbles-outline": "messages",

  /* CALENDAR / TIME */
  calendar: "calendar",
  "calendar-outline": "calendar",
  time: "clock",
  "time-outline": "clock",
  timer: "clock",
  "timer-outline": "clock",

  /* CONTACT */
  call: "phone",
  "call-outline": "phone",
  mail: "mail",
  "mail-outline": "mail",

  /* SECURITY */
  lock: "lock",
  "lock-closed-outline": "lock",
  shield: "shield",
  "shield-outline": "shield",
  "shield-checkmark-outline":
    "verified",

  /* SUPPORT */
  help: "help",
  "help-circle": "help",
  "help-circle-outline": "help",
  information: "info",
  "information-circle-outline": "info",

  /* SETTINGS */
  settings: "settings",
  "settings-outline": "settings",

  /* ACTIVITY */
  pulse: "info",
  "pulse-outline": "info",
  analytics: "info",
  "analytics-outline": "info",
  "bar-chart-outline": "info",

  /* MEDIA */
  camera: "camera",
  "camera-outline": "camera",
  image: "image",
  "image-outline": "image",

  /* NAVIGATION */
  "chevron-forward": "next",
  "chevron-forward-outline": "next",
  "arrow-forward": "next",
  "arrow-forward-outline": "next",
  "arrow-back": "back",
  "chevron-back": "back",
  "chevron-down": "down",

  /* SWITCH */
  "swap-horizontal": "refresh",
  "swap-horizontal-outline": "refresh",
  refresh: "refresh",
  "refresh-outline": "refresh",

  /* LOGOUT */
  "log-out": "logout",
  "log-out-outline": "logout",

  /* STATUS */
  checkmark: "check",
  "checkmark-circle-outline": "success",
  "alert-circle-outline": "warning",
  "close-circle-outline": "error",
};

/* ============================================================
   HELPERS
============================================================ */

function resolveIcon(
  icon: string,
): AppIconName {
  const normalized =
    typeof icon === "string"
      ? icon
          .trim()
          .toLowerCase()
      : "";

  if (!normalized) {
    return "service";
  }

  return (
    ICON_ALIASES[
      normalized
    ] ?? "service"
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMenuItem({
  icon,
  title,
  iconColor,
  badge,
  value,
  onPress,
}: Props) {
  const resolvedIcon =
    useMemo(
      () =>
        resolveIcon(icon),
      [icon],
    );

  const safeTitle =
    title?.trim() ||
    "Menu item";

  const safeValue =
    typeof value === "string"
      ? value.trim()
      : "";

  const hasBadge =
    badge !== undefined &&
    badge !== null &&
    String(badge).trim()
      .length > 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        safeTitle
      }
      style={({
        pressed,
      }) => [
        styles.container,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      {/* ==================================================
          LEFT
      ================================================== */}

      <View
        style={styles.left}
      >
        <View
          style={
            styles.iconBox
          }
        >
          <AppIcon
            name={
              resolvedIcon
            }
            role="worker"
            size="sm"
            color={
              iconColor ??
              WorkerColors.primary
            }
          />
        </View>

        <AppText
          variant="body"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          {safeTitle}
        </AppText>
      </View>

      {/* ==================================================
          RIGHT
      ================================================== */}

      <View
        style={styles.right}
      >
        {safeValue ? (
          <AppText
            variant="caption"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.value
            }
          >
            {safeValue}
          </AppText>
        ) : null}

        {hasBadge ? (
          <View
            style={
              styles.badge
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={
                styles.badgeText
              }
            >
              {badge}
            </AppText>
          </View>
        ) : null}

        <AppIcon
          name="next"
          size="xs"
          state="muted"
          color={
            Colors.textMuted
          }
        />
      </View>
    </Pressable>
  );
}

export default memo(
  WorkerMenuItem,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       ROW
    ======================================================== */

    container: {
      minHeight:
        FixxamTokens.size
          .inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    pressed: {
      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    /* ========================================================
       LEFT
    ======================================================== */

    left: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",
    },

    iconBox: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      marginRight:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    title: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       RIGHT
    ======================================================== */

    right: {
      flexShrink: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",
    },

    value: {
      maxWidth: 96,

      marginRight:
        FixxamTokens.spacing.sm,

      color:
        Colors.success,
    },

    /* ========================================================
       BADGE
    ======================================================== */

    badge: {
      minWidth: 20,

      minHeight: 20,

      marginRight:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,
    },

    badgeText: {
      color:
        Colors.textInverse,

      lineHeight: 14,
    },
  });