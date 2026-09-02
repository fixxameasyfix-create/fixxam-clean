import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import Toast from "react-native-toast-message";

import { AppText } from "@/components/ui";

import ProductCard from "@/components/customer/market/ProductCard";

import {
  getWorkerProducts,
} from "@/firebase/queries/products";

import {
  Product,
} from "@/types/product";

import {
  useCart,
} from "@/contexts/CartContext";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

/* ==============================================================
   TYPES
============================================================== */

type ProductWithDeal = Product & {
  activeDeal:
    | ActiveProductDeal
    | null;
};

/* ==============================================================
   HELPERS
============================================================== */

function getOriginalPrice(
  product: Product,
): number {
  const price =
    Number(product.price);

  return Number.isFinite(price) &&
    price > 0
    ? price
    : 0;
}

function getValidDeal(
  product: Product,
  deal: ActiveProductDeal | null,
): ActiveProductDeal | null {
  if (!deal) {
    return null;
  }

  const originalPrice =
    getOriginalPrice(product);

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
  deal: ActiveProductDeal | null,
): number {
  const originalPrice =
    getOriginalPrice(product);

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

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerStoreScreen() {
  const {
    workerId,
  } =
    useLocalSearchParams<{
      workerId: string;
    }>();

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
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const {
    addToCart,
  } = useCart();

  /* ============================================================
     LOAD PRODUCTS + DEALS
  ============================================================ */

  const loadProducts =
    useCallback(
      async () => {
        const normalizedWorkerId =
          String(
            workerId ?? "",
          ).trim();

        if (
          !normalizedWorkerId
        ) {
          setProducts([]);
          setLoading(false);
          setRefreshing(false);
          return;
        }

        try {
          const snapshot =
            await getWorkerProducts(
              normalizedWorkerId,
            );

          /* ==================================================
             ACTIVE PRODUCTS
          ================================================== */

          const activeProducts: Product[] =
            snapshot.docs
              .map(
                (item) =>
                  ({
                    id: item.id,
                    ...item.data(),
                  } as Product),
              )
              .filter(
                (product) =>
                  product.status ===
                    "active" &&
                  Number(
                    product.stock,
                  ) > 0,
              );

          /* ==================================================
             NO PRODUCTS
          ================================================== */

          if (
            activeProducts.length ===
            0
          ) {
            setProducts([]);
            return;
          }

          /* ==================================================
             PRODUCT IDS
          ================================================== */

          const productIds =
            activeProducts
              .map(
                (product) =>
                  String(
                    product.id ?? "",
                  ).trim(),
              )
              .filter(Boolean);

          /* ==================================================
             ACTIVE DEALS
          ================================================== */

          const dealsByProductId =
            await getActiveProductDeals(
              productIds,
            );

          /* ==================================================
             MERGE DEALS
          ================================================== */

          const productsWithDeals =
            activeProducts.map(
              (product) => {
                const deal =
                  dealsByProductId.get(
                    String(
                      product.id,
                    ).trim(),
                  ) ?? null;

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
        } catch (error) {
          console.error(
            "LOAD WORKER STORE ERROR:",
            error,
          );

          setProducts([]);

          Toast.show({
            type: "error",
            text1:
              "Unable to load store",
            text2:
              "Please try again.",
          });
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [workerId],
    );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh =
    useCallback(
      async () => {
        setRefreshing(true);

        await loadProducts();
      },
      [loadProducts],
    );

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (productId: string) => {
        const normalizedProductId =
          String(
            productId ?? "",
          ).trim();

        if (
          !normalizedProductId
        ) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",
          params: {
            id: normalizedProductId,
          },
        });
      },
      [],
    );

  /* ============================================================
     ADD TO CART
  ============================================================ */

  const handleAddToCart =
    useCallback(
      (
        product: ProductWithDeal,
      ) => {
        const normalizedWorkerId =
          String(
            workerId ?? "",
          ).trim();

        /* ==================================================
           PRODUCT ID
        ================================================== */

        const productId =
          String(
            product.id ?? "",
          ).trim();

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

        /* ==================================================
           STOCK
        ================================================== */

        const stock =
          Number(
            product.stock,
          );

        if (
          !Number.isInteger(
            stock,
          ) ||
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

        /* ==================================================
           WORKER
        ================================================== */

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

        /* ==================================================
           ORIGINAL PRICE
        ================================================== */

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

        /* ==================================================
           VALID DEAL
        ================================================== */

        const validDeal =
          getValidDeal(
            product,
            product.activeDeal,
          );

        /* ==================================================
           CURRENT PRICE
        ================================================== */

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

        /* ==================================================
           PRODUCT NAME
        ================================================== */

        const productName =
          String(
            product.name ?? "",
          ).trim();

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

        /* ==================================================
           DEAL INFORMATION
        ================================================== */

        const hasDiscount =
          Boolean(validDeal);

        const discountPercentage =
          hasDiscount
            ? Number(
                validDeal
                  ?.discountPercentage,
              )
            : undefined;

        const discountedPrice =
          hasDiscount
            ? unitPrice
            : undefined;

        const dealId =
          hasDiscount
            ? String(
                validDeal?.id ??
                  "",
              ).trim()
            : undefined;

        /* ==================================================
           ADD TO CART
        ================================================== */

        try {
          const result =
            addToCart({
              id: productId,

              name: productName,

              /*
               * Original price.
               */
              price:
                originalPrice,

              /*
               * Actual customer price.
               */
              unitPrice,

              image:
                String(
                  product.thumbnail ??
                    "",
                ).trim(),

              quantity: 1,

              ...(hasDiscount
                ? {
                    discountPercentage,

                    discountedPrice,

                    dealId,
                  }
                : {}),

              storeId:
                String(
                  product.storeId ??
                    "",
                ).trim(),

              sellerId:
                normalizedWorkerId,

              workerId:
                normalizedWorkerId,
            });

          /* ==================================================
             RESULT
          ================================================== */

          switch (result) {
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
                  `${productName} quantity has been increased.`,
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
        } catch (error) {
          console.error(
            "ADD PRODUCT TO CART ERROR:",
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
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        style={
          styles.container
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={() =>
              router.back()
            }
            style={
              styles.backButton
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color="#0F172A"
            />
          </Pressable>

          <View
            style={
              styles.headerText
            }
          >
            <AppText
              weight="bold"
              style={
                styles.title
              }
            >
              Worker Store
            </AppText>

            <AppText
              style={
                styles.subtitle
              }
            >
              Available products
            </AppText>
          </View>
        </View>

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading store...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <SafeAreaView
      style={
        styles.container
      }
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={
          styles.header
        }
      >
        <Pressable
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#0F172A"
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            Worker Store
          </AppText>

          <AppText
            style={
              styles.subtitle
            }
          >
            {products.length}{" "}
            {products.length === 1
              ? "product"
              : "products"}{" "}
            available
          </AppText>
        </View>
      </View>

      {/* ========================================================
          PRODUCT LIST
      ======================================================== */}

      <FlatList
        data={products}
        keyExtractor={(item) =>
          String(item.id)
        }
        numColumns={2}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
        columnWrapperStyle={
          styles.row
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
          />
        }
        renderItem={({
          item,
        }) => {
          const activeDeal =
            item.activeDeal;

          const originalPrice =
            getOriginalPrice(
              item,
            );

          const hasDeal =
            Boolean(
              getValidDeal(
                item,
                activeDeal,
              ),
            );

          const discountPercentage =
            hasDeal
              ? Number(
                  activeDeal
                    ?.discountPercentage,
                )
              : undefined;

          const discountedPrice =
            hasDeal
              ? Number(
                  activeDeal
                    ?.discountedPrice,
                )
              : undefined;

          return (
            <View
              style={
                styles.productWrapper
              }
            >
              <ProductCard
                id={String(
                  item.id,
                )}
                name={String(
                  item.name ??
                    "Unnamed product",
                )}
                price={
                  originalPrice
                }
                image={
                  String(
                    item.thumbnail ??
                      "",
                  )
                }
                category={
                  String(
                    item.category ??
                      "",
                  )
                }
                stock={Number(
                  item.stock,
                )}
                featured={Boolean(
                  item.featured,
                )}
                discountPercentage={
                  discountPercentage
                }
                discountedPrice={
                  discountedPrice
                }
                onPress={() =>
                  handleProductPress(
                    String(
                      item.id,
                    ),
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
        }}
        ListEmptyComponent={
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
              <Ionicons
                name="storefront-outline"
                size={42}
                color="#94A3B8"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.emptyTitle
              }
            >
              Store is Empty
            </AppText>

            <AppText
              center
              style={
                styles.emptyText
              }
            >
              This worker has no
              available products at
              the moment.
            </AppText>
          </View>
        }
      />
    </SafeAreaView>
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

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 16,

      paddingTop: 12,

      paddingBottom: 16,

      backgroundColor:
        "#F8FAFC",
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius: 22,

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        "#E2E8F0",
    },

    headerText: {
      flex: 1,

      marginLeft: 12,
    },

    title: {
      fontSize: 23,

      color:
        "#0F172A",
    },

    subtitle: {
      marginTop: 3,

      fontSize: 13,

      color:
        "#64748B",
    },

    /* ==========================================================
       LIST
    ========================================================== */

    list: {
      paddingHorizontal: 16,

      paddingBottom: 30,
    },

    row: {
      justifyContent:
        "space-between",

      marginBottom: 14,
    },

    /* ==========================================================
       PRODUCT WRAPPER
       
       ProductCard owns the complete
       card design.
    ========================================================== */

    productWrapper: {
      width: "48.2%",
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loadingContainer: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,

      fontSize: 14,

      color:
        "#64748B",
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      flex: 1,

      alignItems:
        "center",

      paddingHorizontal: 35,

      paddingTop: 100,
    },

    emptyIcon: {
      width: 88,

      height: 88,

      borderRadius: 28,

      backgroundColor:
        "#E2E8F0",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 16,

      fontSize: 20,

      color:
        "#0F172A",
    },

    emptyText: {
      marginTop: 7,

      fontSize: 14,

      lineHeight: 21,

      color:
        "#64748B",
    },
  });