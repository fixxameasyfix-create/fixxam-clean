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

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  id: string;

  name: string;

  price: number;

  image?: string;

  rating?: number;

  sold?: number;

  favorite?: boolean;

  onPress: () => void;

  onBuy: () => void;

  onFavoritePress?: () => void;
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

function getRemoteImageUrl(
  value: unknown,
): string {
  const url =
    cleanString(value);

  if (
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return url;
  }

  return "";
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

function PopularMaterialCard({
  name,
  price,
  image,
  rating = 0,
  sold = 0,
  favorite = false,
  onPress,
  onBuy,
  onFavoritePress,
}: Props) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  /* ============================================================
     PRODUCT DATA
  ============================================================ */

  const productName =
    cleanString(name) ||
    "Product";

  const imageUrl =
    getRemoteImageUrl(image);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const showImage =
    Boolean(imageUrl) &&
    !imageFailed;

  const safePrice =
    normalizePrice(price);

  const safeSold =
    normalizeCount(sold);

  const safeRating =
    useMemo(() => {
      const parsed =
        Number(rating);

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
    }, [rating]);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${productName}`}
      style={({ pressed }) => [
        styles.card,

        pressed
          ? styles.cardPressed
          : null,
      ]}
    >
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <View
        style={
          styles.imageContainer
        }
      >
        {showImage ? (
          <Image
            source={{
              uri: imageUrl,
            }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            accessibilityLabel={`${productName} product image`}
            onError={() =>
              setImageFailed(true)
            }
          />
        ) : (
          <View
            style={
              styles.placeholder
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

        {/* ====================================================
            FAVORITE
        ==================================================== */}

        {onFavoritePress ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();

              onFavoritePress();
            }}
            accessibilityRole="button"
            accessibilityLabel={
              favorite
                ? `Remove ${productName} from favorites`
                : `Add ${productName} to favorites`
            }
            accessibilityState={{
              selected: favorite,
            }}
            hitSlop={6}
            style={({ pressed }) => [
              styles.favoriteButton,

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
                  ? CustomerColors.primary
                  : Colors.textSecondary
              }
            />
          </Pressable>
        ) : null}
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

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

        {/* ====================================================
            RATING
        ==================================================== */}

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
            {safeRating !== null
              ? safeRating.toFixed(1)
              : "New"}
          </AppText>

          {safeSold > 0 ? (
            <AppText
              variant="caption"
              tone="secondary"
              numberOfLines={1}
              style={
                styles.sold
              }
            >
              {safeSold} sold
            </AppText>
          ) : null}
        </View>

        {/* ====================================================
            PRICE
        ==================================================== */}

        <AppText
          variant="bodyLarge"
          weight="bold"
          numberOfLines={1}
          style={
            styles.price
          }
        >
          ₦{formatPrice(
            safePrice,
          )}
        </AppText>

        {/* ====================================================
            BUY
        ==================================================== */}

        <Pressable
          onPress={(event) => {
            event.stopPropagation();

            onBuy();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Buy ${productName}`}
          style={({ pressed }) => [
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
            Buy Now
          </AppText>
        </Pressable>
      </View>
    </Pressable>
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
      width: 148,

      overflow: "hidden",

      borderWidth: 1,

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

    /* ========================================================
       IMAGE
    ======================================================== */

    imageContainer: {
      position: "relative",

      width: "100%",

      height: 168,

      backgroundColor:
        Colors.disabledBackground,
    },

    image: {
      width: "100%",

      height: "100%",

      backgroundColor:
        Colors.disabledBackground,
    },

    placeholder: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       FAVORITE
    ======================================================== */

    favoriteButton: {
      position: "absolute",

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

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
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
        FixxamTokens.spacing.md,
    },

    name: {
      minHeight: 40,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       RATING
    ======================================================== */

    ratingRow: {
      minHeight: 20,

      flexDirection: "row",

      alignItems: "center",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    rating: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    sold: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.xs,
    },

    /* ========================================================
       PRICE
    ======================================================== */

    price: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        CustomerColors.primary,
    },

    /* ========================================================
       BUY
    ======================================================== */

    buyButton: {
      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      alignItems: "center",

      justifyContent: "center",

      marginTop:
        FixxamTokens.spacing.md,

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
  PopularMaterialCard,
);