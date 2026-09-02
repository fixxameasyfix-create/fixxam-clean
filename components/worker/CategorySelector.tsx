import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import categories from "@/assets/data/categories.json";
import subcategories from "@/assets/data/subcategories.json";

import SearchableModalPicker from "@/components/selectors/SearchableModalPicker";

type Props = {
  category: string;
  subcategory: string;
  setCategory: (value: string) => void;
  setSubcategory: (value: string) => void;
  onResetServices: () => void;
};

export default function CategorySelector({
  category,
  subcategory,
  setCategory,
  setSubcategory,
  onResetServices,
}: Props) {
  const availableSubcategories = useMemo(() => {
    const data =
      subcategories as Record<string, string[]>;

    return category
      ? data[category] || []
      : [];
  }, [category]);

  return (
    <View style={styles.container}>
      <SearchableModalPicker
        label="Category"
        placeholder="Select Category"
        value={category}
        data={categories as string[]}
        onSelect={(value) => {
          setCategory(value);
          setSubcategory("");
          onResetServices();
        }}
      />

      <View style={styles.space} />

      <SearchableModalPicker
        label="Subcategory"
        placeholder="Select Subcategory"
        value={subcategory}
        data={availableSubcategories}
        onSelect={(value) => {
          setSubcategory(value);
          onResetServices();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },

  space: {
    height: 6,
  },
});