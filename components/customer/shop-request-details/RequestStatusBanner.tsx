import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import { CustomerColors } from "@/theme";

export type RequestStatusConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  color: string;
  message: string;
};

type Props = {
  status: RequestStatusConfig;
};

export default function RequestStatusBanner({
  status,
}: Props) {
  return (
    <View
      style={[
        styles.statusBanner,
        {
          backgroundColor: status.backgroundColor,
        },
      ]}
    >
      <View style={styles.statusIcon}>
        <Ionicons
          name={status.icon}
          size={17}
          color={status.color}
        />
      </View>

      <View style={styles.statusContent}>
        <View style={styles.statusTitleRow}>
          <AppText
            variant="caption"
            weight="bold"
            style={{ color: status.color }}
          >
            {status.label}
          </AppText>

          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: status.color,
              },
            ]}
          />
        </View>

        <AppText
          variant="caption"
          numberOfLines={2}
          style={[
            styles.statusMessage,
            {
              color: status.color,
            },
          ]}
        >
          {status.message}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
  },

  statusIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.7)",
  },

  statusContent: {
    flex: 1,
    minWidth: 0,
  },

  statusTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 1,
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  statusMessage: {
    lineHeight: 16,
  },
});