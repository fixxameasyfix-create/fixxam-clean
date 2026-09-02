import React from "react";
import {
    StyleSheet,
    View,
} from "react-native";

export default function BookingDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 18,
    marginHorizontal: 4,
  },
});