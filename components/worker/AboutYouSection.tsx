import React from "react";
import {
  StyleSheet,
  TextInput,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

type Props = {
  about: string;
  setAbout: (value: string) => void;
};

const MAX_LENGTH = 100;

export default function AboutYouSection({
  about,
  setAbout,
}: Props) {
  const handleChange = (text: string) => {
    if (text.length <= MAX_LENGTH) {
      setAbout(text);
    }
  };

  return (
    <AppCard style={styles.card}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        About you and your skills
      </AppText>

      <AppText style={styles.subtitle}>
        Tell customers briefly about yourself,
        your experience and what you do best.
      </AppText>

      <TextInput
        value={about}
        onChangeText={handleChange}
        placeholder="Write about yourself and your skills..."
        placeholderTextColor="#94A3B8"
        multiline
        maxLength={MAX_LENGTH}
        textAlignVertical="top"
        style={styles.input}
      />

      <AppText style={styles.counter}>
        {about.length}/{MAX_LENGTH}
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginBottom: 10,

    paddingHorizontal: 12,
    paddingVertical: 12,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  title: {
    fontSize: 18,
    lineHeight: 23,

    color: "#111827",

    marginBottom: 4,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,

    color: "#64748B",

    marginBottom: 10,
  },

  input: {
    minHeight: 92,

    borderWidth: 1,
    borderColor: "#D1D5DB",

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 24,

    fontSize: 13,
    lineHeight: 19,

    color: "#111827",
  },

  counter: {
    fontSize: 10,

    color: "#94A3B8",

    textAlign: "right",

    marginTop: -20,
    marginRight: 10,

    marginBottom: 2,
  },
});