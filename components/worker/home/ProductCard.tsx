import React, {
  memo,
  useMemo,
  useRef,
} from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

import {
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

function getNumber(
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
    const parsed =
      Number(
        value
          .replace(/[₦,\s]/g, "")
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

/* ==============================================================
   MONEY
============================================================== */

function formatMoney(
  value: number,
): string {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "₦0";
  }

  return `₦${Math.round(
    value,
  ).toLocaleString("en-NG")}`;
}

/* ==============================================================
   COMPONENT
============================================================== */

function ProductCard({
  title,
  category = "Others",
  price,
  discountPercent = 0,
  discountedPrice,
  thumbnail,
  stock,
  width = 156,
  onPress,
  onMore,
}: Props) {
  const moreButtonRef =
    useRef<View>(null);

  /* ============================================================
     ORIGINAL PRICE
  ============================================================ */

  const originalPrice =
    useMemo(() => {
      return Math.max(
        0,
        getNumber(price),
      );
    }, [price]);

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
  ============================================================ */

  const salePrice =
    useMemo(() => {
      const value =
        getNumber(
          discountedPrice,
        );

      if (
        originalPrice <= 0 ||
        discount <= 0 ||
        value <= 0 ||
        value >= originalPrice
      ) {
        return 0;
      }

      return value;
    }, [
      discountedPrice,
      originalPrice,
      discount,
    ]);

  /* ============================================================
     DISCOUNT STATE
  ============================================================ */

  const hasDiscount =
    originalPrice > 0 &&
    discount > 0 &&
    salePrice > 0 &&
    salePrice < originalPrice;

  /* ============================================================
     SAVING
  ============================================================ */

  const saving =
    hasDiscount
      ? originalPrice -
        salePrice
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
    (stock as number) > 0;

  /* ============================================================
     MORE MENU
  ============================================================ */

  const handleMore =
    () => {
      if (!onMore) {
        return;
      }

      moreButtonRef.current?.measureInWindow(
        (
          x,
          y,
          measuredWidth,
          height,
        ) => {
          onMore({
            x,
            y,
            width:
              measuredWidth,
            height,
          });
        },
      );
    };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        hasDiscount
          ? `${title}, ${Math.round(
              discount,
            )}% discount, ${formatMoney(
              salePrice,
            )}`
          : `${title}, ${formatMoney(
              originalPrice,
            )}`
      }
      style={({ pressed }) => [
        styles.card,
        {
          width,
          minWidth: width,
          maxWidth: width,
        },
        pressed &&
          styles.cardPressed,
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
              uri: thumbnail,
            }}
            style={[
              styles.image,
              {
                width,
              },
            ]}
            resizeMode="cover"
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
            <Ionicons
              name="image-outline"
              size={34}
              color="#CBD5E1"
            />

            <AppText
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
              -{Math.round(
                discount,
              )}% OFF
            </AppText>
          </View>
        )}

        {/* ====================================================
            MORE MENU
        ==================================================== */}

        {onMore && (
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
              onPress={(
                event,
              ) => {
                event.stopPropagation();
                handleMore();
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`More options for ${title}`}
              style={({ pressed }) => [
                styles.moreButton,
                pressed &&
                  styles.morePressed,
              ]}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={18}
                color="#334155"
              />
            </Pressable>
          </View>
        )}

        {/* ====================================================
            STOCK
        ==================================================== */}

        {hasStock && (
          <View
            style={[
              styles.stockBadge,
              !inStock &&
                styles.outOfStock,
            ]}
          >
            <View
              style={[
                styles.stockDot,
                !inStock &&
                  styles.outOfStockDot,
              ]}
            />

            <AppText
              weight="bold"
              numberOfLines={1}
              style={[
                styles.stockText,
                !inStock &&
                  styles.outStockText,
              ]}
            >
              {inStock
                ? "In Stock"
                : "Out of Stock"}
            </AppText>
          </View>
        )}
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
          weight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={
            styles.title
          }
        >
          {title ||
            "Unnamed Product"}
        </AppText>

        {/* ====================================================
            CATEGORY
        ==================================================== */}

        <AppText
          numberOfLines={1}
          ellipsizeMode="tail"
          style={
            styles.category
          }
        >
          {category ||
            "Others"}
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
                weight="bold"
                numberOfLines={1}
                style={
                  styles.discountedPrice
                }
              >
                {formatMoney(
                  salePrice,
                )}
              </AppText>

              <AppText
                numberOfLines={1}
                style={
                  styles.originalPrice
                }
              >
                {formatMoney(
                  originalPrice,
                )}
              </AppText>
            </View>

            {/* SAVING */}

            <AppText
              numberOfLines={1}
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
            {/* NORMAL PRICE */}

            <AppText
              weight="bold"
              numberOfLines={1}
              style={
                styles.price
              }
            >
              {formatMoney(
                originalPrice,
              )}
            </AppText>

            {/* NO SAVING */}

            <AppText
              numberOfLines={1}
              style={
                styles.notSaveText
              }
            >
              Not Save
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
      flexShrink: 0,

      alignSelf:
        "flex-start",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 18,

      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        "#EEF1F5",

      shadowColor:
        "#000000",

      shadowOpacity: 0.06,

      shadowRadius: 9,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    cardPressed: {
      opacity: 0.94,

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
      height: 150,

      backgroundColor:
        "#F1F5F9",

      position:
        "relative",

      overflow:
        "hidden",
    },

    image: {
      height: 150,

      backgroundColor:
        "#F1F5F9",
    },

    placeholder: {
      height: 150,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F1F5F9",
    },

    noImageText: {
      marginTop: 4,

      fontSize: 12,

      color:
        "#94A3B8",
    },

    /* ==========================================================
       DISCOUNT
    ========================================================== */

    discountBadge: {
      position:
        "absolute",

      top: 8,

      left: 8,

      backgroundColor:
        "#DC2626",

      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 7,

      zIndex: 5,
    },

    discountText: {
      color:
        "#FFFFFF",

      fontSize: 10,

      lineHeight: 13,
    },

    /* ==========================================================
       MORE MENU
    ========================================================== */

    moreWrapper: {
      position:
        "absolute",

      top: 8,

      right: 8,

      zIndex: 10,
    },

    moreButton: {
      width: 32,

      height: 32,

      borderRadius: 16,

      backgroundColor:
        "rgba(255,255,255,0.94)",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    morePressed: {
      backgroundColor:
        "#E2E8F0",
    },

    /* ==========================================================
       STOCK
    ========================================================== */

    stockBadge: {
      position:
        "absolute",

      right: 8,

      bottom: 8,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#DCFCE7",

      paddingHorizontal: 9,

      paddingVertical: 5,

      borderRadius: 15,

      zIndex: 5,

      maxWidth: 100,
    },

    stockDot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      backgroundColor:
        "#16A34A",

      marginRight: 5,
    },

    stockText: {
      color:
        "#15803D",

      fontSize: 9,

      lineHeight: 12,
    },

    outOfStock: {
      backgroundColor:
        "#FEE2E2",
    },

    outOfStockDot: {
      backgroundColor:
        "#DC2626",
    },

    outStockText: {
      color:
        "#DC2626",
    },

    /* ==========================================================
       CONTENT
    ========================================================== */

    content: {
      paddingHorizontal: 11,

      paddingTop: 10,

      paddingBottom: 12,

      minHeight: 91,

      backgroundColor:
        "#FFFFFF",
    },

    title: {
      fontSize: 14.5,

      lineHeight: 19,

      color:
        "#0F172A",

      marginBottom: 3,
    },

    category: {
      fontSize: 11,

      lineHeight: 15,

      color:
        "#94A3B8",

      marginBottom: 5,
    },

    /* ==========================================================
       PRICE ROW
    ========================================================== */

    priceRow: {
      marginTop: 3,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 5,
    },

    discountedPrice: {
      color:
        "#FF6B00",

      fontSize: 15,

      lineHeight: 19,

      flexShrink: 1,
    },

    originalPrice: {
      color:
        "#94A3B8",

      fontSize: 10,

      lineHeight: 14,

      textDecorationLine:
        "line-through",

      flexShrink: 1,
    },

    /* ==========================================================
       NORMAL PRICE
    ========================================================== */

    price: {
      marginTop: 3,

      color:
        "#FF6B00",

      fontSize: 16,

      lineHeight: 20,
    },

    /* ==========================================================
       SAVE
    ========================================================== */

    saveText: {
      marginTop: 2,

      color:
        "#16A34A",

      fontSize: 10,

      lineHeight: 14,

      fontWeight:
        "600",
    },

    /* ==========================================================
       NOT SAVE
    ========================================================== */

    notSaveText: {
      marginTop: 2,

      color:
        "#94A3B8",

      fontSize: 10,

      lineHeight: 14,

      fontWeight:
        "600",
    },
  });