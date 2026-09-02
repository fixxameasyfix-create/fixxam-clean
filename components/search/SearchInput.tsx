import React from "react";

import {
  ActivityIndicator,
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
  onBack: () => void;

  loading?: boolean;
  onSearch?: () => void;
};

export default function SearchInput({
  value,
  onChangeText,
  onBack,
  loading = false,
  onSearch,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={onBack}
        disabled={loading}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color="#0F172A"
        />
      </TouchableOpacity>

      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={18}
          color="#94A3B8"
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          autoFocus
          placeholder="Search workers or services..."
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          editable={!loading}
          onSubmitEditing={onSearch}
        />

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          </View>
        )}

        {!loading && value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            activeOpacity={0.7}
            onPress={() => onChangeText("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 16,

    paddingTop: 12,

    paddingBottom: 12,

    backgroundColor: "#F8FAFC",
  },

  backButton: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 10,
  },

  searchBox: {
    flex: 1,

    height: 48,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#E2E8F0",

    paddingHorizontal: 14,
  },

  input: {
    flex: 1,

    marginLeft: 8,

    fontSize: 14,

    color: "#0F172A",

    paddingVertical: 0,
  },

  loader: {
    marginLeft: 8,

    width: 24,

    alignItems: "center",

    justifyContent: "center",
  },

  clearButton: {
    marginLeft: 8,

    width: 24,

    height: 24,

    alignItems: "center",

    justifyContent: "center",
  },
});