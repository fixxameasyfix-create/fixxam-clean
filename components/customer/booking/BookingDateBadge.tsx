import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  badgeText: string;
  badgeColor: string;
  badgeBackground: string;
  isToday: boolean;
};

function BookingDateBadge({
  badgeText,
  badgeColor,
  badgeBackground,
  isToday,
}: Props) {
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
          name={
            isToday
              ? "flash-outline"
              : "calendar-outline"
          }
          size={11}
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

      <Ionicons
        name="chevron-forward"
        size={16}
        color="#94A3B8"
        style={styles.arrow}
      />
    </View>
  );
}

export default memo(
  BookingDateBadge,
);

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    minHeight: 26,

    paddingHorizontal: 9,

    borderRadius: 999,
  },

  badgeText: {
    marginLeft: 4,

    fontSize: 10,
    lineHeight: 14,
  },

  arrow: {
    marginTop: 6,
  },
});