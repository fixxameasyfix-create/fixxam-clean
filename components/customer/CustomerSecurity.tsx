import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import PasswordField from "@/components/auth/PasswordField";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  password: string;

  confirmPassword: string;

  setPassword: (
    value: string,
  ) => void;

  setConfirmPassword: (
    value: string,
  ) => void;
};

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerSecurity({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
}: Props) {
  return (
    <AppCard
      role="customer"
      variant="outlined"
      style={
        styles.card
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
        Create your password
      </AppText>

      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.subtitle
        }
      >
        Choose a password to keep your Fixxam account secure.
      </AppText>

      {/* ========================================================
          PASSWORD
      ======================================================== */}

      <View
        style={
          styles.field
        }
      >
        <AppText
          variant="body"
          weight="medium"
          style={
            styles.label
          }
        >
          Password
        </AppText>

        <PasswordField
          placeholder="Enter your password"
          value={
            password
          }
          onChangeText={
            setPassword
          }
          variant="customer"
        />
      </View>

      {/* ========================================================
          CONFIRM PASSWORD
      ======================================================== */}

      <View
        style={
          styles.confirmField
        }
      >
        <AppText
          variant="body"
          weight="medium"
          style={
            styles.label
          }
        >
          Confirm password
        </AppText>

        <PasswordField
          placeholder="Re-enter your password"
          value={
            confirmPassword
          }
          onChangeText={
            setConfirmPassword
          }
          variant="customer"
        />
      </View>

      {/* ========================================================
          PASSWORD HINT
      ======================================================== */}

      <View
        style={
          styles.hint
        }
      >
        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.hintText
          }
        >
          Password must be 6–20 characters.
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={
            styles.hintText
          }
        >
          Use a password you can remember.
        </AppText>
      </View>
    </AppCard>
  );
}

export default memo(
  CustomerSecurity,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxxl,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,
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

    field: {
      width: "100%",
    },

    confirmField: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.md,
    },

    label: {
      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    hint: {
      marginTop:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      borderTopWidth: 1,

      borderTopColor:
        Colors.divider,
    },

    hintText: {
      color:
        Colors.textSecondary,
    },
  });