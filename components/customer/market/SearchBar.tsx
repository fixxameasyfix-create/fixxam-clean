import React from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  value: string;

  onChangeText: (
    text: string,
  ) => void;
};

export default function SearchBar({
  value,
  onChangeText,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={22}
          color="#9CA3AF"
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search materials, tools and more..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  searchBox: {
    width: "100%",
    height: 42,

    backgroundColor: "#FFFFFF",
    borderRadius: 20,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 18,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  input: {
    flex: 1,
    marginLeft: 10,

    fontSize: 14,
    color: "#111827",

    paddingVertical: 0,
  },
});