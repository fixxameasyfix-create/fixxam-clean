import React, {
  memo,
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppIcon,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  value: string;

  onChangeText: (
    text: string,
  ) => void;

  onBack: () => void;

  loading?: boolean;

  onSearch?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function SearchInput({
  value,
  onChangeText,
  onBack,
  loading = false,
  onSearch,
}: Props) {
  const [
    focused,
    setFocused,
  ] =
    useState(false);

  /* ==========================================================
     CLEAR
  ========================================================== */

  const handleClear =
    useCallback(() => {
      if (loading) {
        return;
      }

      onChangeText("");
    }, [
      loading,
      onChangeText,
    ]);

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack =
    useCallback(() => {
      if (loading) {
        return;
      }

      onBack();
    }, [
      loading,
      onBack,
    ]);

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
          BACK
      ====================================================== */}

      <Pressable
        onPress={
          handleBack
        }
        disabled={
          loading
        }
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityState={{
          disabled:
            loading,
        }}
        style={({
          pressed,
        }) => [
          styles.backButton,

          loading
            ? styles.disabled
            : null,

          pressed &&
          !loading
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="back"
          size="md"
          color={
            Colors.textPrimary
          }
        />
      </Pressable>

      {/* ======================================================
          SEARCH FIELD
      ====================================================== */}

      <View
        style={[
          styles.searchBox,

          focused
            ? styles.searchBoxFocused
            : null,

          loading
            ? styles.searchBoxLoading
            : null,
        ]}
      >
        <AppIcon
          name="search"
          role="customer"
          size="sm"
          color={
            focused
              ? CustomerColors.primary
              : Colors.textMuted
          }
        />

        <TextInput
          value={
            value
          }
          onChangeText={
            onChangeText
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
          onSubmitEditing={() => {
            onSearch?.();
          }}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          editable={
            !loading
          }
          placeholder="Search workers or services..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            CustomerColors.primary
          }
          returnKeyType="search"
          clearButtonMode="never"
          accessibilityLabel="Search workers or services"
          accessibilityState={{
            disabled:
              loading,
          }}
          style={
            styles.input
          }
        />

        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <View
            style={
              styles.trailingControl
            }
          >
            <ActivityIndicator
              size="small"
              color={
                CustomerColors.primary
              }
            />
          </View>
        ) : value.length > 0 ? (
          /* ==================================================
             CLEAR
          ================================================== */

          <Pressable
            onPress={
              handleClear
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({
              pressed,
            }) => [
              styles.trailingControl,

              pressed
                ? styles.clearPressed
                : null,
            ]}
          >
            <View
              style={
                styles.clearIconBox
              }
            >
              <AppIcon
                name="close"
                size="xs"
                color={
                  Colors.textSecondary
                }
              />
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedSearchInput =
  memo(
    SearchInput,
  );

MemoizedSearchInput.displayName =
  "SearchInput";

export default MemoizedSearchInput;

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

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

      marginRight:
        FixxamTokens.spacing.sm,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       SEARCH BOX
    ======================================================== */

    searchBox: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      paddingHorizontal:
        FixxamTokens.spacing.md,

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
    },

    searchBoxFocused: {
      borderColor:
        CustomerColors.primary,
    },

    searchBoxLoading: {
      opacity: 0.9,
    },

    /* ========================================================
       INPUT
    ======================================================== */

    input: {
      flex: 1,

      minHeight:
        FixxamTokens.size.inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       TRAILING CONTROL
    ======================================================== */

    trailingControl: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        -FixxamTokens.spacing.sm,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    clearIconBox: {
      width: 26,

      height: 26,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
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

    clearPressed: {
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