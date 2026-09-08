import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppInput,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

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

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_NAME_LENGTH = 20;

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerPersonalInfo({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
}: Props) {
  const handleFirstNameChange =
    useCallback(
      (value: string) => {
        setFirstName(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [
        setFirstName,
      ],
    );

  const handleSurnameChange =
    useCallback(
      (value: string) => {
        setSurname(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [
        setSurname,
      ],
    );

  const handleOtherNameChange =
    useCallback(
      (value: string) => {
        setOtherName(
          value.slice(
            0,
            MAX_NAME_LENGTH,
          ),
        );
      },
      [
        setOtherName,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <AppText
        variant="heading2"
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
        Please enter your name as you'd like it to appear on your Fixxam account.
      </AppText>

      {/* ========================================================
          FIRST NAME
      ======================================================== */}

      <View
        style={
          styles.field
        }
      >
        <AppInput
          label="First name"
          placeholder="Enter your first name"
          leftIcon="person-outline"
          value={
            firstName
          }
          onChangeText={
            handleFirstNameChange
          }
          variant="customer"
          required
        />
      </View>

      {/* ========================================================
          SURNAME
      ======================================================== */}

      <View
        style={
          styles.field
        }
      >
        <AppInput
          label="Surname"
          placeholder="Enter your surname"
          leftIcon="person-outline"
          value={
            surname
          }
          onChangeText={
            handleSurnameChange
          }
          variant="customer"
          required
        />
      </View>

      {/* ========================================================
          OTHER NAME
      ======================================================== */}

      <View
        style={
          styles.fieldLast
        }
      >
        <AppInput
          label="Other name"
          placeholder="Optional"
          leftIcon="person-outline"
          value={
            otherName
          }
          onChangeText={
            handleOtherNameChange
          }
          variant="customer"
        />

        <AppText
          accessibilityRole="text"
          variant="caption"
          tone="secondary"
          style={
            styles.helper
          }
        >
          Other name is optional.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  CustomerPersonalInfo,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      paddingTop:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.xxs,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    subtitle: {
      maxWidth: 340,

      marginBottom:
        FixxamTokens.spacing.xl,

      color:
        Colors.textSecondary,
    },

    field: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    fieldLast: {
      marginBottom:
        FixxamTokens.spacing.xxs,
    },

    helper: {
      marginTop:
        FixxamTokens.spacing.xs,

      marginLeft:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },
  });