import React, {
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import {
  router,
} from "expo-router";

import deleteProduct from "@/services/products/deleteProduct";

import {
  AppText,
} from "@/components/ui";

import ProductCard from "../my-products/ProductCard";

import ProductPopupMenu from "../products/ProductPopupMenu";

import ProductDeleteDialog from "../products/ProductDeleteDialog";

import {
  MenuAnchor,
} from "../products/ProductPopupMenu/ProductPopupMenu.types";

/* ==============================================================
   TYPES
============================================================== */

type Product = {
  id: string;

  name: string;

  price: number | string;

  thumbnail?: string;

  category?: string;

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

export default function AllProductsGrid({
  products,
  onProductPress,
}: Props) {
  const {
    width: screenWidth,
  } = useWindowDimensions();

  /* ============================================================
     GRID WIDTH
  ============================================================ */

  /*
   * The screen normally has horizontal padding.
   * Keep the cards inside the available viewport.
   */
  const horizontalPadding =
    36;

  const columnGap =
    12;

  const cardWidth = Math.floor(
    (screenWidth -
      horizontalPadding -
      columnGap) /
      2,
  );

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
     OPEN MENU
  ============================================================ */

  const handleOpenMenu = (
    productId: string,
    anchor: MenuAnchor,
  ) => {
    if (!productId) {
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
  };

  /* ============================================================
     CLOSE MENU
  ============================================================ */

  const closeMenu = () => {
    if (deleting) {
      return;
    }

    setMenuVisible(
      false,
    );

    setMenuAnchor(
      null,
    );
  };

  /* ============================================================
     EMPTY
  ============================================================ */

  if (products.length === 0) {
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
          Add your first product
          to start selling.
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
          GRID
      ======================================================== */}

      <View
        style={[
          styles.grid,
          {
            columnGap,
          },
        ]}
      >
        {products.map(
          (item) => {
            /* ==================================================
               ID
            ================================================== */

            const productId =
              getSafeString(
                item.id,
              );

            if (!productId) {
              return null;
            }

            /* ==================================================
               NAME
            ================================================== */

            const name =
              getSafeString(
                item.name,
                "Unnamed Product",
              );

            /* ==================================================
               CATEGORY
            ================================================== */

            const category =
              getSafeString(
                item.category,
                "Others",
              );

            /* ==================================================
               PRICE
            ================================================== */

            const price =
              Math.max(
                0,
                getSafeNumber(
                  item.price,
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
                    item.discountPercent,
                  ),
                ),
              );

            /* ==================================================
               DISCOUNTED PRICE
            ================================================== */

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

            /* ==================================================
               THUMBNAIL
            ================================================== */

            const thumbnail =
              getSafeString(
                item.thumbnail,
              ) || undefined;

            /* ==================================================
               STOCK
            ================================================== */

            const stock =
              Math.max(
                0,
                Math.floor(
                  getSafeNumber(
                    item.stock,
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
                  onPress={() =>
                    onProductPress(
                      productId,
                    )
                  }
                  onMore={(
                    anchor,
                  ) =>
                    handleOpenMenu(
                      productId,
                      anchor,
                    )
                  }
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
           * Keep existing behaviour.
           * Connect your duplicate service here
           * when it is available.
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
           * Keep existing behaviour.
           * Connect your share flow here.
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
       GRID
    ========================================================== */

    grid: {
      width: "100%",

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      justifyContent:
        "flex-start",

      alignItems:
        "flex-start",

      rowGap: 14,
    },

    /* ==========================================================
       CARD
    ========================================================== */

    cardWrapper: {
      flexShrink: 0,
    },

    /* ==========================================================
       EMPTY
    ========================================================== */

    empty: {
      width: "100%",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      paddingVertical: 40,

      paddingHorizontal: 24,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity: 0.05,

      shadowRadius: 12,

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

      marginBottom: 10,
    },

    emptyText: {
      fontSize: 15,

      color:
        "#64748B",

      textAlign:
        "center",

      lineHeight: 22,

      marginBottom: 22,
    },

    /* ==========================================================
       ADD BUTTON
    ========================================================== */

    addButton: {
      minHeight: 52,

      paddingHorizontal: 28,

      borderRadius: 16,

      backgroundColor:
        "#FF6B00",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    addButtonText: {
      color:
        "#FFFFFF",

      fontSize: 15,
    },

    buttonPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.98,
        },
      ],
    },
  });