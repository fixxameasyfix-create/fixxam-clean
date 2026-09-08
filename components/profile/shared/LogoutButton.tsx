import React from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  onPress: () => void;

  loading?: boolean;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function LogoutButton({
  onPress,
  loading = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={
        loading
          ? "Logging out"
          : "Logout"
      }
      accessibilityState={{
        disabled: loading,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.button,

        pressed &&
        !loading
          ? styles.pressed
          : null,

        loading
          ? styles.disabled
          : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            Colors.textInverse
          }
        />
      ) : (
        <AppIcon
          name="logout"
          size="sm"
          state="error"
          color={
            Colors.textInverse
          }
        />
      )}

      <AppText
        variant="bodyMedium"
        weight="bold"
        style={styles.text}
      >
        {loading
          ? "Logging out..."
          : "Logout"}
      </AppText>
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       BUTTON
    ======================================================== */

    button: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.xxxl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.error,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    text: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       STATES
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

    disabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });