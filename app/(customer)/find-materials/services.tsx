import React, {
  memo,
  useEffect,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  router,
} from "expo-router";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   COMPONENT
============================================================== */

function FindMaterialsServicesRoute() {
  useEffect(() => {
    router.replace(
      "/(customer)/find-materials",
    );
  }, []);

  return (
    <SafeAreaView
      style={styles.container}
      edges={[
        "top",
        "bottom",
      ]}
    >
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Loading services"
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color={
            CustomerColors.primary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
          style={styles.text}
        >
          Loading services...
        </AppText>
      </View>
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      Colors.background,
  },

  center: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal:
      FixxamTokens.spacing.lg,
  },

  text: {
    marginTop:
      FixxamTokens.spacing.md,
  },
});

export default memo(
  FindMaterialsServicesRoute,
);