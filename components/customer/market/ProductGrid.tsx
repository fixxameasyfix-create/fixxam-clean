import React, {
  memo,
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
  type ListRenderItem,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import ProductGridCard from "@/components/customer/home/ProductGridCard";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

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

type ProductWithDeal =
  MarketProduct & {
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

/* ==============================================================
   COMPONENT
============================================================== */

function ProductGrid({
  title = "Popular Materials",
  products,
  loading = false,
  showSeeAll = true,
  onSeeAll,
  onProductPress,
  onBuyPress,
}: Props) {
  const [
    dealsByProductId,
    setDealsByProductId,
  ] =
    useState<
      Map<
        string,
        ActiveProductDeal
      >
    >(
      new Map(),
    );

  const [
    dealsLoading,
    setDealsLoading,
  ] =
    useState(false);

  /* ============================================================
     LOAD ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let cancelled =
      false;

    const productIds =
      Array.from(
        new Set(
          products
            .map(
              (product) =>
                cleanString(
                  product.id,
                ),
            )
            .filter(Boolean),
        ),
      );

    /*
     * Clear old deal state immediately so
     * deals from a previous product list
     * cannot appear on the new list.
     */
    setDealsByProductId(
      new Map(),
    );

    if (
      productIds.length === 0
    ) {
      setDealsLoading(
        false,
      );

      return () => {
        cancelled =
          true;
      };
    }

    async function loadDeals() {
      try {
        setDealsLoading(
          true,
        );

        const result =
          await getActiveProductDeals(
            productIds,
          );

        if (cancelled) {
          return;
        }

        setDealsByProductId(
          result,
        );
      } catch (error) {
        console.error(
          "PRODUCT_GRID_DEAL_LOAD_ERROR:",
          error,
        );

        /*
         * Deals are optional.
         * Products remain fully usable.
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
    }

    void loadDeals();

    return () => {
      cancelled =
        true;
    };
  }, [
    products,
  ]);

  /* ============================================================
     DISPLAY PRODUCTS
  ============================================================ */

  const displayProducts =
    useMemo<
      ProductWithDeal[]
    >(
      () =>
        products.map(
          (product) => ({
            ...product,

            activeDeal:
              dealsByProductId.get(
                product.id,
              ) ?? null,
          }),
        ),
      [
        dealsByProductId,
        products,
      ],
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
      ),
      [
        onBuyPress,
        onProductPress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item: ProductWithDeal,
      ) => item.id,
      [],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Loading products"
        style={
          styles.loading
        }
      >
        <ActivityIndicator
          size="large"
          color={
            CustomerColors.primary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
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
          variant="heading3"
          weight="bold"
          numberOfLines={1}
          style={
            styles.title
          }
        >
          {title}
        </AppText>

        {showSeeAll &&
        onSeeAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
            hitSlop={8}
            onPress={
              onSeeAll
            }
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
              variant="bodyMedium"
              weight="bold"
              style={
                styles.seeAll
              }
            >
              See All
            </AppText>

            <AppIcon
              name="next"
              role="customer"
              size="xs"
              state="active"
            />
          </Pressable>
        ) : null}
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
          <View
            style={
              styles.emptyIcon
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="xl"
              state="muted"
            />
          </View>

          <AppText
            variant="bodyLarge"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            No Products Found
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Products added by workers will appear here.
          </AppText>
        </View>
      ) : (
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
          scrollEnabled={false}
          showsVerticalScrollIndicator={
            false
          }
          columnWrapperStyle={
            styles.row
          }
        />
      )}

      {/* ======================================================
          DEAL REFRESH
      ====================================================== */}

      {dealsLoading &&
      displayProducts.length >
        0 ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Updating product deals"
          style={
            styles.dealLoading
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
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,
    },

    title: {
      flex: 1,

      minWidth: 0,

      color:
        Colors.textPrimary,
    },

    seeAllButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    seeAll: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       GRID
    ======================================================== */

    row: {
      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    cardWrapper: {
      width: "48.2%",
    },

    /* ========================================================
       MAIN LOADING
    ======================================================== */

    loading: {
      minHeight: 220,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       DEAL LOADING
    ======================================================== */

    dealLoading: {
      minHeight: 28,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingTop:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      minHeight: 220,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    emptyIcon: {
      width: 72,

      height: 72,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,
    },

    /* ========================================================
       PRESSED
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });

export default memo(
  ProductGrid,
);