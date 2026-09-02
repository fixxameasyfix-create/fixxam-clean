import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

export default function WorkerCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.avatar} />

      <View style={styles.content}>
        <View style={styles.name} />

        <View style={styles.line} />

        <View style={styles.lineShort} />

        <View style={styles.bottom} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E2E8F0",
  },

  content: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    width: "60%",
    height: 18,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    marginBottom: 12,
  },

  line: {
    width: "90%",
    height: 14,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    marginBottom: 10,
  },

  lineShort: {
    width: "55%",
    height: 14,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },

  bottom: {
    width: 100,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E2E8F0",
  },
});