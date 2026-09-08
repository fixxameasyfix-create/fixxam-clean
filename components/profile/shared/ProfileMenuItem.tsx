import React, {
  memo,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
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
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  title: string;

  /*
   * Keep string compatibility because
   * existing callers still send legacy
   * Ionicons names.
   */
  icon: string;

  onPress?: () => void;

  danger?: boolean;

  role?: FixxamRole;

  style?: StyleProp<ViewStyle>;
};

/* ============================================================
   LEGACY ICON ALIASES
============================================================ */

const ICON_ALIASES: Record<
  string,
  AppIconName
> = {
  /* ==========================================================
     PROFILE
  ========================================================== */

  person: "profile",
  "person-outline": "profile",

  "person-circle": "profile",
  "person-circle-outline":
    "profile",

  "person-add": "profile",
  "person-add-outline":
    "profile",

  people: "users",
  "people-outline": "users",

  /* ==========================================================
     ORDERS / DOCUMENTS
  ========================================================== */

  receipt: "file",
  "receipt-outline": "file",

  document: "file",
  "document-outline": "file",

  "document-text": "file",
  "document-text-outline":
    "file",

  /* ==========================================================
     JOBS / SERVICES
  ========================================================== */

  briefcase: "jobs",
  "briefcase-outline": "jobs",

  construct: "service",
  "construct-outline":
    "service",

  build: "service",
  "build-outline": "service",

  hammer: "service",
  "hammer-outline": "service",

  /* ==========================================================
     PRODUCTS / STORE
  ========================================================== */

  storefront: "package",
  "storefront-outline":
    "package",

  cube: "package",
  "cube-outline": "package",

  bag: "package",
  "bag-outline": "package",

  package: "package",
  "package-outline": "package",

  /* ==========================================================
     ONLINE / OFFLINE
  ========================================================== */

  radio: "wifi-off",
  "radio-outline":
    "wifi-off",

  "radio-button-on":
    "wifi-off",

  "radio-button-on-outline":
    "wifi-off",

  wifi: "wifi-off",
  "wifi-outline":
    "wifi-off",

  "wifi-off": "wifi-off",
  "wifi-off-outline":
    "wifi-off",

  /* ==========================================================
     SAVED
  ========================================================== */

  heart: "heart",
  "heart-outline": "heart",

  bookmark: "heart",
  "bookmark-outline": "heart",

  /* ==========================================================
     LOCATION
  ========================================================== */

  location: "location",
  "location-outline":
    "location",

  navigate: "navigation",
  "navigate-outline":
    "navigation",

  /* ==========================================================
     PAYMENTS
  ========================================================== */

  card: "payment",
  "card-outline": "payment",

  cash: "payment",
  "cash-outline": "payment",

  wallet: "wallet",
  "wallet-outline": "wallet",

  /* ==========================================================
     NOTIFICATIONS
  ========================================================== */

  notifications:
    "notifications",

  "notifications-outline":
    "notifications",

  /* ==========================================================
     REVIEWS
  ========================================================== */

  star: "star",
  "star-outline": "star",

  /* ==========================================================
     SUPPORT
  ========================================================== */

  help: "help",
  "help-circle": "help",

  "help-circle-outline":
    "help",

  information: "info",

  "information-circle":
    "info",

  "information-circle-outline":
    "info",

  /* ==========================================================
     SETTINGS
  ========================================================== */

  settings: "settings",

  "settings-outline":
    "settings",

  /* ==========================================================
     PROMOTIONS
  ========================================================== */

  pricetag: "info",
  "pricetag-outline": "info",

  /* ==========================================================
     ACTIVITY
  ========================================================== */

  pulse: "info",
  "pulse-outline": "info",

  analytics: "info",
  "analytics-outline": "info",

  "bar-chart": "info",
  "bar-chart-outline": "info",

  /* ==========================================================
     CONTACT
  ========================================================== */

  call: "phone",
  "call-outline": "phone",

  phone: "phone",
  "phone-outline": "phone",

  mail: "mail",
  "mail-outline": "mail",

  /* ==========================================================
     SECURITY
  ========================================================== */

  lock: "lock",
  "lock-outline": "lock",

  "lock-closed": "lock",
  "lock-closed-outline":
    "lock",

  shield: "shield",
  "shield-outline": "shield",

  /* ==========================================================
     MEDIA
  ========================================================== */

  camera: "camera",
  "camera-outline": "camera",

  image: "image",
  "image-outline": "image",

  /* ==========================================================
     SWITCH / REFRESH
  ========================================================== */

  refresh: "refresh",
  "refresh-outline": "refresh",

  "swap-horizontal":
    "refresh",

  "swap-horizontal-outline":
    "refresh",

  /* ==========================================================
     LOGOUT
  ========================================================== */

  "log-out": "logout",
  "log-out-outline": "logout",

  logout: "logout",

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  "chevron-forward": "next",

  "chevron-forward-outline":
    "next",

  "arrow-forward": "next",

  "arrow-forward-outline":
    "next",

  "chevron-back": "back",

  "arrow-back": "back",

  "chevron-down": "down",
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

function ProfileMenuItem({
  title,
  icon,
  onPress,
  danger = false,
  role = "customer",
  style,
}: Props) {
  /* ==========================================================
     ICON
  ========================================================== */

  const resolvedIcon =
    useMemo(
      () =>
        resolveIcon(icon),
      [icon],
    );

  /* ==========================================================
     STATE
  ========================================================== */

  const isDisabled =
    typeof onPress !==
    "function";

  const roleColors =
    role === "worker"
      ? WorkerColors
      : CustomerColors;

  const safeTitle =
    typeof title === "string"
      ? title.trim() ||
        "Menu item"
      : "Menu item";

  /* ==========================================================
     COLORS
  ========================================================== */

  const iconColor =
    danger
      ? Colors.error
      : isDisabled
        ? Colors.textMuted
        : roleColors.primary;

  const iconBackground =
    danger
      ? Colors.errorSoft
      : isDisabled
        ? Colors.disabledBackground
        : roleColors.primarySoft;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={
        safeTitle
      }
      accessibilityState={{
        disabled:
          isDisabled,
      }}
      style={({
        pressed,
      }) => [
        styles.container,

        isDisabled
          ? styles.disabled
          : null,

        pressed &&
        !isDisabled
          ? styles.pressed
          : null,

        style,
      ]}
    >
      {/* ====================================================
          ICON
      ==================================================== */}

      <View
        style={[
          styles.iconBox,

          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <AppIcon
          name={
            resolvedIcon
          }
          role={role}
          size="sm"
          color={
            iconColor
          }
        />
      </View>

      {/* ====================================================
          TITLE
      ==================================================== */}

      <AppText
        variant="body"
        weight="semibold"
        numberOfLines={1}
        style={[
          styles.title,

          danger
            ? styles.dangerText
            : null,

          isDisabled
            ? styles.disabledText
            : null,
        ]}
      >
        {safeTitle}
      </AppText>

      {/* ====================================================
          RIGHT STATUS
      ==================================================== */}

      {isDisabled ? (
        <AppIcon
          name="lock"
          size="xs"
          state="muted"
          color={
            Colors.textMuted
          }
        />
      ) : (
        <AppIcon
          name="next"
          role={role}
          size="xs"
          state="muted"
          color={
            Colors.textMuted
          }
        />
      )}
    </Pressable>
  );
}

export default memo(
  ProfileMenuItem,
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
      minHeight: 58,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconBox: {
      width:
        FixxamTokens.size
          .iconBox,

      height:
        FixxamTokens.size
          .iconBox,

      flexShrink: 0,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    title: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    dangerText: {
      color:
        Colors.error,
    },

    disabledText: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });