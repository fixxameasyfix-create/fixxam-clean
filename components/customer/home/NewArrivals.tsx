import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppText,
} from "@/components/ui";

import ProductGridCard from "./ProductGridCard";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   TYPES
============================================================== */

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnail: string;

  storeId?: string;
  workerId?: string;
}

interface ProductWithDeal
  extends Product {
  activeDeal:
    | ActiveProductDeal
    | null;
}

interface Props {
  products: Product[];
  loading: boolean;
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function NewArrivals({
  products,
  loading,
}: Props) {
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
     VISIBLE PRODUCTS
  ============================================================ */

  const visibleProducts =
    products.slice(0, 10);

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadDeals =
      async () => {
        /*
         * No products.
         */
        if (
          visibleProducts.length ===
          0
        ) {
          setProductsWithDeals([]);
          setDealsLoading(false);
          return;
        }

        try {
          setDealsLoading(true);

          const productIds =
            visibleProducts
              .map(
                (product) =>
                  product.id,
              )
              .filter(Boolean);

          if (
            productIds.length ===
            0
          ) {
            setProductsWithDeals(
              visibleProducts.map(
                (product) => ({
                  ...product,
                  activeDeal: null,
                }),
              ),
            );

            return;
          }

          /*
           * Get active deals for
           * visible products.
           */
          const dealsByProductId =
            await getActiveProductDeals(
              productIds,
            );

          if (cancelled) {
            return;
          }

          /*
           * Merge products + deals.
           */
          const mergedProducts =
            visibleProducts.map(
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
            "NEW ARRIVALS DEAL LOAD ERROR:",
            error,
          );

          if (cancelled) {
            return;
          }

          /*
           * Deal loading should
           * never hide products.
           */
          setProductsWithDeals(
            visibleProducts.map(
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
      };

    loadDeals();

    return () => {
      cancelled = true;
    };
  }, [products]);

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress = (
    productId: string,
  ) => {
    if (!productId) {
      return;
    }

    router.push({
      pathname:
        "/(customer)/product/[id]",

      params: {
        id: productId,
      },
    });
  };

  /* ============================================================
     DATA
  ============================================================ */

  const displayProducts: ProductWithDeal[] =
    productsWithDeals.length > 0
      ? productsWithDeals
      : visibleProducts.map(
          (product) => ({
            ...product,
            activeDeal: null,
          }),
        );

  /* ============================================================
     RENDER
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
        <View
          style={
            styles.headerLeft
          }
        >
          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            New Arrivals
          </AppText>

          {dealsLoading && (
            <ActivityIndicator
              size="small"
              color="#2563EB"
              style={
                styles.dealLoader
              }
            />
          )}
        </View>

        <Pressable
          hitSlop={8}
          onPress={() =>
            router.push(
              "/(customer)/market/popular",
            )
          }
          accessibilityRole="button"
          accessibilityLabel="See all new arrivals"
        >
          <AppText
            weight="semibold"
            style={
              styles.seeAll
            }
          >
            See All
          </AppText>
        </Pressable>
      </View>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <View
          style={
            styles.center
          }
        >
          <ActivityIndicator
            size="small"
            color="#2563EB"
          />

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading products...
          </AppText>
        </View>
      ) : products.length ===
        0 ? (
        /* ====================================================
           EMPTY
        ==================================================== */

        <View
          style={
            styles.center
          }
        >
          <AppText
            style={
              styles.emptyText
            }
          >
            No products available
          </AppText>
        </View>
      ) : (
        /* ====================================================
           PRODUCTS
        ==================================================== */

        <FlatList
          horizontal
          data={
            displayProducts
          }
          keyExtractor={(
            item,
          ) => item.id}
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          renderItem={({
            item,
          }) => (
            <View
              style={
                styles.item
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

                /*
                 * Buy button opens
                 * product details.
                 */
                onBuy={() =>
                  handleProductPress(
                    item.id,
                  )
                }
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginBottom: 15,
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

    headerLeft: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    title: {
      fontSize: 20,

      color:
        "#0F172A",
    },

    dealLoader: {
      marginLeft: 8,
    },

    seeAll: {
      fontSize: 14,

      color:
        "#2563EB",
    },

    /* ==========================================================
       LIST
    ========================================================== */

    list: {
      paddingRight: 16,
    },

    item: {
      width: 200,

      marginRight: 11,
    },

    /* ==========================================================
       LOADING / EMPTY
    ========================================================== */

    center: {
      paddingVertical: 38,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 8,

      fontSize: 12,

      color:
        "#64748B",
    },

    emptyText: {
      fontSize: 13,

      color:
        "#94A3B8",

      textAlign:
        "center",
    },
  });