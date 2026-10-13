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

function WorkerPersonalSection({
  profile,
  updateField,
}: Props) {
  return (
    <View style={styles.card}>
      <AppText
        variant="heading3"
        style={styles.heading}
      >
        Personal Information
      </AppText>

      <AppText
        variant="caption"
        tone="secondary"
        style={styles.description}
      >
        Keep your personal information
        accurate so customers know who
        they are dealing with.
      </AppText>

      <Field
        label="Full Name"
        value={profile.fullName}
        onChange={(value) =>
          updateField(
            "fullName",
            value,
          )
        }
        placeholder="Enter your full name"
      />

      <Field
        label="Phone Number"
        value={profile.phoneNumber}
        onChange={(value) =>
          updateField(
            "phoneNumber",
            value,
          )
        }
        placeholder="Phone number"
        keyboardType="phone-pad"
        editable={false}
      />

      <Field
        label="Experience"
        value={profile.experience}
        onChange={(value) =>
          updateField(
            "experience",
            value.replace(
              /[^0-9]/g,
              "",
            ),
          )
        }
        placeholder="Years of experience"
        keyboardType="number-pad"
      />

      <Field
        label="Hourly Rate"
        value={profile.hourlyRate}
        onChange={(value) =>
          updateField(
            "hourlyRate",
            value.replace(
              /[^0-9.]/g,
              "",
            ),
          )
        }
        placeholder="Enter hourly rate"
        keyboardType="decimal-pad"
      />
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  keyboardType?: React.ComponentProps<
    typeof TextInput
  >["keyboardType"];
  editable?: boolean;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
  editable = true,
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
        keyboardType={keyboardType}
        editable={editable}
        style={[
          styles.input,
          !editable &&
            styles.disabled,
        ]}
      />
    </View>
  );
}

export default memo(
  WorkerPersonalSection,
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

  disabled: {
    backgroundColor: "#F3F5F7",
    color: "#697586",
  },
});