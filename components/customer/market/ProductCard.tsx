import React from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

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

function formatPrice(
  value: number,
): string {
  const safeValue = Number(value);

  if (
    !Number.isFinite(safeValue) ||
    safeValue < 0
  ) {
    return "0";
  }

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

export default function ProductCard({
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
  /* ============================================================
     SAFE PRICE
  ============================================================ */

  const originalPrice =
    Number(price);

  const discount =
    Number(discountPercentage);

  const dealPrice =
    Number(discountedPrice);

  /* ============================================================
     VALID DEAL
  ============================================================ */

  const hasDiscount =
    Number.isFinite(
      originalPrice,
    ) &&
    originalPrice > 0 &&
    Number.isFinite(discount) &&
    discount > 0 &&
    discount < 100 &&
    Number.isFinite(dealPrice) &&
    dealPrice > 0 &&
    dealPrice < originalPrice;

  const displayPrice =
    hasDiscount
      ? dealPrice
      : originalPrice;

  const displayDiscount =
    hasDiscount
      ? Math.round(discount)
      : 0;

  /* ============================================================
     SAFE STOCK
  ============================================================ */

  const safeStock =
    Number(stock);

  const hasStock =
    Number.isFinite(
      safeStock,
    ) &&
    safeStock > 0;

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
          PRODUCT
      ====================================================== */}

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.productContent,
          pressed &&
            styles.productPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View ${name}`}
      >
        {/* ====================================================
            IMAGE
        ==================================================== */}

        <View
          style={
            styles.imageContainer
          }
        >
          {image?.trim() ? (
            <Image
              source={{
                uri: image.trim(),
              }}
              style={
                styles.image
              }
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.imagePlaceholder
              }
            >
              <Ionicons
                name="cube-outline"
                size={30}
                color="#94A3B8"
              />
            </View>
          )}

          {/* ==================================================
              FEATURED
          ================================================== */}

          {featured && (
            <View
              style={
                styles.featuredBadge
              }
            >
              <Ionicons
                name="star"
                size={10}
                color="#F59E0B"
              />

              <AppText
                weight="bold"
                style={
                  styles.featuredText
                }
              >
                Featured
              </AppText>
            </View>
          )}

          {/* ==================================================
              DISCOUNT
          ================================================== */}

          {hasDiscount && (
            <View
              style={
                styles.discountBadge
              }
            >
              <AppText
                weight="bold"
                style={
                  styles.discountText
                }
              >
                -{displayDiscount}%
              </AppText>
            </View>
          )}
        </View>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <View
          style={
            styles.content
          }
        >
          {/* PRODUCT NAME */}

          <AppText
            weight="bold"
            numberOfLines={2}
            style={
              styles.name
            }
          >
            {name}
          </AppText>

          {/* CATEGORY */}

          {!!category && (
            <AppText
              numberOfLines={1}
              style={
                styles.category
              }
            >
              {category}
            </AppText>
          )}

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
                weight="bold"
                numberOfLines={1}
                style={
                  hasDiscount
                    ? styles.discountedPrice
                    : styles.price
                }
              >
                ₦
                {formatPrice(
                  displayPrice,
                )}
              </AppText>

              {hasDiscount && (
                <AppText
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
              )}
            </View>
          </View>

          {/* ==================================================
              DEAL / NO DEAL
          ================================================== */}

          <View
            style={[
              styles.dealRow,
              !hasDiscount &&
                styles.noDealRow,
            ]}
          >
            <Ionicons
              name={
                hasDiscount
                  ? "pricetag"
                  : "pricetag-outline"
              }
              size={11}
              color={
                hasDiscount
                  ? "#2563EB"
                  : "#94A3B8"
              }
            />

            <AppText
              weight="bold"
              style={[
                styles.dealText,
                !hasDiscount &&
                  styles.noDealText,
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
            style={
              styles.stockRow
            }
          >
            <View
              style={
                styles.stockBadge
              }
            >
              <Ionicons
                name={
                  hasStock
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={11}
                color={
                  hasStock
                    ? "#16A34A"
                    : "#DC2626"
                }
              />

              <AppText
                weight="bold"
                style={[
                  styles.stockText,
                  !hasStock &&
                    styles.outOfStockText,
                ]}
              >
                {hasStock
                  ? `${safeStock} available`
                  : "Out of stock"}
              </AppText>
            </View>
          </View>
        </View>
      </Pressable>

      {/* ======================================================
          ADD TO CART
      ====================================================== */}

      <View
        style={
          styles.cartRow
        }
      >
        <AppText
          numberOfLines={1}
          style={
            styles.cartHint
          }
        >
          Add to cart
        </AppText>

        <Pressable
          onPress={(event) => {
            event.stopPropagation();

            if (hasStock) {
              onBuyPress();
            }
          }}
          disabled={!hasStock}
          hitSlop={8}
          style={({ pressed }) => [
            styles.cartButton,
            !hasStock &&
              styles.cartButtonDisabled,
            pressed &&
              hasStock &&
              styles.cartPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            hasStock
              ? `Add ${name} to cart`
              : `${name} is out of stock`
          }
          accessibilityState={{
            disabled: !hasStock,
          }}
        >
          <Ionicons
            name="cart-outline"
            size={20}
            color="#FFFFFF"
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
    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      width: "100%",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      overflow: "hidden",

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.05,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,

        height: 2,
      },

      elevation: 2,
    },

    productContent: {
      backgroundColor:
        "#FFFFFF",
    },

    productPressed: {
      opacity: 0.88,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    /* ==========================================================
       IMAGE
    ========================================================== */

    imageContainer: {
      width: "100%",

      height: 132,

      backgroundColor:
        "#F1F5F9",

      position:
        "relative",
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
        "#F8FAFC",
    },

    /* ==========================================================
       FEATURED
    ========================================================== */

    featuredBadge: {
      position:
        "absolute",

      top: 8,

      left: 8,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 10,

      backgroundColor:
        "#FFFFFF",

      shadowColor:
        "#0F172A",

      shadowOpacity: 0.08,

      shadowRadius: 3,

      shadowOffset: {
        width: 0,

        height: 1,
      },

      elevation: 2,
    },

    featuredText: {
      marginLeft: 4,

      fontSize: 9,

      color:
        "#475569",
    },

    /* ==========================================================
       DISCOUNT
    ========================================================== */

    discountBadge: {
      position:
        "absolute",

      top: 8,

      right: 8,

      minWidth: 46,

      height: 36,

      paddingHorizontal: 8,

      borderRadius: 12,

      /*
       * RED percentage badge
       */
      backgroundColor:
        "#DC2626",

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#DC2626",

      shadowOpacity: 0.18,

      shadowRadius: 4,

      shadowOffset: {
        width: 0,

        height: 2,
      },

      elevation: 3,
    },

    discountText: {
      fontSize: 12,

      color:
        "#FFFFFF",
    },

    /* ==========================================================
       CONTENT
    ========================================================== */

    content: {
      paddingHorizontal: 10,

      paddingTop: 10,

      paddingBottom: 8,
    },

    name: {
      fontSize: 14,

      lineHeight: 18,

      color:
        "#0F172A",

      minHeight: 36,
    },

    category: {
      marginTop: 3,

      fontSize: 10,

      color:
        "#64748B",
    },

    /* ==========================================================
       PRICE
    ========================================================== */

    priceSection: {
      marginTop: 7,

      minHeight: 22,

      justifyContent:
        "center",
    },

    priceRow: {
      flexDirection:
        "row",

      alignItems:
        "baseline",

      flexWrap:
        "wrap",

      columnGap: 6,

      rowGap: 1,
    },

    price: {
      fontSize: 16,

      lineHeight: 21,

      color:
        "#2563EB",
    },

    discountedPrice: {
      fontSize: 16,

      lineHeight: 21,

      color:
        "#2563EB",
    },

    originalPrice: {
      fontSize: 10,

      lineHeight: 14,

      color:
        "#94A3B8",

      textDecorationLine:
        "line-through",
    },

    /* ==========================================================
       DEAL
    ========================================================== */

    dealRow: {
      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 5,

      paddingHorizontal: 6,

      paddingVertical: 3,

      borderRadius: 7,

      backgroundColor:
        "#EFF6FF",
    },

    dealText: {
      marginLeft: 4,

      fontSize: 8,

      color:
        "#2563EB",
    },

    /* ==========================================================
       NO DEAL
    ========================================================== */

    noDealRow: {
      backgroundColor:
        "#F8FAFC",
    },

    noDealText: {
      color:
        "#94A3B8",
    },

    /* ==========================================================
       STOCK
    ========================================================== */

    stockRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 5,
    },

    stockBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 6,

      paddingVertical: 3,

      borderRadius: 7,

      backgroundColor:
        "#F0FDF4",
    },

    stockText: {
      marginLeft: 4,

      fontSize: 8,

      color:
        "#16A34A",
    },

    outOfStockText: {
      color:
        "#DC2626",
    },

    /* ==========================================================
       CART
    ========================================================== */

    cartRow: {
      minHeight: 48,

      paddingHorizontal: 8,

      paddingVertical: 7,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#FFFFFF",
    },

    cartHint: {
      flex: 1,

      marginRight: 6,

      fontSize: 10,

      color:
        "#64748B",
    },

    cartButton: {
      width: 38,

      height: 38,

      borderRadius: 11,

      backgroundColor:
        "#2563EB",

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#2563EB",

      shadowOpacity: 0.18,

      shadowRadius: 4,

      shadowOffset: {
        width: 0,

        height: 2,
      },

      elevation: 3,
    },

    cartButtonDisabled: {
      backgroundColor:
        "#CBD5E1",

      shadowOpacity: 0,

      elevation: 0,
    },

    cartPressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.94,
        },
      ],
    },
  });