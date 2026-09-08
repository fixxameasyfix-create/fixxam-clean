import React, {
  useCallback,
  useEffect,
  useMemo,
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
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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
   CONSTANTS
============================================================== */

const PRODUCT_LIMIT = 10;

const PRODUCT_CARD_WIDTH = 200;

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
  ] =
    useState<
      ProductWithDeal[]
    >([]);

  const [
    dealsLoading,
    setDealsLoading,
  ] =
    useState(false);

  /* ============================================================
     VISIBLE PRODUCTS
  ============================================================ */

  const visibleProducts =
    useMemo(
      () =>
        Array.isArray(products)
          ? products
              .filter(
                (product) =>
                  typeof product.id ===
                    "string" &&
                  product.id.trim()
                    .length > 0,
              )
              .slice(
                0,
                PRODUCT_LIMIT,
              )
          : [],
      [products],
    );

  /* ============================================================
     FALLBACK PRODUCTS
  ============================================================ */

  const fallbackProducts =
    useMemo<
      ProductWithDeal[]
    >(
      () =>
        visibleProducts.map(
          (product) => ({
            ...product,

            activeDeal: null,
          }),
        ),
      [visibleProducts],
    );

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    const loadDeals =
      async () => {
        if (
          visibleProducts.length ===
          0
        ) {
          setProductsWithDeals(
            [],
          );

          setDealsLoading(
            false,
          );

          return;
        }

        /*
         * Immediately move to the latest
         * product set so stale products
         * from a previous render cannot
         * remain visible while deal data
         * is loading.
         */
        setProductsWithDeals(
          fallbackProducts,
        );

        try {
          setDealsLoading(
            true,
          );

          const productIds = [
            ...new Set(
              visibleProducts.map(
                (product) =>
                  product.id,
              ),
            ),
          ];

          if (
            productIds.length ===
            0
          ) {
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
            "NEW_ARRIVALS_DEAL_LOAD_ERROR",
            error,
          );

          if (cancelled) {
            return;
          }

          /*
           * Deals are optional UI data.
           * A deal failure must never
           * hide valid market products.
           */
          setProductsWithDeals(
            fallbackProducts,
          );
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
      cancelled = true;
    };
  }, [
    fallbackProducts,
    visibleProducts,
  ]);

  /* ============================================================
     DISPLAY DATA
  ============================================================ */

  const displayProducts =
    productsWithDeals.length > 0
      ? productsWithDeals
      : fallbackProducts;

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        productId: string,
      ) => {
        const safeProductId =
          productId.trim();

        if (!safeProductId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id: safeProductId,
          },
        });
      },
      [],
    );

  /* ============================================================
     SEE ALL
  ============================================================ */

  const handleSeeAll =
    useCallback(() => {
      router.push(
        "/(customer)/market/popular",
      );
    }, []);

  /* ============================================================
     RENDER PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item: ProductWithDeal;
      }) => (
        <View
          style={styles.item}
        >
          <ProductGridCard
            id={item.id}
            name={item.name}
            price={item.price}
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
              handleProductPress(
                item.id,
              )
            }
          />
        </View>
      ),
      [
        handleProductPress,
      ],
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.headerLeft
          }
        >
          <AppText
            variant="heading3"
            weight="bold"
            numberOfLines={1}
            style={styles.title}
          >
            New Arrivals
          </AppText>

          {dealsLoading ? (
            <ActivityIndicator
              size="small"
              color={
                CustomerColors.primary
              }
              style={
                styles.dealLoader
              }
            />
          ) : null}
        </View>

        <Pressable
          hitSlop={8}
          onPress={
            handleSeeAll
          }
          accessibilityRole="button"
          accessibilityLabel="See all new arrivals"
          style={({
            pressed,
          }) => [
            styles.seeAllButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={styles.seeAll}
          >
            See All
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            color={
              CustomerColors.primary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (
        <View
          style={styles.center}
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
            style={
              styles.loadingText
            }
          >
            Loading products...
          </AppText>
        </View>
      ) : displayProducts.length ===
        0 ? (
        /* ====================================================
           EMPTY
        ==================================================== */

        <View
          style={styles.center}
        >
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="package"
              size="lg"
              state="muted"
            />
          </View>

          <AppText
            variant="body"
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No products available
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            New market products will appear here when available.
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
          renderItem={
            renderProduct
          }
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.list
          }
          initialNumToRender={
            5
          }
          maxToRenderPerBatch={
            PRODUCT_LIMIT
          }
          windowSize={3}
          keyboardShouldPersistTaps="handled"
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
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",
    },

    headerLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection: "row",

      alignItems: "center",

      marginRight:
        FixxamTokens.spacing.sm,
    },

    title: {
      flexShrink: 1,

      color:
        Colors.textPrimary,
    },

    dealLoader: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    seeAllButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    /* ==========================================================
       LIST
    ========================================================== */

    list: {
      paddingRight:
        FixxamTokens.spacing.lg,
    },

    item: {
      width:
        PRODUCT_CARD_WIDTH,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       LOADING / EMPTY
    ========================================================== */

    center: {
      minHeight: 150,

      paddingVertical:
        FixxamTokens.spacing.xl,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      alignItems: "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    emptyIcon: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      marginBottom:
        FixxamTokens.spacing.sm,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,
    },

    /* ==========================================================
       PRESS
    ========================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,
    },
  });