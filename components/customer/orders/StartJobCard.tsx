import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

export default function StartJobCard() {
  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <Ionicons
          name="checkmark"
          size={18}
          color="#15803D"
        />
      </View>

      <View style={styles.content}>
        <AppText
          weight="bold"
          style={styles.title}
        >
          Ready to start
        </AppText>

        <AppText
          numberOfLines={2}
          style={styles.message}
        >
          Your booking is confirmed. The worker can now start the job.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F0FDF4",

    borderWidth: 1,
    borderColor: "#DCFCE7",

    borderRadius: 16,

    paddingHorizontal: 14,
    paddingVertical: 12,

    marginBottom: 12,
  },

  icon: {
    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor: "#DCFCE7",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 2,
  },

  message: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#64748B",
  },
});