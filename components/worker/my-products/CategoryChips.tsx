import React, { useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

const categories = [
  {
    id: "all",
    label: "All",
    icon: "grid-outline",
  },
  {
    id: "building",
    label: "Building",
    icon: "business-outline",
  },
  {
    id: "electrical",
    label: "Electrical",
    icon: "flash-outline",
  },
  {
    id: "plumbing",
    label: "Plumbing",
    icon: "water-outline",
  },
  {
    id: "painting",
    label: "Paint",
    icon: "color-palette-outline",
  },
  {
    id: "more",
    label: "More",
    icon: "ellipsis-horizontal",
  },
] as const;

export default function CategoryChips() {
  const [selected, setSelected] =
    useState("all");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const active =
          selected === category.id;

        return (
          <Pressable
            key={category.id}
            onPress={() =>
              setSelected(category.id)
            }
            style={[
              styles.chip,
              active &&
                styles.activeChip,
            ]}
          >
            <Ionicons
              name={category.icon}
              size={22}
              color={
                active
                  ? "#FFFFFF"
                  : "#F97316"
              }
            />

            <AppText
              weight="bold"
              numberOfLines={1}
              style={[
                styles.label,
                active &&
                  styles.activeLabel,
              ]}
            >
              {category.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingBottom: 10,
  },

  chip: {
    width: 60,
    height: 60,

    marginRight: 5,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E5E7EB",

    alignItems: "center",

    paddingTop: 14,
    paddingBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  activeChip: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },

  label: {
    marginTop: "auto",
    fontSize: 10,
    textAlign: "center",
    color: "#475569",
  },

  activeLabel: {
    color: "#FFFFFF",
  },
});