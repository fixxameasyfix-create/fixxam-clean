import React, {
  memo,
} from "react";

import {
  View,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  recommendation: string;

  period: string;
};

function BookingTimeRecommendation({

  recommendation,

  period,

}: Props) {

  const icon =
    period === "Morning"
      ? "sunny"
      : period === "Afternoon"
      ? "partly-sunny"
      : period === "Evening"
      ? "moon"
      : "moon-outline";

  const color =
    period === "Morning"
      ? "#16A34A"
      : period === "Afternoon"
      ? "#2563EB"
      : period === "Evening"
      ? "#EA580C"
      : "#7C3AED";

  const background =
    period === "Morning"
      ? "#F0FDF4"
      : period === "Afternoon"
      ? "#EFF6FF"
      : period === "Evening"
      ? "#FFF7ED"
      : "#F5F3FF";

  return (

    <View
      style={[
        styles.container,
        {
          backgroundColor:
            background,
        },
      ]}
    >

      <View
        style={styles.iconBox}
      >

        <Ionicons
          name={icon}
          size={20}
          color={color}
        />

      </View>

      <View
        style={styles.content}
      >

        <AppText
          weight="bold"
          style={[
            styles.title,
            {
              color,
            },
          ]}
        >
          Smart Recommendation
        </AppText>

        <AppText
          style={styles.message}
        >
          {recommendation}
        </AppText>

      </View>

    </View>

  );

}

export default memo(
  BookingTimeRecommendation
);

const styles = StyleSheet.create({

  container: {

    flexDirection: "row",

    alignItems: "center",

    marginTop: 12,

    padding: 16,

    borderRadius: 18,

  },

  iconBox: {

    width: 46,

    height: 46,

    borderRadius: 23,

    backgroundColor:
      "#FFFFFF",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 14,

  },

  content: {

    flex: 1,

  },

  title: {

    fontSize: 13,

  },

  message: {

    marginTop: 4,

    fontSize: 12,

    lineHeight: 18,

    color: "#475569",

  },

});