import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

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

type Props = {
  name: string;

  /**
   * Original product price.
   */
  price: number;

  /**
   * Active discounted price.
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

function normalizeCount(
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

function normalizePrice(
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

  return parsed;
}

function formatPrice(
  value: number,
): string {
  return `₦${value.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductInfo({
  name,
  price,
  discountedPrice,
  discountPercentage,
  category,
  stock,
  condition,
  delivery,
  rating = 0,
  reviews = 0,
  imagesCount = 1,
  currentImage = 1,
}: Props) {
  /* ============================================================
     NORMALIZED PRODUCT DATA
  ============================================================ */

  const productName =
    cleanString(name) ||
    "Product";

  const productCategory =
    cleanString(category) ||
    "Others";

  const safeStock =
    normalizeCount(
      stock,
    );

  const safeReviews =
    normalizeCount(
      reviews,
    );

  /* ============================================================
     RATING
  ============================================================ */

  const parsedRating =
    Number(rating);

  const safeRating =
    Number.isFinite(
      parsedRating,
    )
      ? Math.min(
          5,
          Math.max(
            0,
            parsedRating,
          ),
        )
      : 0;

  const hasRating =
    safeRating > 0;

  /* ============================================================
     PRICE
  ============================================================ */

  const originalPrice =
    normalizePrice(
      price,
    );

  const dealPrice =
    normalizePrice(
      discountedPrice,
    );

  const discount =
    Number(
      discountPercentage,
    );

  const hasDiscount =
    originalPrice > 0 &&
    dealPrice > 0 &&
    dealPrice <
      originalPrice;

  const hasDiscountPercentage =
    hasDiscount &&
    Number.isFinite(
      discount,
    ) &&
    discount > 0 &&
    discount < 100;

  /* ============================================================
     GALLERY
  ============================================================ */

  const safeImagesCount =
    normalizeCount(
      imagesCount,
    );

  const safeCurrentImage =
    useMemo(() => {
      if (
        safeImagesCount <= 0
      ) {
        return 0;
      }

      const parsed =
        normalizeCount(
          currentImage,
        );

      return Math.min(
        Math.max(
          parsed,
          1,
        ),
        safeImagesCount,
      );
    }, [
      currentImage,
      safeImagesCount,
    ]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          TITLE + GALLERY
      ====================================================== */}

      <View
        style={
          styles.titleRow
        }
      >
        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={2}
          style={
            styles.name
          }
        >
          {productName}
        </AppText>

        {safeImagesCount >
        0 ? (
          <View
            style={
              styles.galleryInfo
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.galleryTitle
              }
            >
              Gallery
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
            >
              {safeCurrentImage}/
              {safeImagesCount}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ======================================================
          RATING
      ====================================================== */}

      <View
        style={
          styles.ratingRow
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
            styles.rating
          }
        >
          {hasRating
            ? safeRating.toFixed(
                1,
              )
            : "New"}
        </AppText>

        {safeReviews >
        0 ? (
          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.reviews
            }
          >
            ({safeReviews}{" "}
            {safeReviews === 1
              ? "Review"
              : "Reviews"}
            )
          </AppText>
        ) : null}
      </View>

      {/* ======================================================
          PRICE
      ====================================================== */}

      {hasDiscount ? (
        <View
          style={
            styles.discountPriceSection
          }
        >
          <View
            style={
              styles.discountPriceRow
            }
          >
            <AppText
              variant="heading3"
              weight="bold"
              numberOfLines={1}
              style={
                styles.discountedPrice
              }
            >
              {formatPrice(
                dealPrice,
              )}
            </AppText>

            {hasDiscountPercentage ? (
              <View
                style={
                  styles.discountBadge
                }
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.discountBadgeText
                  }
                >
                  -
                  {Math.round(
                    discount,
                  )}
                  %
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText
            variant="caption"
            style={
              styles.originalPrice
            }
          >
            {formatPrice(
              originalPrice,
            )}
          </AppText>
        </View>
      ) : (
        <AppText
          variant="heading3"
          weight="bold"
          style={
            styles.price
          }
        >
          {formatPrice(
            originalPrice,
          )}
        </AppText>
      )}

      {/* ======================================================
          CATEGORY + STOCK
      ====================================================== */}

      <View
        style={
          styles.infoRow
        }
      >
        <View
          style={
            styles.infoBox
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Category
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              styles.infoValue
            }
          >
            {productCategory}
          </AppText>
        </View>

        <View
          style={
            styles.infoBox
          }
        >
          <AppText
            variant="caption"
            tone="secondary"
          >
            Stock
          </AppText>

          <AppText
            variant="bodyMedium"
            weight="bold"
            numberOfLines={1}
            style={
              safeStock > 0
                ? styles.infoValue
                : styles.outOfStockValue
            }
          >
            {safeStock > 0
              ? safeStock
              : "Out"}
          </AppText>
        </View>
      </View>

      {/* ======================================================
          TAGS
      ====================================================== */}

      <View
        style={
          styles.tags
        }
      >
        <View
          style={
            styles.tag
          }
        >
          <AppText
            variant="caption"
            weight="bold"
            style={
              styles.tagText
            }
          >
            {condition ===
            "new"
              ? "New"
              : "Used"}
          </AppText>
        </View>

        {delivery ? (
          <View
            style={
              styles.tag
            }
          >
            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.tagText
              }
            >
              Delivery
            </AppText>
          </View>
        ) : null}

        {hasDiscount ? (
          <View
            style={
              styles.saleTag
            }
          >
            <AppIcon
              name="payment"
              role="customer"
              size="xs"
              state="success"
            />

            <AppText
              variant="caption"
              weight="bold"
              style={
                styles.saleTagText
              }
            >
              Special Offer
            </AppText>
          </View>
        ) : null}
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
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       TITLE
    ======================================================== */

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

      minWidth: 0,

      paddingRight:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    galleryInfo: {
      minWidth: 48,

      flexShrink: 0,

      alignItems:
        "flex-end",
    },

    galleryTitle: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.xs,
    },

    rating: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    reviews: {
      marginLeft:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       NORMAL PRICE
    ======================================================== */

    price: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       DISCOUNT PRICE
    ======================================================== */

    discountPriceSection: {
      marginTop:
        FixxamTokens.spacing.sm,
    },

    discountPriceRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.sm,
    },

    discountedPrice: {
      color:
        Colors.success,
    },

    originalPrice: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,

      textDecorationLine:
        "line-through",
    },

    discountBadge: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.successSoft,
    },

    discountBadgeText: {
      color:
        Colors.success,
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoRow: {
      flexDirection:
        "row",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.md,
    },

    infoBox: {
      flex: 1,

      minWidth: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    infoValue: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    outOfStockValue: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.error,
    },

    /* ========================================================
       TAGS
    ======================================================== */

    tags: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    tag: {
      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    tagText: {
      color:
        CustomerColors.primary,
    },

    saleTag: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.successSoft,
    },

    saleTagText: {
      color:
        Colors.success,
    },
  });

export default memo(
  ProductInfo,
);