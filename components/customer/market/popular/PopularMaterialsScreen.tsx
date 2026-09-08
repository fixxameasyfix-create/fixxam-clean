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
  type ListRenderItem,
} from "react-native";

import {
  Stack,
  router,
} from "expo-router";

import {
  AppText,
} from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import useMarket from "@/hooks/market/useMarket";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import PopularMaterialsCategories from "./PopularMaterialsCategories";
import PopularMaterialsEmpty from "./PopularMaterialsEmpty";
import PopularMaterialsHeader from "./PopularMaterialsHeader";
import PopularMaterialsLoading from "./PopularMaterialsLoading";
import PopularMaterialsSearch from "./PopularMaterialsSearch";

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
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizePrice(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return 0;
  }

  return value;
}

function isValidProduct(
  product: MarketProduct,
): boolean {
  return Boolean(
    cleanString(
      product.id,
    ) &&
      cleanString(
        product.name,
      ),
  );
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
    dealsByProductId,
    setDealsByProductId,
  ] = useState<
    Map<
      string,
      ActiveProductDeal
    >
  >(
    () => new Map(),
  );

  const [
    dealsLoading,
    setDealsLoading,
  ] = useState(false);

  /* ============================================================
     NORMALIZE PRODUCTS
  ============================================================ */

  const marketProducts =
    useMemo<MarketProduct[]>(
      () => {
        if (
          !Array.isArray(
            products,
          )
        ) {
          return [];
        }

        return (
          products as MarketProduct[]
        )
          .filter(
            isValidProduct,
          )
          .map(
            (
              product,
            ) => ({
              ...product,

              id: cleanString(
                product.id,
              ),

              name: cleanString(
                product.name,
              ),

              thumbnail:
                cleanString(
                  product.thumbnail,
                ),

              category:
                cleanString(
                  product.category,
                ),

              workerId:
                cleanString(
                  product.workerId,
                ) ||
                undefined,

              storeId:
                cleanString(
                  product.storeId,
                ) ||
                undefined,

              price:
                normalizePrice(
                  product.price,
                ),
            }),
          );
      },
      [
        products,
      ],
    );

  /* ============================================================
     PRODUCT IDS
  ============================================================ */

  const productIds =
    useMemo(
      () =>
        Array.from(
          new Set(
            marketProducts
              .map(
                (
                  product,
                ) =>
                  product.id,
              )
              .filter(
                Boolean,
              ),
          ),
        ),
      [
        marketProducts,
      ],
    );

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled =
      false;

    if (
      productIds.length ===
      0
    ) {
      setDealsByProductId(
        new Map(),
      );

      setDealsLoading(
        false,
      );

      return () => {
        cancelled =
          true;
      };
    }

    const loadDeals =
      async () => {
        setDealsLoading(
          true,
        );

        try {
          const result =
            await getActiveProductDeals(
              productIds,
            );

          if (cancelled) {
            return;
          }

          setDealsByProductId(
            result instanceof Map
              ? result
              : new Map(),
          );
        } catch (error) {
          console.error(
            "POPULAR_MATERIALS_DEAL_LOAD_ERROR:",
            error,
          );

          /*
           * Product browsing should continue
           * even when deal retrieval fails.
           */
          if (!cancelled) {
            setDealsByProductId(
              new Map(),
            );
          }
        } finally {
          if (!cancelled) {
            setDealsLoading(
              false,
            );
          }
        }
      };

    void loadDeals();

    return () => {
      cancelled =
        true;
    };
  }, [
    productIds,
  ]);

  /* ============================================================
     FILTER PRODUCTS
  ============================================================ */

  const filteredProducts =
    useMemo<
      MarketProduct[]
    >(
      () => {
        const normalizedSearch =
          cleanString(search)
            .toLowerCase();

        const normalizedCategory =
          cleanString(category)
            .toLowerCase();

        return marketProducts.filter(
          (
            product,
          ) => {
            const productName =
              product.name.toLowerCase();

            const productCategory =
              product.category.toLowerCase();

            const matchesSearch =
              !normalizedSearch ||
              productName.includes(
                normalizedSearch,
              );

            const matchesCategory =
              !normalizedCategory ||
              normalizedCategory ===
                "all" ||
              productCategory ===
                normalizedCategory;

            return (
              matchesSearch &&
              matchesCategory
            );
          },
        );
      },
      [
        category,
        marketProducts,
        search,
      ],
    );

  /* ============================================================
     DISPLAY PRODUCTS
  ============================================================ */

  const displayProducts =
    useMemo<
      ProductWithDeal[]
    >(
      () =>
        filteredProducts.map(
          (
            product,
          ) => ({
            ...product,

            activeDeal:
              dealsByProductId.get(
                product.id,
              ) ?? null,
          }),
        ),
      [
        dealsByProductId,
        filteredProducts,
      ],
    );

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        id: string,
      ) => {
        const productId =
          cleanString(id);

        if (!productId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              productId,
          },
        });
      },
      [],
    );

  const handleBuy =
    useCallback(
      (
        id: string,
      ) => {
        const productId =
          cleanString(id);

        if (!productId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              productId,
          },
        });
      },
      [],
    );

  /* ============================================================
     RENDER PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback<
      ListRenderItem<ProductWithDeal>
    >(
      ({
        item,
      }) => (
        <View
          style={
            styles.cardWrapper
          }
        >
          <ProductGridCard
            id={
              item.id
            }
            name={
              item.name
            }
            price={
              item.price
            }
            image={
              item.thumbnail
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
      ),
      [
        handleBuy,
        handleProductPress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          ProductWithDeal,
      ) => item.id,
      [],
    );

  /* ============================================================
     HEADER
  ============================================================ */

  const listHeader =
    useMemo(
      () => (
        <>
          <PopularMaterialsHeader />

          <PopularMaterialsSearch
            value={
              search
            }
            onChangeText={
              setSearch
            }
          />

          <PopularMaterialsCategories
            selected={
              category
            }
            onSelect={
              setCategory
            }
          />

          {dealsLoading &&
          marketProducts.length >
            0 ? (
            <View
              accessibilityRole="progressbar"
              accessibilityLabel="Updating material deals"
              style={
                styles.dealsLoading
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="caption"
                tone="secondary"
              >
                Updating deals...
              </AppText>
            </View>
          ) : null}
        </>
      ),
      [
        category,
        dealsLoading,
        marketProducts.length,
        search,
      ],
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <Stack.Screen
        options={{
          title: "",

          headerShown:
            false,
        }}
      />

      <FlatList
        data={
          displayProducts
        }
        keyExtractor={
          keyExtractor
        }
        renderItem={
          renderProduct
        }
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }
        style={
          styles.container
        }
        contentContainerStyle={[
          styles.content,

          displayProducts.length ===
            0
            ? styles.emptyContent
            : null,
        ]}
        columnWrapperStyle={
          styles.columnWrapper
        }
        ListHeaderComponent={
          listHeader
        }
        ListEmptyComponent={
          loading ? (
            <PopularMaterialsLoading />
          ) : (
            <PopularMaterialsEmpty />
          )
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
      />
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

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
      flexGrow: 1,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    emptyContent: {
      flexGrow: 1,
    },

    /* ========================================================
       GRID
    ======================================================== */

    columnWrapper: {
      gap:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    cardWrapper: {
      flex: 1,

      minWidth: 0,
    },

    /* ========================================================
       DEAL LOADING
    ======================================================== */

    dealsLoading: {
      minHeight: 30,

      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },
  });