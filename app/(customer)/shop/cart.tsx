import React from "react";

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import { useCart } from "@/contexts/CartContext";

type CartItem = {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  sellerId?: string;
  storeId?: string;
};

export default function CartScreen() {
  const {
    items,
    total,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const handleCheckoutPress = () => {
    if (items.length === 0) {
      return;
    }

    router.push(
      "/(customer)/shop/checkout",
    );
  };

  return (
    <AppScreen>
      <FlatList
        data={items as CartItem[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <AppText
            weight="bold"
            style={styles.title}
          >
            My Cart
          </AppText>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image ? (
              <Image
                source={{
                  uri: item.image,
                }}
                style={styles.image}
              />
            ) : (
              <View
                style={styles.imagePlaceholder}
              >
                <Ionicons
                  name="cube-outline"
                  size={28}
                  color="#94A3B8"
                />
              </View>
            )}

            <View style={styles.info}>
              <AppText
                weight="bold"
                numberOfLines={2}
                style={styles.productName}
              >
                {item.name}
              </AppText>

              <AppText style={styles.price}>
                ₦
                {item.price.toLocaleString()}
              </AppText>

              <View style={styles.qtyRow}>
                <Pressable
                  onPress={() =>
                    updateQuantity(
                      item.id,
                      Math.max(
                        1,
                        item.quantity - 1,
                      ),
                    )
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease quantity of ${item.name}`}
                >
                  <Ionicons
                    name="remove-circle"
                    size={28}
                    color="#2563EB"
                  />
                </Pressable>

                <AppText
                  weight="bold"
                  style={styles.qty}
                >
                  {item.quantity}
                </AppText>

                <Pressable
                  onPress={() =>
                    updateQuantity(
                      item.id,
                      item.quantity + 1,
                    )
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase quantity of ${item.name}`}
                >
                  <Ionicons
                    name="add-circle"
                    size={28}
                    color="#2563EB"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() =>
                removeFromCart(item.id)
              }
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name} from cart`}
            >
              <Ionicons
                name="trash"
                size={24}
                color="#EF4444"
              />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="cart-outline"
              size={64}
              color="#CBD5E1"
            />

            <AppText
              weight="bold"
              style={styles.emptyTitle}
            >
              Your cart is empty
            </AppText>

            <AppText style={styles.emptyText}>
              Add products from the market
              to continue shopping.
            </AppText>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <AppText style={styles.totalLabel}>
            Total
          </AppText>

          <AppText
            weight="bold"
            style={styles.totalPrice}
          >
            ₦
            {total.toLocaleString()}
          </AppText>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.checkoutButton,
            items.length === 0 &&
              styles.disabledButton,
            pressed &&
              items.length > 0 &&
              styles.buttonPressed,
          ]}
          disabled={items.length === 0}
          onPress={handleCheckoutPress}
          accessibilityRole="button"
          accessibilityLabel="Proceed to checkout"
        >
          <AppText
            weight="bold"
            style={styles.checkoutText}
          >
            Proceed to Checkout
          </AppText>
        </Pressable>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 180,
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
    color: "#111827",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    alignItems: "center",
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    flex: 1,
    marginHorizontal: 14,
  },

  productName: {
    fontSize: 16,
    color: "#111827",
  },

  price: {
    marginTop: 6,
    color: "#2563EB",
    fontSize: 17,
    fontWeight: "700",
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  qty: {
    marginHorizontal: 14,
    color: "#111827",
  },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  totalLabel: {
    fontSize: 18,
    color: "#64748B",
  },

  totalPrice: {
    fontSize: 24,
    color: "#111827",
  },

  checkoutButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
    lineHeight: 20,
  },
});