import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  View,
  useWindowDimensions,
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

import ProductCard from "../my-products/ProductCard";

import ProductPopupMenu from "../products/ProductPopupMenu";

import ProductDeleteDialog from "../products/ProductDeleteDialog";

import type {
  MenuAnchor,
} from "../products/ProductPopupMenu/ProductPopupMenu.types";

/* ==============================================================
   TYPES
============================================================== */

export type Product = {
  id: string;

  name: string;

  price: number | string;

  thumbnail?: string;

  category: string;

  stock?: number;

  discountPercent?: number | string;

  discountedPrice?: number | string;
};

type Props = {
  products: Product[];

  onProductPress: (
    id: string,
  ) => void;
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

/* ==============================================================
   COMPONENT
============================================================== */

export default function AllProductsGrid({
  products,
  onProductPress,
}: Props) {
  const {
    width: screenWidth,
  } = useWindowDimensions();

  /* ============================================================
     GRID
  ============================================================ */

  const columnGap =
    FixxamTokens.spacing.md;

  const horizontalPadding =
    FixxamTokens.spacing.lg *
    2;

  const cardWidth =
    useMemo(
      () =>
        Math.max(
          140,
          Math.floor(
            (
              screenWidth -
              horizontalPadding -
              columnGap
            ) / 2,
          ),
        ),
      [
        columnGap,
        horizontalPadding,
        screenWidth,
      ],
    );

  /* ============================================================
     VALID PRODUCTS
  ============================================================ */

  const validProducts =
    useMemo(
      () =>
        products.filter(
          product =>
            Boolean(
              getSafeString(
                product.id,
              ),
            ),
        ),
      [products],
    );

  /* ============================================================
     POPUP MENU
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
     OPEN MENU
  ============================================================ */

  const handleOpenMenu =
    useCallback(
      (
        productId: string,
        anchor: MenuAnchor,
      ) => {
        const normalizedProductId =
          productId.trim();

        if (
          !normalizedProductId ||
          deletingRef.current
        ) {
          return;
        }

        setSelectedProduct(
          normalizedProductId,
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

  /* ============================================================
     CLOSE MENU
  ============================================================ */

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
     ADD
  ============================================================ */

  const handleAddProduct =
    useCallback(() => {
      router.push(
        "/(worker)/products/add",
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
    }, [
      closeMenu,
      selectedProduct,
    ]);

  /* ============================================================
     OPEN DELETE
  ============================================================ */

  const handleDelete =
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

  /* ============================================================
     CANCEL DELETE
  ============================================================ */

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

  /* ============================================================
     CONFIRM DELETE
  ============================================================ */

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
     EMPTY
  ============================================================ */

  if (
    validProducts.length === 0
  ) {
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
            role="worker"
            size="xl"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <AppText
          variant="heading2"
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
            styles.emptyText
          }
        >
          Add your first product to start selling.
        </AppText>

        <View
          style={
            styles.emptyAction
          }
        >
          <AppButton
            title="Add Product"
            role="worker"
            variant="primary"
            leftIconName="add"
            onPress={
              handleAddProduct
            }
            style={
              styles.addButton
            }
          />
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
        style={[
          styles.grid,

          {
            columnGap,
          },
        ]}
      >
        {validProducts.map(
          item => {
            const productId =
              getSafeString(
                item.id,
              );

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
              rawDiscountedPrice <
                price
                ? rawDiscountedPrice
                : undefined;

            const thumbnail =
              getSafeString(
                item.thumbnail,
              ) ||
              undefined;

            const stock =
              Math.max(
                0,
                Math.floor(
                  getSafeNumber(
                    item.stock,
                  ),
                ),
              );

            return (
              <View
                key={
                  productId
                }
                style={[
                  styles.cardWrapper,

                  {
                    width:
                      cardWidth,
                  },
                ]}
              >
                <ProductCard
                  width={
                    cardWidth
                  }
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
                  onPress={() => {
                    onProductPress(
                      productId,
                    );
                  }}
                  onMore={anchor => {
                    handleOpenMenu(
                      productId,
                      anchor,
                    );
                  }}
                />
              </View>
            );
          },
        )}
      </View>

      {/* ========================================================
          PRODUCT POPUP MENU
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
          handleDelete
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
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       GRID
    ======================================================== */

    grid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      alignItems:
        "flex-start",

      justifyContent:
        "flex-start",

      rowGap:
        FixxamTokens.spacing.md,
    },

    cardWrapper: {
      flexShrink: 0,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      width: "100%",

      minHeight: 300,

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
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      marginBottom:
        FixxamTokens.spacing.lg,

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
      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    emptyAction: {
      width: "100%",

      maxWidth: 260,

      marginTop:
        FixxamTokens.spacing.xl,
    },

    addButton: {
      width: "100%",
    },
  });