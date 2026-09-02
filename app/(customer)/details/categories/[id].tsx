import React, { useEffect, useState } from "react";

import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import CategoryCard from "@/components/categories/CategoryCard";

import { getSubcategories } from "@/firebase/queries/subcategories";

type Subcategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
};

export default function CategoryScreen() {
  const {
    id: categoryId,
    reward,
  } = useLocalSearchParams<{
    id: string;
    reward?: string;
  }>();

  const [loading, setLoading] =
    useState(true);

  const [subcategories, setSubcategories] =
    useState<Subcategory[]>([]);

  useEffect(() => {
    void loadSubcategories();
  }, [categoryId]);

  async function loadSubcategories() {
    try {
      if (!categoryId) {
        return;
      }

      setLoading(true);

      const snapshot =
        await getSubcategories(
          categoryId,
        );

      const data: Subcategory[] =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<
            Subcategory,
            "id"
          >),
        }));

      setSubcategories(data);
    } catch (error) {
      console.error(
        "Failed to load subcategories:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubcategoryPress(
    subcategoryId: string,
  ) {
    router.push({
      pathname:
        "/(customer)/details/services/[id]",
      params: {
        id: subcategoryId,
        categoryId,
        ...(reward
          ? { reward }
          : {}),
      },
    } as const);
  }

  if (loading) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      contentContainerStyle={
        styles.container
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </TouchableOpacity>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Subcategories
        </AppText>

        <View
          style={styles.placeholder}
        />
      </View>

      <View style={styles.list}>
        {subcategories.map((item) => (
          <CategoryCard
            key={item.id}
            title={item.name}
            icon={item.icon}
            iconColor={item.color}
            backgroundColor={
              item.backgroundColor
            }
            onPress={() =>
              handleSubcategoryPress(
                item.id,
              )
            }
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  placeholder: {
    width: 38,
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
    letterSpacing: -0.2,
  },

  list: {
    marginTop: 4,
    rowGap: 8,
  },
});