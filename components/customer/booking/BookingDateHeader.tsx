import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  displayDate: string;
  formattedDate: string;
};

function BookingDateHeader({
  displayDate,
  formattedDate,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color="#F97316"
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.value}
        >
          {displayDate}
        </AppText>

        <AppText style={styles.subValue}>
          {formattedDate}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  BookingDateHeader,
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

    backgroundColor: "#FFF7ED",

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

  subValue: {
    marginTop: 2,

    fontSize: 11,
    lineHeight: 16,

    color: "#64748B",
  },
});