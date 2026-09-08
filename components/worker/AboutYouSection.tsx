import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  TextInput,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
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
   CONSTANTS
============================================================ */

const MAX_LENGTH = 100;

/* ============================================================
   COMPONENT
============================================================ */

function AboutYouSection({
  about,
  setAbout,
}: Props) {
  const handleChange =
    useCallback(
      (
        text: string,
      ) => {
        if (
          text.length <=
          MAX_LENGTH
        ) {
          setAbout(text);
        }
      },
      [setAbout],
    );

  return (
    <AppCard
      role="worker"
      variant="outlined"
      style={
        styles.card
      }
    >
      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        About you and your skills
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Tell customers briefly about yourself, your experience and what you do best.
      </AppText>

      <TextInput
        value={
          about
        }
        onChangeText={
          handleChange
        }
        placeholder="Write about yourself and your skills..."
        placeholderTextColor={
          Colors.textMuted
        }
        selectionColor={
          WorkerColors.primary
        }
        multiline
        maxLength={
          MAX_LENGTH
        }
        textAlignVertical="top"
        accessibilityLabel="About you and your skills"
        style={
          styles.input
        }
      />

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.counter
        }
      >
        {about.length}/{MAX_LENGTH}
      </AppText>
    </AppCard>
  );
}

export default memo(
  AboutYouSection,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.surface,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    input: {
      minHeight: 92,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xl,

      fontSize: 13,

      lineHeight: 19,

      color:
        Colors.textPrimary,
    },

    counter: {
      marginTop: -20,

      marginRight:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.xxs,

      textAlign:
        "right",

      color:
        Colors.textMuted,
    },
  });