import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
};

export default function ProductActions({
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  onBuyNow,
}: Props) {
  return (
    <View style={styles.container}>
      {/* QUANTITY */}

      <View style={styles.quantityBox}>
        <Pressable
          onPress={onDecrease}
          style={({ pressed }) => [
            styles.qtyButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Decrease quantity"
        >
          <Ionicons
            name="remove"
            size={15}
            color="#111827"
          />
        </Pressable>

        <AppText
          weight="bold"
          style={styles.quantity}
        >
          {quantity}
        </AppText>

        <Pressable
          onPress={onIncrease}
          style={({ pressed }) => [
            styles.qtyButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
        >
          <Ionicons
            name="add"
            size={15}
            color="#111827"
          />
        </Pressable>
      </View>

      {/* ADD TO CART */}

      <Pressable
        style={({ pressed }) => [
          styles.cartButton,
          pressed && styles.pressed,
        ]}
        onPress={onAddToCart}
        accessibilityRole="button"
        accessibilityLabel="Add product to cart"
      >
        <Ionicons
          name="cart-outline"
          size={16}
          color="#2563EB"
        />

        <AppText
          weight="bold"
          style={styles.cartText}
          numberOfLines={1}
        >
          Add Cart
        </AppText>
      </Pressable>

      {/* BUY NOW */}

      <Pressable
        style={({ pressed }) => [
          styles.buyButton,
          pressed && styles.pressed,
        ]}
        onPress={onBuyNow}
        accessibilityRole="button"
        accessibilityLabel="Buy product now"
      >
        <AppText
          weight="bold"
          style={styles.buyText}
          numberOfLines={1}
        >
          Buy Now
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    paddingHorizontal: 10,
    paddingVertical: 7,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: -2,
    },

    elevation: 7,
  },

  quantityBox: {
    width: 78,
    height: 38,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#F8FAFC",

    borderRadius: 11,
  },

  qtyButton: {
    width: 27,
    height: 38,

    alignItems: "center",
    justifyContent: "center",
  },

  quantity: {
    width: 22,

    textAlign: "center",

    fontSize: 13,
    lineHeight: 17,

    color: "#111827",
  },

  cartButton: {
    flex: 1,
    minWidth: 0,

    height: 38,

    borderRadius: 11,

    borderWidth: 1,
    borderColor: "#2563EB",

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 5,
  },

  cartText: {
    marginLeft: 4,

    fontSize: 10.5,
    lineHeight: 14,

    color: "#2563EB",
  },

  buyButton: {
    flex: 1,
    minWidth: 0,

    height: 38,

    borderRadius: 11,

    backgroundColor: "#2563EB",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 5,
  },

  buyText: {
    fontSize: 10.5,
    lineHeight: 14,

    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});