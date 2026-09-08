import React, {
  memo,
  useCallback,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  type ListRenderItem,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   CONSTANTS
============================================================== */

const CATEGORIES = [
  "all",
  "building",
  "electrical",
  "plumbing",
  "paint",
  "roofing",
  "tools",
  "cement",
] as const;

type Category =
  (typeof CATEGORIES)[number];

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  selected: string;

  onSelect: (
    category: string,
  ) => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function formatCategory(
  category: string,
): string {
  if (!category) {
    return "";
  }

  return (
    category
      .charAt(0)
      .toUpperCase() +
    category.slice(1)
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function PopularMaterialsCategories({
  selected,
  onSelect,
}: Props) {
  const handleSelect =
    useCallback(
      (
        category: Category,
      ) => {
        onSelect(category);
      },
      [onSelect],
    );

  const renderItem =
    useCallback<
      ListRenderItem<Category>
    >(
      ({ item }) => {
        const active =
          selected === item;

        const label =
          formatCategory(item);

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Show ${label} materials`}
            accessibilityState={{
              selected: active,
            }}
            onPress={() =>
              handleSelect(item)
            }
            style={({ pressed }) => [
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
              {label}
            </AppText>
          </Pressable>
        );
      },
      [
        handleSelect,
        selected,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item: Category,
      ) => item,
      [],
    );

  return (
    <FlatList
      horizontal
      data={CATEGORIES}
      keyExtractor={
        keyExtractor
      }
      renderItem={
        renderItem
      }
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    content: {
      gap:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    chip: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    activeChip: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    label: {
      color:
        CustomerColors.primary,
    },

    activeLabel: {
      color:
        Colors.textInverse,
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

export default memo(
  PopularMaterialsCategories,
);