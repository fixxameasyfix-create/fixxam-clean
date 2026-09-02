import React, { memo } from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  badgeText: string;
  badgeColor: string;
  badgeBackground: string;
  period: string;
};

function BookingTimeBadge({
  badgeText,
  badgeColor,
  badgeBackground,
  period,
}: Props) {
  const icon =
    period === "Morning"
      ? "sunny-outline"
      : period === "Afternoon"
      ? "partly-sunny-outline"
      : period === "Evening"
      ? "moon-outline"
      : "moon-outline";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              badgeBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={12}
          color={badgeColor}
        />

        <AppText
          weight="bold"
          style={[
            styles.badgeText,
            {
              color: badgeColor,
            },
          ]}
        >
          {badgeText}
        </AppText>
      </View>

      <View style={styles.arrow}>
        <Ionicons
          name="chevron-forward"
          size={17}
          color="#64748B"
        />
      </View>
    </View>
  );
}

export default memo(
  BookingTimeBadge,
);

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 28,

    paddingHorizontal: 10,

    borderRadius: 999,
  },

  badgeText: {
    marginLeft: 4,

    fontSize: 10,
  },

  arrow: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    justifyContent: "center",
    alignItems: "center",
  },
});