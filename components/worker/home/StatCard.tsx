import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  trend?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  iconColor,
  iconBackground,
  trend,
}: Props) {
  return (
    <View style={styles.card}>
  <View
    style={[
      styles.iconContainer,
      {
        backgroundColor: iconBackground,
      },
    ]}
  >
    <Ionicons
      name={icon}
      size={24}
      color={iconColor}
    />
  </View>

  <AppText
    weight="bold"
    style={styles.value}
  >
    {value}
  </AppText>

  <AppText
    weight="bold"
    numberOfLines={1}
    style={[
      styles.title,
      {
        color: iconColor,
      },
    ]}
  >
    {title}
  </AppText>

  {trend ? (
    <View style={styles.trendContainer}>
      <Ionicons
        name="trending-up"
        size={10}
        color="#16A34A"
      />

      <AppText style={styles.trend}>
        {trend}
      </AppText>
    </View>
  ) : null}
</View>
  );
}
const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 16,

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,

    elevation: 4,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 14,
  },

  value: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  title: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
  },

  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  trend: {
    marginLeft: 4,
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "700",
  },
});