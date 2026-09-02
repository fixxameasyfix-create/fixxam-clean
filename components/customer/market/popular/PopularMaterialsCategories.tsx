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
  "paint",
  "roofing",
  "tools",
  "cement",
];

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

export default function PopularMaterialsCategories({
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
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },

  chip: {
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#93C5FD",
  },

  activeChip: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  label: {
    fontSize: 14,
    color: "#2563EB",
  },

  activeLabel: {
    color: "#FFFFFF",
  },
});