import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
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

/* ==============================================================
   TYPES
============================================================== */

export type ProductCardProps = {
  id: string;

  name: string;

  price: number;

  image?: string;

  category?: string;

  rating?: number;

  sold?: number;

  stock?: number;

  featured?: boolean;

  discountPercentage?: number;

  discountedPrice?: number;

  onPress: () => void;

  onBuyPress: () => void;

  style?: StyleProp<ViewStyle>;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizePrice(
  value: unknown,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return 0;
  }

  return parsed;
}

function normalizeStock(
  value: unknown,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return 0;
  }

  return Math.floor(
    parsed,
  );
}

function formatPrice(
  value: number,
): string {
  const safeValue =
    normalizePrice(value);

  return safeValue.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        safeValue % 1 === 0
          ? 0
          : 2,

      maximumFractionDigits: 2,
    },
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductCard({
  name,
  price,
  image,
  category,
  stock = 0,
  featured = false,
  discountPercentage,
  discountedPrice,
  onPress,
  onBuyPress,
  style,
}: ProductCardProps) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  /* ============================================================
     PRODUCT
  ============================================================ */

  const productName =
    cleanString(name) ||
    "Product";

  const categoryName =
    cleanString(
      category,
    );

  const imageUrl =
    cleanString(
      image,
    );

  useEffect(() => {
    setImageFailed(
      false,
    );
  }, [
    imageUrl,
  ]);

  const showImage =
    Boolean(imageUrl) &&
    !imageFailed;

  /* ============================================================
     PRICE
  ============================================================ */

  const originalPrice =
    normalizePrice(
      price,
    );

  const discount =
    Number(
      discountPercentage,
    );

  const dealPrice =
    normalizePrice(
      discountedPrice,
    );

  const hasDiscount =
    originalPrice > 0 &&
    Number.isFinite(
      discount,
    ) &&
    discount > 0 &&
    discount < 100 &&
    dealPrice > 0 &&
    dealPrice <
      originalPrice;

  const displayPrice =
    hasDiscount
      ? dealPrice
      : originalPrice;

  const displayDiscount =
    hasDiscount
      ? Math.round(
          discount,
        )
      : 0;

  /* ============================================================
     STOCK
  ============================================================ */

  const safeStock =
    normalizeStock(
      stock,
    );

  const hasStock =
    safeStock > 0;

  const stockLabel =
    useMemo(
      () =>
        hasStock
          ? `${safeStock} ${
              safeStock === 1
                ? "item"
                : "items"
            } available`
          : "Out of stock",
      [
        hasStock,
        safeStock,
      ],
    );

  /* ============================================================
     ADD TO CART
  ============================================================ */

  const handleBuyPress =
    () => {
      if (!hasStock) {
        return;
      }

      onBuyPress();
    };

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={[
        styles.card,
        style,
      ]}
    >
      {/* ======================================================
          PRODUCT CONTENT
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${productName}`}
        onPress={onPress}
        style={({
          pressed,
        }) => [
          styles.productContent,

          pressed
            ? styles.productPressed
            : null,
        ]}
      >
        {/* ====================================================
            IMAGE
        ==================================================== */}

        <View
          style={
            styles.imageContainer
          }
        >
          {showImage ? (
            <Image
              source={{
                uri:
                  imageUrl,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
              style={
                styles.image
              }
              accessibilityLabel={`${productName} product image`}
              onError={() =>
                setImageFailed(
                  true,
                )
              }
            />
          ) : (
            <View
              style={
                styles.imagePlaceholder
              }
            >
              <AppIcon
                name="package"
                role="customer"
                size="xl"
                state="muted"
              />
            </View>
          )}

          {/* ==================================================
              FEATURED
          ================================================== */}

          {featured ? (
            <View
              style={
                styles.featuredBadge
              }
            >
              <AppIcon
                name="star"
                role="customer"
                size="xs"
                color={
                  Colors.warning
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.featuredText
                }
              >
                Featured
              </AppText>
            </View>
          ) : null}

          {/* ==================================================
              DISCOUNT
          ================================================== */}

          {hasDiscount ? (
            <View
              style={
                styles.discountBadge
              }
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.discountText
                }
              >
                -{displayDiscount}%
              </AppText>
            </View>
          ) : null}
        </View>

        {/* ====================================================
            DETAILS
        ==================================================== */}

        <View
          style={
            styles.content
          }
        >
          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={2}
            style={
              styles.name
            }
          >
            {productName}
          </AppText>

          {/* ==================================================
              CATEGORY
          ================================================== */}

          {categoryName ? (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.category
              }
            >
              {categoryName}
            </AppText>
          ) : null}

          {/* ==================================================
              PRICE
          ================================================== */}

          <View
            style={
              styles.priceSection
            }
          >
            <View
              style={
                styles.priceRow
              }
            >
              <AppText
                variant="bodyLarge"
                weight="bold"
                numberOfLines={1}
                style={
                  styles.price
                }
              >
                ₦
                {formatPrice(
                  displayPrice,
                )}
              </AppText>

              {hasDiscount ? (
                <AppText
                  variant="caption"
                  numberOfLines={1}
                  style={
                    styles.originalPrice
                  }
                >
                  ₦
                  {formatPrice(
                    originalPrice,
                  )}
                </AppText>
              ) : null}
            </View>
          </View>

          {/* ==================================================
              DEAL
          ================================================== */}

          <View
            style={[
              styles.dealRow,

              hasDiscount
                ? styles.activeDealRow
                : styles.noDealRow,
            ]}
          >
            <AppIcon
              name={
                hasDiscount
                  ? "payment"
                  : "info"
              }
              role="customer"
              size="xs"
              color={
                hasDiscount
                  ? CustomerColors.primary
                  : Colors.textMuted
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              style={[
                styles.dealText,

                !hasDiscount
                  ? styles.noDealText
                  : null,
              ]}
            >
              {hasDiscount
                ? "Deal"
                : "No Deal"}
            </AppText>
          </View>

          {/* ==================================================
              STOCK
          ================================================== */}

          <View
            style={[
              styles.stockBadge,

              hasStock
                ? styles.inStockBadge
                : styles.outOfStockBadge,
            ]}
          >
            <AppIcon
              name={
                hasStock
                  ? "success"
                  : "error"
              }
              role="customer"
              size="xs"
              state={
                hasStock
                  ? "success"
                  : "error"
              }
            />

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={1}
              style={[
                styles.stockText,

                hasStock
                  ? styles.inStockText
                  : styles.outOfStockText,
              ]}
            >
              {stockLabel}
            </AppText>
          </View>
        </View>
      </Pressable>

      {/* ======================================================
          CART ACTION
      ====================================================== */}

      <View
        style={
          styles.cartRow
        }
      >
        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={1}
          style={
            styles.cartHint
          }
        >
          {hasStock
            ? "Add to cart"
            : "Unavailable"}
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            hasStock
              ? `Add ${productName} to cart`
              : `${productName} is out of stock`
          }
          accessibilityState={{
            disabled:
              !hasStock,
          }}
          disabled={
            !hasStock
          }
          hitSlop={6}
          onPress={
            handleBuyPress
          }
          style={({
            pressed,
          }) => [
            styles.cartButton,

            !hasStock
              ? styles.cartButtonDisabled
              : null,

            pressed &&
            hasStock
              ? styles.cartPressed
              : null,
          ]}
        >
          <AppIcon
            name={
              hasStock
                ? "add"
                : "close"
            }
            role="customer"
            size="sm"
            color={
              Colors.textInverse
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CARD
    ======================================================== */

    card: {
      width: "100%",

      overflow:
        "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    productContent: {
      backgroundColor:
        Colors.surface,
    },

    productPressed: {
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

    /* ========================================================
       IMAGE
    ======================================================== */

    imageContainer: {
      position:
        "relative",

      width: "100%",

      height: 132,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width: "100%",

      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       FEATURED
    ======================================================== */

    featuredBadge: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      left:
        FixxamTokens.spacing.sm,

      minHeight: 28,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    featuredText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DISCOUNT
    ======================================================== */

    discountBadge: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      minWidth: 46,

      minHeight: 34,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.error,
    },

    discountText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.sm,
    },

    name: {
      minHeight: 36,

      color:
        Colors.textPrimary,
    },

    category: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    priceSection: {
      minHeight: 24,

      justifyContent:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    priceRow: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      alignItems:
        "baseline",

      columnGap:
        FixxamTokens.spacing.xs,
    },

    price: {
      color:
        CustomerColors.primary,
    },

    originalPrice: {
      color:
        Colors.textMuted,

      textDecorationLine:
        "line-through",
    },

    /* ========================================================
       DEAL
    ======================================================== */

    dealRow: {
      alignSelf:
        "flex-start",

      minHeight: 24,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    activeDealRow: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    noDealRow: {
      backgroundColor:
        Colors.disabledBackground,
    },

    dealText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        CustomerColors.primary,
    },

    noDealText: {
      color:
        Colors.textMuted,
    },

    /* ========================================================
       STOCK
    ======================================================== */

    stockBadge: {
      alignSelf:
        "flex-start",

      minHeight: 24,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    inStockBadge: {
      backgroundColor:
        Colors.successSoft,
    },

    outOfStockBadge: {
      backgroundColor:
        Colors.errorSoft,
    },

    stockText: {
      marginLeft:
        FixxamTokens.spacing.xs,
    },

    inStockText: {
      color:
        Colors.success,
    },

    outOfStockText: {
      color:
        Colors.error,
    },

    /* ========================================================
       CART
    ======================================================== */

    cartRow: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    cartHint: {
      flex: 1,

      minWidth: 0,

      marginRight:
        FixxamTokens.spacing.sm,
    },

    cartButton: {
      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    cartButtonDisabled: {
      backgroundColor:
        Colors.disabled,
    },

    cartPressed: {
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

export default memo(
  ProductCard,
);