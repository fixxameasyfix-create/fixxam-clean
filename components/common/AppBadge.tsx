import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  label: string;

  color?: string;

  backgroundColor?: string;
};

export default function AppBadge({
  label,

  color = "#2563EB",

  backgroundColor = "#EFF6FF",
}: Props) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
        },
      ]}
    >
      <AppText
        weight="bold"
        style={[
          styles.text,
          {
            color,
          },
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",

    paddingHorizontal: 12,

    paddingVertical: 6,

    borderRadius: 999,
  },

  text: {
    fontSize: 12,

    letterSpacing: 0.3,
  },
});