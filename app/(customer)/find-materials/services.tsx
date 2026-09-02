import React, {
  useEffect,
} from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppText,
} from "@/components/ui";

export default function FindMaterialsServicesRoute() {
  useEffect(() => {
    router.replace(
      "/(customer)/find-materials",
    );
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
    >
      <View
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color="#0891B2"
        />

        <AppText
          style={styles.text}
        >
          Loading services...
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    marginTop: 10,
    fontSize: 13,
    color: "#64748B",
  },
});