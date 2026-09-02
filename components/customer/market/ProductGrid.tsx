import React, {
  useEffect,
  useState,
} from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   TYPES
============================================================== */

export type MarketProduct = {
  id: string;

  workerId: string;

  storeId?: string;

  name: string;

  price: number;

  thumbnail: string;

  rating?: number;

  sold?: number;
};

type ProductWithDeal = MarketProduct & {
  activeDeal:
    | ActiveProductDeal
    | null;
};

type Props = {
  title?: string;

  products: MarketProduct[];

  loading?: boolean;

  showSeeAll?: boolean;

  onSeeAll?: () => void;

  onProductPress: (
    id: string,
  ) => void;

  onBuyPress: (
    product: MarketProduct,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

export default function ProductGrid({
  title = "Popular Materials",

  products,

  loading = false,

  showSeeAll = true,

  onSeeAll,

  onProductPress,

  onBuyPress,
}: Props) {
  const [
    productsWithDeals,
    setProductsWithDeals,
  ] = useState<ProductWithDeal[]>(
    [],
  );

  const [
    dealsLoading,
    setDealsLoading,
  ] = useState(false);

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadDeals = async () => {
      if (products.length === 0) {
        setProductsWithDeals([]);
        setDealsLoading(false);
        return;
      }

      try {
        setDealsLoading(true);

        const productIds =
          products
            .map(
              (product) =>
                product.id,
            )
            .filter(Boolean);

        if (productIds.length === 0) {
          setProductsWithDeals(
            products.map(
              (product) => ({
                ...product,
                activeDeal: null,
              }),
            ),
          );

          return;
        }

        const dealsByProductId =
          await getActiveProductDeals(
            productIds,
          );

        if (cancelled) {
          return;
        }

        const mergedProducts =
          products.map(
            (product) => ({
              ...product,

              activeDeal:
                dealsByProductId.get(
                  product.id,
                ) ?? null,
            }),
          );

        setProductsWithDeals(
          mergedProducts,
        );
      } catch (error) {
        console.error(
          "PRODUCT GRID DEAL LOAD ERROR:",
          error,
        );

        if (!cancelled) {
          /*
           * Products must continue
           * working even if deal
           * loading fails.
           */
          setProductsWithDeals(
            products.map(
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

    void loadDeals();

    return () => {
      cancelled = true;
    };
  }, [products]);

  /* ============================================================
     DISPLAY DATA
  ============================================================ */

  const displayProducts =
    productsWithDeals.length > 0
      ? productsWithDeals
      : products.map(
          (product) => ({
            ...product,
            activeDeal: null,
          }),
        );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View
        style={
          styles.loading
        }
      >
        <AppText
          style={
            styles.loadingText
          }
        >
          Loading products...
        </AppText>
      </View>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={
          styles.header
        }
      >
        <AppText
          weight="bold"
          style={
            styles.title
          }
        >
          {title}
        </AppText>

        {showSeeAll && (
          <Pressable
            onPress={onSeeAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
          >
            <AppText
              weight="bold"
              style={
                styles.seeAll
              }
            >
              See All
            </AppText>
          </Pressable>
        )}
      </View>

      {/* ======================================================
          PRODUCTS
      ====================================================== */}

      {displayProducts.length ===
      0 ? (
        <View
          style={
            styles.empty
          }
        >
          <AppText
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No Products Found
          </AppText>

          <AppText
            style={
              styles.emptyText
            }
          >
            Products added by
            workers will appear
            here.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={
            displayProducts
          }
          keyExtractor={(
            item,
          ) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={
            styles.row
          }
          showsVerticalScrollIndicator={
            false
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
                  onProductPress(
                    item.id,
                  )
                }

                onBuy={() =>
                  onBuyPress(
                    item,
                  )
                }
              />
            </View>
          )}
        />
      )}

      {/* ======================================================
          DEAL LOADING
          Small indicator only while deals are loading.
      ====================================================== */}

      {dealsLoading &&
        displayProducts.length >
          0 && (
          <View
            style={
              styles.dealLoading
            }
          >
            <AppText
              style={
                styles.dealLoadingText
              }
            >
              Updating deals...
            </AppText>
          </View>
        )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      marginHorizontal: 16,

      marginBottom: 25,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      alignItems:
        "center",

      marginBottom: 12,
    },

    title: {
      fontSize: 22,

      color:
        "#0F172A",
    },

    seeAll: {
      fontSize: 15,

      color:
        "#2563EB",
    },

    /* ==========================================================
       GRID
    ========================================================== */

    row: {
      justifyContent:
        "space-between",

      marginBottom: 14,
    },

    cardWrapper: {
      width: "48.2%",
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loading: {
      minHeight: 220,

      justifyContent:
        "center",

      alignItems:
        "center",

      marginHorizontal: 16,
    },

    loadingText: {
      fontSize: 13,

      color:
        "#64748B",
    },

    /* ==========================================================
       DEAL LOADING
    ========================================================== */

    dealLoading: {
      alignItems:
        "center",

      paddingTop: 4,
    },

    dealLoadingText: {
      fontSize: 10,

      color:
        "#94A3B8",
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#EEF2F7",

      paddingVertical: 35,

      paddingHorizontal: 20,

      alignItems:
        "center",
    },

    emptyTitle: {
      fontSize: 16,

      color:
        "#0F172A",
    },

    emptyText: {
      marginTop: 7,

      fontSize: 13,

      lineHeight: 19,

      color:
        "#64748B",

      textAlign:
        "center",
    },
  });