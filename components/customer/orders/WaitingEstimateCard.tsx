import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

export default function WaitingEstimateCard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons
            name="time-outline"
            size={20}
            color="#D97706"
          />
        </View>

        <View style={styles.content}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            Waiting for worker
          </AppText>

          <AppText style={styles.subtitle}>
            Your request was sent successfully.
          </AppText>
        </View>
      </View>

      <View style={styles.messageRow}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color="#D97706"
        />

        <AppText style={styles.message}>
          The worker is checking your request and
          will send a price soon.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 4,

    padding: 14,

    borderRadius: 18,

    backgroundColor: "#FFFBEB",

    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#FEF3C7",

    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontSize: 15,
    color: "#92400E",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: "#A16207",
  },

  messageRow: {
    marginTop: 10,

    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor: "#FDE68A",

    flexDirection: "row",
    alignItems: "flex-start",
  },

  message: {
    flex: 1,
    marginLeft: 6,

    fontSize: 11.5,
    lineHeight: 17,

    color: "#78350F",
  },
});