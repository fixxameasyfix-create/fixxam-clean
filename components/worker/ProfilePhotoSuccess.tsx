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

function ProfilePhotoSuccess() {
  return (
    <View
      accessibilityRole="text"
      style={
        styles.container
      }
    >
      <AppIcon
        name="success"
        size="sm"
        state="success"
      />

      <AppText
        variant="caption"
        weight="medium"
        style={
          styles.text
        }
      >
        Verified Photo
      </AppText>
    </View>
  );
}

export default memo(
  ProfilePhotoSuccess,
);

const styles =
  StyleSheet.create({
    container: {
      alignSelf:
        "center",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      backgroundColor:
        Colors.successSoft,

      borderWidth: 1,

      borderColor:
        Colors.success,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,

      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    text: {
      color:
        Colors.success,
    },
  });