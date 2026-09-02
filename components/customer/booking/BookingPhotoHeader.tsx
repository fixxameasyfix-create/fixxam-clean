import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  count: number;
  maxPhotos?: number;
};

function BookingPhotoHeader({
  count,
  maxPhotos = 3,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons
            name="camera-outline"
            size={17}
            color="#F97316"
          />
        </View>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Photos
        </AppText>
      </View>

      <AppText
        weight="bold"
        style={styles.counter}
      >
        {count}/{maxPhotos}
      </AppText>
    </View>
  );
}

export default memo(
  BookingPhotoHeader
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 12,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 34,
    height: 34,

    borderRadius: 10,

    backgroundColor: "#FFF7ED",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  title: {
    fontSize: 15,
    color: "#0F172A",
  },

  counter: {
    fontSize: 12,
    color: "#EA580C",
  },
});