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
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerMarketProductUnavailable from "@/components/workerorders/market/WorkerMarketProductUnavailable";

/* ============================================================
   TYPES
============================================================ */

export type WorkerMarketProduct = {
  productId: string;

  name: string;

  image?: string;

  price: number;

  quantity: number;
};

type Props = {
  orderId?: string | null;

  products?: WorkerMarketProduct[] | null;

  unavailableProducts?: string[] | null;

  disabled?: boolean;
};

type ProductImageVariant =
  | "row"
  | "sheet";

/* ============================================================
   HELPERS
============================================================ */

function safeString(
  value: unknown,
  fallback = "",
): string {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  const normalized =
    value.trim();

  return (
    normalized ||
    fallback
  );
}

function normalizePrice(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    value,
  );
}

function normalizeQuantity(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
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

function formatMoney(
  value: unknown,
): string {
  const amount =
    normalizePrice(
      value,
    );

  return `₦${Math.round(
    amount,
  ).toLocaleString(
    "en-NG",
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketProducts({
  orderId,
  products,
  unavailableProducts,
  disabled = false,
}: Props) {
  const [
    galleryVisible,
    setGalleryVisible,
  ] =
    useState(false);

  /* ==========================================================
     NORMALIZE
  ========================================================== */

  const normalizedOrderId =
    useMemo(
      () =>
        safeString(
          orderId,
        ),
      [
        orderId,
      ],
    );

  const normalizedProducts =
    useMemo<
      WorkerMarketProduct[]
    >(() => {
      if (
        !Array.isArray(
          products,
        )
      ) {
        return [];
      }

      const result:
        WorkerMarketProduct[] =
        [];

      products.forEach(
        product => {
          const productId =
            safeString(
              product?.productId,
            );

          if (
            !productId
          ) {
            return;
          }

          const normalizedProduct:
            WorkerMarketProduct = {
              productId,

              name:
                safeString(
                  product?.name,
                  "Product",
                ),

              price:
                normalizePrice(
                  product?.price,
                ),

              quantity:
                normalizeQuantity(
                  product?.quantity,
                ),
            };

          const image =
            safeString(
              product?.image,
            );

          if (
            image
          ) {
            normalizedProduct.image =
              image;
          }

          result.push(
            normalizedProduct,
          );
        },
      );

      return result;
    }, [
      products,
    ]);

  const unavailableSet =
    useMemo(() => {
      const ids =
        new Set<string>();

      if (
        !Array.isArray(
          unavailableProducts,
        )
      ) {
        return ids;
      }

      unavailableProducts.forEach(
        item => {
          const productId =
            safeString(
              item,
            );

          if (
            productId
          ) {
            ids.add(
              productId,
            );
          }
        },
      );

      return ids;
    }, [
      unavailableProducts,
    ]);

  /* ==========================================================
     DERIVED
  ========================================================== */

  const itemCount =
    normalizedProducts.length;

  const firstProduct =
    normalizedProducts[0] ??
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
              weight="bold"
              style={
                styles.title
              }
            >
              Items
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
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

          {itemCount > 1 ? (
            <Pressable
              onPress={
                openGallery
              }
              hitSlop={6}
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
                size="xs"
                color={
                  WorkerColors.primary
                }
              />

              <AppText
                variant="caption"
                weight="medium"
                style={
                  styles.galleryText
                }
              >
                View all
              </AppText>

              <View
                style={
                  styles.galleryCount
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
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
                orderId={
                  normalizedOrderId
                }
                product={
                  firstProduct
                }
                unavailable={
                  unavailableSet.has(
                    firstProduct.productId,
                  )
                }
                disabled={
                  disabled
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
                  remainingItems ===
                  1
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
                  numberOfLines={1}
                >
                  +{remainingItems} more{" "}
                  {remainingItems ===
                  1
                    ? "item"
                    : "items"}
                </AppText>

                <AppIcon
                  name="next"
                  size="xs"
                  color={
                    Colors.textMuted
                  }
                />
              </Pressable>
            ) : null}
          </>
        )}
      </View>

      {/* ======================================================
          GALLERY
      ====================================================== */}

      <WorkerMarketGallery
        visible={
          galleryVisible
        }
        orderId={
          normalizedOrderId
        }
        products={
          normalizedProducts
        }
        unavailableSet={
          unavailableSet
        }
        disabled={
          disabled
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

const MemoizedWorkerMarketProducts =
  memo(
    WorkerMarketProducts,
  );

MemoizedWorkerMarketProducts.displayName =
  "WorkerMarketProducts";

export default MemoizedWorkerMarketProducts;

/* ============================================================
   PRODUCT IMAGE
============================================================ */

const ProductImage =
  memo(
    function ProductImage({
      image,
      productName,
      variant,
      unavailable,
    }: {
      image?: string;

      productName: string;

      variant:
        ProductImageVariant;

      unavailable: boolean;
    }) {
      const [
        imageFailed,
        setImageFailed,
      ] =
        useState(false);

      const safeImage =
        safeString(
          image,
        );

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
          style={[
            containerStyle,

            unavailable
              ? styles.unavailableImage
              : null,
          ]}
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
                FixxamTokens.motion
                  .fast
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
              size={
                variant ===
                "sheet"
                  ? "md"
                  : "sm"
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
      orderId,
      product,
      unavailable,
      disabled,
      variant = "row",
    }: {
      orderId: string;

      product:
        WorkerMarketProduct;

      unavailable: boolean;

      disabled: boolean;

      variant?:
        ProductImageVariant;
    }) {
      const productName =
        safeString(
          product?.name,
          "Product",
        );

      const price =
        normalizePrice(
          product?.price,
        );

      const quantity =
        normalizeQuantity(
          product?.quantity,
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
          style={[
            styles.productRow,

            variant ===
              "sheet"
              ? styles.productRowSheet
              : null,
          ]}
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
            unavailable={
              unavailable
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

            <View
              style={
                styles.productMetaRow
              }
            >
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

              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.productTotalInline
                }
              >
                {formatMoney(
                  itemTotal,
                )}
              </AppText>
            </View>

            {unavailable ? (
              <View
                style={
                  styles.unavailableRow
                }
              >
                <View
                  style={
                    styles.unavailableDot
                  }
                />

                <AppText
                  variant="caption"
                  weight="semibold"
                  style={
                    styles.unavailableText
                  }
                >
                  Unavailable
                </AppText>
              </View>
            ) : (
              <View
                style={
                  styles.availabilityAction
                }
              >
                <WorkerMarketProductUnavailable
                  orderId={
                    orderId
                  }
                  productId={
                    product.productId
                  }
                  productName={
                    productName
                  }
                  disabled={
                    disabled ||
                    !orderId
                  }
                />
              </View>
            )}
          </View>
        </View>
      );
    },
  );

ProductRow.displayName =
  "ProductRow";

/* ============================================================
   GALLERY SHEET
============================================================ */

const WorkerMarketGallery =
  memo(
    function WorkerMarketGallery({
      visible,
      orderId,
      products,
      unavailableSet,
      disabled,
      onClose,
    }: {
      visible: boolean;

      orderId: string;

      products:
        WorkerMarketProduct[];

      unavailableSet:
        Set<string>;

      disabled: boolean;

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
              WorkerMarketProduct,
            index: number,
          ) =>
            safeString(
              item.productId,
            ) ||
            `product-${index}`,
          [],
        );

      const renderItem =
        useCallback(
          ({
            item,
          }: {
            item:
              WorkerMarketProduct;
          }) => (
            <View
              style={
                styles.sheetItem
              }
            >
              <ProductRow
                orderId={
                  orderId
                }
                product={
                  item
                }
                unavailable={
                  unavailableSet.has(
                    item.productId,
                  )
                }
                disabled={
                  disabled
                }
                variant="sheet"
              />
            </View>
          ),
          [
            disabled,
            orderId,
            unavailableSet,
          ],
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
            <Pressable
              onPress={
                onClose
              }
              accessible={
                false
              }
              style={
                StyleSheet.absoluteFill
              }
            />

            <View
              style={[
                styles.modal,

                {
                  paddingBottom:
                    Math.max(
                      insets.bottom,
                      FixxamTokens.spacing
                        .sm,
                    ),
                },
              ]}
            >
              <View
                style={
                  styles.sheetHandle
                }
              />

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
                    variant="bodyLarge"
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
                    size="xs"
                    color={
                      Colors.textPrimary
                    }
                  />
                </Pressable>
              </View>

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
                keyboardShouldPersistTaps="handled"
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

WorkerMarketGallery.displayName =
  "WorkerMarketGallery";

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

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderWidth:
        StyleSheet.hairlineWidth,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        30,

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

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    count: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       GALLERY
    ======================================================== */

    galleryButton: {
      minHeight:
        30,

      flexShrink:
        0,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

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
        WorkerColors.primarySoft,
    },

    galleryText: {
      color:
        WorkerColors.primary,
    },

    galleryCount: {
      minWidth:
        17,

      height:
        17,

      paddingHorizontal:
        4,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    galleryCountText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       PRODUCT
    ======================================================== */

    items: {
      marginTop:
        FixxamTokens.spacing.xs,
    },

    productRow: {
      width:
        "100%",

      minHeight:
        54,

      flexDirection:
        "row",

      alignItems:
        "flex-start",

      paddingVertical:
        FixxamTokens.spacing.xxs,
    },

    productRowSheet: {
      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    productImageBox: {
      width:
        48,

      height:
        48,

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

    productImage: {
      width:
        "100%",

      height:
        "100%",
    },

    unavailableImage: {
      opacity:
        0.5,
    },

    productInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    productName: {
      color:
        Colors.textPrimary,
    },

    productMetaRow: {
      width:
        "100%",

      marginTop:
        2,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    quantity: {
      flex:
        1,

      minWidth:
        0,

      color:
        Colors.textSecondary,
    },

    productTotalInline: {
      flexShrink:
        0,

      color:
        Colors.textPrimary,
    },

    availabilityAction: {
      alignSelf:
        "flex-start",

      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       UNAVAILABLE
    ======================================================== */

    unavailableRow: {
      minHeight:
        22,

      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    unavailableDot: {
      width:
        5,

      height:
        5,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.error,
    },

    unavailableText: {
      color:
        Colors.error,
    },

    /* ========================================================
       MORE ITEMS
    ======================================================== */

    moreRow: {
      minHeight:
        34,

      marginTop:
        FixxamTokens.spacing.xs,

      marginLeft:
        48 +
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
        50,

      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    emptyText: {
      marginLeft:
        FixxamTokens.spacing.xs,
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
        "38%",

      maxHeight:
        "82%",

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
        36,

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
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

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
        1,

      color:
        Colors.textSecondary,
    },

    closeButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

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
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.lg,
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