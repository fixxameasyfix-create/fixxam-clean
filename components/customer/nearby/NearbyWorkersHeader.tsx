import React from "react";
import { StyleSheet, View } from "react-native";

import AppSearch from "@/components/common/AppSearch";
import { AppText } from "@/components/ui";

type Props = {
  search: string;
  onSearch: (value: string) => void;

  /**
   * Optional custom heading.
   *
   * Existing screens continue to use:
   * "Nearby Workers"
   */
  title?: string;

  /**
   * Optional custom subtitle.
   */
  subtitle?: string;
};

export default function NearbyWorkersHeader({
  search,
  onSearch,
  title = "Nearby Workers",
  subtitle = "Discover trusted professionals near your current location.",
}: Props) {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        {title}
      </AppText>

      <AppText style={styles.subtitle}>
        {subtitle}
      </AppText>

      <AppSearch
        value={search}
        onChangeText={onSearch}
        placeholder="Search workers or profession..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },

  title: {
    fontSize: 26,
    color: "#111827",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 14,
  },
});