import React from "react";

import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  productName: string;
  onChangeProductName: (value: string) => void;
  category: string;
  onSelectCategory: () => void;
};

export default function ProductBasicInfo({
  productName,
  onChangeProductName,
  category,
  onSelectCategory,
}: Props) {
  return (
    <View style={styles.container}>
      {/* PRODUCT NAME */}

      <View style={styles.field}>
        <AppText
          weight="bold"
          style={styles.label}
        >
          Product Name
        </AppText>

        <TextInput
          value={productName}
          onChangeText={onChangeProductName}
          placeholder="Enter product name"
          placeholderTextColor="#94A3B8"
          style={styles.input}
          autoCapitalize="sentences"
          autoCorrect={false}
        />
      </View>

      {/* CATEGORY */}

      <View style={styles.field}>
        <AppText
          weight="bold"
          style={styles.label}
        >
          Category
        </AppText>

        <Pressable
          onPress={onSelectCategory}
          accessibilityRole="button"
          accessibilityLabel="Select product category"
          style={({ pressed }) => [
            styles.input,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            style={[
              styles.category,
              !category && styles.placeholder,
            ]}
            numberOfLines={1}
          >
            {category || "Select Category"}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },

  field: {
    marginBottom: 10,
  },

  label: {
    marginBottom: 4,
    fontSize: 11,
    lineHeight: 15,
    color: "#0F172A",
  },

  input: {
    height: 40,

    borderRadius: 10,

    borderWidth: 1,
    borderColor: "#E2E8F0",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 11,

    justifyContent: "center",

    fontSize: 12,
    color: "#0F172A",
  },

  category: {
    fontSize: 12,
    lineHeight: 16,
    color: "#0F172A",
  },

  placeholder: {
    color: "#94A3B8",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});