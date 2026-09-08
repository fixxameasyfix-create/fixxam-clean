import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import categories from "@/assets/data/categories.json";
import subcategories from "@/assets/data/subcategories.json";

import SearchableModalPicker from "@/components/selectors/SearchableModalPicker";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  category: string;

  subcategory: string;

  setCategory: (
    value: string,
  ) => void;

  setSubcategory: (
    value: string,
  ) => void;

  onResetServices: () => void;
};

/* ============================================================
   CONSTANTS
============================================================ */

const CATEGORY_OPTIONS =
  categories as string[];

const SUBCATEGORY_MAP =
  subcategories as Record<
    string,
    string[]
  >;

/* ============================================================
   COMPONENT
============================================================ */

function CategorySelector({
  category,
  subcategory,
  setCategory,
  setSubcategory,
  onResetServices,
}: Props) {
  const availableSubcategories =
    useMemo(() => {
      if (!category) {
        return [];
      }

      return (
        SUBCATEGORY_MAP[
          category
        ] ?? []
      );
    }, [category]);

  const handleCategorySelect =
    useCallback(
      (
        value: string,
      ) => {
        setCategory(value);

        setSubcategory("");

        onResetServices();
      },
      [
        onResetServices,
        setCategory,
        setSubcategory,
      ],
    );

  const handleSubcategorySelect =
    useCallback(
      (
        value: string,
      ) => {
        setSubcategory(value);

        onResetServices();
      },
      [
        onResetServices,
        setSubcategory,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      <SearchableModalPicker
        label="Category"
        placeholder="Select Category"
        value={
          category
        }
        data={
          CATEGORY_OPTIONS
        }
        onSelect={
          handleCategorySelect
        }
      />

      <View
        style={
          styles.space
        }
      />

      <SearchableModalPicker
        label="Subcategory"
        placeholder="Select Subcategory"
        value={
          subcategory
        }
        data={
          availableSubcategories
        }
        onSelect={
          handleSubcategorySelect
        }
      />
    </View>
  );
}

export default memo(
  CategorySelector,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginBottom:
        FixxamTokens.spacing.sm,
    },

    space: {
      height:
        FixxamTokens.spacing.xs,
    },
  });