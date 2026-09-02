import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  displayTime: string;
  period: string;
};

function BookingTimeHeader({
  displayTime,
  period,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons
          name="time-outline"
          size={18}
          color="#2563EB"
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.value}
        >
          {displayTime}
        </AppText>

        <AppText style={styles.period}>
          {period}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  BookingTimeHeader,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",
  },

  iconBox: {
    width: 36,
    height: 36,

    borderRadius: 10,

    backgroundColor: "#EFF6FF",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  content: {
    flex: 1,
  },

  value: {
    fontSize: 15,
    lineHeight: 19,

    color: "#0F172A",
  },

  period: {
    marginTop: 2,

    fontSize: 11,
    lineHeight: 16,

    color: "#64748B",
  },
});