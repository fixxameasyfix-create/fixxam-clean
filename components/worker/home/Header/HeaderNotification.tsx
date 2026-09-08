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

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  count?: number;

  onPress?: () => void;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeCount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function HeaderNotification({
  count = 0,
  onPress,
}: Props) {
  const safeCount =
    useMemo(
      () =>
        getSafeCount(
          count,
        ),
      [count],
    );

  const badgeText =
    safeCount > 99
      ? "99+"
      : String(
          safeCount,
        );

  const accessibilityLabel =
    safeCount > 0
      ? `${safeCount} unread notifications`
      : "Notifications";

  return (
    <Pressable
      onPress={
        onPress
      }
      disabled={
        !onPress
      }
      hitSlop={6}
      accessibilityRole={
        onPress
          ? "button"
          : undefined
      }
      accessibilityLabel={
        accessibilityLabel
      }
      accessibilityHint={
        onPress
          ? "Open worker notifications"
          : undefined
      }
      style={({
        pressed,
      }) => [
        styles.container,

        pressed &&
        onPress
          ? styles.pressed
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <AppIcon
        name="notifications"
        role="worker"
        size="md"
        color={
          WorkerColors.primary
        }
      />

      {/* ======================================================
          BADGE
      ====================================================== */}

      {safeCount > 0 ? (
        <View
          style={
            styles.badge
          }
        >
          <AppText
            weight="bold"
            numberOfLines={1}
            style={
              styles.badgeText
            }
          >
            {badgeText}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ============================================================
   MEMO
============================================================ */

HeaderNotification.displayName =
  "HeaderNotification";

export default memo(
  HeaderNotification,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width:
        FixxamTokens.size.buttonHeight,

      height:
        FixxamTokens.size.buttonHeight,

      position:
        "relative",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       BADGE
    ======================================================== */

    badge: {
      position:
        "absolute",

      top: -4,

      right: -4,

      minWidth: 20,

      height: 20,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 2,

      borderColor:
        Colors.surface,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,
    },

    badgeText: {
      fontSize: 9,

      lineHeight: 11,

      color:
        Colors.textInverse,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

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
  });