import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import ProductSearch from "./ProductSearch";
import CategoryChips from "./CategoryChips";
import ProductBanner from "./ProductBanner";
import ProductTabs from "./ProductTabs";
import ProductList from "./ProductList";

export default function MyProductsScreen() {
  const handleSeeAll = () => {
    router.push("/(worker)/products");
  };

  return (
    <AppScreen
      contentContainerStyle={styles.container}
    >
      {/* SEARCH */}
      <ProductSearch />

      {/* CATEGORIES */}
      <CategoryChips />

      {/* BANNER */}
      <ProductBanner />

      {/* TABS */}
      <ProductTabs />

      {/* PRODUCTS HEADER */}
      <View style={styles.productsHeader}>
        <View style={styles.headerText}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            My Products
          </AppText>

          <AppText style={styles.subtitle}>
            Manage your products
          </AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all products"
          accessibilityHint="Opens all products"
          hitSlop={10}
          onPress={handleSeeAll}
          style={({ pressed }) => [
            styles.seeAllButton,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            weight="bold"
            style={styles.seeAllText}
          >
            See All
          </AppText>

          <AppText
            weight="bold"
            style={styles.arrow}
          >
            ›
          </AppText>
        </Pressable>
      </View>

      {/* PRODUCTS */}
      <ProductList showSeeAll={false} />

      <View style={styles.bottomSpace} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,

    /*
     * Moves the WHOLE page down:
     * Search
     * Categories
     * Banner
     * Tabs
     * My Products
     * Product cards
     */
    paddingTop: 35,

    paddingBottom: 10,

    backgroundColor: "#F8FAFC",

    flexGrow: 0,
  },

  productsHeader: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 1,
    marginBottom: 11,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 24,
    lineHeight: 29,
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: "#94A3B8",
  },

  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 2,

    marginLeft: 12,
  },

  seeAllText: {
    fontSize: 15,
    color: "#F97316",
  },

  arrow: {
    marginLeft: 2,
    fontSize: 22,
    lineHeight: 22,
    color: "#F97316",
  },

  pressed: {
    opacity: 0.6,
  },

  bottomSpace: {
    height: 40,
  },
});