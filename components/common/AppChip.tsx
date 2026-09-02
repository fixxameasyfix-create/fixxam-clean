import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  label: string;

  selected?: boolean;

  onPress?: () => void;
};

export default function AppChip({
  label,
  selected = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.selectedChip,
      ]}
    >
      <AppText
        weight="semibold"
        style={[
          styles.text,
          selected &&
            styles.selectedText,
        ]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,

    borderRadius: 999,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    marginRight: 10,
    marginBottom: 10,
  },

  selectedChip: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  text: {
    fontSize: 14,
    color: "#475569",
  },

  selectedText: {
    color: "#FFFFFF",
  },
});