import React from "react";
import { View, StyleSheet } from "react-native";

import { CustomerColors } from "@/theme";

export default function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: CustomerColors.border,
    width: "100%",
  },
});