import React, {
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import {
 router,
  Stack,
} from "expo-router";

import useWorkerProducts from "@/hooks/worker/useWorkerProducts";

import AllProductsHeader from "./AllProductsHeader";
import AllProductsSearch from "./AllProductsSearch";
import AllProductsCategories from "./AllProductsCategories";
import AllProductsGrid from "./AllProductsGrid";
import AllProductsLoading from "./AllProductsLoading";
import AllProductsEmpty from "./AllProductsEmpty";

export default function AllProductsScreen() {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const {
    loading,
    products,
  } = useWorkerProducts();

  const filteredProducts =
    useMemo(() => {
      return products.filter(
        (product) => {
          const matchesSearch =
            product.name
              .toLowerCase()
              .includes(
                search.toLowerCase(),
              );

          const matchesCategory =
            category === "all" ||
            product.category
              .toLowerCase() ===
              category.toLowerCase();

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      products,
      search,
      category,
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <AllProductsHeader />

        <AllProductsSearch
          value={search}
          onChangeText={
            setSearch
          }
        />

        <AllProductsCategories
          selected={category}
          onSelect={setCategory}
        />

        {loading ? (
          <AllProductsLoading />
        ) : filteredProducts.length ===
          0 ? (
          <AllProductsEmpty />
        ) : (
          <AllProductsGrid
  products={filteredProducts}
  onProductPress={(id) =>
    router.push({
      pathname: "/(worker)/products/[id]",
      params: { id },
    })
  }
/>
        )}
      </ScrollView>
    </>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingBottom: 32,
    },
  });