import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import { AppButton } from "@/components/ui";

type Props = {
  step: number;
  totalSteps?: number;
  loading?: boolean;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
};

export default function WorkerNavigation({
  step,
  totalSteps = 5,
  loading = false,
  onNext,
  onComplete,
}: Props) {
  return (
    <View style={styles.container}>
      {step < totalSteps ? (
        <AppButton
          title="Next"
          variant="worker"
          onPress={onNext}
        />
      ) : (
        <AppButton
          title="Complete Registration"
          variant="worker"
          loading={loading}
          onPress={onComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 12,
    marginHorizontal: 12,
  },
});