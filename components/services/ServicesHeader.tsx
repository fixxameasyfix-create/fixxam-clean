import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

export default function ServicesHeader() {
  return (
    <View
      style={styles.container}
    >
      {/* ======================================================
          BACK BUTTON
      ====================================================== */}

      <Pressable
        onPress={() =>
          router.back()
        }
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        style={({ pressed }) => [
          styles.backButton,
          pressed &&
            styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={21}
          color="#111827"
        />
      </Pressable>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          weight="bold"
          style={styles.title}
        >
          Services
        </AppText>

        <AppText
          numberOfLines={1}
          style={styles.subtitle}
        >
          Find trusted professionals near you.
        </AppText>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      flexDirection: "row",
      alignItems: "center",

      marginBottom: 15,
    },

    backButton: {
      width: 44,
      height: 44,

      borderRadius: 14,

      backgroundColor:
        "#FFFFFF",

      alignItems: "center",
      justifyContent:
        "center",

      marginRight: 12,

      borderWidth: 1,
      borderColor:
        "#E5E7EB",

      shadowColor:
        "#0F172A",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.06,
      shadowRadius: 6,

      elevation: 2,
    },

    content: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize: 25,
      lineHeight: 30,

      color: "#111827",
    },

    subtitle: {
      marginTop: 2,

      fontSize: 12.5,
      lineHeight: 18,

      color: "#6B7280",
    },

    pressed: {
      opacity: 0.75,

      transform: [
        {
          scale: 0.97,
        },
      ],
    },
  });