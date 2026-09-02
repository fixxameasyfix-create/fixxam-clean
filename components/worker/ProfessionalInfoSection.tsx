import React from "react";
import { StyleSheet } from "react-native";

import CategorySelector from "@/components/worker/CategorySelector";
import ServiceSelector from "@/components/worker/ServiceSelector";

import {
  AppCard,
  AppInput,
  AppText,
} from "@/components/ui";

type Props = {
  category: string;
  subcategory: string;
  selectedServices: string[];
  experience: string;

  setCategory: (value: string) => void;
  setSubcategory: (value: string) => void;
  setSelectedServices: React.Dispatch<
    React.SetStateAction<string[]>
  >;
  setExperience: (
    value: string
  ) => void;
};

export default function ProfessionalInfoSection({
  category,
  subcategory,
  selectedServices,
  experience,
  setCategory,
  setSubcategory,
  setSelectedServices,
  setExperience,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <AppText
        size="md"
        weight="bold"
        style={styles.title}
      >
        Professional Information
      </AppText>

      <CategorySelector
        category={category}
        subcategory={subcategory}
        setCategory={setCategory}
        setSubcategory={setSubcategory}
        onResetServices={() =>
          setSelectedServices([])
        }
      />

      <ServiceSelector
        subcategory={subcategory}
        selectedServices={selectedServices}
        setSelectedServices={
          setSelectedServices
        }
      />

      <AppInput
        label="Years of Experience"
        placeholder="0 - 20"
        value={experience}
        keyboardType="numeric"
        variant="worker"
        onChangeText={(text) => {
          const value = text.replace(
            /[^0-9]/g,
            ""
          );

          if (
            value === "" ||
            Number(value) <= 20
          ) {
            setExperience(value);
          }
        }}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,

    // Wannan shi ne zai kawo page ɗin ƙasa
    marginTop: 40,

    marginBottom: 10,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
});