import React, {
  useEffect,
  useMemo,
} from "react";

import {
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import Toast from "react-native-toast-message";

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
   TYPES
============================================================== */

type ResultState =
  | {
      status: "success";

      data:
        FixYourselfResultWithService;
    }
  | {
      status:
        | "missing"
        | "invalid";

      data: null;
    };

/* ==============================================================
   HELPERS
============================================================== */

function getParamString(
  value: unknown,
): string {
  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (
    Array.isArray(value)
  ) {
    const first =
      value[0];

    return typeof first ===
      "string"
      ? first.trim()
      : "";
  }

  return "";
}

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function parseResult(
  value: string,
): ResultState {
  if (!value) {
    return {
      status: "missing",
      data: null,
    };
  }

  try {
    const parsed:
      unknown =
      JSON.parse(value);

    if (
      !parsed ||
      typeof parsed !==
        "object" ||
      Array.isArray(parsed)
    ) {
      return {
        status: "invalid",
        data: null,
      };
    }

    return {
      status: "success",

      data:
        parsed as FixYourselfResultWithService,
    };
  } catch {
    return {
      status: "invalid",
      data: null,
    };
  }
}

/* ==============================================================
   SCREEN
============================================================== */

export default function FixYourselfResultScreen() {
  const params =
    useLocalSearchParams<{
      query?:
        | string
        | string[];

      result?:
        | string
        | string[];
    }>();

  /* ============================================================
     PARAMS
  ============================================================ */

  const query =
    getParamString(
      params.query,
    );

  const rawResult =
    getParamString(
      params.result,
    );

  /* ============================================================
     PARSE RESULT
  ============================================================ */

  const resultState =
    useMemo(
      () =>
        parseResult(
          rawResult,
        ),
      [
        rawResult,
      ],
    );

  /* ============================================================
     INVALID RESULT
  ============================================================ */

  useEffect(() => {
    if (
      resultState.status ===
      "success"
    ) {
      return;
    }

    if (
      resultState.status ===
      "missing"
    ) {
      Toast.show({
        type: "error",

        text1:
          "Analysis not found",

        text2:
          "Please analyze your problem again.",
      });

      router.back();

      return;
    }

    Toast.show({
      type: "error",

      text1:
        "Invalid analysis",

      text2:
        "Unable to load the analysis. Please try again.",
    });

    router.back();
  }, [
    resultState.status,
  ]);

  /* ============================================================
     WAIT FOR NAVIGATION
  ============================================================ */

  if (
    resultState.status !==
    "success"
  ) {
    return null;
  }

  const data =
    resultState.data;

  /* ============================================================
     SERVICE DATA
  ============================================================ */

  const serviceId =
    cleanString(
      data.matchedServiceId,
    );

  const serviceName =
    cleanString(
      data.matchedService,
    );

  const serviceIcon =
    cleanString(
      data.matchedServiceIcon,
    );

  const serviceColor =
    cleanString(
      data.matchedServiceColor,
    );

  const serviceBackgroundColor =
    cleanString(
      data.matchedServiceBackgroundColor,
    );

  const categoryId =
    cleanString(
      data.matchedCategoryId,
    );

  /* ============================================================
     UI
  ============================================================ */

  return (
    <AppScreen
      role="customer"
      padded={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
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
          problem={query}
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
          problem={query}
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
        FixxamTokens.spacing.xxl,

      gap:
        FixxamTokens.spacing.sm,
    },
  });