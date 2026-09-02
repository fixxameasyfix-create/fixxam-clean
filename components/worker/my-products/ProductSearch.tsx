import React, { useState } from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

export default function ProductSearch() {
  const [search, setSearch] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#94A3B8"
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
          returnKeyType="search"
        />

        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={20}
              color="#94A3B8"
            />
          </Pressable>
        )}
      </View>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push(
            "/(worker)/products/add",
          )
        }
      >
        <Ionicons
          name="add"
          size={20}
          color="#FFFFFF"
        />

        <AppText
          weight="bold"
          style={styles.buttonText}
        >
          Add Product
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginBottom: 13,
  },

  searchBox: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#0F172A",
  },

  button: {
    height: 50,
    minWidth: 15,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FF6B00",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#FF6B00",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    marginLeft: 9,
  },
});