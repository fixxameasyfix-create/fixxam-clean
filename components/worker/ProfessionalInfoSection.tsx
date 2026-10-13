import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import AppInput from "@/components/ui/AppInput";

import CategorySelector from "@/components/worker/CategorySelector";
import ServiceSelector from "@/components/worker/ServiceSelector";
import LocationSelector from "@/components/worker/LocationSelector";

import {
  FixxamTokens,
} from "@/theme";

type Props = {
  category: string;
  subcategory: string;
  selectedServices: string[];
  experience: string;
  state: string;
  lga: string;

  setCategory: (
    value: string,
  ) => void;

  setSubcategory: (
    value: string,
  ) => void;

  setSelectedServices: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  setExperience: (
    value: string,
  ) => void;

  setState: (
    value: string,
  ) => void;

  setLga: (
    value: string,
  ) => void;
};

const MAX_EXPERIENCE_YEARS = 20;

function ProfessionalInfoSection({
  category,
  subcategory,
  selectedServices,
  experience,
  state,
  lga,
  setCategory,
  setSubcategory,
  setSelectedServices,
  setExperience,
  setState,
  setLga,
}: Props) {
  const handleResetServices =
    useCallback(() => {
      setSelectedServices([]);
    }, [
      setSelectedServices,
    ]);

  return (
    <View style={styles.container}>
      <CategorySelector
        category={category}
        subcategory={subcategory}
        setCategory={setCategory}
        setSubcategory={
          setSubcategory
        }
        onResetServices={
          handleResetServices
        }
      />

      <ServiceSelector
        subcategory={subcategory}
        selectedServices={
          selectedServices
        }
        setSelectedServices={
          setSelectedServices
        }
      />

      <AppInput
        label="Years of Experience"
        value={experience}
        onChangeText={
          setExperience
        }
        placeholder={`0 - ${MAX_EXPERIENCE_YEARS}`}
        keyboardType="number-pad"
        maxLength={2}
      />

      <LocationSelector
        state={state}
        lga={lga}
        setState={setState}
        setLga={setLga}
      />
    </View>
  );
}

export default memo(
  ProfessionalInfoSection,
);

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },
  });