import React from "react";

import { View, StyleSheet } from "react-native";

import { AppText } from "@/components/ui";
import { Spacing } from "@/theme";

type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({
  title,
  subtitle,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText size="xl" weight="bold">
        {title}
      </AppText>

      {subtitle && (
        <AppText
          size="sm"
          color="#64748B"
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },

  subtitle: {
    marginTop: 4,
  },
});