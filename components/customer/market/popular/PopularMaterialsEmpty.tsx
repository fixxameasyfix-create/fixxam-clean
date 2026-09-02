import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

export default function PopularMaterialsEmpty() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="package-variant-closed-remove"
        size={72}
        color="#CBD5E1"
      />

      <AppText
        weight="bold"
        style={styles.title}
      >
        No Materials Found
      </AppText>

      <AppText style={styles.subtitle}>
        We couldn't find any materials
        matching your search or selected
        category.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  title: {
    marginTop: 20,
    fontSize: 20,
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
  },
});