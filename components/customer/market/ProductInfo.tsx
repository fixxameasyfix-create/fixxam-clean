import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  name: string;

  /**
   * Original product price.
   */
  price: number;

  /**
   * Active discounted price.
   *
   * null/undefined means there is
   * currently no active discount.
   */
  discountedPrice?: number | null;

  /**
   * Active discount percentage.
   */
  discountPercentage?: number | null;

  category: string;

  stock: number;

  condition:
    | "new"
    | "used";

  delivery: boolean;

  rating?: number;

  reviews?: number;

  imagesCount?: number;

  currentImage?: number;
};

export default function ProductInfo({
  name,
  price,
  discountedPrice,
  discountPercentage,
  category,
  stock,
  condition,
  delivery,
  rating = 4.8,
  reviews = 0,
  imagesCount = 1,
  currentImage = 1,
}: Props) {
  /* ==========================================================
     PRICE
  ========================================================== */

  const originalPrice =
    Number(price);

  const validOriginalPrice =
    Number.isFinite(
      originalPrice,
    ) &&
    originalPrice > 0
      ? originalPrice
      : 0;

  const parsedDiscountedPrice =
    Number(
      discountedPrice,
    );

  const hasDiscount =
    Number.isFinite(
      parsedDiscountedPrice,
    ) &&
    parsedDiscountedPrice > 0 &&
    parsedDiscountedPrice <
      validOriginalPrice;

  const parsedDiscountPercentage =
    Number(
      discountPercentage,
    );

  const hasDiscountPercentage =
    Number.isFinite(
      parsedDiscountPercentage,
    ) &&
    parsedDiscountPercentage > 0 &&
    parsedDiscountPercentage <
      100;

  /* ==========================================================
     FORMATTING
  ========================================================== */

  const formatPrice = (
    value: number,
  ) =>
    `₦${value.toLocaleString(
      "en-NG",
    )}`;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={styles.titleRow}
      >
        <AppText
          weight="bold"
          numberOfLines={2}
          style={styles.name}
        >
          {name}
        </AppText>

        {imagesCount > 0 && (
          <View
            style={
              styles.galleryInfo
            }
          >
            <AppText
              weight="bold"
              style={
                styles.galleryTitle
              }
            >
              Gallery
            </AppText>

            <AppText
              style={
                styles.galleryCount
              }
            >
              {currentImage}/
              {imagesCount}
            </AppText>
          </View>
        )}
      </View>

      {/* ======================================================
          RATING
      ====================================================== */}

      <View
        style={styles.ratingRow}
      >
        <Ionicons
          name="star"
          size={13}
          color="#F59E0B"
        />

        <AppText
          style={styles.rating}
        >
          {Number(
            rating,
          ).toFixed(1)}
        </AppText>

        <AppText
          style={styles.reviews}
        >
          ({reviews} Reviews)
        </AppText>
      </View>

      {/* ======================================================
          PRICE
      ====================================================== */}

      {hasDiscount ? (
        <View
          style={styles.discountPriceSection}
        >
          <View
            style={
              styles.discountPriceRow
            }
          >
            <AppText
              weight="bold"
              style={
                styles.discountedPrice
              }
              numberOfLines={1}
            >
              {formatPrice(
                parsedDiscountedPrice,
              )}
            </AppText>

            {hasDiscountPercentage && (
              <View
                style={
                  styles.discountBadge
                }
              >
                <AppText
                  weight="bold"
                  style={
                    styles.discountBadgeText
                  }
                >
                  -
                  {Math.round(
                    parsedDiscountPercentage,
                  )}
                  %
                </AppText>
              </View>
            )}
          </View>

          <AppText
            style={
              styles.originalPrice
            }
          >
            {formatPrice(
              validOriginalPrice,
            )}
          </AppText>
        </View>
      ) : (
        <AppText
          weight="bold"
          style={styles.price}
        >
          {formatPrice(
            validOriginalPrice,
          )}
        </AppText>
      )}

      {/* ======================================================
          CATEGORY + STOCK
      ====================================================== */}

      <View
        style={styles.infoRow}
      >
        <View
          style={styles.infoBox}
        >
          <AppText
            style={styles.label}
          >
            Category
          </AppText>

          <AppText
            weight="bold"
            numberOfLines={1}
            style={styles.value}
          >
            {category ||
              "Others"}
          </AppText>
        </View>

        <View
          style={styles.infoBox}
        >
          <AppText
            style={styles.label}
          >
            Stock
          </AppText>

          <AppText
            weight="bold"
            style={styles.value}
          >
            {stock}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          TAGS
      ====================================================== */}

      <View
        style={styles.tags}
      >
        <View
          style={styles.tag}
        >
          <AppText
            style={styles.tagText}
          >
            {condition ===
            "new"
              ? "New"
              : "Used"}
          </AppText>
        </View>

        {delivery && (
          <View
            style={styles.tag}
          >
            <AppText
              style={styles.tagText}
            >
              Delivery
            </AppText>
          </View>
        )}

        {hasDiscount && (
          <View
            style={
              styles.saleTag
            }
          >
            <Ionicons
              name="pricetag-outline"
              size={11}
              color="#16A34A"
            />

            <AppText
              style={
                styles.saleTagText
              }
            >
              Special Offer
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor:
        "#FFFFFF",
    },

    titleRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",
    },

    name: {
      flex: 1,
      paddingRight: 8,
      fontSize: 14,
      lineHeight: 18,
      color: "#111827",
    },

    galleryInfo: {
      alignItems:
        "flex-end",
      minWidth: 45,
    },

    galleryTitle: {
      fontSize: 10,
      lineHeight: 13,
      color: "#2563EB",
    },

    galleryCount: {
      marginTop: 1,
      fontSize: 9,
      lineHeight: 12,
      color: "#64748B",
    },

    ratingRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 2,
    },

    rating: {
      marginLeft: 3,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "700",
      color: "#111827",
    },

    reviews: {
      marginLeft: 4,
      fontSize: 9,
      lineHeight: 13,
      color: "#6B7280",
    },

    /* ========================================================
       NORMAL PRICE
    ======================================================== */

    price: {
      marginTop: 7,
      fontSize: 20,
      lineHeight: 24,
      color: "#2563EB",
    },

    /* ========================================================
       DISCOUNT PRICE
    ======================================================== */

    discountPriceSection: {
      marginTop: 7,
    },

    discountPriceRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    discountedPrice: {
      fontSize: 21,
      lineHeight: 25,
      color: "#16A34A",
    },

    originalPrice: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 17,
      color: "#94A3B8",
      textDecorationLine:
        "line-through",
    },

    discountBadge: {
      marginLeft: 8,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor:
        "#DCFCE7",
    },

    discountBadgeText: {
      fontSize: 10,
      lineHeight: 13,
      color: "#15803D",
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      flexDirection:
        "row",
      gap: 6,
      marginTop: 8,
    },

    infoBox: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 9,
      backgroundColor:
        "#F8FAFC",
    },

    label: {
      marginBottom: 1,
      fontSize: 9,
      lineHeight: 12,
      color: "#6B7280",
    },

    value: {
      fontSize: 10,
      lineHeight: 14,
      color: "#111827",
    },

    /* ========================================================
       TAGS
    ======================================================== */

    tags: {
      flexDirection:
        "row",
      alignItems:
        "center",
      flexWrap: "wrap",
      gap: 5,
      marginTop: 7,
    },

    tag: {
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 9,
      backgroundColor:
        "#EFF6FF",
    },

    tagText: {
      fontSize: 9,
      lineHeight: 12,
      fontWeight: "700",
      color: "#2563EB",
    },

    saleTag: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 3,
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 9,
      backgroundColor:
        "#F0FDF4",
    },

    saleTagText: {
      fontSize: 9,
      lineHeight: 12,
      fontWeight: "700",
      color: "#16A34A",
    },
  });