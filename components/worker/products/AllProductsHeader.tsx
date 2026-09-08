import React, {
  memo,
  useCallback,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

function AllProductsHeader() {
  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          BACK
      ====================================================== */}

      <Pressable
        onPress={
          handleBack
        }
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={6}
        style={({
          pressed,
        }) => [
          styles.backButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="heading1"
        weight="bold"
        style={
          styles.title
        }
      >
        All Products
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Manage all your products in one place.
      </AppText>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

AllProductsHeader.displayName =
  "AllProductsHeader";

export default memo(
  AllProductsHeader,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xl,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       BACK
    ======================================================== */

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginBottom:
        FixxamTokens.spacing.lg,

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
       TEXT
    ======================================================== */

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 340,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
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