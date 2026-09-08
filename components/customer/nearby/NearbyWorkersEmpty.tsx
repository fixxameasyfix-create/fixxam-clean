import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  message?: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function NearbyWorkersEmpty({
  message = "No nearby workers found.",
}: Props) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`No workers found. ${message}`}
      style={
        styles.container
      }
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <AppIcon
          name="users"
          role="customer"
          size="xl"
          state="muted"
        />
      </View>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="bodyLarge"
        weight="bold"
        center
        style={
          styles.title
        }
      >
        No Workers Found
      </AppText>

      {/* ======================================================
          MESSAGE
      ====================================================== */}

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.message
        }
      >
        {message}
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

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,
    },

    iconContainer: {
      width: 88,

      height: 88,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.disabledBackground,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    message: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,
    },
  });

export default memo(
  NearbyWorkersEmpty,
);