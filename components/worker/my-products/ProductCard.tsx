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

  price:
    | string
    | number;

  discountPercent?:
    | number
    | string;

  /**
   * Kept for compatibility with existing screens.
   *
   * ProductCard no longer depends on this value.
   * Sale price is calculated from:
   *
   * price + discountPercent
   */
  discountedPrice?:
    | number
    | string;

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

function getNumber(
  value: unknown,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value
          .replace(
            /[₦,\s]/g,
            "",
          )
          .trim(),
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  return 0;
}

function formatMoney(
  value: number,
): string {
  if (
    !Number.isFinite(
      value,
    ) ||
    value < 0
  ) {
    return "₦0";
  }

  return `₦${Math.round(
    value,
  ).toLocaleString(
    "en-NG",
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

  const displayTitle =
    title.trim() ||
    "Unnamed Product";

  const displayCategory =
    category.trim() ||
    "Others";

  /* ============================================================
     ORIGINAL PRICE
  ============================================================ */

  const originalPrice =
    useMemo(
      () =>
        Math.max(
          0,
          getNumber(
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
        getNumber(
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
     Current discountPercent is the source of truth.

     Example:
     Price = ₦20,000
     Discount = 12
     Sale price = ₦17,600
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

  const hasStock =
    typeof stock ===
      "number" &&
    Number.isFinite(
      stock,
    );

  const inStock =
    hasStock &&
    stock > 0;

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
    useMemo(() => {
      const priceLabel =
        hasDiscount
          ? `${Math.round(
              discount,
            )}% discount, ${formatMoney(
              salePrice,
            )}`
          : formatMoney(
              originalPrice,
            );

      const stockLabel =
        hasStock
          ? inStock
            ? ", in stock"
            : ", out of stock"
          : "";

      return `${displayTitle}, ${displayCategory}, ${priceLabel}${stockLabel}`;
    }, [
      discount,
      displayCategory,
      displayTitle,
      hasDiscount,
      hasStock,
      inStock,
      originalPrice,
      salePrice,
    ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Pressable
      onPress={
        onPress
      }
      accessibilityRole={
        onPress
          ? "button"
          : undefined
      }
      accessibilityLabel={
        accessibilityLabel
      }
      style={({
        pressed,
      }) => [
        styles.card,

        {
          width,

          minWidth:
            width,

          maxWidth:
            width,
        },

        pressed &&
        onPress
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
            width,
          },
        ]}
      >
        {thumbnail ? (
          <Image
            source={{
              uri:
                thumbnail,
            }}
            contentFit="cover"
            transition={
              150
            }
            recyclingKey={
              thumbnail
            }
            accessibilityLabel={`${displayTitle} product image`}
            style={[
              styles.image,

              {
                width,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,

              {
                width,
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
                8
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
                  Colors.textSecondary
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
            width,
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
              weight="bold"
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
                styles.noDiscountText
              }
            >
              No discount
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
       MORE MENU
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
        36,

      height:
        36,

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

    morePressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

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
      flexShrink:
        1,

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
        94,

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
       SAVING
    ========================================================== */

    saveText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.success,
    },

    noDiscountText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },
  });