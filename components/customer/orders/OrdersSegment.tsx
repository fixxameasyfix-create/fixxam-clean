import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  value: "services" | "products";
  onChange: (
    value: "services" | "products"
  ) => void;
};

export default function OrdersSegment({
  value,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => onChange("services")}
        style={({ pressed }) => [
          styles.item,
          value === "services" && styles.activeItem,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="construct-outline"
          size={17}
          color={
            value === "services"
              ? "#2563EB"
              : "#94A3B8"
          }
        />

        <AppText
          weight="bold"
          style={[
            styles.text,
            value === "services" &&
              styles.activeText,
          ]}
        >
          Services
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => onChange("products")}
        style={({ pressed }) => [
          styles.item,
          value === "products" && styles.activeItem,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="bag-handle-outline"
          size={17}
          color={
            value === "products"
              ? "#2563EB"
              : "#94A3B8"
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
          Products
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  item: {
    flex: 1,

    height: 42,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 6,

    position: "relative",
  },

  activeItem: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
  },

  pressed: {
    opacity: 0.7,
  },

  text: {
    fontSize: 14,
    color: "#64748B",
  },

  activeText: {
    color: "#2563EB",
  },
});