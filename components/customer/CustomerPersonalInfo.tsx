import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppInput,
  AppText,
} from "@/components/ui";

import {
  CustomerColors,
} from "@/theme";

type Props = {
  firstName: string;
  surname: string;
  otherName: string;

  setFirstName: (value: string) => void;
  setSurname: (value: string) => void;
  setOtherName: (value: string) => void;
};

export default function CustomerPersonalInfo({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        What's your full name?
      </AppText>

      <AppText
        style={styles.subtitle}
      >
        Please enter your name as you'd like it
        to appear on your Fixxam account.
      </AppText>

      {/* First Name */}

      <View style={styles.field}>
        <AppInput
          label="First name"
          placeholder="Enter your first name"
          leftIcon="person-outline"
          value={firstName}
          onChangeText={(value) =>
            setFirstName(
              value.slice(0, 20)
            )
          }
          variant="customer"
          required
        />
      </View>

      {/* Surname */}

      <View style={styles.field}>
        <AppInput
          label="Surname"
          placeholder="Enter your surname"
          leftIcon="person-outline"
          value={surname}
          onChangeText={(value) =>
            setSurname(
              value.slice(0, 20)
            )
          }
          variant="customer"
          required
        />
      </View>

      {/* Other Name */}

      <View style={styles.fieldLast}>
        <AppInput
          label="Other name"
          placeholder="Optional"
          leftIcon="person-outline"
          value={otherName}
          onChangeText={(value) =>
            setOtherName(
              value.slice(0, 20)
            )
          }
          variant="customer"
        />

        <AppText
          style={styles.helper}
        >
          Other name is optional.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 4,
    paddingTop: 12,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    color: CustomerColors.textPrimary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: CustomerColors.textSecondary,
    marginBottom: 24,
    maxWidth: 340,
  },

  field: {
    marginBottom: 16,
  },

  fieldLast: {
    marginBottom: 4,
  },

  helper: {
    fontSize: 12,
    lineHeight: 17,
    color: CustomerColors.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
});