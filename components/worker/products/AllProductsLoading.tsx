import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

export default function AllProductsLoading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#F97316"
      />

      <AppText style={styles.text}>
        Loading products...
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    marginTop: 16,
    fontSize: 15,
    color: "#64748B",
  },
});