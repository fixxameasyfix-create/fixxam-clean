import React, {
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import deleteProduct from "@/services/products/deleteProduct";

import {
  AppText,
} from "@/components/ui";

import useWorkerProducts from "@/hooks/worker/useWorkerProducts";

import ProductCard from "./ProductCard";

import ProductPopupMenu from "../products/ProductPopupMenu";
import ProductDeleteDialog from "../products/ProductDeleteDialog";

import {
  MenuAnchor,
} from "../products/ProductPopupMenu/ProductPopupMenu.types";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  /**
   * Home:
   * limit={4}
   *
   * My Products:
   * omit limit to show all products.
   */
  limit?: number;

  /**
   * Show section header.
   */
  showSeeAll?: boolean;
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeNumber(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const cleaned =
      value
        .replace(/[₦,\s]/g, "")
        .trim();

    if (!cleaned) {
      return 0;
    }

    const parsed =
      Number(cleaned);

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  return 0;
}

function getSafeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return value.trim();
  }

  return fallback;
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function ProductList({
  limit,
  showSeeAll = true,
}: Props) {
  const {
    loading,
    products,
  } = useWorkerProducts();

  /* ============================================================
     POPUP MENU
  ============================================================ */

  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  const [
    menuAnchor,
    setMenuAnchor,
  ] = useState<MenuAnchor | null>(
    null,
  );

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<string | null>(
    null,
  );

  /* ============================================================
     DELETE
  ============================================================ */

  const [
    showDeleteDialog,
    setShowDeleteDialog,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* ============================================================
     VISIBLE PRODUCTS
  ============================================================ */

  const visibleProducts =
    typeof limit === "number"
      ? products.slice(
          0,
          Math.min(
            4,
            Math.max(
              0,
              Math.floor(limit),
            ),
          ),
        )
      : products.slice(0, 4);

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
        <AppText>
          Loading products...
        </AppText>
      </View>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  if (
    products.length === 0
  ) {
    return (
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
          No Products Yet
        </AppText>

        <AppText
          style={
            styles.emptyText
          }
        >
          Add your first product to{" "}
          start selling.
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add product"
          onPress={() =>
            router.push(
              "/(worker)/products/add",
            )
          }
          style={({ pressed }) => [
            styles.addButton,
            pressed &&
              styles.buttonPressed,
          ]}
        >
          <AppText
            weight="bold"
            style={
              styles.addButtonText
            }
          >
            Add Product
          </AppText>
        </Pressable>
      </View>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <>
      {/* ========================================================
          HEADER
      ======================================================== */}

      {showSeeAll && (
        <View
          style={
            styles.header
          }
        >
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
              My Products
            </AppText>

            <AppText
              style={
                styles.subtitle
              }
            >
              Manage your products
            </AppText>
          </View>

          <Pressable
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="See all products"
            accessibilityHint="Opens all products"
            onPress={() => {
              router.push(
                "/(worker)/(tabs)/my-products",
              );
            }}
            style={({ pressed }) => [
              styles.seeAllButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <AppText
              weight="bold"
              style={
                styles.seeAll
              }
            >
              See All
            </AppText>

            <AppText
              weight="bold"
              style={
                styles.seeAllArrow
              }
            >
              ›
            </AppText>
          </Pressable>
        </View>
      )}

      {/* ========================================================
          PRODUCT GRID
      ======================================================== */}

      <View
        style={
          styles.productsGrid
        }
      >
        {visibleProducts.map(
          (item) => {
            /* ==================================================
               ID
            ================================================== */

            const productId =
              getSafeString(
                item?.id,
              );

            if (!productId) {
              return null;
            }

            /* ==================================================
               NAME
            ================================================== */

            const name =
              getSafeString(
                item?.name,
                "Unnamed Product",
              );

            /* ==================================================
               CATEGORY
            ================================================== */

            const category =
              getSafeString(
                item?.category,
                "Others",
              );

            /* ==================================================
               PRICE
            ================================================== */

            const price =
              Math.max(
                0,
                getSafeNumber(
                  item?.price,
                ),
              );

            /* ==================================================
               DISCOUNT
            ================================================== */

            const discountPercent =
              Math.min(
                99,
                Math.max(
                  0,
                  getSafeNumber(
                    item?.discountPercent,
                  ),
                ),
              );

            /* ==================================================
               DISCOUNTED PRICE
            ================================================== */

            const rawDiscountedPrice =
              getSafeNumber(
                item?.discountedPrice,
              );

            const discountedPrice =
              price > 0 &&
              discountPercent > 0 &&
              rawDiscountedPrice > 0 &&
              rawDiscountedPrice <
                price
                ? rawDiscountedPrice
                : undefined;

            /* ==================================================
               THUMBNAIL
            ================================================== */

            const thumbnail =
              getSafeString(
                item?.thumbnail,
              ) || undefined;

            /* ==================================================
               STOCK
            ================================================== */

            const stock =
              Math.max(
                0,
                Math.floor(
                  getSafeNumber(
                    item?.stock,
                  ),
                ),
              );

            /* ==================================================
               CARD
            ================================================== */

            return (
              <View
                key={
                  productId
                }
                style={
                  styles.cardWrapper
                }
              >
                <ProductCard
                  title={
                    name
                  }
                  category={
                    category
                  }
                  price={
                    price
                  }
                  discountPercent={
                    discountPercent
                  }
                  discountedPrice={
                    discountedPrice
                  }
                  thumbnail={
                    thumbnail
                  }
                  stock={
                    stock
                  }
                  onPress={() =>
                    router.push({
                      pathname:
                        "/(worker)/products/[id]",
                      params: {
                        id:
                          productId,
                      },
                    })
                  }
                  onMore={(
                    anchor,
                  ) => {
                    setSelectedProduct(
                      productId,
                    );

                    setMenuAnchor(
                      anchor,
                    );

                    setMenuVisible(
                      true,
                    );
                  }}
                />
              </View>
            );
          },
        )}
      </View>

      {/* ========================================================
          POPUP MENU
      ======================================================== */}

      <ProductPopupMenu
        visible={
          menuVisible
        }
        anchor={
          menuAnchor
        }
        onClose={() => {
          if (deleting) {
            return;
          }

          setMenuVisible(
            false,
          );

          setMenuAnchor(
            null,
          );
        }}
        onEdit={() => {
          if (
            !selectedProduct
          ) {
            return;
          }

          const productId =
            selectedProduct;

          setMenuVisible(
            false,
          );

          setMenuAnchor(
            null,
          );

          router.push({
            pathname:
              "/(worker)/products/edit/[id]",
            params: {
              id:
                productId,
            },
          });
        }}
        onDuplicate={() => {
          const productId =
            selectedProduct;

          setMenuVisible(
            false,
          );

          setMenuAnchor(
            null,
          );

          if (!productId) {
            return;
          }

          console.log(
            "Duplicate product:",
            productId,
          );
        }}
        onShare={() => {
          const productId =
            selectedProduct;

          setMenuVisible(
            false,
          );

          setMenuAnchor(
            null,
          );

          if (!productId) {
            return;
          }

          console.log(
            "Share product:",
            productId,
          );
        }}
        onDelete={() => {
          if (
            !selectedProduct
          ) {
            return;
          }

          setMenuVisible(
            false,
          );

          setMenuAnchor(
            null,
          );

          setShowDeleteDialog(
            true,
          );
        }}
      />

      {/* ========================================================
          DELETE DIALOG
      ======================================================== */}

      <ProductDeleteDialog
        visible={
          showDeleteDialog
        }
        loading={
          deleting
        }
        onCancel={() => {
          if (deleting) {
            return;
          }

          setShowDeleteDialog(
            false,
          );
        }}
        onConfirm={async () => {
          if (
            !selectedProduct ||
            deleting
          ) {
            return;
          }

          try {
            setDeleting(
              true,
            );

            await deleteProduct(
              selectedProduct,
            );

            setShowDeleteDialog(
              false,
            );

            setMenuVisible(
              false,
            );

            setMenuAnchor(
              null,
            );

            setSelectedProduct(
              null,
            );
          } catch (error) {
            console.error(
              "FIXXAM_PRODUCT_DELETE_ERROR:",
              error,
            );
          } finally {
            setDeleting(
              false,
            );
          }
        }}
      />
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       LOADING
    ========================================================== */

    loading: {
      minHeight: 180,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      width: "100%",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      paddingVertical:
        40,

      paddingHorizontal:
        24,

      alignItems:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity:
        0.05,

      shadowRadius:
        12,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 4,
    },

    emptyTitle: {
      fontSize: 22,

      color:
        "#0F172A",

      marginBottom:
        10,
    },

    emptyText: {
      fontSize: 15,

      color:
        "#64748B",

      textAlign:
        "center",

      lineHeight: 22,

      marginBottom:
        22,
    },

    /* ==========================================================
       ADD BUTTON
    ========================================================== */

    addButton: {
      minHeight: 52,

      paddingHorizontal:
        28,

      borderRadius: 16,

      backgroundColor:
        "#FF6B00",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    buttonPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    addButtonText: {
      color:
        "#FFFFFF",

      fontSize: 15,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom: 14,
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      fontSize: 24,

      lineHeight: 29,

      color:
        "#111827",
    },

    subtitle: {
      marginTop: 2,

      fontSize: 14,

      lineHeight: 20,

      color:
        "#94A3B8",
    },

    /* ==========================================================
       SEE ALL
    ========================================================== */

    seeAllButton: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical: 8,

      paddingLeft: 10,

      paddingRight: 2,

      marginLeft: 12,
    },

    seeAll: {
      fontSize: 15,

      color:
        "#F97316",
    },

    seeAllArrow: {
      marginLeft: 2,

      fontSize: 22,

      lineHeight: 22,

      color:
        "#F97316",
    },

    pressed: {
      opacity: 0.65,
    },

    /* ==========================================================
       PRODUCT GRID
    ========================================================== */

    productsGrid: {
      width: "100%",

      flexDirection: "row",

      flexWrap: "wrap",

      alignItems: "flex-start",

      justifyContent:
        "flex-start",

      columnGap: 12,

      rowGap: 14,
    },

    /* ==========================================================
       PRODUCT CARD
    ========================================================== */

    cardWrapper: {
      width: 156,

      flexShrink: 0,
    },
  });