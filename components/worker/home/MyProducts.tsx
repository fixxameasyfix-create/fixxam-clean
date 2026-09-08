import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
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

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import deleteProduct from "@/services/products/deleteProduct";

import useWorkerProducts from "@/hooks/worker/useWorkerProducts";

import ProductCard from "./ProductCard";

import ProductPopupMenu from "../products/ProductPopupMenu";

import ProductDeleteDialog from "../products/ProductDeleteDialog";

import type {
  MenuAnchor,
} from "../products/ProductPopupMenu/ProductPopupMenu.types";

/* ==============================================================
   TYPES
============================================================== */

type HomeProduct = {
  id: string;

  name: string;

  category: string;

  price: number;

  discountPercent: number;

  discountedPrice?: number;

  thumbnail?: string;

  stock: number;
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value === "string" &&
    value.trim()
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
        .replace(
          /[₦,\s]/g,
          "",
        )
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

function MyProducts() {
  const {
    loading,
    products,
  } =
    useWorkerProducts();

  /* ============================================================
     NORMALIZE HOME PRODUCTS
  ============================================================ */

  const recentProducts =
    useMemo<HomeProduct[]>(() => {
      if (
        !Array.isArray(
          products,
        )
      ) {
        return [];
      }

      const result: HomeProduct[] =
        [];

      for (
        const product of products
      ) {
        if (
          result.length >= 3
        ) {
          break;
        }

        /*
         * Some current useWorkerProducts typings
         * expose fewer fields than the runtime object.
         */
        const item =
          product as unknown as Record<
            string,
            unknown
          >;

        const id =
          getSafeString(
            item.id,
          );

        if (!id) {
          continue;
        }

        const name =
          getSafeString(
            item.name,
            "Unnamed Product",
          );

        const category =
          getSafeString(
            item.category,
            "Others",
          );

        const price =
          Math.max(
            0,
            getSafeNumber(
              item.price,
            ),
          );

        const discountPercent =
          Math.min(
            99,
            Math.max(
              0,
              getSafeNumber(
                item.discountPercent,
              ),
            ),
          );

        const rawDiscountedPrice =
          getSafeNumber(
            item.discountedPrice,
          );

        const discountedPrice =
          price > 0 &&
          discountPercent > 0 &&
          rawDiscountedPrice > 0 &&
          rawDiscountedPrice < price
            ? rawDiscountedPrice
            : undefined;

        const thumbnail =
          getSafeString(
            item.thumbnail,
          ) || undefined;

        const stock =
          Math.max(
            0,
            Math.floor(
              getSafeNumber(
                item.stock,
              ),
            ),
          );

        result.push({
          id,
          name,
          category,
          price,
          discountPercent,
          discountedPrice,
          thumbnail,
          stock,
        });
      }

      return result;
    }, [
      products,
    ]);

  /* ============================================================
     MENU
  ============================================================ */

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  const [
    menuAnchor,
    setMenuAnchor,
  ] =
    useState<MenuAnchor | null>(
      null,
    );

  const [
    selectedProduct,
    setSelectedProduct,
  ] =
    useState<string | null>(
      null,
    );

  /* ============================================================
     DELETE
  ============================================================ */

  const [
    showDeleteDialog,
    setShowDeleteDialog,
  ] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const deletingRef =
    useRef(false);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleViewAll =
    useCallback(() => {
      router.push(
        "/(worker)/products",
      );
    }, []);

  const handleAddProduct =
    useCallback(() => {
      router.push(
        "/(worker)/products/add",
      );
    }, []);

  const handleProductPress =
    useCallback(
      (
        productId: string,
      ) => {
        const id =
          productId.trim();

        if (!id) {
          return;
        }

        router.push({
          pathname:
            "/(worker)/products/[id]",

          params: {
            id,
          },
        });
      },
      [],
    );

  /* ============================================================
     MENU
  ============================================================ */

  const handleOpenMenu =
    useCallback(
      (
        productId: string,
        anchor: MenuAnchor,
      ) => {
        const id =
          productId.trim();

        if (
          !id ||
          deletingRef.current
        ) {
          return;
        }

        setSelectedProduct(
          id,
        );

        setMenuAnchor(
          anchor,
        );

        setMenuVisible(
          true,
        );
      },
      [],
    );

  const closeMenu =
    useCallback(() => {
      if (
        deletingRef.current
      ) {
        return;
      }

      setMenuVisible(
        false,
      );

      setMenuAnchor(
        null,
      );
    }, []);

  /* ============================================================
     EDIT
  ============================================================ */

  const handleEdit =
    useCallback(() => {
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
    }, [
      closeMenu,
      selectedProduct,
    ]);

  /* ============================================================
     DUPLICATE
  ============================================================ */

  const handleDuplicate =
    useCallback(() => {
      const productId =
        selectedProduct;

      closeMenu();

      if (!productId) {
        return;
      }

      Toast.show({
        type: "info",
        text1:
          "Duplicate unavailable",
        text2:
          "Product duplication is not available yet.",
      });

      setSelectedProduct(
        null,
      );
    }, [
      closeMenu,
      selectedProduct,
    ]);

  /* ============================================================
     SHARE
  ============================================================ */

  const handleShare =
    useCallback(() => {
      const productId =
        selectedProduct;

      closeMenu();

      if (!productId) {
        return;
      }

      Toast.show({
        type: "info",
        text1:
          "Share unavailable",
        text2:
          "Product sharing is not available yet.",
      });

      setSelectedProduct(
        null,
      );
    }, [
      closeMenu,
      selectedProduct,
    ]);

  /* ============================================================
     DELETE
  ============================================================ */

  const handleOpenDelete =
    useCallback(() => {
      if (
        !selectedProduct ||
        deletingRef.current
      ) {
        return;
      }

      closeMenu();

      setShowDeleteDialog(
        true,
      );
    }, [
      closeMenu,
      selectedProduct,
    ]);

  const handleCancelDelete =
    useCallback(() => {
      if (
        deletingRef.current
      ) {
        return;
      }

      setShowDeleteDialog(
        false,
      );
    }, []);

  const handleConfirmDelete =
    useCallback(async () => {
      if (
        !selectedProduct ||
        deletingRef.current
      ) {
        return;
      }

      const productId =
        selectedProduct;

      deletingRef.current =
        true;

      setDeleting(
        true,
      );

      try {
        await deleteProduct(
          productId,
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

        Toast.show({
          type: "success",
          text1:
            "Product deleted",
          text2:
            "The product has been removed successfully.",
        });
      } catch (error) {
        console.error(
          "FIXXAM_PRODUCT_DELETE_ERROR:",
          error,
        );

        Toast.show({
          type: "error",
          text1:
            "Unable to delete product",
          text2:
            "Please check your connection and try again.",
        });
      } finally {
        deletingRef.current =
          false;

        setDeleting(
          false,
        );
      }
    }, [
      selectedProduct,
    ]);

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
            variant="heading2"
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
          accessibilityRole="progressbar"
          accessibilityLabel="Loading products"
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <ActivityIndicator
              size="large"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            center
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
              variant="heading2"
              weight="bold"
              style={
                styles.title
              }
            >
              My Products
            </AppText>

            {products.length >
            0 ? (
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.subtitle
                }
              >
                Manage your products
              </AppText>
            ) : null}
          </View>

          <Pressable
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="View all my products"
            accessibilityHint="Opens all products"
            onPress={
              handleViewAll
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
              role="worker"
              size="xs"
              color={
                WorkerColors.primary
              }
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
              <AppIcon
                name="package"
                role="worker"
                size="xl"
                color={
                  WorkerColors.primary
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
              No Products Yet
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyDescription
              }
            >
              Start selling by adding your first product.
            </AppText>

            <View
              style={
                styles.emptyAction
              }
            >
              <AppButton
                title="Add First Product"
                role="worker"
                variant="primary"
                leftIconName="add"
                onPress={
                  handleAddProduct
                }
              />
            </View>
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
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.productsContent
            }
          >
            {recentProducts.map(
              product => (
                <View
                  key={
                    product.id
                  }
                  style={
                    styles.cardWrapper
                  }
                >
                  <ProductCard
                    width={156}
                    title={
                      product.name
                    }
                    category={
                      product.category
                    }
                    price={
                      product.price
                    }
                    discountPercent={
                      product.discountPercent
                    }
                    discountedPrice={
                      product.discountedPrice
                    }
                    thumbnail={
                      product.thumbnail
                    }
                    stock={
                      product.stock
                    }
                    onPress={() => {
                      handleProductPress(
                        product.id,
                      );
                    }}
                    onMore={anchor => {
                      handleOpenMenu(
                        product.id,
                        anchor,
                      );
                    }}
                  />
                </View>
              ),
            )}

            {/* ==================================================
                ADD PRODUCT
            ================================================== */}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add new product"
              onPress={
                handleAddProduct
              }
              style={({
                pressed,
              }) => [
                styles.addCard,

                pressed
                  ? styles.addCardPressed
                  : null,
              ]}
            >
              <View
                style={
                  styles.addIcon
                }
              >
                <AppIcon
                  name="add"
                  role="worker"
                  size="md"
                  color={
                    WorkerColors.primary
                  }
                />
              </View>

              <AppText
                variant="bodyMedium"
                weight="bold"
                center
                style={
                  styles.addText
                }
              >
                Add Product
              </AppText>

              <AppText
                variant="caption"
                tone="secondary"
                center
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
        onEdit={
          handleEdit
        }
        onDuplicate={
          handleDuplicate
        }
        onShare={
          handleShare
        }
        onDelete={
          handleOpenDelete
        }
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
        onCancel={
          handleCancelDelete
        }
        onConfirm={
          handleConfirmDelete
        }
      />
    </>
  );
}

