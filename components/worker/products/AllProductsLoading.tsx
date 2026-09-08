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
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

function AllProductsLoading() {
  return (
    <View
      style={
        styles.container
      }
      accessibilityRole="progressbar"
      accessibilityLabel="Loading products"
    >
      <View
        style={
          styles.loaderContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            WorkerColors.primary
          }
        />
      </View>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.text
        }
      >
        Loading products...
      </AppText>
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

AllProductsLoading.displayName =
  "AllProductsLoading";

export default memo(
  AllProductsLoading,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      minHeight: 300,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loaderContainer: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    text: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textSecondary,
    },
  });