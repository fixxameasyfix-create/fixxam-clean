import React from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export default function ServicesSearch({
  value,
  onChangeText,
}: Props) {
  const hasValue =
    value.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* SEARCH ICON */}
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color="#9CA3AF"
      />

      {/* INPUT */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search services..."
        placeholderTextColor="#9CA3AF"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        style={styles.input}
      />

      {/* CLEAR */}
      {hasValue && (
        <Pressable
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear service search"
          hitSlop={8}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={19}
            color="#9CA3AF"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,

    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    marginBottom: 16,

    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,

    elevation: 2,
  },

  input: {
    flex: 1,

    minWidth: 0,

    marginLeft: 10,

    paddingVertical: 0,

    fontSize: 15,

    color: "#111827",
  },

  clearButton: {
    width: 28,
    height: 28,

    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.55,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});