import React from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  AppScreen,
} from "@/components/ui";

import type {
  FixYourselfResult,
} from "@/services/fixxamAi";

import {
  FixxamTokens,
} from "@/theme";

import ResultSummaryCard from "./ResultSummaryCard";
import ResultProblemCard from "./ResultProblemCard";
import ResultDiagnosisCard from "./ResultDiagnosisCard";
import ResultCausesCard from "./ResultCausesCard";
import ResultStepsCard from "./ResultStepsCard";
import ResultCostCard from "./ResultCostCard";
import ResultSafetyCard from "./ResultSafetyCard";
import ResultActions from "./ResultActions";

/* ==============================================================
   RESULT SERVICE DATA
============================================================== */

type FixYourselfResultWithService =
  FixYourselfResult & {
    matchedServiceIcon?: string;

    matchedServiceColor?: string;

    matchedServiceBackgroundColor?: string;

    matchedCategoryId?: string;
  };

/* ==============================================================
   SCREEN
============================================================== */

export default function FixYourselfResultScreen() {
  const {
    query,
    result,
  } =
    useLocalSearchParams<{
      query?: string;
      result?: string;
    }>();

  /* ============================================================
     RESULT CHECK
  ============================================================ */

  if (!result) {
    Alert.alert(
      "Analysis Not Found",
      "Please analyze your problem again.",
      [
        {
          text: "OK",
          onPress: () =>
            router.back(),
        },
      ],
    );

    return null;
  }

  /* ============================================================
     PARSE RESULT
  ============================================================ */

  let data:
    FixYourselfResultWithService;

  try {
    data =
      JSON.parse(
        result,
      ) as FixYourselfResultWithService;
  } catch {
    Alert.alert(
      "Invalid Result",
      "Unable to load the analysis.",
      [
        {
          text: "OK",
          onPress: () =>
            router.back(),
        },
      ],
    );

    return null;
  }

  /* ============================================================
     SERVICE DATA
  ============================================================ */

  const serviceId =
    data.matchedServiceId
      ?.trim() ?? "";

  const serviceName =
    data.matchedService
      ?.trim() ?? "";

  const serviceIcon =
    data.matchedServiceIcon
      ?.trim() ?? "";

  const serviceColor =
    data.matchedServiceColor
      ?.trim() ?? "";

  const serviceBackgroundColor =
    data.matchedServiceBackgroundColor
      ?.trim() ?? "";

  const categoryId =
    data.matchedCategoryId
      ?.trim() ?? "";

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.container
        }
      >
        {/* ======================================================
            SUMMARY
        ====================================================== */}

        <ResultSummaryCard
          result={data}
        />

        {/* ======================================================
            PROBLEM
        ====================================================== */}

        <ResultProblemCard
          problem={
            query ?? ""
          }
        />

        {/* ======================================================
            DIAGNOSIS
        ====================================================== */}

        <ResultDiagnosisCard
          diagnosis={
            data.response
          }
        />

        {/* ======================================================
            CAUSES
        ====================================================== */}

        <ResultCausesCard
          causes={
            data.causes
          }
        />

        {/* ======================================================
            STEPS
        ====================================================== */}

        <ResultStepsCard
          steps={
            data.steps
          }
        />

        {/* ======================================================
            COST
        ====================================================== */}

        <ResultCostCard
          cost={
            data.estimatedCost
          }
          estimatedTime={
            data.estimatedTime
          }
        />

        {/* ======================================================
            SAFETY
        ====================================================== */}

        <ResultSafetyCard
          safety={
            data.safety
          }
          emergency={
            data.emergency
          }
          professionalRequired={
            data.professionalRequired
          }
        />

        {/* ======================================================
            NEXT ACTION
        ====================================================== */}

        <ResultActions
          problem={
            query ?? ""
          }

          serviceId={
            serviceId
          }

          serviceName={
            serviceName
          }

          serviceIcon={
            serviceIcon
          }

          serviceColor={
            serviceColor
          }

          serviceBackgroundColor={
            serviceBackgroundColor
          }

          categoryId={
            categoryId
          }

          professionalRequired={
            data.professionalRequired
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xl,

      gap: 10,
    },
  });