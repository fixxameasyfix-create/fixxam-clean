import React, {
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

export default function FloatingAddButton() {
  const insets =
    useSafeAreaInsets();

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handlePress =
    useCallback(() => {
      router.push(
        "/(worker)/products/add",
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Pressable
      onPress={
        handlePress
      }
      accessibilityRole="button"
      accessibilityLabel="Add product"
      accessibilityHint="Opens the add product screen"
      hitSlop={8}
      style={({
        pressed,
      }) => [
        styles.button,

        {
          bottom:
            Math.max(
              insets.bottom,
              FixxamTokens.spacing.lg,
            ) +
            FixxamTokens.spacing.sm,
        },

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <AppIcon
        name="add"
        role="worker"
        size="lg"
        color={
          Colors.textInverse
        }
      />
    </Pressable>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    button: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.xl,

      width:
        FixxamTokens.size.fabLarge,

      height:
        FixxamTokens.size.fabLarge,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,

      ...FixxamTokens.shadow.card,

      elevation: 8,

      zIndex: 20,
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