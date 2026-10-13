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

import ProductCardMenu from "@/components/customer/home/ProductCardMenu";

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

  /**
   * Legacy compatibility only.
   *
   * ProductCard no longer depends on this value.
   * Discounted price is calculated directly from:
   *
   * price + discountPercentage
   */
  discountedPrice?: number;

  favorite?: boolean;

  favoriteCount?: number;

  ratingCount?: number;

  reviewCount?: number;

  onFavoritePress?: () => void;

  onRatingPress?: () => void;

  onReviewPress?: () => void;

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

function normalizeStock(
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

function ProductCard({
  name,
  price,
  image,
  category,
  stock = 0,
  featured = false,
  discountPercentage = 0,
  favoriteCount = 0,
  ratingCount = 0,
  reviewCount = 0,
  onFavoritePress,
  onRatingPress,
  onReviewPress,
  onPress,
  onBuyPress,
  style,
}: ProductCardProps) {
  const [
    imageFailed,
    setImageFailed,
  ] =
    useState(
      false,
    );

  const [
    menuVisible,
    setMenuVisible,
  ] =
    useState(
      false,
    );

  /* ============================================================
     PRODUCT
  ============================================================ */

  const productName =
    cleanString(
      name,
    ) ||
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
     DISCOUNT
  ============================================================ */

  const discount =
    useMemo(
      () =>
        normalizeDiscount(
          discountPercentage,
        ),
      [
        discountPercentage,
      ],
    );

  /* ============================================================
     DISCOUNTED PRICE
  ============================================================ */

  const dealPrice =
    useMemo(
      () =>
        calculateDiscountedPrice(
          originalPrice,
          discount,
        ),
      [
        discount,
        originalPrice,
      ],
    );

  /* ============================================================
     DISCOUNT STATE
  ============================================================ */

  const hasDiscount =
    originalPrice > 0 &&
    discount > 0 &&
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

  const saving =
    hasDiscount
      ? Math.max(
          0,
          originalPrice -
            dealPrice,
        )
      : 0;

  /* ============================================================
     STOCK
  ============================================================ */

  const safeStock =
    useMemo(
      () =>
        normalizeStock(
          stock,
        ),
      [
        stock,
      ],
    );

  const hasStock =
    safeStock >
    0;

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
          reviewCount,
        ),
      [
        reviewCount,
      ],
    );

  /* ============================================================
     ADD TO CART
  ============================================================ */

  const handleBuyPress =
    () => {
      if (
        !hasStock
      ) {
        return;
      }

      onBuyPress();
    };

  /* ============================================================
     MENU
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
      onFavoritePress?.();
    };

  const handleRating =
    () => {
      onRatingPress?.();
    };

  const handleReview =
    () => {
      onReviewPress?.();
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          hasDiscount
            ? `View ${productName}. ${displayDiscount}% discount. Price ₦${formatPrice(
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
              transition={
                150
              }
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
                size="lg"
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
                numberOfLines={
                  1
                }
                style={
                  styles.featuredText
                }
              >
                Featured
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
            DETAILS
        ==================================================== */}

        <View
          style={
            styles.content
          }
        >
          {/* ==================================================
              NAME
          ================================================== */}

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
              CATEGORY
          ================================================== */}

          <View
            style={
              styles.categoryRow
            }
          >
            {categoryName ? (
              <AppText
                variant="caption"
                tone="secondary"
                numberOfLines={
                  1
                }
                style={
                  styles.category
                }
              >
                {categoryName}
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

              {hasDiscount ? (
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
              {hasDiscount ? (
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
              DEAL + STOCK
          ================================================== */}

          <View
            style={
              styles.metaSection
            }
          >
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
                numberOfLines={
                  1
                }
                style={[
                  styles.dealText,

                  !hasDiscount
                    ? styles.noDealText
                    : null,
                ]}
              >
                {hasDiscount
                  ? `${displayDiscount}% Deal`
                  : "No Deal"}
              </AppText>
            </View>

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
                numberOfLines={
                  1
                }
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
          numberOfLines={
            1
          }
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
          hitSlop={
            6
          }
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
    /* ========================================================
       CARD
    ======================================================== */

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

    productContent: {
      backgroundColor:
        Colors.surface,
    },

    productPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    /* ========================================================
       IMAGE
    ======================================================== */

    imageContainer: {
      position:
        "relative",

      width:
        "100%",

      height:
        118,

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

    /* ========================================================
       FEATURED
    ======================================================== */

    featuredBadge: {
      position:
        "absolute",

      top:
        6,

      left:
        6,

      minHeight:
        22,

      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal:
        6,

      borderWidth:
        1,

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
        4,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       THREE DOT MENU
    ======================================================== */

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
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      padding:
        8,
    },

    name: {
      minHeight:
        36,

      color:
        Colors.textPrimary,
    },

    categoryRow: {
      height:
        18,

      justifyContent:
        "center",
    },

    category: {
      color:
        Colors.textSecondary,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    priceSection: {
      minHeight:
        38,

      justifyContent:
        "flex-start",
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

    /* ========================================================
       DEAL + STOCK
    ======================================================== */

    metaSection: {
      minHeight:
        52,

      justifyContent:
        "flex-start",
    },

    dealRow: {
      alignSelf:
        "flex-start",

      maxWidth:
        "100%",

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

    activeDealRow: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    noDealRow: {
      backgroundColor:
        Colors.disabledBackground,
    },

    dealText: {
      flexShrink:
        1,

      marginLeft:
        4,

      color:
        CustomerColors.primary,
    },

    noDealText: {
      color:
        Colors.textMuted,
    },

    stockBadge: {
      alignSelf:
        "flex-start",

      maxWidth:
        "100%",

      minHeight:
        24,

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        4,

      paddingHorizontal:
        6,

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
      flexShrink:
        1,

      marginLeft:
        4,
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
        42,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        8,

      paddingVertical:
        3,

      borderTopWidth:
        1,

      borderTopColor:
        Colors.divider,

      backgroundColor:
        Colors.surface,
    },

    cartHint: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        6,
    },

    cartButton: {
      width:
        36,

      height:
        36,

      flexShrink:
        0,

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
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },
  });

export default memo(
  ProductCard,
);