import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  workerName: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function CustomerServiceProgressCard({
  workerName,
}: Props) {
  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel="Service in progress"
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View style={styles.iconContainer}>
        <Ionicons
          name="construct-outline"
          size={25}
          color="#16A34A"
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            SERVICE IN PROGRESS
          </AppText>

          <View style={styles.statusDot} />
        </View>

        <AppText style={styles.description}>
          {workerName} has started working
          on your service.
        </AppText>

        <AppText style={styles.helper}>
          You can contact the worker if you
          need to discuss anything.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  CustomerServiceProgressCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 11.5,
    letterSpacing: 0.3,
    color: "#15803D",
  },

  statusDot: {
    width: 7,
    height: 7,
    marginLeft: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },

  description: {
    marginTop: 4,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#334155",
  },

  helper: {
    marginTop: 3,
    fontSize: 9.5,
    lineHeight: 14,
    color: "#64748B",
  },
});