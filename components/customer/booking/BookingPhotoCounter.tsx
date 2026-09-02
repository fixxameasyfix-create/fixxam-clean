import React, {
  memo,
} from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

type Props = {
  count: number;

  maxPhotos?: number;
};

function BookingPhotoCounter({

  count,

  maxPhotos = 3,

}: Props) {

  const progress =
    Math.min(
      count / maxPhotos,
      1
    );

  const percentage =
    Math.round(
      progress * 100
    );

  const color =
    percentage === 100
      ? "#16A34A"
      : "#EA580C";

  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <AppText
          weight="bold"
          style={styles.title}
        >
          Photo Progress
        </AppText>

        <AppText
          style={[
            styles.count,
            {
              color,
            },
          ]}
        >
          {count}/{maxPhotos}
        </AppText>

      </View>

      <View style={styles.track}>

        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor:
                color,
            },
          ]}
        />

      </View>

      <AppText
        style={styles.subtitle}
      >
        {percentage === 100
          ? "All photos added."
          : `${percentage}% complete`}
      </AppText>

    </View>

  );

}

export default memo(
  BookingPhotoCounter
);

const styles = StyleSheet.create({

  container: {

    marginTop: 18,

  },

  header: {

    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 10,

  },

  title: {

    fontSize: 13,

    color: "#0F172A",

  },

  count: {

    fontSize: 13,

    fontWeight: "700",

  },

  track: {

    height: 8,

    borderRadius: 999,

    backgroundColor: "#E2E8F0",

    overflow: "hidden",

  },

  fill: {

    height: "100%",

    borderRadius: 999,

  },

  subtitle: {

    marginTop: 8,

    fontSize: 12,

    color: "#64748B",

  },

});