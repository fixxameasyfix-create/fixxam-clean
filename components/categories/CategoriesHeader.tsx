import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

interface CategoriesHeaderProps {
  title?: string;
}

export default function CategoriesHeader({
  title = "All Categories",
}: CategoriesHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.8}
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color="#0F172A"
        />
      </TouchableOpacity>

      <AppText
        weight="bold"
        style={styles.title}
      >
        {title}
      </AppText>

      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  title: {
    fontSize: 20,
    color: "#0F172A",
  },

  placeholder: {
    width: 42,
  },
});