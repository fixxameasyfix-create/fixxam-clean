import React, {
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import deleteProduct from "@/services/products/deleteProduct";

import useWorkerProducts from "@/hooks/worker/useWorkerProducts";

import ProductCard from "./ProductCard";

import ProductPopupMenu from "../products/ProductPopupMenu";
import ProductDeleteDialog from "../products/ProductDeleteDialog";

import {
  MenuAnchor,
} from "../products/ProductPopupMenu/ProductPopupMenu.types";

/* ==============================================================
   HELPERS
============================================================== */

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

/* ==============================================================
   COMPONENT
============================================================== */

export default function MyProducts() {
  const {
    loading,
    products,
  } =
    useWorkerProducts();

  /* ============================================================
     MENU
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
     CLOSE MENU
  ============================================================ */

  const closeMenu = () => {
    if (deleting) {
      return;
    }

    setMenuVisible(false);
    setMenuAnchor(null);
  };

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
            My Products
          </AppText>
        </View>

        <View
          style={
            styles.loadingCard
          }
        >
          <Ionicons
            name="cube-outline"
            size={30}
            color="#CBD5E1"
          />

          <AppText
            style={
              styles.loadingText
            }
          >
            Loading products...
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <>
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

            {products.length >
              0 && (
              <AppText
                style={
                  styles.subtitle
                }
              >
                Manage your products
              </AppText>
            )}
          </View>

          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View all my products"
            accessibilityHint="Opens all products"
            onPress={() =>
              router.push(
                "/(worker)/products",
              )
            }
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

            <Ionicons
              name="chevron-forward"
              size={15}
              color="#FF6B00"
            />
          </Pressable>
        </View>

        {/* ======================================================
            EMPTY
        ====================================================== */}

        {products.length ===
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
              <Ionicons
                name="cube-outline"
                size={42}
                color="#CBD5E1"
              />
            </View>

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
                styles.emptyDescription
              }
            >
              Start selling by adding
              your first product.
            </AppText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add first product"
              onPress={() =>
                router.push(
                  "/(worker)/products/add",
                )
              }
              style={({ pressed }) => [
                styles.emptyButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="add"
                size={18}
                color="#FFFFFF"
              />

              <AppText
                weight="bold"
                style={
                  styles.emptyButtonText
                }
              >
                Add First Product
              </AppText>
            </Pressable>
          </View>
        ) : (
          /* ====================================================
             PRODUCTS
          ==================================================== */

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            bounces
            decelerationRate="fast"
            contentContainerStyle={
              styles.productsContent
            }
          >
            {products
              .slice(0, 3)
              .map(
                (product) => {
                  /*
                   * useWorkerProducts currently exposes
                   * product fields too narrowly in some
                   * TypeScript paths.
                   *
                   * Normalize the runtime object here.
                   */
                  const item =
                    product as unknown as Record<
                      string,
                      unknown
                    >;

                  /* ============================================
                     ID
                  ============================================ */

                  const productId =
                    getSafeString(
                      item.id,
                    );

                  if (!productId) {
                    return null;
                  }

                  /* ============================================
                     NAME
                  ============================================ */

                  const name =
                    getSafeString(
                      item.name,
                      "Unnamed Product",
                    );

                  /* ============================================
                     CATEGORY
                  ============================================ */

                  const category =
                    getSafeString(
                      item.category,
                      "Others",
                    );

                  /* ============================================
                     PRICE
                  ============================================ */

                  const price =
                    Math.max(
                      0,
                      getSafeNumber(
                        item.price,
                      ),
                    );

                  /* ============================================
                     DISCOUNT
                  ============================================ */

                  const rawDiscount =
                    getSafeNumber(
                      item.discountPercent,
                    );

                  const discountPercent =
                    Math.min(
                      99,
                      Math.max(
                        0,
                        rawDiscount,
                      ),
                    );

                  /* ============================================
                     DISCOUNTED PRICE
                  ============================================ */

                  const rawDiscountedPrice =
                    getSafeNumber(
                      item.discountedPrice,
                    );

                  const discountedPrice =
                    price > 0 &&
                    discountPercent > 0 &&
                    rawDiscountedPrice >
                      0 &&
                    rawDiscountedPrice <
                      price
                      ? rawDiscountedPrice
                      : undefined;

                  /* ============================================
                     THUMBNAIL
                  ============================================ */

                  const thumbnail =
                    getSafeString(
                      item.thumbnail,
                    ) ||
                    undefined;

                  /* ============================================
                     STOCK
                  ============================================ */

                  const stock =
                    Math.max(
                      0,
                      Math.floor(
                        getSafeNumber(
                          item.stock,
                        ),
                      ),
                    );

                  /* ============================================
                     CARD
                  ============================================ */

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

            {/* ==================================================
                ADD PRODUCT
            ================================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add new product"
              onPress={() =>
                router.push(
                  "/(worker)/products/add",
                )
              }
              style={({ pressed }) => [
                styles.addCard,
                pressed &&
                  styles.addCardPressed,
              ]}
            >
              <View
                style={
                  styles.addIcon
                }
              >
                <Ionicons
                  name="add"
                  size={28}
                  color="#64748B"
                />
              </View>

              <AppText
                weight="bold"
                style={
                  styles.addText
                }
              >
                Add Product
              </AppText>

              <AppText
                style={
                  styles.addSubtext
                }
              >
                Create new
              </AppText>
            </Pressable>
          </ScrollView>
        )}
      </View>

      {/* ========================================================
          PRODUCT MENU
      ======================================================== */}

      <ProductPopupMenu
        visible={
          menuVisible
        }
        anchor={
          menuAnchor
        }
        onClose={
          closeMenu
        }
        onEdit={() => {
          if (
            !selectedProduct
          ) {
            return;
          }

          const productId =
            selectedProduct;

          closeMenu();

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

          closeMenu();

          if (!productId) {
            return;
          }

          /*
           * Keep existing duplicate
           * behaviour.
           *
           * Connect duplicateProduct()
           * here when the service is ready.
           */
          console.log(
            "Duplicate product:",
            productId,
          );
        }}
        onShare={() => {
          const productId =
            selectedProduct;

          closeMenu();

          if (!productId) {
            return;
          }

          /*
           * Keep existing share
           * behaviour.
           *
           * Connect native Share API
           * here when required.
           */
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

          closeMenu();

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
       CONTAINER
    ========================================================== */

    container: {
      marginTop: 24,
      marginBottom: 40,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
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
      fontSize: 22,
      lineHeight: 27,
      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,
      color: "#94A3B8",
      fontSize: 11,
      lineHeight: 15,
    },

    /* ==========================================================
       SEE ALL
    ========================================================== */

    seeAllButton: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 2,

      paddingVertical: 6,
      paddingHorizontal: 4,
    },

    seeAll: {
      color: "#FF6B00",
      fontSize: 14,
    },

    pressed: {
      opacity: 0.65,
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loadingCard: {
      height: 170,

      borderRadius: 22,

      backgroundColor:
        "#FFFFFF",

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    loadingText: {
      marginTop: 8,

      color:
        "#64748B",

      fontSize: 13,
    },

    /* ==========================================================
       PRODUCTS
    ========================================================== */

    productsContent: {
      paddingLeft: 0,

      paddingRight: 8,

      gap: 12,
    },

    cardWrapper: {
      width: 156,

      flexShrink: 0,
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 22,

      paddingHorizontal: 20,

      paddingVertical: 32,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    emptyIcon: {
      width: 78,
      height: 78,

      borderRadius: 24,

      backgroundColor:
        "#F8FAFC",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 14,

      fontSize: 20,

      color:
        "#0F172A",
    },

    emptyDescription: {
      marginTop: 6,

      color:
        "#64748B",

      textAlign:
        "center",

      fontSize: 13,

      lineHeight: 20,
    },

    /* ==========================================================
       EMPTY BUTTON
    ========================================================== */

    emptyButton: {
      marginTop: 18,

      minHeight: 44,

      paddingHorizontal: 18,

      borderRadius: 14,

      backgroundColor:
        "#FF6B00",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 7,
    },

    emptyButtonText: {
      color:
        "#FFFFFF",

      fontSize: 13,
    },

    buttonPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    /* ==========================================================
       ADD PRODUCT
    ========================================================== */

    addCard: {
      width: 156,

      height: 241,

      flexShrink: 0,

      borderRadius: 18,

      backgroundColor:
        "#FFFFFF",

      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        "#CBD5E1",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    addCardPressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },

    addIcon: {
      width: 50,

      height: 50,

      borderRadius: 16,

      backgroundColor:
        "#F1F5F9",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    addText: {
      marginTop: 10,

      color:
        "#334155",

      fontSize: 13,
    },

    addSubtext: {
      marginTop: 3,

      color:
        "#94A3B8",

      fontSize: 10,
    },
  });