import React from "react";
import { StyleSheet } from "react-native";

import {
  AppCard,
  AppInput,
  AppText,
} from "@/components/ui";

type Props = {
  firstName: string;
  surname: string;
  otherName: string;

  setFirstName: (value: string) => void;
  setSurname: (value: string) => void;
  setOtherName: (value: string) => void;
};

export default function WorkerPersonalInfo({
  firstName,
  surname,
  otherName,
  setFirstName,
  setSurname,
  setOtherName,
}: Props) {
  return (
    <AppCard style={styles.card}>
      {/* HEADER */}

      <AppText
        weight="bold"
        style={styles.title}
      >
        What's your full name?
      </AppText>

      <AppText style={styles.subtitle}>
        Enter your name as you'd like it to
        appear on your Fixxam worker profile.
      </AppText>

      {/* FIRST NAME */}

      <AppInput
        label="First name *"
        placeholder="Enter your first name"
        value={firstName}
        onChangeText={(value) =>
          setFirstName(
            value.slice(0, 20),
          )
        }
        variant="worker"
      />

      {/* SURNAME */}

      <AppInput
        label="Surname *"
        placeholder="Enter your surname"
        value={surname}
        onChangeText={(value) =>
          setSurname(
            value.slice(0, 20),
          )
        }
        variant="worker"
      />

      {/* OTHER NAME */}

      <AppInput
        label="Other name"
        placeholder="Optional"
        value={otherName}
        onChangeText={(value) =>
          setOtherName(
            value.slice(0, 20),
          )
        }
        variant="worker"
      />

      <AppText style={styles.hint}>
        Other name is optional.
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    color: "#0F172A",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    marginBottom: 18,
  },

  hint: {
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
    marginTop: -2,
  },
});