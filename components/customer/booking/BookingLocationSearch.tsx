import React, { memo } from "react";

import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

type Props = {
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
  editable?: boolean;
};

function BookingLocationSearch({
  value,
  placeholder = "Search for an address",
  onChange,
  editable = true,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#64748B"
        />

        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          editable={editable}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
          accessibilityLabel="Search for service address"
        />
      </View>
    </View>
  );
}

export default memo(
  BookingLocationSearch,
);

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },

  inputContainer: {
    height: 46,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    borderRadius: 13,
  },

  input: {
    flex: 1,

    marginLeft: 9,

    paddingVertical: 0,

    fontSize: 13,

    color: "#0F172A",
  },
});