import React from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

const CATEGORIES = [
  "all",
  "building",
  "electrical",
  "plumbing",
  "painting",
  "carpentry",
  "others",
];

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

export default function AllProductsCategories({
  selected,
  onSelect,
}: Props) {
  return (
    <FlatList
      horizontal
      data={CATEGORIES}
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => {
        const active = selected === item;

        return (
          <Pressable
            onPress={() => onSelect(item)}
            style={[
              styles.chip,
              active && styles.activeChip,
            ]}
          >
            <AppText
              weight={active ? "bold" : "medium"}
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {item.charAt(0).toUpperCase() +
                item.slice(1)}
            </AppText>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },

  chip: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    justifyContent: "center",
    alignItems: "center",
  },

  activeChip: {
    backgroundColor: "#F97316",
    borderColor: "#F97316",
  },

  label: {
    fontSize: 14,
    color: "#EA580C",
  },

  activeLabel: {
    color: "#FFFFFF",
  },
});