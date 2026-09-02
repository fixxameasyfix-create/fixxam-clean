import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  onPress: () => void;
};

export default function DashboardWideCard({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={25}
          color={iconColor}
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </AppText>

        <AppText
          numberOfLines={2}
          style={styles.description}
        >
          {description}
        </AppText>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={22}
          color="#2563EB"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",

    minHeight: 112,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    paddingHorizontal: 18,
    paddingVertical: 16,

    marginTop: 2,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  pressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  icon: {
    width: 58,
    height: 58,

    borderRadius: 17,

    justifyContent: "center",
    alignItems: "center",

    flexShrink: 0,
  },

  content: {
    flex: 1,

    marginLeft: 16,
    marginRight: 10,

    minWidth: 0,
  },

  title: {
    fontSize: 19,
    lineHeight: 23,

    color: "#0F172A",
  },

  description: {
    marginTop: 4,

    fontSize: 14,
    lineHeight: 19,

    color: "#64748B",
  },

  arrowContainer: {
    width: 26,

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },
});