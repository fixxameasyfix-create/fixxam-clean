import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import type {
  MarketProduct,
} from "./marketOrder.utils";

/* ============================================================
   TYPES
============================================================ */

export type MarketOrderProduct =
  MarketProduct;

type Props = {
  products:
    MarketOrderProduct[];
};

type ProductImageVariant =
  | "row"
  | "gallery";

/* ============================================================
   HELPERS
============================================================ */

function normalizePrice(
  value: number,
): number {
  return Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function normalizeQuantity(
  value: number,
): number {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(value),
  );
}

function normalizeProductName(
  value: string,
): string {
  if (
    typeof value !== "string"
  ) {
    return "Product";
  }

  return (
    value.trim() ||
    "Product"
  );
}

function formatMoney(
  value: number,
): string {
  const amount =
    Number.isFinite(value)
      ? Math.max(0, value)
      : 0;

  return `₦${amount.toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function MarketOrderItems({
  products,
}: Props) {
  const [
    galleryVisible,
    setGalleryVisible,
  ] =
    useState(false);

  const firstProduct =
    products[0] ?? null;

  const itemCount =
    products.length;

  const openGallery =
    useCallback(() => {
      if (
        itemCount > 0
      ) {
        setGalleryVisible(
          true,
        );
      }
    }, [
      itemCount,
    ]);

  const closeGallery =
    useCallback(() => {
      setGalleryVisible(
        false,
      );
    }, []);

  return (
    <>
      <View
        style={
          styles.card
        }
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerTitleBox
            }
          >
            <AppText
              variant="body"
              weight="bold"
              style={
                styles.title
              }
            >
              Order Items
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.count
              }
            >
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </AppText>
          </View>

          {itemCount > 0 ? (
            <Pressable
              onPress={
                openGallery
              }
              accessibilityRole="button"
              accessibilityLabel={`View all ${itemCount} order items`}
              style={({
                pressed,
              }) => [
                styles.galleryButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppIcon
                name="image"
                role="customer"
                size="xs"
                color={
                  CustomerColors.primary
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.galleryText
                }
              >
                Gallery
              </AppText>
            </Pressable>
          ) : null}
        </View>

        {/* ====================================================
            PRODUCT / EMPTY
        ==================================================== */}

        {!firstProduct ? (
          <View
            style={
              styles.empty
            }
          >
            <AppIcon
              name="package"
              size="md"
              color={
                Colors.textMuted
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.emptyText
              }
            >
              No items found.
            </AppText>
          </View>
        ) : (
          <ProductRow
            product={
              firstProduct
            }
          />
        )}
      </View>

      {/* ======================================================
          GALLERY
      ====================================================== */}

      <MarketOrderGallery
        visible={
          galleryVisible
        }
        products={
          products
        }
        onClose={
          closeGallery
        }
      />
    </>
  );
}

/* ============================================================
   MEMO
============================================================ */

const MemoizedMarketOrderItems =
  memo(
    MarketOrderItems,
  );

MemoizedMarketOrderItems.displayName =
  "MarketOrderItems";

export default MemoizedMarketOrderItems;

/* ============================================================
   PRODUCT IMAGE
============================================================ */

const ProductImage =
  memo(
    function ProductImage({
      image,
      productName,
      variant,
    }: {
      image?: string;

      productName: string;

      variant:
        ProductImageVariant;
    }) {
      const [
        imageFailed,
        setImageFailed,
      ] =
        useState(false);

      const safeImage =
        typeof image === "string"
          ? image.trim()
          : "";

      useEffect(() => {
        setImageFailed(
          false,
        );
      }, [
        safeImage,
      ]);

      const showImage =
        safeImage.length > 0 &&
        !imageFailed;

      const containerStyle =
        variant === "gallery"
          ? styles.galleryImageBox
          : styles.productImageBox;

      const imageStyle =
        variant === "gallery"
          ? styles.galleryImage
          : styles.productImage;

      return (
        <View
          style={
            containerStyle
          }
        >
          {showImage ? (
            <Image
              source={{
                uri: safeImage,
              }}
              contentFit="cover"
              transition={150}
              accessibilityLabel={`${productName} product image`}
              onError={() => {
                setImageFailed(
                  true,
                );
              }}
              style={
                imageStyle
              }
            />
          ) : (
            <AppIcon
              name="package"
              role="customer"
              size={
                variant ===
                "gallery"
                  ? "lg"
                  : "md"
              }
              color={
                Colors.textMuted
              }
            />
          )}
        </View>
      );
    },
  );

ProductImage.displayName =
  "ProductImage";

/* ============================================================
   PRODUCT ROW
============================================================ */

const ProductRow =
  memo(
    function ProductRow({
      product,
    }: {
      product:
        MarketOrderProduct;
    }) {
      const productName =
        normalizeProductName(
          product.name,
        );

      const price =
        normalizePrice(
          product.price,
        );

      const quantity =
        normalizeQuantity(
          product.quantity,
        );

      const itemTotal =
        price *
        quantity;

      return (
        <View
          style={
            styles.productRow
          }
          accessibilityLabel={`${productName}. Quantity ${quantity}. Total ${formatMoney(
            itemTotal,
          )}.`}
        >
          <ProductImage
            image={
              product.image
            }
            productName={
              productName
            }
            variant="row"
          />

          <View
            style={
              styles.productInfo
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={2}
              style={
                styles.productName
              }
            >
              {productName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.quantity
              }
            >
              {quantity}
              {" × "}
              {formatMoney(
                price,
              )}
            </AppText>
          </View>

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.productTotal
            }
          >
            {formatMoney(
              itemTotal,
            )}
          </AppText>
        </View>
      );
    },
  );

ProductRow.displayName =
  "ProductRow";

/* ============================================================
   GALLERY MODAL
============================================================ */

const MarketOrderGallery =
  memo(
    function MarketOrderGallery({
      visible,
      products,
      onClose,
    }: {
      visible: boolean;

      products:
        MarketOrderProduct[];

      onClose: () => void;
    }) {
      const itemCount =
        products.length;

      const keyExtractor =
        useCallback(
          (
            item:
              MarketOrderProduct,
            index: number,
          ) =>
            item.productId ||
            `product-${index}`,
          [],
        );

      const renderItem =
        useCallback(
          ({
            item,
          }: {
            item:
              MarketOrderProduct;
          }) => (
            <GalleryItem
              product={
                item
              }
            />
          ),
          [],
        );

      return (
        <Modal
          visible={
            visible
          }
          transparent
          animationType="slide"
          statusBarTranslucent
          onRequestClose={
            onClose
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            {/* BACKDROP */}

            <Pressable
              onPress={
                onClose
              }
              accessible={false}
              style={
                StyleSheet.absoluteFill
              }
            />

            {/* SHEET */}

            <View
              style={
                styles.modal
              }
            >
              {/* ==============================================
                  HEADER
              ============================================== */}

              <View
                style={
                  styles.modalHeader
                }
              >
                <View
                  style={
                    styles.modalHeaderText
                  }
                >
                  <AppText
                    variant="heading3"
                    weight="bold"
                    style={
                      styles.modalTitle
                    }
                  >
                    Order Gallery
                  </AppText>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {itemCount}{" "}
                    {itemCount === 1
                      ? "item"
                      : "items"}
                  </AppText>
                </View>

                <Pressable
                  onPress={
                    onClose
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close order gallery"
                  style={({
                    pressed,
                  }) => [
                    styles.closeButton,

                    pressed
                      ? styles.pressed
                      : null,
                  ]}
                >
                  <AppIcon
                    name="close"
                    size="sm"
                    color={
                      Colors.textPrimary
                    }
                  />
                </Pressable>
              </View>

              {/* ==============================================
                  PRODUCTS
              ============================================== */}

              <FlatList
                data={
                  products
                }
                keyExtractor={
                  keyExtractor
                }
                renderItem={
                  renderItem
                }
                numColumns={2}
                showsVerticalScrollIndicator={
                  false
                }
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                columnWrapperStyle={
                  styles.galleryRow
                }
                contentContainerStyle={
                  styles.galleryContent
                }
              />
            </View>
          </View>
        </Modal>
      );
    },
  );

MarketOrderGallery.displayName =
  "MarketOrderGallery";

/* ============================================================
   GALLERY ITEM
============================================================ */

const GalleryItem =
  memo(
    function GalleryItem({
      product,
    }: {
      product:
        MarketOrderProduct;
    }) {
      const productName =
        normalizeProductName(
          product.name,
        );

      const price =
        normalizePrice(
          product.price,
        );

      const quantity =
        normalizeQuantity(
          product.quantity,
        );

      const itemTotal =
        useMemo(
          () =>
            price *
            quantity,
          [
            price,
            quantity,
          ],
        );

      return (
        <View
          style={
            styles.galleryItem
          }
          accessibilityLabel={`${productName}. Quantity ${quantity}. ${formatMoney(
            itemTotal,
          )}.`}
        >
          <ProductImage
            image={
              product.image
            }
            productName={
              productName
            }
            variant="gallery"
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={2}
            style={
              styles.galleryName
            }
          >
            {productName}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.galleryQuantity
            }
          >
            Qty: {quantity}
          </AppText>

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.galleryPrice
            }
          >
            {formatMoney(
              itemTotal,
            )}
          </AppText>
        </View>
      );
    },
  );

GalleryItem.displayName =
  "GalleryItem";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
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

      gap:
        FixxamTokens.spacing.sm,
    },

    headerTitleBox: {
      flex: 1,

      minWidth: 0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    count: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    galleryButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    galleryText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       PRODUCT
    ======================================================== */

    productRow: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    productImageBox: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      flexShrink: 0,

      overflow:
        "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.background,
    },

    productImage: {
      width: "100%",

      height: "100%",
    },

    productInfo: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    productName: {
      lineHeight: 16,

      color:
        Colors.textPrimary,
    },

    quantity: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    productTotal: {
      flexShrink: 0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      minHeight: 100,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex: 1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    modal: {
      minHeight: "45%",

      maxHeight: "88%",

      overflow:
        "hidden",

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.background,
    },

    modalHeader: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    modalHeaderText: {
      flex: 1,

      minWidth: 0,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalSubtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    galleryContent: {
      padding:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    galleryRow: {
      gap:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.sm,
    },

    galleryItem: {
      flex: 1,

      maxWidth: "48.5%",

      padding:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    galleryImageBox: {
      width: "100%",

      aspectRatio: 1,

      overflow:
        "hidden",

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.background,
    },

    galleryImage: {
      width: "100%",

      height: "100%",
    },

    galleryName: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 15,

      color:
        Colors.textPrimary,
    },

    galleryQuantity: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    galleryPrice: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        CustomerColors.primary,
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