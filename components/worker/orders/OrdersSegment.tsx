import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  value: "bookings" | "products";
  onChange: (
    value: "bookings" | "products"
  ) => void;
};

export default function OrdersSegment({
  value,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.item,
          value === "bookings" &&
            styles.active,
        ]}
        onPress={() =>
          onChange("bookings")
        }
      >
        <Ionicons
          name="briefcase-outline"
          size={20}
          color={
            value === "bookings"
              ? "#FF6B00"
              : "#64748B"
          }
        />

        <AppText
          weight="bold"
          style={[
            styles.text,
            value === "bookings" &&
              styles.activeText,
          ]}
        >
          Bookings
        </AppText>
      </Pressable>

      <Pressable
        style={[
          styles.item,
          value === "products" &&
            styles.active,
        ]}
        onPress={() =>
          onChange("products")
        }
      >
        <Ionicons
          name="bag-handle-outline"
          size={20}
          color={
            value === "products"
              ? "#FF6B00"
              : "#64748B"
          }
        />

        <AppText
          weight="bold"
          style={[
            styles.text,
            value === "products" &&
              styles.activeText,
          ]}
        >
          Product Orders
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 20,
  },

  item: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  active: {
    backgroundColor: "#FFF7ED",
  },

  text: {
    fontSize: 15,
    color: "#64748B",
  },

  activeText: {
    color: "#FF6B00",
  },
});