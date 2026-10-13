import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { AppButton } from "@/components/ui";

import { FixxamTokens } from "@/theme";

type Props = {
  step: number;
  totalSteps?: number;
  loading?: boolean;
  onNext: () => void;
  onComplete: () => void;
};

function WorkerNavigation({
  step,
  totalSteps = 7,
  loading = false,
  onNext,
  onComplete,
}: Props) {
  const isLastStep =
    step >= totalSteps;

  return (
    <View style={styles.container}>
      <AppButton
        title={
          isLastStep
            ? "Complete Setup"
            : "Continue"
        }
        role="worker"
        variant="primary"
        size="md"
        loading={loading}
        disabled={loading}
        onPress={
          isLastStep
            ? onComplete
            : onNext
        }
        style={styles.primaryButton}
      />
    </View>
  );
}

export default memo(
  WorkerNavigation,
);

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
      marginTop:
        FixxamTokens.spacing.md,
      marginBottom:
        FixxamTokens.spacing.md,
      paddingHorizontal:
        FixxamTokens.spacing.md,
    },

    primaryButton: {
      width: "100%",
    },
  });