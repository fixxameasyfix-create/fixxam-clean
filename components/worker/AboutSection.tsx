import React from "react";
import { StyleSheet } from "react-native";

import {
  AppCard,
  AppInput,
  AppText,
} from "@/components/ui";

type Props = {
  about: string;
  setAbout: (value: string) => void;
};

export default function AboutSection({
  about,
  setAbout,
}: Props) {
  return (
    <>
      <AppText
        size="lg"
        weight="semibold"
        style={styles.title}
      >
        About Me
      </AppText>

      <AppCard>
        <AppInput
          label="About Me"
          placeholder="Tell customers about your skills, experience and services..."
          value={about}
          onChangeText={setAbout}
          multiline
          numberOfLines={5}
          variant="worker"
        />
      </AppCard>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 24,
    marginBottom: 12,
  },
});