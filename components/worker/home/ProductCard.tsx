import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
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

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import type {
  MenuAnchor,
} from "../products/ProductPopupMenu/ProductPopupMenu.types";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  title: string;

  category?: string;

  price: string | number;

  discountPercent?: number | string;

  /**
   * Legacy compatibility only.
   *
   * ProductCard now calculates the sale price
   * directly from price + discountPercent.
   */
  discountedPrice?: number | string;

  thumbnail?: string;

  stock?: number;

  /**
   * Default width is 156.
   * Grid screens can provide responsive width.
   */
  width?: number;

  onPress?: () => void;

  onMore?: (
    anchor: MenuAnchor,
  ) => void;
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeNumber(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const cleaned =
      value
        .replace(
          /[₦,\s]/g,
          "",
        )
        .trim();

    if (
      !cleaned
    ) {
      return 0;
    }

    const parsed =
      Number(
        cleaned,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  return 0;
}

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

/* ==============================================================
   MONEY
============================================================== */

function formatMoney(
  value: number,
): string {
  const safeValue =
    Number.isFinite(
      value,
    )
      ? Math.max(
          0,
          value,
        )
      : 0;

  return `₦${safeValue.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits:
        2,
    },
  )}`;
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductCard({
  title,
  category = "Others",
  price,
  discountPercent = 0,
  thumbnail,
  stock,
  width = 156,
  onPress,
  onMore,
}: Props) {
  const moreButtonRef =
    useRef<View>(
      null,
    );

  /* ============================================================
     DISPLAY VALUES
  ============================================================ */

  const safeWidth =
    useMemo(
      () =>
        Number.isFinite(
          width,
        )
          ? Math.max(
              140,
              width,
            )
          : 156,
      [
        width,
      ],
    );

  const displayTitle =
    useMemo(
      () =>
        getSafeText(
          title,
          "Unnamed Product",
        ),
      [
        title,
      ],
    );

  const displayCategory =
    useMemo(
      () =>
        getSafeText(
          category,
          "Others",
        ),
      [
        category,
      ],
    );

  const displayThumbnail =
    useMemo(
      () =>
        getSafeText(
          thumbnail,
        ),
      [
        thumbnail,
      ],
    );

  /* ============================================================
     ORIGINAL PRICE
  ============================================================ */

  const originalPrice =
    useMemo(
      () =>
        Math.max(
          0,
          getSafeNumber(
            price,
          ),
        ),
      [
        price,
      ],
    );

  /* ============================================================
     DISCOUNT
  ============================================================ */

  const discount =
    useMemo(() => {
      const value =
        getSafeNumber(
          discountPercent,
        );

      if (
        value <= 0 ||
        value >= 100
      ) {
        return 0;
      }

      return Math.min(
        99,
        Math.max(
          0,
          value,
        ),
      );
    }, [
      discountPercent,
    ]);

  /* ============================================================
     SALE PRICE

     IMPORTANT:
     discountPercent is the source of truth.

     Example:
     ₦20,000 + 12%
     = ₦17,600
  ============================================================ */

  const salePrice =
    useMemo(() => {
      if (
        originalPrice <= 0 ||
        discount <= 0
      ) {
        return 0;
      }

      const calculatedPrice =
        originalPrice *
        (
          1 -
          discount / 100
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
    }, [
      discount,
      originalPrice,
    ]);

  /* ============================================================
     DISCOUNT STATE
  ============================================================ */

  const hasDiscount =
    originalPrice > 0 &&
    discount > 0 &&
    salePrice > 0 &&
    salePrice <
      originalPrice;

  const saving =
    hasDiscount
      ? Math.max(
          0,
          originalPrice -
            salePrice,
        )
      : 0;

  /* ============================================================
     STOCK
  ============================================================ */

  const safeStock =
    useMemo(() => {
      if (
        typeof stock !==
          "number" ||
        !Number.isFinite(
          stock,
        )
      ) {
        return null;
      }

      return Math.max(
        0,
        Math.floor(
          stock,
        ),
      );
    }, [
      stock,
    ]);

  const hasStock =
    safeStock !==
    null;

  const inStock =
    hasStock &&
    safeStock > 0;

  /* ============================================================
     MORE MENU
  ============================================================ */

  const handleMore =
    useCallback(() => {
      if (
        !onMore
      ) {
        return;
      }

      moreButtonRef.current?.measureInWindow(
        (
          x,
          y,
          measuredWidth,
          measuredHeight,
        ) => {
          onMore({
            x,
            y,

            width:
              measuredWidth,

            height:
              measuredHeight,
          });
        },
      );
    }, [
      onMore,
    ]);

  /* ============================================================
     ACCESSIBILITY
  ============================================================ */

  const accessibilityLabel =
    hasDiscount
      ? `${displayTitle}, ${Math.round(
          discount,
        )}% discount, ${formatMoney(
          salePrice,
        )}`
      : `${displayTitle}, ${formatMoney(
          originalPrice,
        )}`;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Pressable
      onPress={
        onPress
      }
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel
      }
      style={({
        pressed,
      }) => [
        styles.card,

        {
          width:
            safeWidth,

          minWidth:
            safeWidth,

          maxWidth:
            safeWidth,
        },

        pressed
          ? styles.cardPressed
          : null,
      ]}
    >
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <View
        style={[
          styles.imageContainer,

          {
            width:
              safeWidth,
          },
        ]}
      >
        {displayThumbnail ? (
          <Image
            source={{
              uri:
                displayThumbnail,
            }}
            style={[
              styles.image,

              {
                width:
                  safeWidth,
              },
            ]}
            contentFit="cover"
            transition={
              150
            }
            recyclingKey={
              displayThumbnail
            }
            accessibilityLabel={`${displayTitle} product image`}
          />
        ) : (
          <View
            style={[
              styles.placeholder,

              {
                width:
                  safeWidth,
              },
            ]}
          >
            <AppIcon
              name="image"
              size="lg"
              color={
                Colors.disabled
              }
            />

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.noImageText
              }
            >
              No Image
            </AppText>
          </View>
        )}

        {/* ====================================================
            DISCOUNT BADGE
        ==================================================== */}

        {hasDiscount ? (
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
                discount,
              )}
              % OFF
            </AppText>
          </View>
        ) : null}

        {/* ====================================================
            MORE MENU
        ==================================================== */}

        {onMore ? (
          <View
            ref={
              moreButtonRef
            }
            collapsable={
              false
            }
            style={
              styles.moreWrapper
            }
          >
            <Pressable
              onPress={
                event => {
                  event.stopPropagation();

                  handleMore();
                }
              }
              hitSlop={
                6
              }
              accessibilityRole="button"
              accessibilityLabel={`More options for ${displayTitle}`}
              style={({
                pressed,
              }) => [
                styles.moreButton,

                pressed
                  ? styles.morePressed
                  : null,
              ]}
            >
              <AppIcon
                name="more"
                size="sm"
                color={
                  Colors.textPrimary
                }
              />
            </Pressable>
          </View>
        ) : null}

        {/* ====================================================
            STOCK
        ==================================================== */}

        {hasStock ? (
          <View
            style={[
              styles.stockBadge,

              !inStock
                ? styles.outOfStock
                : null,
            ]}
          >
            <View
              style={[
                styles.stockDot,

                !inStock
                  ? styles.outOfStockDot
                  : null,
              ]}
            />

            <AppText
              variant="caption"
              weight="bold"
              numberOfLines={
                1
              }
              style={[
                styles.stockText,

                !inStock
                  ? styles.outStockText
                  : null,
              ]}
            >
              {inStock
                ? "In Stock"
                : "Out of Stock"}
            </AppText>
          </View>
        ) : null}
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={[
          styles.content,

          {
            width:
              safeWidth,
          },
        ]}
      >
        {/* ====================================================
            TITLE
        ==================================================== */}

        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={
            1
          }
          ellipsizeMode="tail"
          style={
            styles.title
          }
        >
          {displayTitle}
        </AppText>

        {/* ====================================================
            CATEGORY
        ==================================================== */}

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={
            1
          }
          ellipsizeMode="tail"
          style={
            styles.category
          }
        >
          {displayCategory}
        </AppText>

        {/* ====================================================
            PRICE
        ==================================================== */}

        {hasDiscount ? (
          <>
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
                  styles.discountedPrice
                }
              >
                {formatMoney(
                  salePrice,
                )}
              </AppText>

              <AppText
                variant="caption"
                numberOfLines={
                  1
                }
                style={
                  styles.originalPrice
                }
              >
                {formatMoney(
                  originalPrice,
                )}
              </AppText>
            </View>

            <AppText
              variant="caption"
              weight="medium"
              numberOfLines={
                1
              }
              style={
                styles.saveText
              }
            >
              Save{" "}
              {formatMoney(
                saving,
              )}
            </AppText>
          </>
        ) : (
          <>
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
              {formatMoney(
                originalPrice,
              )}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={
                1
              }
              style={
                styles.regularPriceText
              }
            >
              Regular price
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}

