import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  enabled: boolean;
  loading?: boolean;
  expired?: boolean;
  onPress: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

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

  const title = expired
    ? "CALL UNAVAILABLE"
    : enabled
      ? "CALL WORKER"
      : "CALL WILL OPEN AFTER MESSAGES";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{
        disabled,
      }}
      accessibilityLabel={
        expired
          ? "Call unavailable because the order has expired"
          : enabled
            ? "Call worker"
            : "Call worker will be available after messages end"
      }
      style={({ pressed }) => [
        styles.button,

        enabled &&
          !expired &&
          styles.enabledButton,

        !enabled &&
          styles.lockedButton,

        expired &&
          styles.expiredButton,

        pressed &&
          !disabled &&
          styles.pressed,

        disabled &&
          !enabled &&
          styles.disabledOpacity,
      ]}
    >
      <View
        style={[
          styles.iconContainer,

          enabled &&
            !expired &&
            styles.enabledIcon,

          expired &&
            styles.expiredIcon,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              enabled &&
              !expired
                ? "#FFFFFF"
                : "#94A3B8"
            }
          />
        ) : (
          <Ionicons
            name={
              expired
                ? "close-circle-outline"
                : enabled
                  ? "call-outline"
                  : "lock-closed-outline"
            }
            size={19}
            color={
              expired
                ? "#DC2626"
                : enabled
                  ? "#FFFFFF"
                  : "#64748B"
            }
          />
        )}
      </View>

      <View
        style={
          styles.content
        }
      >
        <AppText
          weight="bold"
          style={[
            styles.title,

            enabled &&
              !expired &&
              styles.enabledTitle,

            expired &&
              styles.expiredTitle,
          ]}
          numberOfLines={1}
        >
          {loading
            ? "STARTING CALL..."
            : title}
        </AppText>

        {!enabled &&
        !expired &&
        !loading ? (
          <AppText
            style={
              styles.subtitle
            }
          >
            Available when message time ends
          </AppText>
        ) : null}

        {expired &&
        !loading ? (
          <AppText
            style={
              styles.expiredSubtitle
            }
          >
            This order has expired
          </AppText>
        ) : null}
      </View>

      {enabled &&
      !expired &&
      !loading ? (
        <Ionicons
          name="arrow-forward"
          size={18}
          color="#FFFFFF"
        />
      ) : null}
    </Pressable>
  );
}

export default memo(
  OrderCallButton,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    button: {
      minHeight: 58,
      marginTop: 10,
      paddingHorizontal: 11,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
    },

    enabledButton: {
      backgroundColor:
        "#16A34A",
      borderColor:
        "#16A34A",
    },

    lockedButton: {
      backgroundColor:
        "#F8FAFC",
      borderColor:
        "#E2E8F0",
    },

    expiredButton: {
      backgroundColor:
        "#FEF2F2",
      borderColor:
        "#FECACA",
    },

    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#E2E8F0",
      alignItems: "center",
      justifyContent:
        "center",
    },

    enabledIcon: {
      backgroundColor:
        "rgba(255,255,255,0.18)",
    },

    expiredIcon: {
      backgroundColor:
        "#FEE2E2",
    },

    content: {
      flex: 1,
      marginLeft: 9,
      marginRight: 8,
    },

    title: {
      fontSize: 10,
      letterSpacing: 0.3,
      color: "#475569",
    },

    enabledTitle: {
      color: "#FFFFFF",
    },

    expiredTitle: {
      color: "#B91C1C",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 9,
      lineHeight: 14,
      color: "#94A3B8",
    },

    expiredSubtitle: {
      marginTop: 3,
      fontSize: 9,
      lineHeight: 14,
      color: "#991B1B",
    },

    disabledOpacity: {
      opacity: 0.9,
    },

    pressed: {
      opacity: 0.85,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },
  });