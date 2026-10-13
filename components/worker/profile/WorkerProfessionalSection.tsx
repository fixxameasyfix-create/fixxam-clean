import React, { memo } from "react";
import {
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  WorkerProfile,
  WorkerProfileField,
} from "@/types/workerProfile";

type Props = {
  profile: WorkerProfile;

  updateField: <
    K extends WorkerProfileField,
  >(
    field: K,
    value: WorkerProfile[K],
  ) => void;
};

function WorkerProfessionalSection({
  profile,
  updateField,
}: Props) {
  const servicesText =
    profile.selectedServices.join(
      ", ",
    );

  return (
    <View style={styles.card}>
      <AppText
        variant="heading3"
        style={styles.heading}
      >
        Professional Information
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.description}
      >
        These details help customers
        understand exactly what you offer.
      </AppText>

      <Field
        label="Category"
        value={profile.category}
        onChange={(value) =>
          updateField(
            "category",
            value,
          )
        }
        placeholder="e.g. Plumbing"
      />

      <Field
        label="Subcategory"
        value={profile.subcategory}
        onChange={(value) =>
          updateField(
            "subcategory",
            value,
          )
        }
        placeholder="e.g. Residential Plumbing"
      />

      <AppText
        variant="caption"
        style={styles.label}
      >
        Services
      </AppText>

      <TextInput
        value={servicesText}
        onChangeText={(value) => {
          const services =
            value
              .split(",")
              .map(
                (item) =>
                  item.trim(),
              )
              .filter(Boolean);

          updateField(
            "selectedServices",
            Array.from(
              new Set(services),
            ),
          );
        }}
        placeholder="Plumbing, Pipe Repair, Installation"
        placeholderTextColor="#8B95A3"
        multiline
        textAlignVertical="top"
        style={[
          styles.input,
          styles.servicesInput,
        ]}
      />

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.helper}
      >
        Separate multiple services with
        commas.
      </AppText>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <AppText
        variant="caption"
        style={styles.label}
      >
        {label}
      </AppText>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#8B95A3"
        style={styles.input}
      />
    </View>
  );
}

export default memo(
  WorkerProfessionalSection,
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  heading: {
    marginBottom: 5,
  },

  description: {
    lineHeight: 19,
    marginBottom: 16,
  },

  field: {
    marginBottom: 14,
  },

  label: {
    marginBottom: 7,
    fontWeight: "600",
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#DCE2E8",
    borderRadius: 12,
    color: "#17202A",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
  },

  servicesInput: {
    minHeight: 92,
    paddingTop: 14,
  },

  helper: {
    marginTop: -6,
  },
});