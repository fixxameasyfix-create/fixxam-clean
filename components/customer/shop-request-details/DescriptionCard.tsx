import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import {
  Colors,
  CustomerColors,
} from "@/theme";

type Props = {
  description: string;
};

export default function DescriptionCard({
  description,
}: Props) {
  const hasDescription =
    Boolean(description?.trim());

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionTitleRow}>
        <Ionicons
          name="document-text-outline"
          size={16}
          color={CustomerColors.primary}
        />

        <AppText
          variant="caption"
          weight="bold"
        >
          Description
        </AppText>
      </View>

      <AppText
        variant="body"
        style={
          hasDescription
            ? styles.description
            : styles.emptyText
        }
        tone={
          hasDescription
            ? undefined
            : "secondary"
        }
      >
        {description || "No description added."}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    lineHeight: 19,
    color: Colors.textPrimary,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});