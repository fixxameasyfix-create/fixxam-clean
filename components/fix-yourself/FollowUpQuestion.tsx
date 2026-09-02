import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  question: string;
};

export default function FollowUpQuestion({
  question,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Question
      </Text>

      <View style={styles.card}>
        <Text style={styles.question}>
          {question}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },

  question: {
    fontSize: 18,
    color: "#111827",
    lineHeight: 28,
    fontWeight: "500",
  },
});