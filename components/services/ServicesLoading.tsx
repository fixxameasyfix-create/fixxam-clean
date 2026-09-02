import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

export default function ServicesLoading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#FF6B00"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});