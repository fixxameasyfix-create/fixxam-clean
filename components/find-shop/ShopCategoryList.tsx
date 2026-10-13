import React, {
  memo,
  useCallback,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import {
  FIND_SHOP_CATEGORIES,
  type ShopCategoryFilter,
} from '../../constants/shopCategories';

/* ============================================================
   TYPES
============================================================ */

type ShopCategoryListProps = {
  selectedCategory:
    ShopCategoryFilter;

  onSelectCategory: (
    category:
      ShopCategoryFilter,
  ) => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function ShopCategoryListComponent({
  selectedCategory,
  onSelectCategory,
}: ShopCategoryListProps) {
  const handleSelect =
    useCallback(
      (
        category:
          ShopCategoryFilter,
      ) => {
        if (
          category ===
          selectedCategory
        ) {
          return;
        }

        onSelectCategory(
          category,
        );
      },
      [
        onSelectCategory,
        selectedCategory,
      ],
    );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.container
      }
      keyboardShouldPersistTaps="handled"
    >
      {FIND_SHOP_CATEGORIES.map(
        (category) => {
          const selected =
            selectedCategory ===
            category.id;

          return (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityLabel={
                category.label
              }
              accessibilityState={{
                selected,
              }}
              onPress={() =>
                handleSelect(
                  category.id,
                )
              }
              style={({
                pressed,
              }) => [
                styles.chip,

                selected &&
                  styles.selectedChip,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.text,

                  selected &&
                    styles.selectedText,
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          );
        },
      )}
    </ScrollView>
  );
}

/* ============================================================
   MEMO
============================================================ */

export const ShopCategoryList =
  memo(
    ShopCategoryListComponent,
  );

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      gap: 10,

      paddingBottom: 18,

      paddingRight: 20,
    },

    chip: {
      minHeight: 48,

      justifyContent:
        'center',

      paddingHorizontal: 20,

      borderRadius: 24,

      backgroundColor:
        '#F1F5F9',
    },

    selectedChip: {
      backgroundColor:
        '#1677FF',
    },

    text: {
      fontSize: 15,

      fontWeight: '600',

      color:
        '#64748B',
    },

    selectedText: {
      color:
        '#FFFFFF',
    },

    pressed: {
      opacity: 0.75,
    },
  });