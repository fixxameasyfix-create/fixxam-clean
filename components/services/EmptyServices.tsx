import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

export default function EmptyServices() {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons
          name="tools"
          size={34}
          color="#94A3B8"
        />
      </View>

      <AppText
        weight="bold"
        style={styles.title}
      >
        No services found
      </AppText>

      <AppText style={styles.subtitle}>
        Try another search or category.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 48,
    paddingHorizontal: 24,
  },

  iconBox: {
    width: 68,
    height: 68,

    borderRadius: 20,

    backgroundColor: "#F1F5F9",

    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 14,

    fontSize: 18,
    lineHeight: 23,

    color: "#111827",

    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,

    fontSize: 13,
    lineHeight: 19,

    color: "#6B7280",

    textAlign: "center",
  },
});