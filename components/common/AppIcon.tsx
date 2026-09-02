import React from "react";
import { View, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  icon?: string;
  color?: string;
  backgroundColor?: string;

  size?: number;
  containerSize?: number;
  borderRadius?: number;
};

export default function AppIcon({
  icon = "shape-outline",
  color = "#2563EB",
  backgroundColor = "#EFF6FF",

  size = 26,
  containerSize = 52,
  borderRadius = 14,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius,
          backgroundColor,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={size}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});