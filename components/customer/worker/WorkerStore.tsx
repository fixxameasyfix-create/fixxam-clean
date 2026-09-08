import React, {
  memo,
  useCallback,
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

import Toast from "react-native-toast-message";

import {
  AppButton,
  AppIcon,
  AppText,
} from "@/components/ui";

import ProductCard from "@/components/customer/market/ProductCard";

import {
  useCart,
} from "@/contexts/CartContext";

import {
  getWorkerProducts,
} from "@/firebase/queries/products";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import type {
  Product,
} from "@/types/product";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workerId: string;
};

type ProductWithDeal =
  Product & {
    activeDeal:
      | ActiveProductDeal
      | null;
  };

/* ==============================================================
   CONSTANTS
============================================================== */

const PRODUCT_CARD_WIDTH =
  190;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

/**
 * Returns a valid positive
 * product price.
 */
function getOriginalPrice(
  product: Product,
): number {
  const price =
    Number(
      product.price,
    );

  return (
    Number.isFinite(
      price,
    ) &&
    price > 0
      ? price
      : 0
  );
}

function getStock(
  product: Product,
): number {
  const stock =
    Number(
      product.stock,
    );

  if (
    !Number.isFinite(
      stock,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      stock,
    ),
  );
}

/**
 * Validates an active deal against
 * the original product price.
 */
