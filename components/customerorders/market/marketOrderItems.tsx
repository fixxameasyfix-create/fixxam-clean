import React, {
  memo,
  useCallback,
  useEffect,
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
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  | "sheet";

/* ============================================================
   HELPERS
============================================================ */

function normalizePrice(
  value: number,
): number {
  return Number.isFinite(
    value,
  )
    ? Math.max(
        0,
        value,
      )
    : 0;
}

function normalizeQuantity(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    ) ||
    value <= 0
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(
      value,
    ),
  );
}

function normalizeProductName(
  value: string,
): string {
  if (
    typeof value !==
    "string"
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
    Number.isFinite(
      value,
    )
      ? Math.max(
          0,
          value,
        )
      : 0;

  return `₦${Math.round(
    amount,
  ).toLocaleString(
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

  const itemCount =
    products.length;

  const firstProduct =
    products[0] ??
    null;

  const remainingItems =
    Math.max(
      0,
      itemCount - 1,
    );

  /* ==========================================================
     GALLERY
  ========================================================== */

  const openGallery =
    useCallback(() => {
      if (
        itemCount <= 1
      ) {
        return;
      }

      setGalleryVisible(
        true,
      );
    }, [
      itemCount,
    ]);

  const closeGallery =
    useCallback(() => {
      setGalleryVisible(
        false,
      );
    }, []);

  /* ==========================================================
     RENDER
  ========================================================== */

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
              styles.headerInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.title
              }
            >
              Items
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

          {/* ==================================================
              GALLERY
          ================================================== */}

          {itemCount > 1 ? (
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
                state="active"
              />

              <AppText
                variant="caption"
                weight="semibold"
                style={
                  styles.galleryText
                }
              >
                Gallery
              </AppText>

              <View
                style={
                  styles.galleryCount
                }
              >
                <AppText
                  variant="caption"
                  weight="semibold"
                  style={
                    styles.galleryCountText
                  }
                >
                  {itemCount}
                </AppText>
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* ====================================================
            PRODUCT
        ==================================================== */}

        {!firstProduct ? (
          <View
            style={
              styles.empty
            }
          >
            <AppIcon
              name="package"
              size="sm"
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
              No items found
            </AppText>
          </View>
        ) : (
          <>
            <View
              style={
                styles.items
              }
            >
              <ProductRow
                product={
                  firstProduct
                }
              />
            </View>

            {remainingItems >
            0 ? (
              <Pressable
                onPress={
                  openGallery
                }
                accessibilityRole="button"
                accessibilityLabel={`View ${remainingItems} more ${
                  remainingItems === 1
                    ? "item"
                    : "items"
                }`}
                style={({
                  pressed,
                }) => [
                  styles.moreRow,

                  pressed
                    ? styles.pressed
                    : null,
                ]}
              >
                <AppText
                  variant="caption"
                  tone="secondary"
                >
                  +{remainingItems} more{" "}
                  {remainingItems === 1
                    ? "item"
                    : "items"}
                </AppText>

                <AppIcon
                  name="next"
                  role="customer"
                  size="xs"
                  state="muted"
                />
              </Pressable>
            ) : null}
          </>
        )}
      </View>

      {/* ======================================================
          GALLERY SHEET
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
   EXPORT
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
        typeof image ===
        "string"
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
        Boolean(
          safeImage &&
          !imageFailed,
        );

      const containerStyle =
        variant ===
        "sheet"
          ? styles.sheetImageBox
          : styles.productImageBox;

      return (
        <View
          style={
            containerStyle
          }
        >
          {showImage ? (
            <Image
              source={{
                uri:
                  safeImage,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={
                FixxamTokens.motion.fast
              }
              accessibilityLabel={`${productName} product image`}
              onError={() => {
                setImageFailed(
                  true,
                );
              }}
              style={
                styles.productImage
              }
            />
          ) : (
            <AppIcon
              name="package"
              role="customer"
              size={
                variant ===
                "sheet"
                  ? "md"
                  : "sm"
              }
              state="muted"
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
      variant = "row",
    }: {
      product:
        MarketOrderProduct;

      variant?:
        ProductImageVariant;
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
          accessible
          accessibilityLabel={`${productName}. Quantity ${quantity}. Total ${formatMoney(
            itemTotal,
          )}.`}
          style={
            styles.productRow
          }
        >
          <ProductImage
            image={
              product.image
            }
            productName={
              productName
            }
            variant={
              variant
            }
          />

          <View
            style={
              styles.productInfo
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              numberOfLines={2}
              ellipsizeMode="tail"
              style={
                styles.productName
              }
            >
              {productName}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
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
            weight="semibold"
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
   GALLERY SHEET
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
      const insets =
        useSafeAreaInsets();

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
            <View
              style={
                styles.sheetItem
              }
            >
              <ProductRow
                product={
                  item
                }
                variant="sheet"
              />
            </View>
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
            {/* ================================================
                BACKDROP
            ================================================ */}

            <Pressable
              onPress={
                onClose
              }
              accessible={false}
              style={
                StyleSheet.absoluteFill
              }
            />

            {/* ================================================
                SHEET
            ================================================ */}

            <View
              style={[
                styles.modal,

                {
                  paddingBottom:
                    Math.max(
                      insets.bottom,
                      FixxamTokens.spacing.md,
                    ),
                },
              ]}
            >
              {/* ==============================================
                  HANDLE
              ============================================== */}

              <View
                style={
                  styles.sheetHandle
                }
              />

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
                    Order items
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
                  accessibilityLabel="Close order items"
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
                showsVerticalScrollIndicator={
                  false
                }
                initialNumToRender={
                  8
                }
                maxToRenderPerBatch={
                  8
                }
                windowSize={
                  7
                }
                removeClippedSubviews
                contentContainerStyle={
                  styles.sheetContent
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
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width:
        "100%",

      marginTop:
        FixxamTokens.spacing.sm,

      padding:
        FixxamTokens.spacing.md,

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        40,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    headerInfo: {
      flex:
        1,

      minWidth:
        0,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    count: {
      marginTop:
        2,
    },

    /* ========================================================
       GALLERY BUTTON
    ======================================================== */

    galleryButton: {
      minHeight:
        36,

      flexShrink:
        0,

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

      backgroundColor:
        CustomerColors.primarySoft,
    },

    galleryText: {
      color:
        CustomerColors.primary,
    },

    galleryCount: {
      minWidth:
        20,

      height:
        20,

      paddingHorizontal:
        5,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    galleryCountText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       ITEM
    ======================================================== */

    items: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    productRow: {
      minHeight:
        64,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingVertical:
        FixxamTokens.spacing.xs,
    },

    productImageBox: {
      width:
        56,

      height:
        56,

      flexShrink:
        0,

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

    sheetImageBox: {
      width:
        64,

      height:
        64,

      flexShrink:
        0,

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

    productImage: {
      width:
        "100%",

      height:
        "100%",
    },

    productInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    productName: {
      color:
        Colors.textPrimary,
    },

    quantity: {
      marginTop:
        3,
    },

    productTotal: {
      flexShrink:
        0,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       MORE ITEMS
    ======================================================== */

    moreRow: {
      minHeight:
        36,

      marginTop:
        FixxamTokens.spacing.xs,

      marginLeft:
        56 +
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderTopWidth:
        StyleSheet.hairlineWidth,

      borderTopColor:
        Colors.divider,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      minHeight:
        72,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyText: {
      marginLeft:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modalOverlay: {
      flex:
        1,

      justifyContent:
        "flex-end",

      backgroundColor:
        Colors.overlayMedium,
    },

    modal: {
      minHeight:
        "42%",

      maxHeight:
        "86%",

      overflow:
        "hidden",

      borderTopLeftRadius:
        FixxamTokens.radius.xl,

      borderTopRightRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,
    },

    sheetHandle: {
      width:
        40,

      height:
        4,

      alignSelf:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.divider,
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

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    modalHeaderText: {
      flex:
        1,

      minWidth:
        0,
    },

    modalTitle: {
      color:
        Colors.textPrimary,
    },

    modalSubtitle: {
      marginTop:
        2,
    },

    closeButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       SHEET LIST
    ======================================================== */

    sheetContent: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },

    sheetItem: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    /* ========================================================
       STATES
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });