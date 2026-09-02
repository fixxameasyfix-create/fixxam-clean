import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import CategoryCard from "./CategoryCard";

import { getCategories } from "@/firebase/queries/categories";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
};

export default function CategoryGrid() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const { reward } =
    useLocalSearchParams<{
      reward?: string;
    }>();

  useEffect(() => {
    void loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const snapshot =
        await getCategories();

      const data: Category[] =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<
            Category,
            "id"
          >),
        }));

      setCategories(data);
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error,
      );
    }
  }

  function handleCategoryPress(
    categoryId: string,
  ) {
    router.push({
      pathname:
        "/(customer)/details/categories/[id]",
      params: {
        id: categoryId,
        ...(reward
          ? { reward }
          : {}),
      },
    } as const);
  }

  return (
    <View style={styles.container}>
      {categories.map((item) => (
        <CategoryCard
          key={item.id}
          title={item.name}
          icon={item.icon}
          iconColor={item.color}
          backgroundColor={
            item.backgroundColor
          }
          onPress={() =>
            handleCategoryPress(
              item.id,
            )
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 20,
  },
});