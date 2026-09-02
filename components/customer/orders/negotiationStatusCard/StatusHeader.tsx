import React from "react";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  description: string;
};

export default function StatusHeader({
  icon,
  color,
  title,
  description,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.accent,
          {
            backgroundColor: color,
          },
        ]}
      />

      <View style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${color}15`,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={30}
            color={color}
          />
        </View>

        <View style={styles.content}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            {title}
          </AppText>

          <AppText style={styles.description}>
            {description}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginBottom: 20,
  },

  accent: {
    width: 4,
    borderRadius: 999,
    marginRight: 14,
  },

  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    color: "#0F172A",
    marginBottom: 4,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
  },
});