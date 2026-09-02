import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

export default function AllProductsEmpty() {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        No Products Found
      </AppText>

      <AppText style={styles.description}>
        You haven't added any products yet.
      </AppText>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push(
            "/(worker)/products/add",
          )
        }
      >
        <AppText
          weight="bold"
          style={styles.buttonText}
        >
          Add Product
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 22,
    color: "#0F172A",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  button: {
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
  },
});