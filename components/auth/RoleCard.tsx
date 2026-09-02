import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "react-native";

type Props = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

export default function RoleCard({
  title,
  description,
  icon,
  color,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          borderColor: color,
        },
      ]}
    >
      
     <View style={styles.left}>
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
  size={20}
  color={color}
/>
  </View>

  <View style={styles.textContainer}>
  <Text style={styles.title}>
    {title}
  </Text>

  <Text style={styles.description}>
    {description}
  </Text>
</View>
</View>

<Ionicons
  name="chevron-forward"
  size={20}
  color={color}
  style={styles.arrow}
/>

    </TouchableOpacity>
   )
   };


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    height: 82,

    borderWidth: 1,
    borderRadius: 16,
    borderColor: "#E5E7EB",

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  description: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  arrow: {
    marginLeft: 10,
  },
});