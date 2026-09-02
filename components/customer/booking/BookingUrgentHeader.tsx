import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  available: boolean;
};

function BookingUrgentHeader({
  available,
}: Props) {
  return (
    <View style={styles.container}>
      {/* ======================================================
          ICON
      ====================================================== */}

      <View style={styles.iconBox}>
        <Ionicons
          name="flash"
          size={18}
          color="#FFFFFF"
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.content}>
        <View style={styles.row}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Urgent Service
          </AppText>

          {/* ==================================================
              AVAILABILITY
          ================================================== */}

          <View
            style={[
              styles.badge,
              available
                ? styles.availableBadge
                : styles.closedBadge,
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: available
                    ? "#16A34A"
                    : "#DC2626",
                },
              ]}
            />

            <AppText style={styles.badgeText}>
              {available
                ? "Open"
                : "Closed"}
            </AppText>
          </View>
        </View>

        <AppText style={styles.subtitle}>
          Priority matching
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  BookingUrgentHeader,
);

const styles =
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",

      marginBottom: 10,
    },

    iconBox: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor:
        "#F97316",

      justifyContent: "center",
      alignItems: "center",

      marginRight: 10,
    },

    content: {
      flex: 1,
    },

    row: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      gap: 8,
    },

    title: {
      flex: 1,

      fontSize: 16,

      lineHeight: 20,

      color: "#0F172A",
    },

    subtitle: {
      marginTop: 2,

      fontSize: 12,

      lineHeight: 17,

      color: "#64748B",
    },

    badge: {
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 8,

      paddingVertical: 4,

      borderRadius: 999,
    },

    availableBadge: {
      backgroundColor:
        "#DCFCE7",
    },

    closedBadge: {
      backgroundColor:
        "#FEE2E2",
    },

    dot: {
      width: 6,

      height: 6,

      borderRadius: 3,

      marginRight: 5,
    },

    badgeText: {
      fontSize: 10,

      fontWeight: "700",

      color: "#0F172A",
    },
  });