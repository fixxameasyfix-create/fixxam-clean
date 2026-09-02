import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  address: string;
};

function BookingLocationHeader({
  address,
}: Props) {
  const cleanAddress =
    address.trim();

  return (
    <View style={styles.container}>
      {/* ======================================================
          LOCATION ICON
      ====================================================== */}

      <View style={styles.iconBox}>
        <Ionicons
          name="location"
          size={20}
          color="#2563EB"
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Service Location
        </AppText>

        <AppText
          numberOfLines={2}
          style={styles.address}
        >
          {cleanAddress ||
            "Where should the worker come?"}
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  BookingLocationHeader,
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 52,
  },

  iconBox: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 11,
  },

  content: {
    flex: 1,

    minWidth: 0,
  },

  title: {
    fontSize: 15,

    lineHeight: 20,

    color: "#0F172A",
  },

  address: {
    marginTop: 3,

    fontSize: 11.5,

    lineHeight: 17,

    color: "#64748B",
  },
});