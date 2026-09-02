import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import {
  Stack,
  router,
} from "expo-router";

import useMarket from "@/hooks/market/useMarket";

import PopularMaterialsHeader from "./PopularMaterialsHeader";
import PopularMaterialsSearch from "./PopularMaterialsSearch";
import PopularMaterialsCategories from "./PopularMaterialsCategories";
import PopularMaterialsLoading from "./PopularMaterialsLoading";
import PopularMaterialsEmpty from "./PopularMaterialsEmpty";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   TYPES
============================================================== */

interface MarketProduct {
  id: string;
  workerId?: string;
  storeId?: string;
  name: string;
  price: number;
  thumbnail: string;
  category: string;
  rating?: number;
  sold?: number;
}

interface ProductWithDeal
  extends MarketProduct {
  activeDeal:
    | ActiveProductDeal
    | null;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function PopularMaterialsScreen() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("all");

  const {
    loading,
    products,
  } = useMarket();

  const [
    productsWithDeals,
    setProductsWithDeals,
  ] = useState<
    ProductWithDeal[]
  >([]);

  const [
    dealsLoading,
    setDealsLoading,
  ] = useState(false);

  /* ============================================================
     FILTER PRODUCTS
  ============================================================ */

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const normalizedCategory =
        category.trim().toLowerCase();

      return (
        products as MarketProduct[]
      ).filter((product) => {
        const productName =
          product.name
            ?.toLowerCase()
            .trim() ?? "";

        const productCategory =
          product.category
            ?.toLowerCase()
            .trim() ?? "";

        const matchesSearch =
          !normalizedSearch ||
          productName.includes(
            normalizedSearch,
          );

        const matchesCategory =
          normalizedCategory ===
            "all" ||
          productCategory ===
            normalizedCategory;

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

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  const loadDeals =
    useCallback(
      async () => {
        if (
          filteredProducts.length ===
          0
        ) {
          setProductsWithDeals([]);
          setDealsLoading(false);
          return;
        }

        let cancelled = false;

        try {
          setDealsLoading(true);

          const productIds =
            filteredProducts.map(
              (product) =>
                product.id,
            );

          const dealsByProductId =
            await getActiveProductDeals(
              productIds,
            );

          if (cancelled) {
            return;
          }

          const merged =
            filteredProducts.map(
              (product) => ({
                ...product,

                activeDeal:
                  dealsByProductId.get(
                    product.id,
                  ) ?? null,
              }),
            );

          setProductsWithDeals(
            merged,
          );
        } catch (error) {
          console.error(
            "POPULAR MATERIALS DEAL LOAD ERROR:",
            error,
          );

          if (cancelled) {
            return;
          }

          /*
           * Deals are optional.
           * Products remain visible
           * even if deal loading fails.
           */
          setProductsWithDeals(
            filteredProducts.map(
              (product) => ({
                ...product,
                activeDeal: null,
              }),
            ),
          );
        } finally {
          if (!cancelled) {
            setDealsLoading(false);
          }
        }

        return () => {
          cancelled = true;
        };
      },
      [filteredProducts],
    );

  /* ============================================================
     RUN DEAL LOAD
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (
        filteredProducts.length ===
        0
      ) {
        setProductsWithDeals([]);
        setDealsLoading(false);
        return;
      }

      try {
        setDealsLoading(true);

        const productIds =
          filteredProducts.map(
            (product) =>
              product.id,
          );

        const dealsByProductId =
          await getActiveProductDeals(
            productIds,
          );

        if (cancelled) {
          return;
        }

        setProductsWithDeals(
          filteredProducts.map(
            (product) => ({
              ...product,

              activeDeal:
                dealsByProductId.get(
                  product.id,
                ) ?? null,
            }),
          ),
        );
      } catch (error) {
        console.error(
          "POPULAR MATERIALS DEAL LOAD ERROR:",
          error,
        );

        if (!cancelled) {
          setProductsWithDeals(
            filteredProducts.map(
              (product) => ({
                ...product,
                activeDeal: null,
              }),
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setDealsLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [filteredProducts]);

  /* ============================================================
     PRODUCT PRESS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (id: string) => {
        if (!id) {
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

  /* ============================================================
     BUY
  ============================================================ */

  const handleBuy =
    useCallback(
      (id: string) => {
        if (!id) {
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

  /* ============================================================
     DISPLAY DATA
  ============================================================ */

  const displayProducts =
    productsWithDeals.length > 0
      ? productsWithDeals
      : filteredProducts.map(
          (product) => ({
            ...product,
            activeDeal: null,
          }),
        );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

      <FlatList
        data={displayProducts}
        keyExtractor={(item) =>
          item.id
        }
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        columnWrapperStyle={
          styles.columnWrapper
        }
        ListHeaderComponent={
          <>
            <PopularMaterialsHeader />

            <PopularMaterialsSearch
              value={search}
              onChangeText={
                setSearch
              }
            />

            <PopularMaterialsCategories
              selected={category}
              onSelect={setCategory}
            />

            {dealsLoading && (
              <View
                style={
                  styles.dealsLoading
                }
              >
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

                <View
                  style={
                    styles.dealsLoadingText
                  }
                >
                  {/* Small spacing container */}
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <PopularMaterialsLoading />
          ) : (
            <PopularMaterialsEmpty />
          )
        }
        renderItem={({
          item,
        }) => (
          <View
            style={
              styles.cardWrapper
            }
          >
            <ProductGridCard
              id={item.id}
              name={item.name}
              price={item.price}
              image={
                item.thumbnail ?? ""
              }
              activeDeal={
                item.activeDeal
              }
              onPress={() =>
                handleProductPress(
                  item.id,
                )
              }
              onBuy={() =>
                handleBuy(
                  item.id,
                )
              }
            />
          </View>
        )}
      />
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 16,

      paddingBottom: 32,

      flexGrow: 1,
    },

    columnWrapper: {
      justifyContent:
        "space-between",

      marginBottom: 14,
    },

    cardWrapper: {
      width: "48.2%",
    },

    dealsLoading: {
      height: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom: 4,
    },

    dealsLoadingText: {
      width: 1,

      height: 1,
    },
  });