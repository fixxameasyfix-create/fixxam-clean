import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppLoader,
} from "@/components/common";

import {
  FixxamTokens,
} from "@/theme";

function ServicesLoading() {
  return (
    <View
      style={
        styles.container
      }
      accessibilityLiveRegion="polite"
    >
      <AppLoader
        role="customer"
        size="sm"
      />
    </View>
  );
}

export default memo(
  ServicesLoading,
);

const styles =
  StyleSheet.create({
    container: {
      paddingVertical:
        FixxamTokens.spacing.xxxl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },
  });