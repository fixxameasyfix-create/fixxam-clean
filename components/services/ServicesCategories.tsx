import React, {
  memo,
  useCallback,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import type {
  ServiceCategory,
} from "@/firebase/queries/services/listenCategories";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type MaterialIconName =
  keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  categories:
    ServiceCategory[];

  selected: string;

  onSelect: (
    id: string,
  ) => void;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const DEFAULT_ICON: MaterialIconName =
  "apps";

/* ==============================================================
   HELPERS
============================================================== */

function safeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function resolveIcon(
  value: unknown,
): MaterialIconName {
  const icon =
    safeString(
      value,
    );

  if (
    icon &&
    icon in
      MaterialCommunityIcons.glyphMap
  ) {
    return icon as MaterialIconName;
  }

  return DEFAULT_ICON;
}

/* ==============================================================
   CATEGORY CHIP
============================================================== */

const CategoryChip =
  memo(
    function CategoryChip({
      item,
      active,
      onPress,
    }: {
      item:
        ServiceCategory;

      active: boolean;

      onPress: (
        id: string,
      ) => void;
    }) {
      const id =
        safeString(
          item.id,
        );

      const name =
        safeString(
          item.name,
        ) ||
        "Category";

      const icon =
        resolveIcon(
          item.icon,
        );

      return (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Filter services by ${name}`}
          accessibilityState={{
            selected:
              active,
          }}
          disabled={
            !id
          }
          onPress={() =>
            onPress(
              id,
            )
          }
          style={({
            pressed,
          }) => [
            styles.chip,

            active
              ? styles.activeChip
              : null,

            !id
              ? styles.disabledChip
              : null,

            pressed &&
            id
              ? styles.pressed
              : null,
          ]}
        >
          <MaterialCommunityIcons
            name={
              icon
            }
            size={
              FixxamTokens.size.iconSm
            }
            color={
              active
                ? Colors.textInverse
                : CustomerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="medium"
            numberOfLines={1}
            style={[
              styles.label,

              active
                ? styles.activeLabel
                : null,
            ]}
          >
            {name}
          </AppText>
        </Pressable>
      );
    },
  );

CategoryChip.displayName =
  "ServicesCategoryChip";

/* ==============================================================
   COMPONENT
============================================================== */

function ServicesCategories({
  categories,
  selected,
  onSelect,
}: Props) {
  const renderItem =
    useCallback(
      ({
        item,
      }: {
        item:
          ServiceCategory;
      }) => (
        <CategoryChip
          item={
            item
          }
          active={
            item.id ===
            selected
          }
          onPress={
            onSelect
          }
        />
      ),
      [
        onSelect,
        selected,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          ServiceCategory,
        index: number,
      ) => {
        const id =
          safeString(
            item.id,
          );

        return (
          id ||
          `service-category-${index}`
        );
      },
      [],
    );

  if (
    categories.length ===
    0
  ) {
    return null;
  }

  return (
    <FlatList
      horizontal
      data={
        categories
      }
      renderItem={
        renderItem
      }
      keyExtractor={
        keyExtractor
      }
      showsHorizontalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={
        styles.list
      }
    />
  );
}

export default memo(
  ServicesCategories,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    list: {
      paddingRight:
        FixxamTokens.spacing.md,
    },

    chip: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginRight:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    activeChip: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    disabledChip: {
      opacity:
        FixxamTokens.motion.disabledOpacity,
    },

    label: {
      color:
        Colors.textPrimary,
    },

    activeLabel: {
      color:
        Colors.textInverse,
    },

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });