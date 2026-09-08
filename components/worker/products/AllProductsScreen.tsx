import React, {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  Stack,
} from "expo-router";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import useWorkerProducts from "@/hooks/worker/useWorkerProducts";

import AllProductsHeader from "./AllProductsHeader";
import AllProductsSearch from "./AllProductsSearch";
import AllProductsCategories from "./AllProductsCategories";

import AllProductsGrid, {
  type Product,
} from "./AllProductsGrid";

import AllProductsLoading from "./AllProductsLoading";
import AllProductsEmpty from "./AllProductsEmpty";

/* ==============================================================
   HELPERS
============================================================== */

function getSafeString(
  value: unknown,
  fallback: string,
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

function getSafeNumber(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const cleaned =
      value
        .replace(
          /[₦,\s]/g,
          "",
        )
        .trim();

    if (!cleaned) {
      return 0;
    }

    const parsed =
      Number(cleaned);

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  return 0;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function AllProductsScreen() {
  /* ============================================================
     SEARCH
  ============================================================ */

  const [
    search,
    setSearch,
  ] = useState("");

  const deferredSearch =
    useDeferredValue(
      search,
    );

  /* ============================================================
     CATEGORY
  ============================================================ */

  const [
    category,
    setCategory,
  ] = useState(
    "all",
  );

  /* ============================================================
     PRODUCTS
  ============================================================ */

  const {
    loading,
    products,
  } =
    useWorkerProducts();

  /* ============================================================
     NORMALIZE PRODUCTS
  ============================================================ */

  const normalizedProducts =
    useMemo<Product[]>(() => {
      const result: Product[] =
        [];

      for (
        const product of products
      ) {
        const id =
          getSafeString(
            product.id,
            "",
          );

        if (!id) {
          continue;
        }

        const name =
          getSafeString(
            product.name,
            "Unnamed Product",
          );

        const productCategory =
          getSafeString(
            product.category,
            "Others",
          );

        const price =
          Math.max(
            0,
            getSafeNumber(
              product.price,
            ),
          );

        const stock =
          Math.max(
            0,
            Math.floor(
              getSafeNumber(
                product.stock,
              ),
            ),
          );

        const discountPercent =
          Math.min(
            99,
            Math.max(
              0,
              getSafeNumber(
                product.discountPercent,
              ),
            ),
          );

        const rawDiscountedPrice =
          getSafeNumber(
            product.discountedPrice,
          );

        const discountedPrice =
          price > 0 &&
          discountPercent > 0 &&
          rawDiscountedPrice > 0 &&
          rawDiscountedPrice < price
            ? rawDiscountedPrice
            : undefined;

        const thumbnail =
          getSafeString(
            product.thumbnail,
            "",
          );

        result.push({
          id,

          name,

          price,

          thumbnail:
            thumbnail ||
            undefined,

          category:
            productCategory,

          stock,

          discountPercent,

          discountedPrice,
        });
      }

      return result;
    }, [
      products,
    ]);

  /* ============================================================
     FILTER PRODUCTS
  ============================================================ */

  const filteredProducts =
    useMemo<Product[]>(() => {
      const normalizedSearch =
        deferredSearch
          .trim()
          .toLowerCase();

      const normalizedCategory =
        category
          .trim()
          .toLowerCase();

      return normalizedProducts.filter(
        product => {
          const matchesSearch =
            !normalizedSearch ||
            product.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesCategory =
            normalizedCategory ===
              "all" ||
            product.category
              .toLowerCase() ===
              normalizedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      category,
      deferredSearch,
      normalizedProducts,
    ]);

  /* ============================================================
     PRODUCT PRESS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        id: string,
      ) => {
        const productId =
          id.trim();

        if (!productId) {
          return;
        }

        router.push({
          pathname:
            "/(worker)/products/[id]",

          params: {
            id:
              productId,
          },
        });
      },
      [],
    );

  /* ============================================================
     FILTERED EMPTY
  ============================================================ */

  const hasProducts =
    normalizedProducts.length >
    0;

  const hasFilteredProducts =
    filteredProducts.length >
    0;

  const hasActiveFilter =
    Boolean(
      search.trim(),
    ) ||
    category !== "all";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <Stack.Screen
        options={{
          headerShown:
            false,
        }}
      />

      <SafeAreaView
        edges={[
          "top",
        ]}
        style={
          styles.safeArea
        }
      >
        <ScrollView
          style={
            styles.container
          }
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <AllProductsHeader />

          {/* ==================================================
              SEARCH
          ================================================== */}

          <AllProductsSearch
            value={
              search
            }
            onChangeText={
              setSearch
            }
          />

          {/* ==================================================
              CATEGORIES
          ================================================== */}

          <AllProductsCategories
            selected={
              category
            }
            onSelect={
              setCategory
            }
          />

          {/* ==================================================
              RESULTS
          ================================================== */}

          <View
            style={
              styles.results
            }
          >
            {loading ? (
              <AllProductsLoading />
            ) : !hasProducts ? (
              <AllProductsEmpty />
            ) : !hasFilteredProducts &&
              hasActiveFilter ? (
              <FilteredEmptyState />
            ) : (
              <AllProductsGrid
                products={
                  filteredProducts
                }
                onProductPress={
                  handleProductPress
                }
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* ==============================================================
   FILTERED EMPTY STATE
============================================================== */

function FilteredEmptyState() {
  return (
    <View
      style={
        styles.filteredEmpty
      }
    >
      <View
        style={
          styles.filteredEmptyIcon
        }
      >
        <AppIcon
          name="search"
          role="worker"
          size="lg"
          color={
            WorkerColors.primary
          }
        />
      </View>

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={
          styles.filteredEmptyTitle
        }
      >
        No matching products
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.filteredEmptyText
        }
      >
        Try another search or choose a different category.
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    container: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      flexGrow: 1,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       RESULTS
    ======================================================== */

    results: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       FILTERED EMPTY
    ======================================================== */

    filteredEmpty: {
      width: "100%",

      minHeight: 280,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    filteredEmptyIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.lg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    filteredEmptyTitle: {
      color:
        Colors.textPrimary,
    },

    filteredEmptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },
  });