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

function EmptyServices() {
  return (
    <View
      style={
        styles.container
      }
      accessibilityRole="text"
    >
      <View
        style={
          styles.iconBox
        }
      >
        <MaterialCommunityIcons
          name="tools"
          size={
            FixxamTokens.size.iconLg
          }
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
        No services found
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.subtitle
        }
      >
        Try another search or category.
      </AppText>
    </View>
  );
}

export default memo(
  EmptyServices,
);

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingVertical:
        FixxamTokens.spacing.xxxl,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    iconBox: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.disabledBackground,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });