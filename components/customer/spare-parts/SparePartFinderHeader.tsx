import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme/customerColors";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function SparePartFinderHeader({
  title = "Find a Spare Part",
  subtitle = "We'll help you find the right part.",
}: Props) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons
          name="arrow-back"
          size={21}
          color={CustomerColors.textPrimary}
        />
      </Pressable>

      <View style={styles.textContainer}>
        <AppText
          weight="bold"
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          numberOfLines={1}
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CustomerColors.background,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.border,
  },

  pressed: {
    opacity: 0.75,
  },

  textContainer: {
    flex: 1,
    marginLeft: 11,
  },

  title: {
    fontSize: 20,
    lineHeight: 24,
    color: CustomerColors.textPrimary,
  },

  subtitle: {
    marginTop: 1,
    fontSize: 11,
    lineHeight: 15,
    color: CustomerColors.textSecondary,
  },
});