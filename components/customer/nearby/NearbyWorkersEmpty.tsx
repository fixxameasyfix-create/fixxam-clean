import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

type Props = {
  message?: string;
};

export default function NearbyWorkersEmpty({
  message = "No nearby workers found.",
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="people-outline"
        size={72}
        color="#CBD5E1"
      />

      <AppText
        weight="bold"
        style={styles.title}
      >
        No Workers Found
      </AppText>

      <AppText style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  title: {
    marginTop: 16,
    fontSize: 20,
    color: "#0F172A",
  },

  message: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
    fontSize: 15,
    lineHeight: 22,
  },
});