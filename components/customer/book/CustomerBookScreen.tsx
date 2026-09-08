import React from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

import BookGrid from "./BookGrid";

/* ==============================================================
   SCREEN
============================================================== */

export default function CustomerBookScreen() {
  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.container
        }
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <AppText
          variant="heading1"
          weight="bold"
          style={styles.title}
        >
          Book
        </AppText>

        <AppText
          variant="bodyLarge"
          tone="secondary"
          style={styles.subtitle}
        >
          What would you like to do today?
        </AppText>

        {/* ======================================================
            BOOK OPTIONS
        ====================================================== */}

        <BookGrid />
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xxl,

      backgroundColor:
        Colors.background,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.xl,
    },
  });