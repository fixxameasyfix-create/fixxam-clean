import React from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function PopularMaterialsSearch({
  value,
  onChangeText,
}: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="magnify"
        size={22}
        color="#94A3B8"
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search materials, tools..."
        placeholderTextColor="#94A3B8"
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#111827",
  },
});