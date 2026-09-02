import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { CustomerColors } from "@/theme";

type Props = {
  visible: boolean;
};

export default function LoadingOverlay({
  visible,
}: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator
        size="large"
        color={CustomerColors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "rgba(255,255,255,0.75)",

    justifyContent: "center",
    alignItems: "center",

    zIndex: 9999,
  },
});