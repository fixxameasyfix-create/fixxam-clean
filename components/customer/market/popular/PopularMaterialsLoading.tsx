import React from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

export default function PopularMaterialsLoading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#0F766E"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
  },
});