/* ==============================================================
   MEMO
============================================================== */

ProductCard.displayName =
  "WorkerProductCard";

export default memo(
  ProductCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ==========================================================
       CARD
    ========================================================== */

    card: {
      flexShrink:
        0,

      alignSelf:
        "flex-start",

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

    cardPressed: {
      opacity:
        FixxamTokens.motion.pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion.scalePressed,
        },
      ],
    },

    /* ==========================================================
       IMAGE
    ========================================================== */

    imageContainer: {
      height:
        150,

      position:
        "relative",

      overflow:
        "hidden",

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      height:
        150,

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
      height:
        150,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    noImageText: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },

    /* ==========================================================
       DISCOUNT
    ========================================================== */

    discountBadge: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      left:
        FixxamTokens.spacing.sm,

      zIndex:
        5,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        WorkerColors.primary,
    },

    discountText: {
      color:
        Colors.textInverse,
    },

    /* ==========================================================
       MORE
    ========================================================== */

    moreWrapper: {
      position:
        "absolute",

      top:
        FixxamTokens.spacing.sm,

      right:
        FixxamTokens.spacing.sm,

      zIndex:
        10,
    },

    moreButton: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,
    },

    morePressed: {
      backgroundColor:
        Colors.disabledBackground,
    },

    /* ==========================================================
       STOCK
    ========================================================== */

    stockBadge: {
      position:
        "absolute",

      right:
        FixxamTokens.spacing.sm,

      bottom:
        FixxamTokens.spacing.sm,

      zIndex:
        5,

      maxWidth:
        105,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.successSoft,
    },

    stockDot: {
      width:
        6,

      height:
        6,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    stockText: {
      color:
        Colors.success,
    },

    outOfStock: {
      backgroundColor:
        Colors.errorSoft,
    },

    outOfStockDot: {
      backgroundColor:
        Colors.error,
    },

    outStockText: {
      color:
        Colors.error,
    },

    /* ==========================================================
       CONTENT
    ========================================================== */

    content: {
      minHeight:
        96,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textPrimary,
    },

    category: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textMuted,
    },

    /* ==========================================================
       PRICE
    ========================================================== */

    priceRow: {
      marginTop:
        FixxamTokens.spacing.xxs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    discountedPrice: {
      flexShrink:
        1,

      color:
        WorkerColors.primary,
    },

    originalPrice: {
      flexShrink:
        1,

      color:
        Colors.textMuted,

      textDecorationLine:
        "line-through",
    },

    price: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        WorkerColors.primary,
    },

    /* ==========================================================
       PRICE META
    ========================================================== */

    saveText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.success,
    },

    regularPriceText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },
  });