import React from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onFilter?: () => void;
  onVoiceSearch?: () => void;
};

export default function HeaderSearch({
  value,
  onChangeText,
  onFilter,
  onVoiceSearch,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={12}
          color="#94A3B8"
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search jobs, customers..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
          returnKeyType="search"
        />

        <Pressable
          hitSlop={4}
          onPress={onVoiceSearch}
        >
          <Ionicons
            name="mic-outline"
            size={12}
            color="#94A3B8"
          />
        </Pressable>
      </View>

      <Pressable
        style={styles.filter}
        onPress={onFilter}
      >
        <Ionicons
          name="options-outline"
          size={17}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },

  searchBox: {
    flex: 1,
    height: 40,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,

    backgroundColor: "#FFFFFF",

    borderRadius: 12,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 1,
    },

    elevation: 1,
  },

  input: {
    flex: 1,
    marginLeft: 8,

    fontSize: 13,
    color: "#0F172A",

    paddingVertical: 0,
    includeFontPadding: false,
  },

  filter: {
    width: 40,
    height: 40,

    marginLeft: 8,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FF6B00",

    shadowColor: "#FF6B00",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },
});