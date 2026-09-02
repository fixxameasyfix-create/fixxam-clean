import React from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
};

export default function FollowUpInput({
  value,
  onChangeText,
  maxLength = 50,
}: Props) {
  const remaining =
    maxLength - value.length;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Answer
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Type your answer..."
        placeholderTextColor="#9CA3AF"
        multiline
        maxLength={maxLength}
        style={styles.input}
        textAlignVertical="top"
      />

      <Text
        style={[
          styles.counter,
          remaining <= 20 &&
            styles.counterWarning,
        ]}
      >
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },

  input: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },

  counter: {
    marginTop: 8,
    textAlign: "right",
    color: "#6B7280",
    fontSize: 13,
  },

  counterWarning: {
    color: "#F59E0B",
    fontWeight: "600",
  },
});