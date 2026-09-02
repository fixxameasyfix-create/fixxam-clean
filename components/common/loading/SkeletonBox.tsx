import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

type Props = {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
};

export default function SkeletonBox({
  width = "100%",
  height,
  borderRadius = 12,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
});