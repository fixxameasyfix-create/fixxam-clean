import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

export default function FollowUpHeader() {
  return (
    <View style={styles.container}>
      <AppText
        size="xl"
        weight="bold"
        center
      >
        Fixxam Smart Repair
      </AppText>

      <AppText
        center
        color={CustomerColors.textSecondary}
        style={styles.subtitle}
      >
        I need one more detail.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: FixxamTokens.spacing.xl,
    marginBottom: FixxamTokens.spacing.xl,
  },

  subtitle: {
    marginTop: FixxamTokens.spacing.sm,
    maxWidth: 320,
    lineHeight: 22,
    textAlign: "center",
  },
});