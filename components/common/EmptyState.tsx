import React from "react";

import { View, StyleSheet } from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  description?: string;
};

export default function EmptyState({
  title,
  description,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText size="lg" weight="semibold" center>
        {title}
      </AppText>

      {description && (
        <AppText
          center
          color="#64748B"
          style={styles.description}
        >
          {description}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  description: {
    marginTop: 8,
  },
});