import React, {
  memo,
  useCallback,
} from "react";

import {
  StyleSheet,
} from "react-native";

import CategorySelector from "@/components/worker/CategorySelector";
import ServiceSelector from "@/components/worker/ServiceSelector";

import {
  AppCard,
  AppInput,
  AppText,
} from "@/components/ui";

import {
  Colors,
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
};

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_EXPERIENCE_YEARS = 20;

/* ============================================================
   COMPONENT
============================================================ */

function ProfessionalInfoSection({
  category,
  subcategory,
  selectedServices,
  experience,
  setCategory,
  setSubcategory,
  setSelectedServices,
  setExperience,
}: Props) {
  const handleResetServices =
    useCallback(() => {
      setSelectedServices([]);
    }, [setSelectedServices]);

  const handleExperienceChange =
    useCallback(
      (
        text: string,
      ) => {
        const sanitized =
          text.replace(
            /\D/g,
            "",
          );

        if (
          sanitized === ""
        ) {
          setExperience("");
          return;
        }

        const numericValue =
          Number(sanitized);

        if (
          numericValue <=
          MAX_EXPERIENCE_YEARS
        ) {
          setExperience(
            sanitized,
          );
        }
      },
      [setExperience],
    );

  return (
    <AppCard
      role="worker"
      variant="outlined"
      style={
        styles.card
      }
    >
      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Professional Information
      </AppText>

      <CategorySelector
        category={
          category
        }
        subcategory={
          subcategory
        }
        setCategory={
          setCategory
        }
        setSubcategory={
          setSubcategory
        }
        onResetServices={
          handleResetServices
        }
      />

      <ServiceSelector
        subcategory={
          subcategory
        }
        selectedServices={
          selectedServices
        }
        setSelectedServices={
          setSelectedServices
        }
      />

      <AppInput
        label="Years of Experience"
        placeholder="0 - 20"
        value={
          experience
        }
        keyboardType="numeric"
        variant="worker"
        onChangeText={
          handleExperienceChange
        }
      />
    </AppCard>
  );
}

export default memo(
  ProfessionalInfoSection,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      marginHorizontal:
        FixxamTokens.spacing.md,

      marginTop:
        FixxamTokens.spacing.xxl,

      marginBottom:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      backgroundColor:
        Colors.surface,
    },

    title: {
      marginBottom:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },
  });