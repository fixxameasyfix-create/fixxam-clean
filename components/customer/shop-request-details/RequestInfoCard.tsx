import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ui";
import {
  Colors,
} from "@/theme";

type Props = {
  createdAt: string;
  requestId: string;
};

export default function RequestInfoCard({
  createdAt,
  requestId,
}: Props) {
  return (
    <View style={styles.requestInfo}>
      <View style={styles.requestInfoHeader}>
        <Ionicons
          name="information-circle-outline"
          size={15}
          color={Colors.textSecondary}
        />

        <AppText
          variant="caption"
          weight="semibold"
          tone="secondary"
        >
          Request info
        </AppText>
      </View>

      <View style={styles.infoRow}>
        <AppText
          variant="caption"
          tone="secondary"
        >
          Sent
        </AppText>

        <AppText
          variant="caption"
          weight="semibold"
          numberOfLines={1}
          style={styles.infoValue}
        >
          {createdAt}
        </AppText>
      </View>

      <View style={styles.infoRow}>
        <AppText
          variant="caption"
          tone="secondary"
        >
          Request ID
        </AppText>

        <AppText
          variant="caption"
          weight="semibold"
          selectable
          numberOfLines={1}
          style={styles.requestId}
        >
          {requestId}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  requestInfo: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  requestInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },

  infoRow: {
    minHeight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 1,
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
  },

  requestId: {
    flex: 1,
    textAlign: "right",
  },
});