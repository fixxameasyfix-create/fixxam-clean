import React, {
  useCallback,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

export default function ProductSearch() {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    focused,
    setFocused,
  ] =
    useState(false);

  /* ==========================================================
     CLEAR SEARCH
  ========================================================== */

  const handleClear =
    useCallback(() => {
      setSearch("");
    }, []);

  /* ==========================================================
     ADD PRODUCT
  ========================================================== */

  const handleAddProduct =
    useCallback(() => {
      router.push(
        "/(worker)/products/add",
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <View
        style={[
          styles.searchBox,

          focused
            ? styles.searchBoxFocused
            : null,
        ]}
      >
        <AppIcon
          name="search"
          role="worker"
          size="sm"
          color={
            focused
              ? WorkerColors.primary
              : Colors.textMuted
          }
        />

        <TextInput
          value={
            search
          }
          onChangeText={
            setSearch
          }
          onFocus={() => {
            setFocused(
              true,
            );
          }}
          onBlur={() => {
            setFocused(
              false,
            );
          }}
          placeholder="Search products..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            WorkerColors.primary
          }
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={
            false
          }
          clearButtonMode="never"
          accessibilityLabel="Search products"
          style={
            styles.input
          }
        />

        {search.length >
        0 ? (
          <Pressable
            onPress={
              handleClear
            }
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Clear product search"
            style={({
              pressed,
            }) => [
              styles.clearButton,

              pressed
                ? styles.iconPressed
                : null,
            ]}
          >
            <AppIcon
              name="close"
              size="xs"
              color={
                Colors.textMuted
              }
            />
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          ADD PRODUCT
      ====================================================== */}

      <Pressable
        onPress={
          handleAddProduct
        }
        accessibilityRole="button"
        accessibilityLabel="Add product"
        accessibilityHint="Opens the add product screen"
        style={({
          pressed,
        }) => [
          styles.button,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="add"
          role="worker"
          size="sm"
          color={
            Colors.textInverse
          }
        />

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
          style={
            styles.buttonText
          }
        >
          Add Product
        </AppText>
      </Pressable>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchBox: {
      flex: 1,

      minWidth: 0,

      height:
        FixxamTokens.size.inputHeight,

      paddingLeft:
        FixxamTokens.spacing.md,

      paddingRight:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    searchBoxFocused: {
      borderColor:
        WorkerColors.primary,
    },

    input: {
      flex: 1,

      minWidth: 0,

      height: "100%",

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      paddingHorizontal: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    clearButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,
    },

    /* ========================================================
       ADD BUTTON
    ======================================================== */

    button: {
      height:
        FixxamTokens.size.inputHeight,

      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        WorkerColors.primary,

      ...FixxamTokens.shadow.card,
    },

    buttonText: {
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

    iconPressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      backgroundColor:
        Colors.disabledBackground,
    },
  });