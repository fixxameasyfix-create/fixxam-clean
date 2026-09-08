import React, {
  memo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppIcon,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  Typography,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  value: string;

  onChangeText: (
    text: string,
  ) => void;

  onFilter?: () => void;

  onVoiceSearch?: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function HeaderSearch({
  value,
  onChangeText,
  onFilter,
  onVoiceSearch,
}: Props) {
  const [
    focused,
    setFocused,
  ] = useState(false);

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
          size="sm"
          color={
            focused
              ? WorkerColors.primary
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
          placeholder="Search jobs, customers..."
          placeholderTextColor={
            Colors.textMuted
          }
          selectionColor={
            WorkerColors.primary
          }
          cursorColor={
            WorkerColors.primary
          }
          style={
            styles.input
          }
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          maxLength={120}
          accessibilityLabel="Search jobs and customers"
        />

        {onVoiceSearch ? (
          <Pressable
            onPress={
              onVoiceSearch
            }
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Voice search"
            style={({
              pressed,
            }) => [
              styles.trailingButton,

              pressed
                ? styles.trailingPressed
                : null,
            ]}
          >
            <Ionicons
              name="mic-outline"
              size={20}
              color={
                Colors.textMuted
              }
            />
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          FILTER
      ====================================================== */}

      <Pressable
        onPress={
          onFilter
        }
        disabled={
          !onFilter
        }
        accessibilityRole={
          onFilter
            ? "button"
            : undefined
        }
        accessibilityLabel="Filter search results"
        style={({
          pressed,
        }) => [
          styles.filter,

          pressed &&
          onFilter
            ? styles.filterPressed
            : null,

          !onFilter
            ? styles.filterDisabled
            : null,
        ]}
      >
        <AppIcon
          name="filter"
          role="worker"
          size="sm"
          color={
            Colors.textInverse
          }
        />
      </Pressable>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

HeaderSearch.displayName =
  "HeaderSearch";

export default memo(
  HeaderSearch,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
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

      color:
        Colors.textPrimary,

      fontSize:
        Typography.fontSize.md,

      includeFontPadding:
        false,
    },

    trailingButton: {
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

    trailingPressed: {
      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       FILTER
    ======================================================== */

    filter: {
      width:
        FixxamTokens.size.inputHeight,

      height:
        FixxamTokens.size.inputHeight,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        WorkerColors.primary,
    },

    filterPressed: {
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

    filterDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },
  });