import React from "react";

import {
  Pressable,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function FloatingAddButton() {
  return (
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
        size={32}
        color="#FFFFFF"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({

  button: {
    position: "absolute",

    right: 24,

    bottom: 30,

    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor: "#FF6B00",

    justifyContent: "center",

    alignItems: "center",

    shadowColor: "#FF6B00",

    shadowOpacity: 0.35,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 10,
  },

});