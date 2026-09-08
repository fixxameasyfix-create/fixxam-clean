import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  router,
} from "expo-router";

import MarketHeader from "@/components/customer/market/MarketHeader";
import SearchBar from "@/components/customer/market/SearchBar";
import CategoryTabs from "@/components/customer/market/CategoryTabs";
import ProductGrid from "@/components/customer/market/ProductGrid";
import PayAfterDelivery from "@/components/customer/market/PayAfterDelivery";

import useMarket from "@/hooks/market/useMarket";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   CONSTANTS
============================================================ */

const MARKET_HOME_PRODUCT_LIMIT =
  4;

/* ============================================================
   HELPERS
============================================================ */

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
    : "";
}

/* ============================================================
   COMPONENT
============================================================ */

export default function MarketScreen() {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    category,
    setCategory,
  ] =
    useState("all");

  const {
    loading,
    products,
  } =
    useMarket();

  /* ==========================================================
     FILTER PRODUCTS
  ========================================================== */

  const filteredProducts =
    useMemo(() => {
      const query =
        normalizeText(
          search,
        );

      const selectedCategory =
        normalizeText(
          category,
        );

      return products.filter(
        (product) => {
          const productName =
            normalizeText(
              product.name,
            );

          const productCategory =
            normalizeText(
              product.category,
            );

          const matchesSearch =
            !query ||
            productName.includes(
              query,
            );

          const matchesCategory =
            selectedCategory ===
              "all" ||
            productCategory ===
              selectedCategory;

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

  /* ==========================================================
     MARKET HOME LIMIT

     Only 4 products appear on the
     main Market screen.
  ========================================================== */

  const marketProducts =
    useMemo(
      () =>
        filteredProducts.slice(
          0,
          MARKET_HOME_PRODUCT_LIMIT,
        ),
      [filteredProducts],
    );

  /* ==========================================================
     PRODUCT GRID DATA
  ========================================================== */

  const productGridData =
    useMemo(
      () =>
        marketProducts.map(
          (product) => ({
            id:
              product.id,

            workerId:
              product.workerId,

            /*
             * Preserve the existing
             * ProductGrid data shape.
             */
            storeId:
              "",

            name:
              product.name,

            price:
              product.price,

            thumbnail:
              product.thumbnail,

            rating:
              product.rating ??
              0,

            sold:
              product.sold ??
              0,
          }),
        ),
      [marketProducts],
    );

  /* ==========================================================
     SEE ALL
  ========================================================== */

  const handleSeeAll =
    useCallback(() => {
      /*
       * Preserve existing route.
       */
      router.push({
        pathname:
          "/market/popular" as never,
      });
    }, []);

  /* ==========================================================
     PRODUCT
  ========================================================== */

  const handleProductPress =
    useCallback(
      (
        id: string,
      ) => {
        if (
          !id?.trim()
        ) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id,
          },
        });
      },
      [],
    );

  /* ==========================================================
     BUY
  ========================================================== */

  const handleBuyPress =
    useCallback(
      (
        product: {
          id: string;
        },
      ) => {
        if (
          !product.id?.trim()
        ) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              product.id,
          },
        });
      },
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
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
      keyboardDismissMode="on-drag"
    >
      {/* ======================================================
          MARKET HEADER
      ====================================================== */}

      <MarketHeader />

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <SearchBar
        value={
          search
        }
        onChangeText={
          setSearch
        }
      />

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <CategoryTabs
        selected={
          category
        }
        onSelect={
          setCategory
        }
      />

      {/* ======================================================
          MARKET BANNER
      ====================================================== */}

      <Image
        source={require("@/assets/images/construction-banner.jpg")}
        style={
          styles.bannerImage
        }
        contentFit="cover"
        transition={150}
        accessibilityLabel="Construction materials promotion"
      />

      {/* ======================================================
          POPULAR MATERIALS
      ====================================================== */}

      <ProductGrid
        title="Popular Materials"
        loading={
          loading
        }
        showSeeAll
        products={
          productGridData
        }
        onSeeAll={
          handleSeeAll
        }
        onProductPress={
          handleProductPress
        }
        onBuyPress={
          handleBuyPress
        }
      />

      {/* ======================================================
          PAY AFTER DELIVERY
      ====================================================== */}

      <PayAfterDelivery />
    </ScrollView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       SCREEN
    ======================================================== */

    container: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ========================================================
       BANNER
    ======================================================== */

    bannerImage: {
      width: "auto",

      height: 180,

      marginTop:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.md,

      marginHorizontal:
        FixxamTokens.spacing.lg,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },
  });