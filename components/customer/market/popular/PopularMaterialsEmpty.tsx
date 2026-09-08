import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   COMPONENT
============================================================== */

function PopularMaterialsEmpty() {
  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.iconBox
        }
      >
        <MaterialCommunityIcons
          name="package-variant-closed-remove"
          size={56}
          color={
            Colors.textMuted
          }
        />
      </View>

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={
          styles.title
        }
      >
        No Materials Found
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.subtitle
        }
      >
        We couldn't find any materials matching your search or selected category.
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
      minHeight: 300,

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.xxl,

      paddingVertical:
        FixxamTokens.spacing.xl,
    },

    iconBox: {
      width: 88,

      height: 88,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 21,
    },
  });

export default memo(
  PopularMaterialsEmpty,
);