import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;

  title: string;

  iconColor?: string;

  badge?: string | number;

  value?: string;

  onPress: () => void;
};

export default function WorkerMenuItem({
  icon,
  title,
  iconColor = "#FF6B00",
  badge,
  value,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed &&
          styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {/* ==================================================
          LEFT
      ================================================== */}

      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons
            name={icon}
            size={17}
            color={iconColor}
          />
        </View>

        <AppText
          weight="bold"
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>

      {/* ==================================================
          RIGHT
      ================================================== */}

      <View style={styles.right}>
        {!!value && (
          <AppText
            style={styles.value}
            numberOfLines={1}
          >
            {value}
          </AppText>
        )}

        {!!badge && (
          <View style={styles.badge}>
            <AppText
              weight="bold"
              style={styles.badgeText}
              numberOfLines={1}
            >
              {badge}
            </AppText>
          </View>
        )}

        <Ionicons
          name="chevron-forward"
          size={16}
          color="#94A3B8"
        />
      </View>
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    /* ========================================================
       ROW
    ======================================================== */

    container: {
      minHeight: 52,

      paddingHorizontal: 10,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",

      backgroundColor: "#FFFFFF",
    },

    pressed: {
      backgroundColor: "#F8FAFC",
    },

    /* ========================================================
       LEFT
    ======================================================== */

    left: {
      flex: 1,
      minWidth: 0,

      flexDirection: "row",
      alignItems: "center",
    },

    iconBox: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: "#F8FAFC",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 10,
    },

    title: {
      flex: 1,

      fontSize: 13,
      lineHeight: 18,

      color: "#0F172A",
    },

    /* ========================================================
       RIGHT
    ======================================================== */

    right: {
      flexDirection: "row",
      alignItems: "center",

      marginLeft: 8,
    },

    value: {
      maxWidth: 80,

      marginRight: 8,

      fontSize: 10.5,
      color: "#16A34A",
    },

    /* ========================================================
       BADGE
    ======================================================== */

    badge: {
      minWidth: 20,
      height: 20,

      paddingHorizontal: 5,

      borderRadius: 10,

      backgroundColor: "#FF5A1F",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 8,
    },

    badgeText: {
      color: "#FFFFFF",

      fontSize: 9,
      lineHeight: 12,
    },
  });