/* ==============================================================
   MEMO
============================================================== */

MyProducts.displayName =
  "MyProducts";

export default memo(
  MyProducts,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CONTAINER
    ========================================================== */

    container: {
      width: "100%",
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    /* ==========================================================
       SEE ALL
    ========================================================== */

    seeAllButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    seeAll: {
      color:
        WorkerColors.primary,
    },

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

    /* ==========================================================
       LOADING
    ========================================================== */

    loadingCard: {
      minHeight: 190,

      padding:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    loadingIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       PRODUCTS
    ========================================================== */

    productsContent: {
      paddingRight:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.md,
    },

    cardWrapper: {
      width: 156,

      flexShrink: 0,
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      width: "100%",

      minHeight: 260,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    emptyTitle: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    emptyDescription: {
      maxWidth: 290,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    emptyAction: {
      width: "100%",

      maxWidth: 240,

      marginTop:
        FixxamTokens.spacing.lg,
    },

    /* ==========================================================
       ADD PRODUCT
    ========================================================== */

    addCard: {
      width: 156,

      minHeight: 241,

      flexShrink: 0,

      padding:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderStyle:
        "dashed",

      borderColor:
        WorkerColors.primary,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    addCardPressed: {
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

    addIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    addText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    addSubtext: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },
  });