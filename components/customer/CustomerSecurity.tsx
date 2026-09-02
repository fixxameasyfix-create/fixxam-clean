import React from "react";
import { StyleSheet, View } from "react-native";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import PasswordField from "@/components/auth/PasswordField";

import {
  CustomerColors,
} from "@/theme";

type Props = {
  password: string;
  confirmPassword: string;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
};

export default function CustomerSecurity({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
}: Props) {
  return (
    <AppCard style={styles.card}>
      {/* HEADER */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        Create your password
      </AppText>

      <AppText style={styles.subtitle}>
        Choose a password to keep your
        Fixxam account secure.
      </AppText>

      {/* PASSWORD */}

      <View style={styles.field}>
        <AppText
          weight="semibold"
          style={styles.label}
        >
          Password
        </AppText>

        <PasswordField
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          variant="customer"
        />
      </View>

      {/* CONFIRM PASSWORD */}

      <View style={styles.confirmField}>
        <AppText
          weight="semibold"
          style={styles.label}
        >
          Confirm password
        </AppText>

        <PasswordField
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={
            setConfirmPassword
          }
          variant="customer"
        />
      </View>

      {/* PASSWORD HINT */}

      <View style={styles.hint}>
        <AppText style={styles.hintText}>
          Password must be 6–20 characters.
        </AppText>

        <AppText style={styles.hintText}>
          Use a password you can remember.
        </AppText>
      </View>
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  card: {
    marginTop: 60,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    color:
      CustomerColors.textPrimary,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color:
      CustomerColors.textSecondary,
    marginBottom: 18,
  },

  field: {
    width: "100%",
  },

  confirmField: {
    width: "100%",
    marginTop: 16,
  },

  label: {
    fontSize: 13,
    lineHeight: 18,
    color:
      CustomerColors.textPrimary,
    marginBottom: 7,
  },

  hint: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF3",
  },

  hintText: {
    fontSize: 11,
    lineHeight: 17,
    color:
      CustomerColors.textSecondary,
  },
});