import React from "react";

import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { AppText } from "@/components/ui";

export default function PopularMaterialsHeader() {
  return (
    <View style={styles.container}>
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color={styles.icon.color}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Materials
          </AppText>

          <AppText style={styles.subtitle}>
            Find quality materials and tools
            for your service.
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  headerText: {
    flex: 1,
    marginLeft: 14,
    paddingRight: 4,
  },

  title: {
    fontSize: 24,
    lineHeight: 29,
    color: "#111827",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  icon: {
    color: "#111827",
  },
});