import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function AppSearch({
  value,
  onChangeText,
  placeholder = "Search...",
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={22}
        color="#64748B"
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={22}
          color="#94A3B8"
          onPress={() => onChangeText("")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  input: {
    flex: 1,

    marginLeft: 12,

    fontSize: 16,

    color: "#0F172A",
  },
});