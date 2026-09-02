import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppText,
} from "@/components/ui";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  note?: string | null;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerMarketNote({
  note,
}: Props) {
  const normalizedNote =
    typeof note === "string"
      ? note.trim()
      : "";

  if (!normalizedNote) {
    return null;
  }

  return (
    <View
      style={styles.card}
    >
      <View
        style={styles.iconBox}
      >
        <Ionicons
          name="chatbubble-outline"
          size={18}
          color="#2563EB"
        />
      </View>

      <View
        style={styles.content}
      >
        <AppText
          weight="bold"
          style={styles.title}
        >
          Customer Note
        </AppText>

        <AppText
          style={styles.text}
        >
          {normalizedNote}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  WorkerMarketNote,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      flexDirection: "row",
      backgroundColor: "#EFF6FF",
      borderRadius: 17,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#BFDBFE",
    },

    iconBox: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    content: {
      flex: 1,
      minWidth: 0,
      marginLeft: 10,
    },

    title: {
      fontSize: 12,
      color: "#1D4ED8",
    },

    text: {
      marginTop: 4,
      fontSize: 11,
      lineHeight: 17,
      color: "#475569",
    },
  });