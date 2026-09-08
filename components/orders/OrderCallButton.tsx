import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
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
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  enabled: boolean;

  loading?: boolean;

  expired?: boolean;

  onPress: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function OrderCallButton({
  enabled,
  loading = false,
  expired = false,
  onPress,
}: Props) {
  const disabled =
    !enabled ||
    loading ||
    expired;

  const title =
    expired
      ? "CALL UNAVAILABLE"
      : enabled
        ? "CALL WORKER"
        : "CALL WILL OPEN AFTER MESSAGES";

  const accessibilityLabel =
    expired
      ? "Call unavailable because the order has expired"
      : enabled
        ? "Call worker"
        : "Call worker will be available after messages end";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel
      }
      accessibilityState={{
        disabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.button,

        enabled &&
        !expired
          ? styles.enabledButton
          : null,

        !enabled &&
        !expired
          ? styles.lockedButton
          : null,

        expired
          ? styles.expiredButton
          : null,

        pressed &&
        !disabled
          ? styles.pressed
          : null,

        disabled &&
        !enabled
          ? styles.disabledOpacity
          : null,
      ]}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.iconContainer,

          enabled &&
          !expired
            ? styles.enabledIcon
            : null,

          expired
            ? styles.expiredIcon
            : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              enabled &&
              !expired
                ? Colors.textInverse
                : Colors.textMuted
            }
          />
        ) : (
          <AppIcon
            name={
              expired
                ? "error"
                : enabled
                  ? "phone"
                  : "lock"
            }
            size="sm"
            color={
              expired
                ? Colors.error
                : enabled
                  ? Colors.textInverse
                  : Colors.textSecondary
            }
          />
        )}
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={[
            styles.title,

            enabled &&
            !expired
              ? styles.enabledTitle
              : null,

            expired
              ? styles.expiredTitle
              : null,
          ]}
        >
          {loading
            ? "STARTING CALL..."
            : title}
        </AppText>

        {!enabled &&
        !expired &&
        !loading ? (
          <AppText
            variant="caption"
            tone="muted"
            style={styles.subtitle}
          >
            Available when message time ends
          </AppText>
        ) : null}

        {expired &&
        !loading ? (
          <AppText
            variant="caption"
            style={
              styles.expiredSubtitle
            }
          >
            This order has expired
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          NEXT
      ====================================================== */}

      {enabled &&
      !expired &&
      !loading ? (
        <AppIcon
          name="next"
          size="xs"
          color={
            Colors.textInverse
          }
        />
      ) : null}
    </Pressable>
  );
}

export default memo(
  OrderCallButton,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       BUTTON
    ======================================================== */

    button: {
      minHeight: 58,

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderRadius:
        FixxamTokens.radius.lg,
    },

    /* ========================================================
       ENABLED
    ======================================================== */

    enabledButton: {
      backgroundColor:
        Colors.success,

      borderColor:
        Colors.success,
    },

    enabledIcon: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    enabledTitle: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       LOCKED
    ======================================================== */

    lockedButton: {
      backgroundColor:
        Colors.background,

      borderColor:
        Colors.border,
    },

    /* ========================================================
       EXPIRED
    ======================================================== */

    expiredButton: {
      backgroundColor:
        Colors.errorSoft,

      borderColor:
        Colors.error,
    },

    expiredIcon: {
      backgroundColor:
        Colors.errorSoft,
    },

    expiredTitle: {
      color:
        Colors.error,
    },

    expiredSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 14,

      color:
        Colors.error,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width: 40,

      height: 40,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      letterSpacing: 0.3,

      color:
        Colors.textSecondary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 14,
    },

    /* ========================================================
       STATES
    ======================================================== */

    disabledOpacity: {
      opacity: 0.9,
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
  });