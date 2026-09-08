import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import ProductCard from "@/components/customer/market/ProductCard";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import {
  getWorkerProducts,
} from "@/firebase/queries/products";

import type {
  Product,
} from "@/types/product";

import {
  useCart,
} from "@/contexts/CartContext";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ============================================================
   TYPES
============================================================ */

type ProductWithDeal =
  Product & {
    activeDeal:
      | ActiveProductDeal
      | null;
  };

type WorkerStoreParams = {
  workerId?:
    | string
    | string[];
};

type LoadProductsOptions = {
  preserveExisting?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function getParamString(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (
    Array.isArray(value)
  ) {
    return (
      value[0] ??
      ""
    ).trim();
  }

  return (
    value ??
    ""
  ).trim();
}

function normalizeString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function getOriginalPrice(
  product: Product,
): number {
  const price =
    Number(
      product.price,
    );

  return Number.isFinite(
    price,
  ) &&
    price > 0
    ? price
    : 0;
}

function getStock(
  value: unknown,
): number {
  const stock =
    Number(value);

  if (
    !Number.isFinite(
      stock,
    ) ||
    stock <= 0
  ) {
    return 0;
  }

  return Math.floor(
    stock,
  );
}

function getValidDeal(
  product: Product,
  deal:
    | ActiveProductDeal
    | null,
): ActiveProductDeal | null {
  if (!deal) {
    return null;
  }

  const originalPrice =
    getOriginalPrice(
      product,
    );

  const discountedPrice =
    Number(
      deal.discountedPrice,
    );

  const discountPercentage =
    Number(
      deal.discountPercentage,
    );

  if (
    originalPrice <= 0 ||
    !Number.isFinite(
      discountedPrice,
    ) ||
    discountedPrice <= 0 ||
    discountedPrice >=
      originalPrice
  ) {
    return null;
  }

  if (
    !Number.isFinite(
      discountPercentage,
    ) ||
    discountPercentage <= 0 ||
    discountPercentage >= 100
  ) {
    return null;
  }

  return deal;
}

function getUnitPrice(
  product: Product,
  deal:
    | ActiveProductDeal
    | null,
): number {
  const originalPrice =
    getOriginalPrice(
      product,
    );

  const validDeal =
    getValidDeal(
      product,
      deal,
    );

  if (!validDeal) {
    return originalPrice;
  }

  const discountedPrice =
    Number(
      validDeal.discountedPrice,
    );

  return Number.isFinite(
    discountedPrice,
  ) &&
    discountedPrice > 0 &&
    discountedPrice <
      originalPrice
    ? discountedPrice
    : originalPrice;
}

/* ============================================================
   SCREEN
============================================================ */

export default function WorkerStoreScreen() {
  const params =
    useLocalSearchParams<WorkerStoreParams>();

  const normalizedWorkerId =
    useMemo(
      () =>
        getParamString(
          params.workerId,
        ),
      [
        params.workerId,
      ],
    );

  const [
    products,
    setProducts,
  ] =
    useState<ProductWithDeal[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const loadRequestId =
    useRef(0);

  const {
    addToCart,
  } =
    useCart();

  /* ==========================================================
     LOAD PRODUCTS + DEALS
  ========================================================== */

  const loadProducts =
    useCallback(
      async (
        options:
          LoadProductsOptions = {},
      ) => {
        const {
          preserveExisting =
            false,
        } =
          options;

        const requestId =
          ++loadRequestId.current;

        if (
          !normalizedWorkerId
        ) {
          setProducts(
            [],
          );

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );

          return;
        }

        try {
          const snapshot =
            await getWorkerProducts(
              normalizedWorkerId,
            );

          if (
            requestId !==
            loadRequestId.current
          ) {
            return;
          }

          /* ================================================
             ACTIVE PRODUCTS
          ================================================ */

          const activeProducts:
            Product[] =
            snapshot.docs
              .map(
                item =>
                  ({
                    /*
                     * Firestore document ID
                     * remains authoritative.
                     */
                    ...item.data(),

                    id:
                      item.id,
                  }) as Product,
              )
              .filter(
                product =>
                  product.status ===
                    "active" &&
                  getStock(
                    product.stock,
                  ) > 0,
              );

          if (
            activeProducts.length ===
            0
          ) {
            setProducts(
              [],
            );

            return;
          }

          /* ================================================
             PRODUCT IDS
          ================================================ */

          const productIds =
            activeProducts
              .map(
                product =>
                  normalizeString(
                    product.id,
                  ),
              )
              .filter(Boolean);

          /* ================================================
             DEALS

             Deal lookup is optional presentation data.
             A temporary deal-query failure must not make
             the entire store disappear.
          ================================================ */

          let dealsByProductId =
            new Map<
              string,
              ActiveProductDeal
            >();

          try {
            dealsByProductId =
              await getActiveProductDeals(
                productIds,
              );
          } catch (
            error
          ) {
            console.warn(
              "LOAD_WORKER_STORE_DEALS_ERROR:",
              error,
            );
          }

          if (
            requestId !==
            loadRequestId.current
          ) {
            return;
          }

          /* ================================================
             MERGE
          ================================================ */

          const productsWithDeals =
            activeProducts.map(
              product => {
                const productId =
                  normalizeString(
                    product.id,
                  );

                const deal =
                  dealsByProductId.get(
                    productId,
                  ) ??
                  null;

                return {
                  ...product,

                  activeDeal:
                    getValidDeal(
                      product,
                      deal,
                    ),
                };
              },
            );

          setProducts(
            productsWithDeals,
          );
        } catch (
          error
        ) {
          console.error(
            "LOAD_WORKER_STORE_ERROR:",
            error,
          );

          if (
            requestId !==
            loadRequestId.current
          ) {
            return;
          }

          if (
            !preserveExisting
          ) {
            setProducts(
              [],
            );
          }

          Toast.show({
            type: "error",

            text1:
              "Unable to load store",

            text2:
              "Please try again.",
          });
        } finally {
          if (
            requestId ===
            loadRequestId.current
          ) {
            setLoading(
              false,
            );

            setRefreshing(
              false,
            );
          }
        }
      },
      [
        normalizedWorkerId,
      ],
    );

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    setLoading(
      true,
    );

    void loadProducts();

    return () => {
      /*
       * Invalidates any in-flight request.
       */
      loadRequestId.current +=
        1;
    };
  }, [
    loadProducts,
  ]);

  /* ==========================================================
     REFRESH
  ========================================================== */

  const handleRefresh =
    useCallback(() => {
      if (
        refreshing
      ) {
        return;
      }

      setRefreshing(
        true,
      );

      void loadProducts({
        preserveExisting:
          true,
      });
    }, [
      loadProducts,
      refreshing,
    ]);

  /* ==========================================================
     PRODUCT DETAILS
  ========================================================== */

  const handleProductPress =
    useCallback(
      (
        productId: string,
      ) => {
        const normalizedProductId =
          normalizeString(
            productId,
          );

        if (
          !normalizedProductId
        ) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              normalizedProductId,
          },
        });
      },
      [],
    );

  /* ==========================================================
     ADD TO CART
  ========================================================== */

  const handleAddToCart =
    useCallback(
      (
        product:
          ProductWithDeal,
      ) => {
        /* ================================================
           PRODUCT
        ================================================ */

        const productId =
          normalizeString(
            product.id,
          );

        if (!productId) {
          Toast.show({
            type: "error",

            text1:
              "Product unavailable",

            text2:
              "This product could not be added to cart.",
          });

          return;
        }

        const productName =
          normalizeString(
            product.name,
          );

        if (!productName) {
          Toast.show({
            type: "error",

            text1:
              "Invalid product",

            text2:
              "This product has no valid name.",
          });

          return;
        }

        /* ================================================
           STOCK
        ================================================ */

        const stock =
          getStock(
            product.stock,
          );

        if (
          stock <= 0
        ) {
          Toast.show({
            type: "error",

            text1:
              "Out of Stock",

            text2:
              "This product is currently unavailable.",
          });

          return;
        }

        /* ================================================
           WORKER
        ================================================ */

        if (
          !normalizedWorkerId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Worker unavailable",

            text2:
              "This product is not linked to a worker.",
          });

          return;
        }

        /* ================================================
           PRICE
        ================================================ */

        const originalPrice =
          getOriginalPrice(
            product,
          );

        if (
          originalPrice <= 0
        ) {
          Toast.show({
            type: "error",

            text1:
              "Invalid product price",

            text2:
              "This product cannot be added to cart.",
          });

          return;
        }

        const validDeal =
          getValidDeal(
            product,
            product.activeDeal,
          );

        const unitPrice =
          getUnitPrice(
            product,
            validDeal,
          );

        if (
          !Number.isFinite(
            unitPrice,
          ) ||
          unitPrice <= 0 ||
          unitPrice >
            originalPrice
        ) {
          Toast.show({
            type: "error",

            text1:
              "Invalid product price",

            text2:
              "The product price could not be verified.",
          });

          return;
        }

        /* ================================================
           DEAL METADATA
        ================================================ */

        const discountData =
          validDeal
            ? {
                discountPercentage:
                  Number(
                    validDeal
                      .discountPercentage,
                  ),

                discountedPrice:
                  unitPrice,

                ...(normalizeString(
                  validDeal.id,
                )
                  ? {
                      dealId:
                        normalizeString(
                          validDeal.id,
                        ),
                    }
                  : {}),
              }
            : {};

        /* ================================================
           CART
        ================================================ */

        try {
          const result =
            addToCart({
              id:
                productId,

              name:
                productName,

              /*
               * Original market price.
               */
              price:
                originalPrice,

              /*
               * Customer's current display price.
               */
              unitPrice,

              image:
                normalizeString(
                  product.thumbnail,
                ),

              quantity:
                1,

              ...discountData,

              storeId:
                normalizeString(
                  product.storeId,
                ),

              /*
               * Existing Fixxam market
               * ownership behavior preserved.
               */
              sellerId:
                normalizedWorkerId,

              workerId:
                normalizedWorkerId,
            });

          switch (
            result
          ) {
            case "added":
              Toast.show({
                type:
                  "success",

                text1:
                  "Added to Cart",

                text2:
                  validDeal
                    ? `${productName} added at the discounted price.`
                    : `${productName} added successfully.`,
              });
              break;

            case "updated":
              Toast.show({
                type:
                  "success",

                text1:
                  "Cart Updated",

                text2:
                  `${productName} quantity has been increased.`,
              });
              break;

            case "worker-conflict":
              Toast.show({
                type:
                  "error",

                text1:
                  "Different Worker",

                text2:
                  "Your cart can only contain products from one worker.",
              });
              break;

            case "invalid":
              Toast.show({
                type:
                  "error",

                text1:
                  "Unable to add product",

                text2:
                  "This product contains invalid information.",
              });
              break;

            default:
              break;
          }
        } catch (
          error
        ) {
          console.error(
            "ADD_PRODUCT_TO_CART_ERROR:",
            error,
          );

          Toast.show({
            type: "error",

            text1:
              "Unable to add to cart",

            text2:
              "Please try again.",
          });
        }
      },
      [
        addToCart,
        normalizedWorkerId,
      ],
    );

  /* ==========================================================
     ITEM RENDERER
  ========================================================== */

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item:
          ProductWithDeal;
      }) => {
        const originalPrice =
          getOriginalPrice(
            item,
          );

        const validDeal =
          getValidDeal(
            item,
            item.activeDeal,
          );

        const discountPercentage =
          validDeal
            ? Number(
                validDeal
                  .discountPercentage,
              )
            : undefined;

        const discountedPrice =
          validDeal
            ? Number(
                validDeal
                  .discountedPrice,
              )
            : undefined;

        const productId =
          normalizeString(
            item.id,
          );

        return (
          <View
            style={
              styles.productWrapper
            }
          >
            <ProductCard
              id={
                productId
              }
              name={
                normalizeString(
                  item.name,
                ) ||
                "Unnamed product"
              }
              price={
                originalPrice
              }
              image={
                normalizeString(
                  item.thumbnail,
                )
              }
              category={
                normalizeString(
                  item.category,
                )
              }
              stock={
                getStock(
                  item.stock,
                )
              }
              featured={
                Boolean(
                  item.featured,
                )
              }
              discountPercentage={
                discountPercentage
              }
              discountedPrice={
                discountedPrice
              }
              onPress={() => {
                handleProductPress(
                  productId,
                );
              }}
              onBuyPress={() => {
                handleAddToCart(
                  item,
                );
              }}
            />
          </View>
        );
      },
      [
        handleAddToCart,
        handleProductPress,
      ],
    );

  const keyExtractor =
    useCallback(
      (
        item:
          ProductWithDeal,
      ) =>
        normalizeString(
          item.id,
        ),
      [],
    );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <AppScreen
      role="customer"
      contentContainerStyle={
        styles.screen
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
        <Pressable
          onPress={() => {
            router.back();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({
            pressed,
          }) => [
            styles.backButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="back"
            size="md"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <AppText
            variant="heading2"
            weight="bold"
            style={
              styles.title
            }
          >
            Worker Store
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            {loading
              ? "Available products"
              : `${products.length} ${
                  products.length ===
                  1
                    ? "product"
                    : "products"
                } available`}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      {loading ? (
        <View
          style={
            styles.loadingContainer
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
            Loading store...
          </AppText>
        </View>
      ) : (
        <FlatList
          data={
            products
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.list,

            products.length ===
            0
              ? styles.emptyList
              : null,
          ]}
          columnWrapperStyle={
            products.length >
            0
              ? styles.row
              : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                handleRefresh
              }
              tintColor={
                CustomerColors.primary
              }
              colors={[
                CustomerColors.primary,
              ]}
              progressBackgroundColor={
                Colors.surface
              }
            />
          }
          ListEmptyComponent={
            <StoreEmptyState />
          }
        />
      )}
    </AppScreen>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function StoreEmptyState() {
  return (
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
          color={
            CustomerColors.primary
          }
        />
      </View>

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={
          styles.emptyTitle
        }
      >
        Store is Empty
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.emptyText
        }
      >
        This worker has no available products at the moment.
      </AppText>
    </View>
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

    screen: {
      flex: 1,

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        Colors.background,
    },

    backButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    headerText: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    emptyList: {
      flexGrow: 1,
    },

    row: {
      justifyContent:
        "space-between",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    productWrapper: {
      width: "48.2%",
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xl,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      flex: 1,

      minHeight: 360,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 310,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       STATES
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