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
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   COMPONENT
============================================================ */

function ProfilePhotoHeader() {
  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.badge
        }
      >
        <AppText
          variant="caption"
          weight="medium"
          style={
            styles.badgeText
          }
        >
          Step 3 of 3
        </AppText>
      </View>

      <AppText
        variant="heading2"
        weight="bold"
        center
        style={
          styles.title
        }
      >
        Complete Your Profile
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.subtitle
        }
      >
        Add a professional profile photo to build customer trust.
      </AppText>
    </View>
  );
}

export default memo(
  ProfilePhotoHeader,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      alignItems:
        "center",

      marginBottom:
        FixxamTokens.spacing.md,
    },

    badge: {
      marginBottom:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    badgeText: {
      color:
        WorkerColors.primary,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 260,

      color:
        Colors.textSecondary,
    },
  });