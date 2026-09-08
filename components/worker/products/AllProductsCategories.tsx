import React, {
  memo,
  useCallback,
} from "react";

import {
  FlatList,
  type ListRenderItemInfo,
  Pressable,
  StyleSheet,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   CATEGORIES
============================================================ */

const CATEGORIES = [
  "all",
  "building",
  "electrical",
  "plumbing",
  "painting",
  "carpentry",
  "others",
] as const;

/* ============================================================
   TYPES
============================================================ */

type Props = {
  selected: string;

  onSelect: (
    category: string,
  ) => void;
};

/* ============================================================
   HELPERS
============================================================ */

function formatCategoryLabel(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

/* ============================================================
   COMPONENT
============================================================ */

function AllProductsCategories({
  selected,
  onSelect,
}: Props) {
  const renderItem =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<
        (typeof CATEGORIES)[number]
      >) => {
        const active =
          selected === item;

        return (
          <Pressable
            onPress={() => {
              if (!active) {
                onSelect(item);
              }
            }}
            accessibilityRole="tab"
            accessibilityLabel={`${formatCategoryLabel(
              item,
            )} category`}
            accessibilityState={{
              selected:
                active,
            }}
            style={({
              pressed,
            }) => [
              styles.chip,

              active
                ? styles.activeChip
                : null,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppText
              variant="bodyMedium"
              weight={
                active
                  ? "bold"
                  : "medium"
              }
              numberOfLines={1}
              style={[
                styles.label,

                active
                  ? styles.activeLabel
                  : null,
              ]}
            >
              {formatCategoryLabel(
                item,
              )}
            </AppText>
          </Pressable>
        );
      },
      [
        onSelect,
        selected,
      ],
    );

  return (
    <FlatList
      horizontal
      data={CATEGORIES}
      renderItem={
        renderItem
      }
      keyExtractor={
        item => item
      }
      showsHorizontalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={
        styles.content
      }
    />
  );
}

/* ============================================================
   MEMO
============================================================ */

AllProductsCategories.displayName =
  "AllProductsCategories";

export default memo(
  AllProductsCategories,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    content: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.lg,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       CHIP
    ======================================================== */

    chip: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
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
    },

    activeChip: {
      borderColor:
        WorkerColors.primary,

      backgroundColor:
        WorkerColors.primary,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    label: {
      color:
        Colors.textSecondary,
    },

    activeLabel: {
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