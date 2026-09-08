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

function NearbyWorkersLoading() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Finding nearby workers"
      style={
        styles.container
      }
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
        style={
          styles.text
        }
      >
        Finding nearby workers...
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      padding:
        FixxamTokens.spacing.xl,
    },

    text: {
      marginTop:
        FixxamTokens.spacing.lg,

      textAlign:
        "center",
    },
  });

export default memo(
  NearbyWorkersLoading,
);