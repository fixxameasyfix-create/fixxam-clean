import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   COMPONENT
============================================================== */

function MarketHeader() {
  return (
    <View
      style={
        styles.container
      }
    >
      <AppText
        variant="heading2"
        weight="bold"
      >
        Market
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Buy quality materials for your service
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
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.lg,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,
    },
  });

export default memo(
  MarketHeader,
);