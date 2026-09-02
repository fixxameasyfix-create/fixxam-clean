import React from "react";

import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AppText } from "@/components/ui";

const tabs = [
  "all",
  "pending",
  "accepted",
  "ongoing",
  "completed",
  "cancelled",
];

type Props = {
  selected: string;
  onChange: (tab: string) => void;
};

export default function OrderTabs({
  selected,
  onChange,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const active = selected === tab;

        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => onChange(tab)}
            style={[
              styles.tab,
              active && styles.activeTab,
            ]}
          >
            <AppText
              weight={active ? "bold" : undefined}
              style={[
                styles.text,
                active && styles.activeText,
              ]}
            >
              {tab === "all"
                ? "All"
                : tab.charAt(0).toUpperCase() +
                  tab.slice(1)}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 2,
    paddingBottom: 12,
    gap: 18,
  },

  tab: {
    height: 34,

    paddingHorizontal: 2,

    justifyContent: "center",
    alignItems: "center",

    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: "#2563EB",
  },

  text: {
    fontSize: 13,
    color: "#94A3B8",
  },

  activeText: {
    color: "#2563EB",
  },
});