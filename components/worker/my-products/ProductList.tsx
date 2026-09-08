import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

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

import {
  showError,
  showSuccess,
} from "@/utils/showToast";

import deleteProduct from "@/services/products/deleteProduct";

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
   CONSTANTS
============================================================== */

const DEFAULT_CARD_WIDTH =
  156;

const GRID_GAP =
  FixxamTokens.spacing.md;

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
    typeof value ===
      "string" &&
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
  } =
    useWorkerProducts();

  /* ============================================================
     GRID
  ============================================================ */

  const [
    gridWidth,
    setGridWidth,
  ] =
    useState(0);

  const cardWidth =
    useMemo(() => {
      if (
        gridWidth <=
        GRID_GAP
      ) {
        return DEFAULT_CARD_WIDTH;
      }

      return Math.floor(
        (gridWidth -
          GRID_GAP) /
          2,
      );
    }, [
      gridWidth,
    ]);

  const handleGridLayout =
    useCallback(
      (
        event: LayoutChangeEvent,
      ) => {
        const nextWidth =
          Math.floor(
            event.nativeEvent
              .layout.width,
          );

        setGridWidth(
          current =>
            current === nextWidth
              ? current
              : nextWidth,
        );
      },
      [],
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

  const deleteInFlight =
    useRef(false);

  /* ============================================================
     VISIBLE PRODUCTS
  ============================================================ */

  const visibleProducts =
    useMemo(() => {
      if (
        typeof limit !==
          "number" ||
        !Number.isFinite(limit)
      ) {
        return products;
      }

      const safeLimit =
        Math.max(
          0,
          Math.floor(
            limit,
          ),
        );

      return products.slice(
        0,
        safeLimit,
      );
    }, [
      limit,
      products,
    ]);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleAddProduct =
    useCallback(() => {
      router.push(
        "/(worker)/products/add",
      );
    }, []);

  const handleSeeAll =
    useCallback(() => {
      router.push(
        "/(worker)/(tabs)/my-products",
      );
    }, []);

  const handleProductPress =
    useCallback(
      (
        productId: string,
      ) => {
        router.push({
          pathname:
            "/(worker)/products/[id]",

          params: {
            id:
              productId,
          },
        });
      },
      [],
    );

  /* ============================================================
     MENU
  ============================================================ */

  const closeMenu =
    useCallback(() => {
      if (deleting) {
        return;
      }

      setMenuVisible(
        false,
      );

      setMenuAnchor(
        null,
      );
    }, [
      deleting,
    ]);

  const handleOpenMenu =
    useCallback(
      (
        productId: string,
        anchor: MenuAnchor,
      ) => {
        if (deleting) {
          return;
        }

        setSelectedProduct(
          productId,
        );

        setMenuAnchor(
          anchor,
        );

        setMenuVisible(
          true,
        );
      },
      [
        deleting,
      ],
    );

  /* ============================================================
     EDIT
  ============================================================ */

  const handleEdit =
    useCallback(() => {
      if (
        !selectedProduct ||
        deleting
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
    }, [
      deleting,
      selectedProduct,
    ]);

  /* ============================================================
     DUPLICATE
  ============================================================ */

  const handleDuplicate =
    useCallback(() => {
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

      /*
       * Duplicate service is not available
       * in this component yet.
       *
       * Do not create a fake product locally.
       */
      showError(
        "Duplicate Unavailable",
        "Product duplication is not available yet.",
      );
    }, [
      selectedProduct,
    ]);

  /* ============================================================
     SHARE
  ============================================================ */

  const handleShare =
    useCallback(() => {
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

      /*
       * A verified public product URL/share
       * service is required before enabling this.
       */
      showError(
        "Share Unavailable",
        "Product sharing is not available yet.",
      );
    }, [
      selectedProduct,
    ]);

  /* ============================================================
     OPEN DELETE
  ============================================================ */

  const handleOpenDelete =
    useCallback(() => {
      if (
        !selectedProduct ||
        deleting
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
    }, [
      deleting,
      selectedProduct,
    ]);

  /* ============================================================
     CANCEL DELETE
  ============================================================ */

  const handleCancelDelete =
    useCallback(() => {
      if (deleting) {
        return;
      }

      setShowDeleteDialog(
        false,
      );
    }, [
      deleting,
    ]);

  /* ============================================================
     CONFIRM DELETE
  ============================================================ */

  const handleConfirmDelete =
    useCallback(async () => {
      if (
        !selectedProduct ||
        deleting ||
        deleteInFlight.current
      ) {
        return;
      }

      const productId =
        selectedProduct;

      deleteInFlight.current =
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

        showSuccess(
          "Product Deleted",
          "The product was deleted successfully.",
        );
      } catch (
        error: unknown
      ) {
        console.error(
          "FIXXAM_PRODUCT_DELETE_ERROR:",
          error,
        );

        showError(
          "Unable to Delete Product",
          "The product could not be deleted. Please try again.",
        );
      } finally {
        deleteInFlight.current =
          false;

        setDeleting(
          false,
        );
      }
    }, [
      deleting,
      selectedProduct,
    ]);

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
        <ActivityIndicator
          size="small"
          color={
            WorkerColors.primary
          }
        />

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
        <View
          style={
            styles.emptyIcon
          }
        >
          <AppIcon
            name="package"
            role="worker"
            size="lg"
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
            styles.emptyText
          }
        >
          Add your first product to start selling.
        </AppText>

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

      {showSeeAll ? (
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

            <AppText
              variant="body"
              tone="secondary"
              style={
                styles.subtitle
              }
            >
              Manage your products
            </AppText>
          </View>

          <Pressable
            onPress={
              handleSeeAll
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="See all products"
            accessibilityHint="Opens all products"
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
      ) : null}

      {/* ========================================================
          PRODUCT GRID
      ======================================================== */}

      <View
        onLayout={
          handleGridLayout
        }
        style={
          styles.productsGrid
        }
      >
        {visibleProducts.map(
          item => {
            const productId =
              getSafeString(
                item?.id,
              );

            if (!productId) {
              return null;
            }

            const name =
              getSafeString(
                item?.name,
                "Unnamed Product",
              );

            const category =
              getSafeString(
                item?.category,
                "Others",
              );

            const price =
              Math.max(
                0,
                getSafeNumber(
                  item?.price,
                ),
              );

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

            const thumbnail =
              getSafeString(
                item?.thumbnail,
              ) ||
              undefined;

            const stock =
              Math.max(
                0,
                Math.floor(
                  getSafeNumber(
                    item?.stock,
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
                    handleProductPress(
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
          POPUP MENU
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

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
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
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,

      color:
        Colors.textSecondary,
    },

    addButton: {
      marginTop:
        FixxamTokens.spacing.xl,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
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
        Colors.textSecondary,
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

    /* ==========================================================
       PRODUCT GRID
    ========================================================== */

    productsGrid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      alignItems:
        "flex-start",

      justifyContent:
        "flex-start",

      columnGap:
        GRID_GAP,

      rowGap:
        FixxamTokens.spacing.lg,
    },

    cardWrapper: {
      flexShrink: 0,
    },

    /* ==========================================================
       STATES
    ========================================================== */

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