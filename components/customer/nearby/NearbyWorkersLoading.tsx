import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

export default function NearbyWorkersLoading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#2563EB"
      />

      <AppText style={styles.text}>
        Finding nearby workers...
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  text: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 15,
  },
});