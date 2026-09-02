import React from "react";

import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  total: number;
  onOpenFilter: () => void;
};

export default function WorkersHeader({
  value,
  onChangeText,
  total,
  onOpenFilter,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
        numberOfLines={1}
      >
        Available Workers
      </AppText>

      <AppText
        style={styles.subtitle}
        numberOfLines={1}
      >
        {total} Professional Workers Found
      </AppText>

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={16}
            color="#94A3B8"
          />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Search workers..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.filterButton}
          onPress={onOpenFilter}
          accessibilityRole="button"
          accessibilityLabel="Open worker filters"
        >
          <Ionicons
            name="options-outline"
            size={17}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 2,
  },

  title: {
    fontSize: 16,
    lineHeight: 20,
    color: "#0F172A",
  },

  subtitle: {
    marginTop: 1,
    marginBottom: 5,
    fontSize: 10,
    lineHeight: 13,
    color: "#64748B",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchContainer: {
    flex: 1,
    height: 36,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 10,

    paddingHorizontal: 9,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    elevation: 1,
  },

  searchInput: {
    flex: 1,
    height: "100%",

    marginLeft: 6,

    paddingVertical: 0,

    fontSize: 11,

    color: "#0F172A",
  },

  filterButton: {
    width: 36,
    height: 36,

    marginLeft: 6,

    borderRadius: 10,

    backgroundColor: "#2563EB",

    alignItems: "center",
    justifyContent: "center",

    elevation: 2,
  },
});