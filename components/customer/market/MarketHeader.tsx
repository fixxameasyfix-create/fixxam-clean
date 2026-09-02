import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

export default function MarketHeader() {
  return (
    <View style={styles.container}>
      <View>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Market
        </AppText>

        <AppText
          style={styles.subtitle}
        >
          Buy quality materials for your service
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 24,

    paddingTop: 19,

    paddingBottom: 20,
  },

  title: {
    fontSize: 35,

    color: "#111827",
  },

  subtitle: {
    marginTop: 4,

    color: "#6B7280",

    fontSize: 15,
  },
});