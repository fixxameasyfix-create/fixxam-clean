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

import ProductCardMenu from "./ProductCardMenu";

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

  workerId?: string;

  name: string;

  price: number;

  image: string;

  activeDeal?:
    | ActiveProductDeal
    | null;

  rating?: number;

  reviews?: number;

  favorite?: boolean;

  favoriteCount?: number;

  ratingCount?: number;

  reviewCount?: number;

  onFavoritePress?: () => void;

  onRatingPress?: () => void;

  onReviewPress?: () => void;

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
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizePrice(
  value: unknown,
): number {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed < 0
  ) {
    return 0;
  }

  return parsed;
}

function normalizeDiscount(
  value: unknown,
): number {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed <= 0 ||
    parsed >= 100
  ) {
    return 0;
  }

  return Math.min(
    99,
    Math.max(
      0,
      parsed,
    ),
  );
}

function normalizeCount(
  value: unknown,
): number {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed <= 0
  ) {
    return 0;
  }

  return Math.floor(
    parsed,
  );
}

function normalizeRating(
  value: unknown,
): number | null {
  const parsed =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
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
    cleanString(
      value,
    );

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

function calculateDiscountedPrice(
  originalPrice: number,
  discountPercentage: number,
): number {
  if (
    originalPrice <= 0 ||
    discountPercentage <= 0
  ) {
    return 0;
  }

  const calculatedPrice =
    originalPrice *
    (
      1 -
      discountPercentage /
        100
    );

  if (
    !Number.isFinite(
      calculatedPrice,
    ) ||
    calculatedPrice <= 0 ||
    calculatedPrice >=
      originalPrice
  ) {
    return 0;
  }

  return (
    Math.round(
      calculatedPrice *
        100,
    ) /
    100
  );
}

function formatPrice(
  value: number,
): string {
  const safeValue =
    normalizePrice(
      value,
    );

  return safeValue.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        safeValue % 1 === 0
          ? 0
          : 2,

      maximumFractionDigits:
        2,
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
  favoriteCount = 0,
  ratingCount = 0,
  reviewCount,
  onFavoritePress,
  onRatingPress,
  onReviewPress,
  onPress,
  onBuy,
}: ProductGridCardProps) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(false);

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(false);

  /* ============================================================
     PRODUCT DATA
  ============================================================ */

  const productName =
    cleanString(
      name,
    ) ||
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
    Boolean(
      imageUrl,
    ) &&
    !imageFailed;

  /* ============================================================
     ORIGINAL PRICE
  ============================================================ */

  const originalPrice =
    useMemo(
      () =>
        normalizePrice(
          price,
        ),
      [
        price,
      ],
    );

  /* ============================================================
     ACTIVE DEAL
  ============================================================ */

  const parsedDiscount =
    useMemo(
      () =>
        activeDeal
          ? normalizeDiscount(
              activeDeal
                .discountPercentage,
            )
          : 0,
      [
        activeDeal,
      ],
    );

  /* ============================================================
     DEAL PRICE
  ============================================================ */

  const dealPrice =
    useMemo(
      () =>
        activeDeal
          ? calculateDiscountedPrice(
              originalPrice,
              parsedDiscount,
            )
          : 0,
      [
        activeDeal,
        originalPrice,
        parsedDiscount,
      ],
    );

  /* ============================================================
     DEAL STATE
  ============================================================ */

  const hasDeal =
    Boolean(
      activeDeal,
    ) &&
    originalPrice > 0 &&
    parsedDiscount > 0 &&
    dealPrice > 0 &&
    dealPrice <
      originalPrice;

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

  const saving =
    hasDeal
      ? Math.max(
          0,
          originalPrice -
            dealPrice,
        )
      : 0;

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
    useMemo(
      () =>
        normalizeCount(
          reviews,
        ),
      [
        reviews,
      ],
    );

  /* ============================================================
     MENU COUNTS
  ============================================================ */

  const safeFavoriteCount =
    useMemo(
      () =>
        normalizeCount(
          favoriteCount,
        ),
      [
        favoriteCount,
      ],
    );

  const safeRatingCount =
    useMemo(
      () =>
        normalizeCount(
          ratingCount,
        ),
      [
        ratingCount,
      ],
    );

  const safeReviewCount =
    useMemo(
      () =>
        normalizeCount(
          reviewCount ??
            reviews,
        ),
      [
        reviewCount,
        reviews,
      ],
    );

  /* ============================================================
     MENU ACTIONS
  ============================================================ */

  const handleOpenMenu =
    () => {
      setMenuVisible(
        true,
      );
    };

  const handleCloseMenu =
    () => {
      setMenuVisible(
        false,
      );
    };

  const handleFavorite =
    () => {
      setMenuVisible(
        false,
      );

      onFavoritePress?.();
    };

  const handleRating =
    () => {
      setMenuVisible(
        false,
      );

      onRatingPress?.();
    };

  const handleReview =
    () => {
      setMenuVisible(
        false,
      );

      /*
       * Allow ProductCardMenu modal to
       * finish closing before opening
       * ProductReviewModal.
       */
      setTimeout(
        () => {
          onReviewPress?.();
        },
        150,
      );
    };

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
        accessibilityLabel={
          hasDeal
            ? `View ${productName}. ${discountPercentage}% discount. Price ₦${formatPrice(
                displayPrice,
              )}.`
            : `View ${productName}. Price ₦${formatPrice(
                originalPrice,
              )}.`
        }
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
              transition={
                150
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
                name="shop"
                role="customer"
                size="lg"
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
                numberOfLines={
                  1
                }
                style={
                  styles.discountText
                }
              >
                -
                {discountPercentage}
                % OFF
              </AppText>
            </View>
          ) : null}

          {/* ==================================================
              THREE DOT MENU
          ================================================== */}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`More options for ${productName}`}
            accessibilityState={{
              expanded:
                menuVisible,
            }}
            hitSlop={
              6
            }
            onPress={(
              event,
            ) => {
              event.stopPropagation();

              handleOpenMenu();
            }}
            style={({
              pressed,
            }) => [
              styles.menuButton,

              pressed
                ? styles.menuButtonPressed
                : null,
            ]}
          >
            <AppText
              variant="bodyLarge"
              weight="bold"
              style={
                styles.menuDots
              }
            >
              •••
            </AppText>
          </Pressable>
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
            numberOfLines={
              2
            }
            style={
              styles.name
            }
          >
            {productName}
          </AppText>

          {/* ==================================================
              WORKER RATING
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
                numberOfLines={
                  1
                }
                style={
                  styles.reviews
                }
              >
                (
                {safeReviews}
                )
              </AppText>
            ) : null}
          </View>

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
                variant="bodyMedium"
                weight="bold"
                numberOfLines={
                  1
                }
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
                  numberOfLines={
                    1
                  }
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

            <View
              style={
                styles.savingRow
              }
            >
              {hasDeal ? (
                <AppText
                  variant="caption"
                  weight="bold"
                  numberOfLines={
                    1
                  }
                  style={
                    styles.savingText
                  }
                >
                  Save ₦
                  {formatPrice(
                    saving,
                  )}
                </AppText>
              ) : null}
            </View>
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
                numberOfLines={
                  1
                }
                style={[
                  styles.dealStatusText,

                  hasDeal
                    ? styles.dealActiveText
                    : null,
                ]}
              >
                {hasDeal
                  ? `${discountPercentage}% Deal`
                  : "No Deal"}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Buy ${productName}`}
              hitSlop={
                4
              }
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

      {/* ======================================================
          PRODUCT MENU
      ====================================================== */}

      <ProductCardMenu
        visible={
          menuVisible
        }
        favorCount={
          safeFavoriteCount
        }
        ratingCount={
          safeRatingCount
        }
        reviewCount={
          safeReviewCount
        }
        onClose={
          handleCloseMenu
        }
        onFavor={
          handleFavorite
        }
        onRating={
          handleRating
        }
        onReview={
          handleReview
        }
      />
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width:
        "100%",

      overflow:
        "hidden",

      borderWidth:
        1,

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

    imageContainer: {
      position:
        "relative",

      width:
        "100%",

      height:
        190,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width:
        "100%",

      height:
        "100%",

      backgroundColor:
        Colors.disabledBackground,
    },

    imagePlaceholder: {
      flex:
        1,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    discountBadge: {
      position:
        "absolute",

      top:
        6,

      left:
        6,

      minWidth:
        50,

      minHeight:
        22,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        6,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.error,
    },

    discountText: {
      color:
        Colors.textInverse,
    },

    menuButton: {
      position:
        "absolute",

      top:
        6,

      right:
        6,

      width:
        42,

      height:
        42,

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

    menuDots: {
      marginTop:
        -6,

      letterSpacing:
        1,

      color:
        Colors.textPrimary,
    },

    menuButtonPressed: {
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

    content: {
      padding:
        8,
    },

    name: {
      minHeight:
        28,

      color:
        Colors.textPrimary,
    },

    ratingRow: {
      minHeight:
        18,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        0,
    },

    rating: {
      marginLeft:
        4,

      color:
        Colors.textPrimary,
    },

    reviews: {
      marginLeft:
        4,
    },

    priceSection: {
      minHeight:
        38,

      justifyContent:
        "flex-start",

      marginTop:
        0,
    },

    priceRow: {
      minHeight:
        22,

      flexDirection:
        "row",

      flexWrap:
        "nowrap",

      alignItems:
        "baseline",

      columnGap:
        4,
    },

    price: {
      flexShrink:
        1,

      color:
        CustomerColors.primary,
    },

    originalPrice: {
      flexShrink:
        1,

      color:
        Colors.textMuted,

      textDecorationLine:
        "line-through",
    },

    savingRow: {
      height:
        16,

      justifyContent:
        "center",
    },

    savingText: {
      color:
        Colors.success,
    },

    bottomRow: {
      minHeight:
        36,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        4,

      marginTop:
        2,
    },

    dealStatus: {
      flex:
        1,

      minWidth:
        0,

      minHeight:
        24,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        6,

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
        4,

      color:
        Colors.textMuted,
    },

    dealActiveText: {
      color:
        CustomerColors.primary,
    },

    buyButton: {
      minWidth:
        52,

      minHeight:
        36,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        8,

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