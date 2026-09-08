import React, {
  memo,
  useCallback,
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
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  firstName: string;

  surname: string;

  otherName: string;

  setFirstName: (
    value: string,
  ) => void;

  setSurname: (
    value: string,
  ) => void;

  setOtherName: (
    value: string,
  ) => void;
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_NAME_LENGTH = 20;

/* ============================================================
   COMPONENT
============================================================ */

function WorkerPersonalInfo({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
}: Props) {
  const handleFirstNameChange =
    useCallback(
      (
        value: string,
      ) => {
        setFirstName(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [setFirstName],
    );

  const handleSurnameChange =
    useCallback(
      (
        value: string,
      ) => {
        setSurname(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [setSurname],
    );

  const handleOtherNameChange =
    useCallback(
      (
        value: string,
      ) => {
        setOtherName(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [setOtherName],
    );

  return (
    <AppCard
      role="worker"
      variant="outlined"
      style={
        styles.card
      }
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        What's your full name?
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Enter your name as you'd like it to appear on your Fixxam worker profile.
      </AppText>

      {/* ==================================================
          FIRST NAME
      ================================================== */}

      <AppInput
        label="First name *"
        placeholder="Enter your first name"
        value={
          firstName
        }
        onChangeText={
          handleFirstNameChange
        }
        variant="worker"
      />

      {/* ==================================================
          SURNAME
      ================================================== */}

      <AppInput
        label="Surname *"
        placeholder="Enter your surname"
        value={
          surname
        }
        onChangeText={
          handleSurnameChange
        }
        variant="worker"
      />

      {/* ==================================================
          OTHER NAME
      ================================================== */}

      <AppInput
        label="Other name"
        placeholder="Optional"
        value={
          otherName
        }
        onChangeText={
          handleOtherNameChange
        }
        variant="worker"
      />

      <AppText
        variant="caption"
        tone="secondary"
        style={
          styles.hint
        }
      >
        Other name is optional.
      </AppText>
    </AppCard>
  );
}

export default memo(
  WorkerPersonalInfo,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginTop:
        FixxamTokens.spacing.xxs,

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
        FixxamTokens.spacing.lg,

      color:
        Colors.textSecondary,
    },

    hint: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },
  });