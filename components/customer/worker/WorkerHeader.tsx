import React, {
  memo,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  Typography,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  value: string;

  onChangeText: (
    text: string,
  ) => void;

  total: number;

  onOpenFilter: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkersHeader({
  value,
  onChangeText,
  total,
  onOpenFilter,
}: Props) {
  const [
    searchFocused,
    setSearchFocused,
  ] =
    useState(false);

  const safeTotal =
    useMemo(
      () =>
        Number.isFinite(
          total,
        )
          ? Math.max(
              0,
              Math.floor(
                total,
              ),
            )
          : 0,
      [
        total,
      ],
    );

  const workerLabel =
    safeTotal === 1
      ? "Professional Worker Found"
      : "Professional Workers Found";

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="bodyLarge"
        weight="bold"
        numberOfLines={1}
      >
        Available Workers
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        numberOfLines={1}
        style={
          styles.subtitle
        }
      >
        {safeTotal} {workerLabel}
      </AppText>

      {/* ======================================================
          SEARCH + FILTER
      ====================================================== */}

      <View
        style={
          styles.searchRow
        }
      >
        <View
          style={[
            styles.searchContainer,

            searchFocused
              ? styles.searchContainerFocused
              : null,
          ]}
        >
          <AppIcon
            name="search"
            role="customer"
            size="sm"
            state={
              searchFocused
                ? "active"
                : "muted"
            }
          />

          <TextInput
            value={
              value
            }
            onChangeText={
              onChangeText
            }
            onFocus={() =>
              setSearchFocused(
                true,
              )
            }
            onBlur={() =>
              setSearchFocused(
                false,
              )
            }
            placeholder="Search workers..."
            placeholderTextColor={
              Colors.textMuted
            }
            selectionColor={
              CustomerColors.primary
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel="Search workers"
            style={
              styles.searchInput
            }
          />
        </View>

        {/* ====================================================
            FILTER
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open worker filters"
          hitSlop={4}
          onPress={
            onOpenFilter
          }
          style={({
            pressed,
          }) => [
            styles.filterButton,

            pressed
              ? styles.filterButtonPressed
              : null,
          ]}
        >
          <AppIcon
            name="filter"
            role="customer"
            size="sm"
            color={
              Colors.textInverse
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xs,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       SEARCH
    ======================================================== */

    searchRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    searchContainer: {
      flex: 1,

      minHeight:
        FixxamTokens.size
          .inputHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.search,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    searchContainerFocused: {
      borderColor:
        CustomerColors.primary,
    },

    searchInput: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .inputHeight,

      marginLeft:
        FixxamTokens.spacing.sm,

      paddingHorizontal: 0,

      paddingVertical: 0,

      fontSize:
        Typography.fontSize.md,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       FILTER
    ======================================================== */

    filterButton: {
      width:
        FixxamTokens.size
          .inputHeight,

      height:
        FixxamTokens.size
          .inputHeight,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primary,

      ...FixxamTokens.shadow.card,
    },

    filterButtonPressed: {
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

export default memo(
  WorkersHeader,
);