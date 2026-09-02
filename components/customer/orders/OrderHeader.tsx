import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

export default function OrdersHeader() {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Orders
      </AppText>

      <AppText style={styles.subtitle}>
        Your bookings and orders
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    lineHeight: 32,
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },
});