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
} from "react-native";

import {
  Image,
} from "expo-image";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import type {
  ActiveProductDeal,
} from "@/services/deals/getActiveProductDeal";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

export interface ProductGridCardProps {
  id: string;

  name: string;

  price: number;

  image: string;

  activeDeal?:
    | ActiveProductDeal
    | null;

  /**
   * Optional real product rating.
   * Do not pass fake/default ratings.
   */
  rating?: number;

  /**
   * Optional real review count.
   */
  reviews?: number;

  /**
   * Controlled favorite state.
   */
  favorite?: boolean;

  /**
   * Only provide this when favorite
   * persistence is actually implemented.
   */
  onFavoritePress?: () => void;

  onPress: () => void;

  onBuy: () => void;
}

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

  return Math.floor(parsed);
}

function normalizeRating(
  value: unknown,
): number | null {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return Math.min(
    5,
    Math.max(
      0,
      parsed,
    ),
  );
}

function getRemoteImageUrl(
  value: unknown,
): string {
  const url =
    cleanString(value);

  if (
    url.startsWith(
      "https://",
    ) ||
    url.startsWith(
      "http://",
    )
  ) {
    return url;
  }

  return "";
}

function formatPrice(
  value: number,
): string {
  return value.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        value % 1 === 0
          ? 0
          : 2,

      maximumFractionDigits: 2,
    },
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductGridCard({
  name,
  price,
  image,
  activeDeal,
  rating,
  reviews,
  favorite = false,
  onFavoritePress,
  onPress,
  onBuy,
}: ProductGridCardProps) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  /* ============================================================
     PRODUCT DATA
  ============================================================ */

  const productName =
    cleanString(name) ||
    "Product";

  const imageUrl =
    getRemoteImageUrl(
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
     PRICE + DEAL
  ============================================================ */

  const originalPrice =
    normalizePrice(
      price,
    );

  const dealPrice =
    normalizePrice(
      activeDeal
        ?.discountedPrice,
    );

  const parsedDiscount =
    Number(
      activeDeal
        ?.discountPercentage,
    );

  const hasDeal =
    Boolean(activeDeal) &&
    originalPrice > 0 &&
    dealPrice > 0 &&
    dealPrice <
      originalPrice &&
    Number.isFinite(
      parsedDiscount,
    ) &&
    parsedDiscount > 0 &&
    parsedDiscount < 100;

  const discountPercentage =
    hasDeal
      ? Math.round(
          parsedDiscount,
        )
      : 0;

  const displayPrice =
    hasDeal
      ? dealPrice
      : originalPrice;

  /* ============================================================
     RATING
  ============================================================ */

  const safeRating =
    useMemo(
      () =>
        normalizeRating(
          rating,
        ),
      [
        rating,
      ],
    );

  const safeReviews =
    normalizeCount(
      reviews,
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <View
      style={
        styles.card
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${productName}`}
        onPress={
          onPress
        }
        style={({
          pressed,
        }) => [
          styles.productPressable,

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
              style={
                styles.image
              }
              contentFit="cover"
              cachePolicy="memory-disk"
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
              DISCOUNT
          ================================================== */}

          {hasDeal ? (
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
                -{discountPercentage}%
              </AppText>
            </View>
          ) : null}

          {/* ==================================================
              FAVORITE
          ================================================== */}

          {onFavoritePress ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                favorite
                  ? `Remove ${productName} from favorites`
                  : `Add ${productName} to favorites`
              }
              accessibilityState={{
                selected:
                  favorite,
              }}
              hitSlop={6}
              onPress={(
                event,
              ) => {
                event.stopPropagation();

                onFavoritePress();
              }}
              style={({
                pressed,
              }) => [
                styles.favoriteButton,

                favorite
                  ? styles.favoriteActive
                  : null,

                pressed
                  ? styles.favoritePressed
                  : null,
              ]}
            >
              <AppIcon
                name="heart"
                role="customer"
                size="sm"
                color={
                  favorite
                    ? Colors.error
                    : Colors.textSecondary
                }
              />
            </Pressable>
          ) : null}
        </View>

        {/* ====================================================
            CONTENT
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
              RATING
          ================================================== */}

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
              {safeRating !==
              null
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
                numberOfLines={1}
                style={
                  styles.reviews
                }
              >
                ({safeReviews})
              </AppText>
            ) : null}
          </View>

          {/* ==================================================
              PRICE
          ================================================== */}

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

            {hasDeal ? (
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

          {/* ==================================================
              BOTTOM
          ================================================== */}

          <View
            style={
              styles.bottomRow
            }
          >
            <View
              style={[
                styles.dealStatus,

                hasDeal
                  ? styles.activeDealStatus
                  : styles.noDealStatus,
              ]}
            >
              <AppIcon
                name={
                  hasDeal
                    ? "payment"
                    : "info"
                }
                role="customer"
                size="xs"
                color={
                  hasDeal
                    ? CustomerColors.primary
                    : Colors.textMuted
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                numberOfLines={1}
                style={[
                  styles.dealStatusText,

                  hasDeal
                    ? styles.dealActiveText
                    : null,
                ]}
              >
                {hasDeal
                  ? "Deal"
                  : "No Deal"}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Buy ${productName}`}
              hitSlop={4}
              onPress={(
                event,
              ) => {
                event.stopPropagation();

                onBuy();
              }}
              style={({
                pressed,
              }) => [
                styles.buyButton,

                pressed
                  ? styles.buyPressed
                  : null,
              ]}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.buyText
                }
              >
                Buy
              </AppText>
            </Pressable>
          </View>
        </View>
      </Pressable>
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

    productPressable: {
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

      aspectRatio: 1,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width: "100%",

      height: "100%",

      backgroundColor:
        Colors.disabledBackground,
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
       DISCOUNT
    ======================================================== */

    discountBadge: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      left:
        FixxamTokens.spacing.sm,

      minWidth: 46,

      minHeight: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.error,
    },

    discountText: {
      color:
        Colors.textInverse,
    },

    /* ========================================================
       FAVORITE
    ======================================================== */

    favoriteButton: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      width:
        FixxamTokens.size
          .minimumTouchTarget,

      height:
        FixxamTokens.size
          .minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    favoriteActive: {
      backgroundColor:
        Colors.errorSoft,
    },

    favoritePressed: {
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
       CONTENT
    ======================================================== */

    content: {
      padding:
        FixxamTokens.spacing.sm,
    },

    name: {
      minHeight: 36,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingRow: {
      minHeight: 20,

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
       PRICE
    ======================================================== */

    priceRow: {
      minHeight: 24,

      flexDirection:
        "row",

      flexWrap:
        "wrap",

      alignItems:
        "baseline",

      columnGap:
        FixxamTokens.spacing.xs,

      marginTop:
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
       BOTTOM
    ======================================================== */

    bottomRow: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    dealStatus: {
      flex: 1,

      minWidth: 0,

      minHeight: 26,

      flexDirection:
        "row",

      alignItems:
        "center",

      alignSelf:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,
    },

    activeDealStatus: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    noDealStatus: {
      backgroundColor:
        Colors.disabledBackground,
    },

    dealStatusText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },

    dealActiveText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       BUY
    ======================================================== */

    buyButton: {
      minWidth: 58,

      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        CustomerColors.primary,
    },

    buyText: {
      color:
        Colors.textInverse,
    },

    buyPressed: {
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
  ProductGridCard,
);