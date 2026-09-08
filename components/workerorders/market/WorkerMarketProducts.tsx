import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  type ListRenderItemInfo,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerMarketProductUnavailable from "./WorkerMarketProductUnavailable";

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
  orderId: string;

  products: WorkerMarketProduct[];

  /*
   * Store product IDs only.
   *
   * Example:
   * ["product_123", "product_456"]
   */
  unavailableProducts?: string[];

  disabled?: boolean;
};

type ProductItemProps = {
  product: WorkerMarketProduct;

  orderId: string;

  unavailable: boolean;

  disabled: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeText(
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

function getSafePrice(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return Math.max(
      0,
      value,
    );
  }

  return 0;
}

function getSafeQuantity(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(value),
  );
}

function formatMoney(
  value: unknown,
): string {
  const amount =
    getSafePrice(value);

  return `₦${amount.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function WorkerMarketProducts({
  orderId,
  products,
  unavailableProducts = [],
  disabled = false,
}: Props) {
  const [
    galleryVisible,
    setGalleryVisible,
  ] = useState(false);

  /* ==========================================================
     NORMALIZED ORDER ID
  ========================================================== */

  const normalizedOrderId =
    useMemo(
      () =>
        orderId.trim(),
      [orderId],
    );

  /* ==========================================================
     UNAVAILABLE LOOKUP
  ========================================================== */

  const unavailableSet =
    useMemo(
      () =>
        new Set(
          unavailableProducts
            .map(productId =>
              productId.trim(),
            )
            .filter(Boolean),
        ),
      [unavailableProducts],
    );

  /* ==========================================================
     PREVIEW
  ========================================================== */

  const previewProducts =
    useMemo(
      () =>
        products.slice(
          0,
          3,
        ),
      [products],
    );

  const remainingCount =
    Math.max(
      products.length - 3,
      0,
    );

  /* ==========================================================
     ITEM COUNT
  ========================================================== */

  const itemCount =
    useMemo(
      () =>
        products.reduce(
          (
            total,
            product,
          ) =>
            total +
            getSafeQuantity(
              product.quantity,
            ),
          0,
        ),
      [products],
    );

  /* ==========================================================
     MODAL
  ========================================================== */

  const openGallery =
    useCallback(() => {
      setGalleryVisible(
        true,
      );
    }, []);

  const closeGallery =
    useCallback(() => {
      setGalleryVisible(
        false,
      );
    }, []);

  /* ==========================================================
     RENDER GALLERY ITEM
  ========================================================== */

  const renderGalleryProduct =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<WorkerMarketProduct>) => {
        const productId =
          getSafeText(
            item.productId,
          );

        return (
          <GalleryProduct
            product={
              item
            }
            orderId={
              normalizedOrderId
            }
            unavailable={
              productId
                ? unavailableSet.has(
                    productId,
                  )
                : false
            }
            disabled={
              disabled ||
              !normalizedOrderId ||
              !productId
            }
          />
        );
      },
      [
        disabled,
        normalizedOrderId,
        unavailableSet,
      ],
    );

  /* ==========================================================
     EMPTY
  ========================================================== */

  if (
    products.length === 0
  ) {
    return (
      <View
        style={
          styles.card
        }
      >
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.title
          }
        >
          Products
        </AppText>

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
              size="lg"
              color={
                Colors.textMuted
              }
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            No products available
          </AppText>
        </View>
      </View>
    );
  }

  /* ==========================================================
     MAIN
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
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.headerContent
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.title
              }
            >
              Products
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

          {products.length > 3 ? (
            <Pressable
              onPress={
                openGallery
              }
              accessibilityRole="button"
              accessibilityLabel="View all products"
              style={({
                pressed,
              }) => [
                styles.viewAllButton,

                pressed
                  ? styles.pressed
                  : null,
              ]}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.viewAllText
                }
              >
                View All
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
          ) : null}
        </View>

        {/* ====================================================
            PREVIEW
        ==================================================== */}

        {previewProducts.map(
          (
            product,
            index,
          ) => {
            const productId =
              getSafeText(
                product.productId,
              );

            const unavailable =
              productId
                ? unavailableSet.has(
                    productId,
                  )
                : false;

            return (
              <ProductRow
                key={
                  productId
                    ? `${productId}-${index}`
                    : `product-${index}`
                }
                product={
                  product
                }
                orderId={
                  normalizedOrderId
                }
                last={
                  index ===
                  previewProducts.length -
                    1
                }
                unavailable={
                  unavailable
                }
                disabled={
                  disabled ||
                  !normalizedOrderId ||
                  !productId
                }
              />
            );
          },
        )}

        {/* ====================================================
            MORE
        ==================================================== */}

        {remainingCount > 0 ? (
          <Pressable
            onPress={
              openGallery
            }
            accessibilityRole="button"
            accessibilityLabel={`View ${remainingCount} more products`}
            style={({
              pressed,
            }) => [
              styles.moreButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppIcon
              name="image"
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.moreText
              }
            >
              +{remainingCount} more{" "}
              {remainingCount === 1
                ? "product"
                : "products"}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          GALLERY
      ====================================================== */}

      <Modal
        visible={
          galleryVisible
        }
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={
          closeGallery
        }
      >
        <SafeAreaView
          edges={[
            "top",
            "bottom",
          ]}
          style={
            styles.modal
          }
        >
          {/* ==================================================
              MODAL HEADER
          ================================================== */}

          <View
            style={
              styles.modalHeader
            }
          >
            <View
              style={
                styles.modalHeaderContent
              }
            >
              <AppText
                variant="heading2"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.modalTitle
                }
              >
                Order Products
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
                closeGallery
              }
              accessibilityRole="button"
              accessibilityLabel="Close products"
              hitSlop={6}
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

          {/* ==================================================
              PRODUCT LIST
          ================================================== */}

          <FlatList
            data={
              products
            }
            renderItem={
              renderGalleryProduct
            }
            keyExtractor={(
              product,
              index,
            ) => {
              const productId =
                getSafeText(
                  product.productId,
                );

              return productId
                ? `${productId}-${index}`
                : `gallery-product-${index}`;
            }}
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.gallery
            }
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={7}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

/* ============================================================
   PRODUCT ROW
============================================================ */

const ProductRow =
  memo(
    function ProductRow({
      product,
      orderId,
      last,
      unavailable,
      disabled,
    }: ProductItemProps & {
      last: boolean;
    }) {
      const productId =
        getSafeText(
          product.productId,
        );

      const productName =
        getSafeText(
          product.name,
          "Product",
        );

      const productImage =
        getSafeText(
          product.image,
        );

      const price =
        getSafePrice(
          product.price,
        );

      const quantity =
        getSafeQuantity(
          product.quantity,
        );

      const total =
        price *
        quantity;

      return (
        <View
          style={[
            styles.productContainer,

            !last
              ? styles.productBorder
              : null,
          ]}
        >
          <View
            style={
              styles.productRow
            }
          >
            {productImage ? (
              <Image
                source={{
                  uri:
                    productImage,
                }}
                contentFit="cover"
                transition={150}
                recyclingKey={
                  productImage
                }
                accessibilityLabel={`${productName} product image`}
                style={
                  styles.productImage
                }
              />
            ) : (
              <View
                style={
                  styles.placeholder
                }
              >
                <AppIcon
                  name="package"
                  size="md"
                  color={
                    Colors.textMuted
                  }
                />
              </View>
            )}

            <View
              style={
                styles.productInfo
              }
            >
              <AppText
                variant="bodyMedium"
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
                  styles.productMeta
                }
              >
                {formatMoney(
                  price,
                )}{" "}
                × {quantity}
              </AppText>
            </View>

            <AppText
              variant="bodyMedium"
              weight="bold"
              numberOfLines={1}
              style={
                styles.productTotal
              }
            >
              {formatMoney(
                total,
              )}
            </AppText>
          </View>

          {/* ==================================================
              UNAVAILABLE ACTION
          ================================================== */}

          <View
            style={
              styles.unavailableContainer
            }
          >
            <WorkerMarketProductUnavailable
              orderId={
                orderId
              }
              productId={
                productId
              }
              productName={
                productName
              }
              disabled={
                disabled ||
                unavailable
              }
            />

            {unavailable ? (
              <ReportedBadge />
            ) : null}
          </View>
        </View>
      );
    },
  );

ProductRow.displayName =
  "WorkerMarketProductRow";

/* ============================================================
   GALLERY PRODUCT
============================================================ */

const GalleryProduct =
  memo(
    function GalleryProduct({
      product,
      orderId,
      unavailable,
      disabled,
    }: ProductItemProps) {
      const productId =
        getSafeText(
          product.productId,
        );

      const productName =
        getSafeText(
          product.name,
          "Product",
        );

      const productImage =
        getSafeText(
          product.image,
        );

      const price =
        getSafePrice(
          product.price,
        );

      const quantity =
        getSafeQuantity(
          product.quantity,
        );

      const total =
        price *
        quantity;

      return (
        <View
          style={[
            styles.galleryItem,

            unavailable
              ? styles.galleryUnavailable
              : null,
          ]}
        >
          {/* ==================================================
              IMAGE
          ================================================== */}

          <View
            style={
              styles.galleryTop
            }
          >
            {productImage ? (
              <Image
                source={{
                  uri:
                    productImage,
                }}
                contentFit="cover"
                transition={150}
                recyclingKey={
                  productImage
                }
                accessibilityLabel={`${productName} product image`}
                style={
                  styles.galleryImage
                }
              />
            ) : (
              <View
                style={[
                  styles.galleryImage,
                  styles.galleryPlaceholder,
                ]}
              >
                <AppIcon
                  name="package"
                  size="xl"
                  color={
                    Colors.textMuted
                  }
                />
              </View>
            )}

            {unavailable ? (
              <View
                style={
                  styles.unavailableOverlay
                }
              >
                <AppIcon
                  name="error"
                  size="sm"
                  color={
                    Colors.textInverse
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.overlayText
                  }
                >
                  UNAVAILABLE
                </AppText>
              </View>
            ) : null}
          </View>

          {/* ==================================================
              INFO
          ================================================== */}

          <View
            style={
              styles.galleryInfo
            }
          >
            <AppText
              variant="bodyMedium"
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
              Quantity: {quantity}
            </AppText>

            <View
              style={
                styles.galleryBottom
              }
            >
              <AppText
                variant="caption"
                tone="secondary"
                style={
                  styles.galleryUnitPrice
                }
              >
                {formatMoney(
                  price,
                )}{" "}
                each
              </AppText>

              <AppText
                variant="bodyMedium"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.galleryTotal
                }
              >
                {formatMoney(
                  total,
                )}
              </AppText>
            </View>

            {/* ==================================================
                ACTION
            ================================================== */}

            <View
              style={
                styles.galleryAction
              }
            >
              <WorkerMarketProductUnavailable
                orderId={
                  orderId
                }
                productId={
                  productId
                }
                productName={
                  productName
                }
                disabled={
                  disabled ||
                  unavailable
                }
              />

              {unavailable ? (
                <ReportedBadge />
              ) : null}
            </View>
          </View>
        </View>
      );
    },
  );

GalleryProduct.displayName =
  "WorkerMarketGalleryProduct";

/* ============================================================
   REPORTED BADGE
============================================================ */

const ReportedBadge =
  memo(
    function ReportedBadge() {
      return (
        <View
          style={
            styles.reportedBadge
          }
        >
          <AppIcon
            name="success"
            size="xs"
            color={
              Colors.success
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.reportedText
            }
          >
            Reported unavailable
          </AppText>
        </View>
      );
    },
  );

ReportedBadge.displayName =
  "WorkerMarketReportedBadge";

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.lg,

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

    sectionHeader: {
      marginBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    headerContent: {
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

    viewAllButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

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

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    viewAllText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       PRODUCT ROW
    ======================================================== */

    productContainer: {
      paddingVertical:
        FixxamTokens.spacing.xs,
    },

    productRow: {
      minHeight: 84,

      paddingVertical:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    productBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    productImage: {
      width: 64,

      height: 64,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
      width: 64,

      height: 64,

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

    productInfo: {
      flex: 1,

      minWidth: 0,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    productName: {
      color:
        Colors.textPrimary,
    },

    productMeta: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    productTotal: {
      flexShrink: 1,

      maxWidth: 110,

      textAlign: "right",

      color:
        WorkerColors.primary,
    },

    /* ========================================================
       UNAVAILABLE
    ======================================================== */

    unavailableContainer: {
      paddingBottom:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      gap:
        FixxamTokens.spacing.sm,
    },

    reportedBadge: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

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

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    reportedText: {
      color:
        Colors.success,
    },

    /* ========================================================
       MORE
    ======================================================== */

    moreButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        WorkerColors.primarySoft,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    moreText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    empty: {
      minHeight: 140,

      alignItems:
        "center",

      justifyContent:
        "center",
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
        Colors.disabledBackground,
    },

    emptyText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textMuted,
    },

    /* ========================================================
       MODAL
    ======================================================== */

    modal: {
      flex: 1,

      backgroundColor:
        Colors.background,
    },

    modalHeader: {
      minHeight:
        FixxamTokens.size.headerHeight,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

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

    modalHeaderContent: {
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

    gallery: {
      padding:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    /* ========================================================
       GALLERY ITEM
    ======================================================== */

    galleryItem: {
      marginBottom:
        FixxamTokens.spacing.md,

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

    galleryUnavailable: {
      borderColor:
        Colors.error,
    },

    galleryTop: {
      position: "relative",
    },

    galleryImage: {
      width: "100%",

      height: 180,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    galleryPlaceholder: {
      alignItems:
        "center",

      justifyContent:
        "center",
    },

    unavailableOverlay: {
      position: "absolute",

      left:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      bottom:
        FixxamTokens.spacing.sm,

      minHeight:
        FixxamTokens.size.minimumTouchTarget,

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
        Colors.error,
    },

    overlayText: {
      color:
        Colors.textInverse,
    },

    galleryInfo: {
      paddingTop:
        FixxamTokens.spacing.xs,
    },

    galleryName: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    galleryQuantity: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    galleryBottom: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,
    },

    galleryUnitPrice: {
      flex: 1,

      color:
        Colors.textSecondary,
    },

    galleryTotal: {
      flexShrink: 1,

      color:
        WorkerColors.primary,
    },

    galleryAction: {
      marginTop:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      alignItems:
        "center",

      justifyContent:
        "flex-end",

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       INTERACTION
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