function getValidDeal(
  product: Product,
  deal:
    | ActiveProductDeal
    | null,
): ActiveProductDeal | null {
  if (
    !deal
  ) {
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

/**
 * Gets the actual customer-facing
 * unit price.
 */
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

  if (
    !validDeal
  ) {
    return originalPrice;
  }

  const discountedPrice =
    Number(
      validDeal.discountedPrice,
    );

  if (
    Number.isFinite(
      discountedPrice,
    ) &&
    discountedPrice > 0 &&
    discountedPrice <
      originalPrice
  ) {
    return discountedPrice;
  }

  return originalPrice;
}

/* ==============================================================
   HEADER
============================================================== */

const Header =
  memo(function Header({
    count,
    onViewAll,
  }: {
    count?: number;

    onViewAll: () => void;
  }) {
    return (
      <View
        style={
          styles.header
        }
      >
        {/* ====================================================
            LEFT
        ==================================================== */}

        <View
          style={
            styles.headerLeft
          }
        >
          <View
            style={
              styles.iconBox
            }
          >
            <AppIcon
              name="package"
              role="customer"
              size="sm"
              state="active"
            />
          </View>

          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              numberOfLines={1}
            >
              Worker Store
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.subtitle
              }
            >
              {typeof count ===
              "number"
                ? `${count} product${
                    count === 1
                      ? ""
                      : "s"
                  } available`
                : "Products available from this worker"}
            </AppText>
          </View>
        </View>

        {/* ====================================================
            VIEW ALL
        ==================================================== */}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all worker products"
          hitSlop={8}
          onPress={
            onViewAll
          }
          style={({
            pressed,
          }) => [
            styles.viewAllButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.viewAll
            }
          >
            View All
          </AppText>

          <AppIcon
            name="next"
            role="customer"
            size="xs"
            state="active"
          />
        </Pressable>
      </View>
    );
  });

/* ==============================================================
   COMPONENT
============================================================== */

export default function WorkerStore({
  workerId,
}: Props) {
  const [
    products,
    setProducts,
  ] =
    useState<
      ProductWithDeal[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    loadError,
    setLoadError,
  ] =
    useState(false);

  const {
    addToCart,
  } =
    useCart();

  /* ============================================================
     LOAD PRODUCTS
  ============================================================ */

  const loadProducts =
    useCallback(async () => {
      const normalizedWorkerId =
        cleanString(
          workerId,
        );

      if (
        !normalizedWorkerId
      ) {
        setProducts(
          [],
        );

        setLoadError(
          false,
        );

        setLoading(
          false,
        );

        return;
      }

      try {
        setLoading(
          true,
        );

        setLoadError(
          false,
        );

        const snapshot =
          await getWorkerProducts(
            normalizedWorkerId,
          );

        /* ====================================================
           MAP ACTIVE PRODUCTS
        ==================================================== */

        const workerProducts =
          snapshot.docs
            .map(
              (
                document,
              ) =>
                ({
                  id:
                    document.id,

                  ...document.data(),
                }) as Product,
            )
            .filter(
              (
                product,
              ) =>
                product.status ===
                  "active" &&
                getStock(
                  product,
                ) > 0 &&
                getOriginalPrice(
                  product,
                ) > 0,
            );

        if (
          workerProducts.length ===
          0
        ) {
          setProducts(
            [],
          );

          return;
        }

        /* ====================================================
           PRODUCT IDS
        ==================================================== */

        const productIds =
          workerProducts
            .map(
              (
                product,
              ) =>
                cleanString(
                  product.id,
                ),
            )
            .filter(
              Boolean,
            );

        /* ====================================================
           ACTIVE DEALS
           
           Deal failure must NOT prevent
           products from loading.
        ==================================================== */

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
          dealError
        ) {
          console.error(
            "FAILED_TO_LOAD_WORKER_PRODUCT_DEALS:",
            dealError,
          );
        }

        /* ====================================================
           MERGE PRODUCTS + DEALS
        ==================================================== */

        const productsWithDeals =
          workerProducts.map(
            (
              product,
            ) => {
              const productId =
                cleanString(
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
          "FAILED_TO_LOAD_WORKER_STORE:",
          error,
        );

        setProducts(
          [],
        );

        setLoadError(
          true,
        );

        Toast.show({
          type: "error",

          text1:
            "Unable to load store",

          text2:
            "Please try again.",
        });
      } finally {
        setLoading(
          false,
        );
      }
    }, [
      workerId,
    ]);

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    let active =
      true;

    const run =
      async () => {
        if (
          !active
        ) {
          return;
        }

        await loadProducts();
      };

    void run();

    return () => {
      active =
        false;
    };
  }, [
    loadProducts,
  ]);

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (
        productId:
          string,
      ) => {
        const normalizedId =
          cleanString(
            productId,
          );

        if (
          !normalizedId
        ) {
          return;
        }

        /*
         * ROUTE PRESERVED.
         */
        router.push({
          pathname:
            "/(customer)/product/[id]",

          params: {
            id:
              normalizedId,
          },
        });
      },
      [],
    );

  /* ============================================================
     ADD PRODUCT TO CART
  ============================================================ */

  const handleAddToCart =
    useCallback(
      (
        product:
          ProductWithDeal,
      ) => {
        const productId =
          cleanString(
            product.id,
          );

        if (
          !productId
        ) {
          Toast.show({
            type: "error",

            text1:
              "Product unavailable",

            text2:
              "This product could not be added to cart.",
          });

          return;
        }

        /* ====================================================
           STOCK
        ==================================================== */

        const stock =
          getStock(
            product,
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

        /* ====================================================
           WORKER
        ==================================================== */

        const worker =
          cleanString(
            product.workerId,
          ) ||
          cleanString(
            workerId,
          );

        if (
          !worker
        ) {
          Toast.show({
            type: "error",

            text1:
              "Worker unavailable",

            text2:
              "This product has no assigned worker.",
          });

          return;
        }

        /* ====================================================
           PRICE
        ==================================================== */

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

        const activeDeal =
          getValidDeal(
            product,
            product.activeDeal,
          );

        const unitPrice =
          getUnitPrice(
            product,
            activeDeal,
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

        /* ====================================================
           PRODUCT NAME
        ==================================================== */

        const productName =
          cleanString(
            product.name,
          );

        if (
          !productName
        ) {
          Toast.show({
            type: "error",

            text1:
              "Invalid product",

            text2:
              "This product has no valid name.",
          });

          return;
        }

        /* ====================================================
           DEAL
        ==================================================== */

        const hasDiscount =
          Boolean(
            activeDeal,
          );

        const dealId =
          hasDiscount
            ? cleanString(
                activeDeal?.id,
              )
            : "";

        const discountPercentage =
          hasDiscount
            ? Number(
                activeDeal
                  ?.discountPercentage,
              )
            : 0;

        /* ====================================================
           CART
        ==================================================== */

        try {
          const result =
            addToCart({
              id:
                productId,

              name:
                productName,

              /*
               * Original product price.
               */
              price:
                originalPrice,

              /*
               * Actual customer-facing
               * price.
               */
              unitPrice,

              image:
                cleanString(
                  product.thumbnail,
                ),

              quantity: 1,

              ...(hasDiscount &&
              dealId
                ? {
                    discountPercentage,

                    discountedPrice:
                      unitPrice,

                    dealId,
                  }
                : {}),

              storeId:
                cleanString(
                  product.storeId,
                ),

              sellerId:
                worker,

              workerId:
                worker,
            });

          switch (
            result
          ) {
            case "added":
              Toast.show({
                type: "success",

                text1:
                  "Added to Cart",

                text2:
                  hasDiscount
                    ? `${productName} added at the discounted price.`
                    : `${productName} added successfully.`,
              });
              break;

            case "updated":
              Toast.show({
                type: "success",

                text1:
                  "Cart Updated",

                text2:
                  `${productName} quantity increased.`,
              });
              break;

            case "worker-conflict":
              Toast.show({
                type: "error",

                text1:
                  "Different Worker",

                text2:
                  "Your cart can only contain products from one worker.",
              });
              break;

            case "invalid":
              Toast.show({
                type: "error",

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
        workerId,
      ],
    );

  /* ============================================================
     VIEW ALL
  ============================================================ */

  const handleViewAll =
    useCallback(() => {
      const normalizedWorkerId =
        cleanString(
          workerId,
        );

      if (
        !normalizedWorkerId
      ) {
        return;
      }

      /*
       * ROUTE PRESERVED.
       */
      router.push({
        pathname:
          "/(customer)/worker-store/worker-store",

        params: {
          workerId:
            normalizedWorkerId,
        },
      });
    }, [
      workerId,
    ]);

  /* ============================================================
     RENDER PRODUCT
  ============================================================ */

  const renderProduct =
    useCallback(
      ({
        item,
      }: {
        item:
          ProductWithDeal;
      }) => {
        const activeDeal =
          item.activeDeal;

        const productId =
          cleanString(
            item.id,
          );

        const productName =
          cleanString(
            item.name,
          ) ||
          "Unnamed product";

        return (
          <View
            style={
              styles.productCard
            }
          >
            <ProductCard
              id={
                productId
              }
              name={
                productName
              }
              price={
                getOriginalPrice(
                  item,
                )
              }
              image={
                cleanString(
                  item.thumbnail,
                )
              }
              category={
                cleanString(
                  item.category,
                )
              }
              stock={
                getStock(
                  item,
                )
              }
              featured={
                Boolean(
                  item.featured,
                )
              }
              discountPercentage={
                activeDeal
                  ? Number(
                      activeDeal.discountPercentage,
                    )
                  : undefined
              }
              discountedPrice={
                activeDeal
                  ? Number(
                      activeDeal.discountedPrice,
                    )
                  : undefined
              }
              onPress={() =>
                handleProductPress(
                  productId,
                )
              }
              onBuyPress={() =>
                handleAddToCart(
                  item,
                )
              }
            />
          </View>
        );
      },
      [
        handleAddToCart,
        handleProductPress,
      ],
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (
    loading
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <Header
          count={
            undefined
          }
          onViewAll={
            handleViewAll
          }
        />

        <View
          style={
            styles.loading
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
            style={
              styles.loadingText
            }
          >
            Loading store...
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    loadError
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <Header
          count={
            undefined
          }
          onViewAll={
            handleViewAll
          }
        />

        <View
          style={
            styles.errorCard
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <AppIcon
              name="error"
              role="customer"
              size="md"
              state="error"
            />
          </View>

          <AppText
            variant="bodyMedium"
            weight="bold"
            center
          >
            Unable to load store
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            center
            style={
              styles.errorText
            }
          >
            We couldn't load this
            worker's products.
          </AppText>

          <AppButton
            title="Try Again"
            role="customer"
            variant="outline"
            leftIconName="refresh"
            onPress={
              loadProducts
            }
            style={
              styles.retryButton
            }
          />
        </View>
      </View>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  if (
    products.length ===
    0
  ) {
    return null;
  }

  /* ============================================================
     STORE
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      <Header
        count={
          products.length
        }
        onViewAll={
          handleViewAll
        }
      />

      <FlatList
        horizontal
        data={
          products
        }
        keyExtractor={(
          item,
        ) =>
          String(
            item.id,
          )
        }
        renderItem={
          renderProduct
        }
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.productList
        }
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      marginTop:
        FixxamTokens.spacing.lg,

      marginBottom:
        FixxamTokens.spacing.lg,
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

      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.lg,
    },

    headerLeft: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    iconBox: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       VIEW ALL
    ======================================================== */

    viewAllButton: {
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
        FixxamTokens.spacing.xxs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    viewAll: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       PRODUCTS
    ======================================================== */

    productList: {
      paddingLeft:
        FixxamTokens.spacing.lg,

      paddingRight:
        FixxamTokens.spacing.sm,
    },

    productCard: {
      width:
        PRODUCT_CARD_WIDTH,

      marginRight:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loading: {
      minHeight: 110,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorCard: {
      minHeight: 180,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    errorIcon: {
      width:
        FixxamTokens.size
          .avatarLg,

      height:
        FixxamTokens.size
          .avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    retryButton: {
      minWidth: 150,

      marginTop:
        FixxamTokens.spacing.md,
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