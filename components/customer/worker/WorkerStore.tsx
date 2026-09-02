import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import Toast from "react-native-toast-message";

import { AppText } from "@/components/ui";

import ProductCard from "@/components/customer/market/ProductCard";

import { useCart } from "@/contexts/CartContext";

import { getWorkerProducts } from "@/firebase/queries/products";

import getActiveProductDeals, {
  type ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import { Product } from "@/types/product";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workerId: string;
};

type ProductWithDeal = Product & {
  activeDeal: ActiveProductDeal | null;
};

/* ==============================================================
   HELPERS
============================================================== */

/**
 * Returns a valid positive product price.
 */
function getOriginalPrice(
  product: Product,
): number {
  const price = Number(
    product.price,
  );

  return Number.isFinite(price) &&
    price > 0
    ? price
    : 0;
}

/**
 * Validates an active deal against
 * the product's original price.
 */
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

/**
 * Gets the actual customer price.
 */
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
   COMPONENT
============================================================== */

export default function WorkerStore({
  workerId,
}: Props) {
  const [
    products,
    setProducts,
  ] = useState<
    ProductWithDeal[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const {
    addToCart,
  } = useCart();

  /* ============================================================
     LOAD PRODUCTS + ACTIVE DEALS
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadProducts =
      async () => {
        const normalizedWorkerId =
          String(
            workerId ?? "",
          ).trim();

        if (!normalizedWorkerId) {
          if (mounted) {
            setProducts([]);
            setLoading(false);
          }

          return;
        }

        try {
          setLoading(true);

          const snapshot =
            await getWorkerProducts(
              normalizedWorkerId,
            );

          if (!mounted) {
            return;
          }

          /* ==================================================
             MAP FIREBASE PRODUCTS
          ================================================== */

          const workerProducts =
            snapshot.docs
              .map(
                (document) =>
                  ({
                    id: document.id,
                    ...document.data(),
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
             EMPTY STORE
          ================================================== */

          if (
            workerProducts.length ===
            0
          ) {
            setProducts([]);
            return;
          }

          /* ==================================================
             PRODUCT IDS
          ================================================== */

          const productIds =
            workerProducts
              .map(
                (product) =>
                  String(
                    product.id ?? "",
                  ).trim(),
              )
              .filter(Boolean);

          /* ==================================================
             LOAD ACTIVE DEALS
          ================================================== */

          const dealsByProductId =
            await getActiveProductDeals(
              productIds,
            );

          if (!mounted) {
            return;
          }

          /* ==================================================
             MERGE PRODUCTS + DEALS
          ================================================== */

          const productsWithDeals =
            workerProducts.map(
              (product) => {
                const productId =
                  String(
                    product.id ?? "",
                  ).trim();

                const deal =
                  dealsByProductId.get(
                    productId,
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
            "FAILED TO LOAD WORKER STORE:",
            error,
          );

          if (mounted) {
            setProducts([]);

            Toast.show({
              type: "error",
              text1:
                "Unable to load store",
              text2:
                "Please try again later.",
            });
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, [workerId]);

  /* ============================================================
     PRODUCT DETAILS
  ============================================================ */

  const handleProductPress =
    useCallback(
      (productId: string) => {
        const normalizedId =
          String(
            productId ?? "",
          ).trim();

        if (!normalizedId) {
          return;
        }

        router.push({
          pathname:
            "/(customer)/product/[id]",
          params: {
            id: normalizedId,
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
        product: ProductWithDeal,
      ) => {
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
          !Number.isFinite(
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

        const worker =
          String(
            product.workerId ??
              workerId ??
              "",
          ).trim();

        if (!worker) {
          Toast.show({
            type: "error",
            text1:
              "Worker unavailable",
            text2:
              "This product has no assigned worker.",
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
           ACTIVE DEAL
        ================================================== */

        const activeDeal =
          getValidDeal(
            product,
            product.activeDeal,
          );

        /* ==================================================
           UNIT PRICE
        ================================================== */

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
           DEAL DATA
        ================================================== */

        const hasDiscount =
          Boolean(activeDeal);

        const dealId =
          hasDiscount
            ? String(
                activeDeal?.id ??
                  "",
              ).trim()
            : "";

        const discountPercentage =
          hasDiscount
            ? Number(
                activeDeal
                  ?.discountPercentage,
              )
            : 0;

        /* ==================================================
           CART
        ================================================== */

        try {
          const result =
            addToCart({
              id: productId,

              name: productName,

              /*
               * Original product price.
               */
              price:
                originalPrice,

              /*
               * Actual customer price.
               */
              unitPrice,

              image: String(
                product.thumbnail ??
                  "",
              ).trim(),

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

              storeId: String(
                product.storeId ??
                  "",
              ).trim(),

              sellerId: worker,

              workerId: worker,
            });

          /* ==================================================
             CART RESULT
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
     VIEW ALL
  ============================================================ */

  const handleViewAll =
    useCallback(() => {
      const normalizedWorkerId =
        String(
          workerId ?? "",
        ).trim();

      if (!normalizedWorkerId) {
        return;
      }

      router.push({
        pathname:
          "/(customer)/worker-store/worker-store",
        params: {
          workerId:
            normalizedWorkerId,
        },
      });
    }, [workerId]);

  /* ============================================================
     PRODUCT COUNT
  ============================================================ */

  const productCount =
    products.length;

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View
        style={
          styles.container
        }
      >
        <Header
          count={undefined}
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
      </View>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  if (productCount === 0) {
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
      {/* ========================================================
          HEADER
      ======================================================== */}

      <Header
        count={productCount}
        onViewAll={
          handleViewAll
        }
      />

      {/* ========================================================
          PRODUCTS
      ======================================================== */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.productList
        }
      >
        {products.map(
          (product) => {
            const activeDeal =
              product.activeDeal;

            return (
              <View
                key={
                  product.id
                }
                style={
                  styles.productCard
                }
              >
                <ProductCard
                  id={
                    String(
                      product.id,
                    )
                  }
                  name={String(
                    product.name ??
                      "Unnamed product",
                  )}
                  price={getOriginalPrice(
                    product,
                  )}
                  image={
                    product.thumbnail ??
                    ""
                  }
                  category={
                    product.category ??
                    ""
                  }
                  stock={Number(
                    product.stock,
                  )}
                  featured={Boolean(
                    product.featured,
                  )}
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
                      String(
                        product.id,
                      ),
                    )
                  }
                  onBuyPress={() =>
                    handleAddToCart(
                      product,
                    )
                  }
                />
              </View>
            );
          },
        )}
      </ScrollView>
    </View>
  );
}

/* ==============================================================
   HEADER
============================================================== */

function Header({
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
      {/* ========================================================
          HEADER LEFT
      ======================================================== */}

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
          <Ionicons
            name="storefront-outline"
            size={21}
            color="#2563EB"
          />
        </View>

        <View
          style={
            styles.headerContent
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
            numberOfLines={1}
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

      {/* ========================================================
          VIEW ALL
      ======================================================== */}

      <Pressable
        onPress={onViewAll}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="View all worker products"
      >
        <AppText
          weight="bold"
          style={
            styles.viewAll
          }
        >
          View All
        </AppText>
      </Pressable>
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
      marginTop: 18,

      marginBottom: 18,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      paddingHorizontal: 16,

      marginBottom: 12,

      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",
    },

    headerLeft: {
      flex: 1,

      flexDirection: "row",

      alignItems: "center",

      marginRight: 12,
    },

    headerContent: {
      flex: 1,
    },

    iconBox: {
      width: 42,

      height: 42,

      borderRadius: 13,

      backgroundColor:
        "#EFF6FF",

      alignItems: "center",

      justifyContent:
        "center",

      marginRight: 10,
    },

    title: {
      fontSize: 18,

      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,

      fontSize: 12,

      color: "#64748B",
    },

    viewAll: {
      fontSize: 13,

      color: "#2563EB",
    },

    /* ==========================================================
       PRODUCT LIST
    ========================================================== */

    productList: {
      paddingHorizontal: 16,

      paddingRight: 4,
    },

    /* ==========================================================
       PRODUCT CARD WRAPPER
    ========================================================== */

    productCard: {
      width: 190,

      marginRight: 12,
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loading: {
      minHeight: 100,

      alignItems: "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 8,

      fontSize: 12,

      color: "#64748B",
    },
  });