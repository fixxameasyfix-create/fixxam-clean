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
        Manage your bookings and product orders.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748B",
  },
});