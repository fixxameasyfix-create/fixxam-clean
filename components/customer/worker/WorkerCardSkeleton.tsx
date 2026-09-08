import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerCardSkeleton() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={
        styles.card
      }
    >
      {/* ======================================================
          AVATAR
      ====================================================== */}

      <View
        style={
          styles.avatar
        }
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <View
          style={
            styles.name
          }
        />

        <View
          style={
            styles.line
          }
        />

        <View
          style={
            styles.lineShort
          }
        />

        <View
          style={
            styles.bottom
          }
        />
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      minHeight: 112,

      flexDirection:
        "row",

      alignItems:
        "center",

      padding:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatar: {
      width:
        FixxamTokens.size
          .avatarXl,

      height:
        FixxamTokens.size
          .avatarXl,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.disabledBackground,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    name: {
      width: "60%",

      height: 18,

      marginBottom:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.disabledBackground,
    },

    line: {
      width: "90%",

      height: 14,

      marginBottom:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.disabledBackground,
    },

    lineShort: {
      width: "55%",

      height: 14,

      marginBottom:
        FixxamTokens.spacing.md,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.disabledBackground,
    },

    bottom: {
      width: 100,

      height: 30,

      borderRadius:
        FixxamTokens.radius.chip,

      backgroundColor:
        Colors.disabledBackground,
    },
  });

export default memo(
  WorkerCardSkeleton,
);