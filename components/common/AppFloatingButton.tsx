import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;

  color?: string;
  backgroundColor?: string;

  style?: ViewStyle;
};

export default function AppFloatingButton({
  icon = "plus",
  onPress,

  color = "#FFFFFF",
  backgroundColor = "#2563EB",

  style,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={28}
        color={color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",

    right: 20,
    bottom: 24,

    width: 64,
    height: 64,

    borderRadius: 32,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },
});