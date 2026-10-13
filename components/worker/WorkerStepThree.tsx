import React, {
  memo,
} from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import ProfessionalInfoSection from "@/components/worker/ProfessionalInfoSection";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

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

/* ============================================================
   COMPONENT
============================================================ */

function WorkerStepThree({
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
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
    >
      <ProfessionalInfoSection
        category={category}
        subcategory={
          subcategory
        }
        selectedServices={
          selectedServices
        }
        experience={
          experience
        }
        state={state}
        lga={lga}
        setCategory={
          setCategory
        }
        setSubcategory={
          setSubcategory
        }
        setSelectedServices={
          setSelectedServices
        }
        setExperience={
          setExperience
        }
        setState={
          setState
        }
        setLga={
          setLga
        }
      />
    </ScrollView>
  );
}

export default memo(
  WorkerStepThree,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xl,
    },
  });