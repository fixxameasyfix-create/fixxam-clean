import React, {
  memo,
} from "react";

import {
  StyleSheet,
} from "react-native";

import {
  AppCard,
  AppInput,
  AppText,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  about: string;

  setAbout: (
    value: string,
  ) => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function AboutSection({
  about,
  setAbout,
}: Props) {
  return (
    <>
      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        About Me
      </AppText>

      <AppCard
        role="worker"
        variant="outlined"
      >
        <AppInput
          label="About Me"
          placeholder="Tell customers about your skills, experience and services..."
          value={
            about
          }
          onChangeText={
            setAbout
          }
          multiline
          numberOfLines={5}
          variant="worker"
        />
      </AppCard>
    </>
  );
}

export default memo(
  AboutSection,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    title: {
      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.md,
    },
  });