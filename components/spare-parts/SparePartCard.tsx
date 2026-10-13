import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";

import {
  Image,
} from "expo-image";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

import ProductCardMenu from "@/components/customer/home/ProductCardMenu";

import type {
  SparePartCardProps,
} from "@/app/(customer)/buy-spare-parts/types";

import {
  formatPrice,
  getValidDeal,
  normalizeNumber,
} from "@/app/(customer)/buy-spare-parts/utils";

/* ==============================================================
   HELPERS
============================================================== */

function normalizeDiscountPercentage(
  value: unknown,
): number {
  const parsed =
    normalizeNumber(
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

function normalizeWorkerRating(
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

/* ==============================================================
   PRODUCT IMAGE
============================================================== */

const ProductImage =
  memo(
    function ProductImage({
      uri,
    }: {
      uri: string;
    }) {
      const [
        failed,
        setFailed,
      ] =
        useState(
          false,
        );

      useEffect(() => {
        setFailed(
          false,
        );
      }, [
        uri,
      ]);

      if (
        !uri ||
        failed
      ) {
        return (
          <View
            style={
              styles.imagePlaceholder
            }
          >
            <MaterialCommunityIcons
              name="image-off-outline"
              size={
                FixxamTokens.size.iconLg
              }
              color={
                Colors.textMuted
              }
            />
          </View>
        );
      }

      return (
        <Image
          source={{
            uri,
          }}
          style={
            styles.productImage
          }
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={
            150
          }
          accessibilityIgnoresInvertColors
          onError={() => {
            setFailed(
              true,
            );
          }}
        />
      );
    },
  );

/* ==============================================================
   PRODUCT CARD
============================================================== */

const SparePartCard =
  memo(
    function SparePartCard({
      product,
      onBuy,
      onRating,
      onReview,
    }: SparePartCardProps) {
      const [
        menuVisible,
        setMenuVisible,
      ] =
        useState(
          false,
        );

      /* ========================================================
         STOCK
      ======================================================== */

      const inStock =
        product.stock >
          0 &&
        product.status ===
          "active";

      /* ========================================================
         WORKER RATING
      ======================================================== */

      const workerRating =
        useMemo(
          () =>
            normalizeWorkerRating(
              product.workerRating,
            ),
          [
            product.workerRating,
          ],
        );

      /* ========================================================
         ACTIVE DEAL
      ======================================================== */

      const validDeal =
        getValidDeal(
          product,
          product.activeDeal,
        );

      /* ========================================================
         ORIGINAL PRICE
      ======================================================== */

      const originalPrice =
        useMemo(
          () =>
            Math.max(
              0,
              normalizeNumber(
                product.price,
              ),
            ),
          [
            product.price,
          ],
        );

      /* ========================================================
         DISCOUNT
      ======================================================== */

      const discountPercentage =
        useMemo(
          () =>
            validDeal
              ? normalizeDiscountPercentage(
                  validDeal
                    .discountPercentage,
                )
              : 0,
          [
            validDeal,
          ],
        );

      const discountedPrice =
        useMemo(
          () =>
            calculateDiscountedPrice(
              originalPrice,
              discountPercentage,
            ),
          [
            discountPercentage,
            originalPrice,
          ],
        );

      const hasDeal =
        validDeal !==
          null &&
        originalPrice >
          0 &&
        discountPercentage >
          0 &&
        discountedPrice >
          0 &&
        discountedPrice <
          originalPrice;

      const displayPrice =
        hasDeal
          ? discountedPrice
          : originalPrice;

      const saving =
        hasDeal
          ? Math.max(
              0,
              originalPrice -
                discountedPrice,
            )
          : 0;

      /* ========================================================
         MENU COUNTS
      ======================================================== */

      const favoriteCount =
        useMemo(
          () =>
            normalizeCount(
              product.favoriteCount,
            ),
          [
            product.favoriteCount,
          ],
        );

      const ratingCount =
        useMemo(
          () =>
            normalizeCount(
              product.ratingCount,
            ),
          [
            product.ratingCount,
          ],
        );

      const reviewCount =
        useMemo(
          () =>
            normalizeCount(
              product.reviewCount,
            ),
          [
            product.reviewCount,
          ],
        );

      /* ========================================================
         OPEN PRODUCT
      ======================================================== */

      const handleOpen =
        useCallback(() => {
          onBuy(
            product,
          );
        }, [
          onBuy,
          product,
        ]);

      /* ========================================================
         BUY
      ======================================================== */

      const handleBuyPress =
        useCallback(
          (
            event:
              GestureResponderEvent,
          ) => {
            event.stopPropagation();

            if (
              !inStock
            ) {
              return;
            }

            onBuy(
              product,
            );
          },
          [
            inStock,
            onBuy,
            product,
          ],
        );

      /* ========================================================
         OPEN MENU
      ======================================================== */

      const handleMenuPress =
        useCallback(
          (
            event:
              GestureResponderEvent,
          ) => {
            event.stopPropagation();

            setMenuVisible(
              true,
            );
          },
          [],
        );

      /* ========================================================
         CLOSE MENU
      ======================================================== */

      const handleCloseMenu =
        useCallback(() => {
          setMenuVisible(
            false,
          );
        }, []);

      /* ========================================================
         FAVOR
         
         Favor remains unchanged because this card currently
         has no favorite action supplied by the parent.
      ======================================================== */

      const handleFavor =
        useCallback(() => {
          setMenuVisible(
            false,
          );
        }, []);

      /* ========================================================
         PRODUCT RATING
      ======================================================== */

      const handleRating =
        useCallback(() => {
          setMenuVisible(
            false,
          );

          onRating?.(
            product,
          );
        }, [
          onRating,
          product,
        ]);

      /* ========================================================
         PRODUCT REVIEW
      ======================================================== */

      const handleReview =
        useCallback(() => {
          setMenuVisible(
            false,
          );

          onReview?.(
            product,
          );
        }, [
          onReview,
          product,
        ]);

      /* ========================================================
         UI
      ======================================================== */

      return (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hasDeal
                ? `View ${product.name}. ${Math.round(
                    discountPercentage,
                  )}% discount. ${formatPrice(
                    displayPrice,
                  )}.`
                : `View ${product.name}. ${formatPrice(
                    originalPrice,
                  )}.`
            }
            accessibilityHint="Opens spare part details"
            onPress={
              handleOpen
            }
            style={({
              pressed,
            }) => [
              styles.productCard,

              pressed
                ? styles.productCardPressed
                : null,
            ]}
          >
            {/* ================================================
                IMAGE
            ================================================ */}

            <View
              style={
                styles.imageContainer
              }
            >
              <ProductImage
                uri={
                  product.thumbnail
                }
              />

              {/* ==============================================
                  DISCOUNT
              ============================================== */}

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
                    {Math.round(
                      discountPercentage,
                    )}
                    % OFF
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* ================================================
                PRODUCT INFO
            ================================================ */}

            <View
              style={
                styles.productInfo
              }
            >
              {/* ==============================================
                  NAME + MENU
              ============================================== */}

              <View
                style={
                  styles.titleRow
                }
              >
                <AppText
                  variant="bodyLarge"
                  weight="bold"
                  numberOfLines={
                    2
                  }
                  style={
                    styles.productName
                  }
                >
                  {product.name}
                </AppText>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`More options for ${product.name}`}
                  accessibilityState={{
                    expanded:
                      menuVisible,
                  }}
                  hitSlop={
                    8
                  }
                  onPress={
                    handleMenuPress
                  }
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

              {/* ==============================================
                  META
              ============================================== */}

              <View
                style={
                  styles.metaRow
                }
              >
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
                    tone="secondary"
                    style={
                      styles.ratingText
                    }
                  >
                    {workerRating !==
                    null
                      ? workerRating.toFixed(
                          1,
                        )
                      : "New"}
                  </AppText>
                </View>

                <View
                  style={
                    styles.stockRow
                  }
                >
                  <View
                    style={[
                      styles.stockDot,

                      inStock
                        ? styles.stockDotAvailable
                        : styles.stockDotUnavailable,
                    ]}
                  />

                  <AppText
                    variant="caption"
                    style={[
                      styles.stockText,

                      inStock
                        ? styles.stockTextAvailable
                        : styles.stockTextUnavailable,
                    ]}
                  >
                    {inStock
                      ? "In stock"
                      : "Out of stock"}
                  </AppText>
                </View>
              </View>

              {/* ==============================================
                  DEAL
              ============================================== */}

              <View
                style={[
                  styles.dealRow,

                  !hasDeal
                    ? styles.noDealRow
                    : null,
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
                      ? Colors.error
                      : Colors.textMuted
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={[
                    styles.dealText,

                    !hasDeal
                      ? styles.noDealText
                      : null,
                  ]}
                >
                  {hasDeal
                    ? `Deal -${Math.round(
                        discountPercentage,
                      )}%`
                    : "Regular price"}
                </AppText>
              </View>

              {/* ==============================================
                  PRICE / BUY
              ============================================== */}

              <View
                style={
                  styles.bottomRow
                }
              >
                <View
                  style={
                    styles.priceContainer
                  }
                >
                  <AppText
                    variant="bodyLarge"
                    weight="bold"
                    numberOfLines={
                      1
                    }
                    style={[
                      styles.price,

                      hasDeal
                        ? styles.discountedPrice
                        : null,
                    ]}
                  >
                    {formatPrice(
                      displayPrice,
                    )}
                  </AppText>

                  {hasDeal ? (
                    <>
                      <AppText
                        variant="caption"
                        tone="muted"
                        numberOfLines={
                          1
                        }
                        style={
                          styles.originalPrice
                        }
                      >
                        {formatPrice(
                          originalPrice,
                        )}
                      </AppText>

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
                        Save{" "}
                        {formatPrice(
                          saving,
                        )}
                      </AppText>
                    </>
                  ) : null}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Buy ${product.name}`}
                  accessibilityState={{
                    disabled:
                      !inStock,
                  }}
                  disabled={
                    !inStock
                  }
                  onPress={
                    handleBuyPress
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.buyButton,

                    !inStock
                      ? styles.buyButtonDisabled
                      : null,

                    pressed &&
                    inStock
                      ? styles.buyButtonPressed
                      : null,
                  ]}
                >
                  <AppText
                    variant="bodyMedium"
                    weight="bold"
                    style={
                      styles.buyButtonText
                    }
                  >
                    Buy
                  </AppText>
                </Pressable>
              </View>
            </View>
          </Pressable>

          {/* ================================================
              PRODUCT MENU
          ================================================ */}

          <ProductCardMenu
            visible={
              menuVisible
            }
            favorCount={
              favoriteCount
            }
            ratingCount={
              ratingCount
            }
            reviewCount={
              reviewCount
            }
            onClose={
              handleCloseMenu
            }
            onFavor={
              handleFavor
            }
            onRating={
              handleRating
            }
            onReview={
              handleReview
            }
          />
        </>
      );
    },
  );

export default SparePartCard;

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    productCard: {
      minHeight:
        158,

      flexDirection:
        "row",

      padding:
        FixxamTokens.spacing.sm,

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

    productCardPressed: {
      borderColor:
        CustomerColors.primary,

      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    imageContainer: {
      width:
        130,

      height:
        140,

      flexShrink:
        0,

      overflow:
        "hidden",

      position:
        "relative",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    productImage: {
      width:
        "100%",

      height:
        "100%",
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
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      minHeight:
        28,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.error,
    },

    discountText: {
      color:
        Colors.textInverse,
    },

    productInfo: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.xxs,
    },

    titleRow: {
      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    productName: {
      flex:
        1,

      minWidth:
        0,

      paddingRight:
        FixxamTokens.spacing.xs,
    },

    menuButton: {
      width:
        38,

      height:
        38,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginTop:
        -FixxamTokens.spacing.xs,

      marginRight:
        -FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
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
      backgroundColor:
        Colors.disabledBackground,

      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    metaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    ratingRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    ratingText: {
      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    reviewText: {
      marginLeft:
        FixxamTokens.spacing.xxs,
    },

    stockRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    stockDot: {
      width:
        7,

      height:
        7,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    stockDotAvailable: {
      backgroundColor:
        Colors.success,
    },

    stockDotUnavailable: {
      backgroundColor:
        Colors.error,
    },

    stockText: {
      flexShrink:
        0,
    },

    stockTextAvailable: {
      color:
        Colors.textSecondary,
    },

    stockTextUnavailable: {
      color:
        Colors.error,
    },

    dealRow: {
      alignSelf:
        "flex-start",

      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xxs,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.errorSoft,
    },

    noDealRow: {
      backgroundColor:
        Colors.disabledBackground,
    },

    dealText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.error,
    },

    noDealText: {
      color:
        Colors.textSecondary,
    },

    bottomRow: {
      flex:
        1,

      flexDirection:
        "row",

      alignItems:
        "flex-end",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    priceContainer: {
      flex:
        1,

      minWidth:
        0,

      justifyContent:
        "flex-end",
    },

    price: {
      color:
        CustomerColors.primary,
    },

    discountedPrice: {
      color:
        Colors.error,
    },

    originalPrice: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,

      textDecorationLine:
        "line-through",
    },

    savingText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.success,
    },

    buyButton: {
      minWidth:
        76,

      minHeight:
        FixxamTokens.size.buttonSmallHeight,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        CustomerColors.primary,
    },

    buyButtonPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    buyButtonDisabled: {
      backgroundColor:
        Colors.disabled,
    },

    buyButtonText: {
      color:
        Colors.textInverse,
    },
  });