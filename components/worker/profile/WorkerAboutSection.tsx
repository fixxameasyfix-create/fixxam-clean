import React, { memo } from "react";
import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

type Props = {
  value: string;
  onChange: (
    value: string,
  ) => void;
};

function WorkerAboutSection({
  value,
  onChange,
}: Props) {
  return (
    <View style={styles.card}>
      <AppText
        variant="heading3"
        style={styles.heading}
      >
        About Me
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.description}
      >
        Tell customers about your
        experience, approach, and what
        makes your service useful.
      </AppText>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Write something about your professional experience..."
        placeholderTextColor="#8B95A3"
        multiline
        textAlignVertical="top"
        maxLength={1000}
        style={styles.input}
      />

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.counter}
      >
        {value.length}/1000
      </AppText>
    </View>
  );
}

export default memo(
  WorkerAboutSection,
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  heading: {
    marginBottom: 5,
  },

  description: {
    lineHeight: 19,
    marginBottom: 16,
  },

  input: {
    minHeight: 150,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: "#DCE2E8",
    borderRadius: 12,
    color: "#17202A",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },

  counter: {
    marginTop: 7,
    textAlign: "right",
  },
});