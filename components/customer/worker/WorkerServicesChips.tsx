import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import { AppText } from "@/components/ui";

type Service = {
  id?: string;
  name: string;
};

type Props = {
  services?: Service[];
  maxItems?: number;
};

export default function WorkerServices({
  services = [],
  maxItems = 4,
}: Props) {
  if (!services.length) {
    return null;
  }

  const visible = services.slice(0, maxItems);
  const remaining = services.length - visible.length;

  return (
    <View style={styles.container}>
      {visible.map((service) => (
        <View
          key={service.id ?? service.name}
          style={styles.chip}
        >
          <AppText
            numberOfLines={1}
            style={styles.text}
          >
            {service.name}
          </AppText>
        </View>
      ))}

      {remaining > 0 && (
        <View style={styles.moreChip}>
          <AppText style={styles.moreText}>
            +{remaining}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 8,
  },

  chip: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  text: {
    fontSize: 11,
    color: "#334155",
  },

  moreChip: {
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  moreText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
});