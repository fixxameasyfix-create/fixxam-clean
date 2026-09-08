import React, {
  memo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppButton,
} from "@/components/ui";

import {
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  step: number;

  totalSteps?: number;

  loading?: boolean;

  onNext: () => void;

  onBack: () => void;

  onComplete: () => void;
};

/* ============================================================
   COMPONENT
============================================================ */

function WorkerNavigation({
  step,
  totalSteps = 5,
  loading = false,
  onNext,
  onBack,
  onComplete,
}: Props) {
  const isLastStep =
    step >= totalSteps;

  const canGoBack =
    step > 1;

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.actions
        }
      >
        {canGoBack ? (
          <AppButton
            title="Back"
            role="worker"
            variant="outline"
            size="md"
            disabled={
              loading
            }
            onPress={
              onBack
            }
            style={
              styles.backButton
            }
          />
        ) : null}

        <AppButton
          title={
            isLastStep
              ? "Complete Registration"
              : "Next"
          }
          role="worker"
          variant="primary"
          size="md"
          loading={
            isLastStep &&
            loading
          }
          disabled={
            loading
          }
          onPress={
            isLastStep
              ? onComplete
              : onNext
          }
          style={
            styles.primaryButton
          }
        />
      </View>
    </View>
  );
}

export default memo(
  WorkerNavigation,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,

      marginHorizontal:
        FixxamTokens.spacing.md,
    },

    actions: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    backButton: {
      flex: 1,
    },

    primaryButton: {
      flex: 2,
    },
  });