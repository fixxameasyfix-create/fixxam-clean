import React, {
  memo,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   COMPONENT
============================================================== */

function PopularMaterialsLoading() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading materials"
      style={styles.container}
    >
      <ActivityIndicator
        size="large"
        color={CustomerColors.primary}
      />

      <AppText
        variant="body"
        tone="secondary"
        style={styles.text}
      >
        Loading materials...
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,

    minHeight: 300,

    alignItems: "center",

    justifyContent: "center",

    paddingVertical:
      FixxamTokens.spacing.xl,
  },

  text: {
    marginTop:
      FixxamTokens.spacing.md,
  },
});

export default memo(
  PopularMaterialsLoading,
);