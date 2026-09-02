import React, {
  useMemo,
  useState,
} from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";

import MarketHeader from "@/components/customer/market/MarketHeader";
import SearchBar from "@/components/customer/market/SearchBar";
import CategoryTabs from "@/components/customer/market/CategoryTabs";
import ProductGrid from "@/components/customer/market/ProductGrid";
import PayAfterDelivery from "@/components/customer/market/PayAfterDelivery";

import useMarket from "@/hooks/market/useMarket";

export default function MarketScreen() {
  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("all");

  const {
    loading,
    products,
  } = useMarket();

  /* ==========================================================
     FILTER PRODUCTS
  ========================================================== */

  const filteredProducts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "all" ||
        product.category
          .toLowerCase() ===
          category.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    category,
  ]);

  /* ==========================================================
     MARKET HOME LIMIT

     Only 4 products should appear on the
     main Market screen.

     The full product list remains available
     through "See All".
  ========================================================== */

  const marketProducts = useMemo(() => {
    return filteredProducts.slice(0, 4);
  }, [filteredProducts]);

  /* ==========================================================
     PRODUCT DATA

     Convert Market products into the shape
     expected by ProductGrid.
  ========================================================== */

  const productGridData = useMemo(() => {
    return marketProducts.map(
      (product) => ({
        id: product.id,
        workerId: product.workerId,
        storeId: "",
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        rating: product.rating ?? 0,
        sold: product.sold ?? 0,
      }),
    );
  }, [marketProducts]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* ======================================================
          MARKET HEADER
      ====================================================== */}

      <MarketHeader />

      {/* ======================================================
          SEARCH
      ====================================================== */}

      <SearchBar
        value={search}
        onChangeText={setSearch}
      />

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <CategoryTabs
        selected={category}
        onSelect={setCategory}
      />

      {/* ======================================================
          BANNER
      ====================================================== */}

      <Image
        source={require("@/assets/images/construction-banner.jpg")}
        resizeMode="cover"
        style={styles.bannerImage}
      />

      {/* ======================================================
          POPULAR MATERIALS

          IMPORTANT:
          Only 4 products are displayed here.
      ====================================================== */}

      <ProductGrid
        title="Popular Materials"
        loading={loading}
        showSeeAll
        products={productGridData}
        onSeeAll={() =>
          router.push({
            pathname:
              "/market/popular" as never,
          })
        }
        onProductPress={(id) =>
          router.push({
            pathname:
              "/(customer)/product/[id]",
            params: {
              id,
            },
          })
        }
        onBuyPress={(product) =>
          router.push({
            pathname:
              "/(customer)/product/[id]",
            params: {
              id: product.id,
            },
          })
        }
      />

      {/* ======================================================
          PAY AFTER DELIVERY
      ====================================================== */}

      <PayAfterDelivery />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* ==========================================================
     SCREEN
  ========================================================== */

  container: {
    flex: 1,

    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingBottom: 40,
  },

  /* ==========================================================
     BANNER
  ========================================================== */

  bannerImage: {
    width: "90%",

    height: 180,

    marginTop: 1,
    marginBottom: 15,
    marginHorizontal: 16,

    borderRadius: 11,
  },
});