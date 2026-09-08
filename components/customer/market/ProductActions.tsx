import React, {
  memo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  quantity: number;

  onIncrease: () => void;

  onDecrease: () => void;

  onAddToCart: () => void;

  onBuyNow: () => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function ProductActions({
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  onBuyNow,
}: Props) {
  const insets =
    useSafeAreaInsets();

  const safeQuantity =
    Number.isFinite(quantity)
      ? Math.max(
          1,
          Math.floor(quantity),
        )
      : 1;

  const canDecrease =
    safeQuantity > 1;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom:
            Math.max(
              insets.bottom,
              FixxamTokens.spacing.sm,
            ),
        },
      ]}
    >
      {/* ======================================================
          QUANTITY
      ====================================================== */}

      <View
        style={
          styles.quantityBox
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Decrease quantity"
          accessibilityState={{
            disabled:
              !canDecrease,
          }}
          disabled={
            !canDecrease
          }
          onPress={
            onDecrease
          }
          style={({
            pressed,
          }) => [
            styles.qtyButton,

            !canDecrease
              ? styles.qtyButtonDisabled
              : null,

            pressed &&
            canDecrease
              ? styles.pressed
              : null,
          ]}
        >
          <AppText
            weight="bold"
            style={
              styles.minus
            }
          >
            −
          </AppText>
        </Pressable>

        <AppText
          variant="bodyMedium"
          weight="bold"
          style={
            styles.quantity
          }
        >
          {safeQuantity}
        </AppText>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
          onPress={
            onIncrease
          }
          style={({
            pressed,
          }) => [
            styles.qtyButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <AppIcon
            name="add"
            role="customer"
            size="xs"
            color={
              Colors.textPrimary
            }
          />
        </Pressable>
      </View>

      {/* ======================================================
          ADD TO CART
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add product to cart"
        onPress={
          onAddToCart
        }
        style={({
          pressed,
        }) => [
          styles.cartButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppIcon
          name="package"
          role="customer"
          size="xs"
          state="active"
        />

        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={
            styles.cartText
          }
        >
          Add Cart
        </AppText>
      </Pressable>

      {/* ======================================================
          BUY NOW
      ====================================================== */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buy product now"
        onPress={
          onBuyNow
        }
        style={({
          pressed,
        }) => [
          styles.buyButton,

          pressed
            ? styles.pressed
            : null,
        ]}
      >
        <AppText
          variant="caption"
          weight="bold"
          numberOfLines={1}
          style={
            styles.buyText
          }
        >
          Buy Now
        </AppText>
      </Pressable>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      minHeight:
        FixxamTokens.size
          .buttonHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingTop:
        FixxamTokens.spacing.sm,

      borderTopWidth: 1,

      borderTopColor:
        Colors.border,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       QUANTITY
    ======================================================== */

    quantityBox: {
      width: 92,

      height:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.disabledBackground,
    },

    qtyButton: {
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
    },

    qtyButtonDisabled: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    quantity: {
      minWidth: 20,

      textAlign:
        "center",

      color:
        Colors.textPrimary,
    },

    minus: {
      fontSize: 20,

      lineHeight: 22,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       ADD TO CART
    ======================================================== */

    cartButton: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderWidth: 1,

      borderColor:
        CustomerColors.primary,

      borderRadius:
        FixxamTokens.radius.button,

      backgroundColor:
        Colors.surface,
    },

    cartText: {
      color:
        CustomerColors.primary,
    },

    /* ========================================================
       BUY NOW
    ======================================================== */

    buyButton: {
      flex: 1,

      minWidth: 0,

      minHeight:
        FixxamTokens.size
          .buttonSmallHeight,

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

    /* ========================================================
       PRESSED
    ======================================================== */

    pressed: {
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
  ProductActions,
);