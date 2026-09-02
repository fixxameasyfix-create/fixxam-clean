import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

type Props = {
  marginVertical?: number;
  color?: string;
};

export default function AppDivider({
  marginVertical = 16,
  color = "#E2E8F0",
}: Props) {
  return (
    <View
      style={[
        styles.divider,
        {
          marginVertical,
          backgroundColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: "100%",
    borderRadius: 999,
  },
});