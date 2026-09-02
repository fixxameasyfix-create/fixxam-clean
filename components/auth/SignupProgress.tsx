import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppText } from "@/components/ui";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

type Props = {
  currentStep: number;
  totalSteps: number;
};

export default function SignupProgress({
  currentStep,
  totalSteps,
}: Props) {
  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.title}
      >
        Step {currentStep} of {totalSteps}
      </AppText>

      <View style={styles.row}>
        {Array.from({ length: totalSteps }).map(
          (_, index) => {
            const step = index + 1;

            const completed =
              step < currentStep;

            const active =
              step === currentStep;

            return (
              <React.Fragment key={step}>
                <View
                  style={[
                    styles.circle,
                    completed &&
                      styles.completedCircle,
                    active &&
                      styles.activeCircle,
                  ]}
                >
                  {completed ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#FFFFFF"
                    />
                  ) : (
                    <AppText
                      style={[
                        styles.number,
                        active &&
                          styles.activeNumber,
                      ]}
                    >
                      {step}
                    </AppText>
                  )}
                </View>

                {step !== totalSteps && (
                  <View
                    style={[
                      styles.line,
                      completed &&
                        styles.activeLine,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          }
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  title: {
    textAlign: "center",
    marginBottom: 14,
    fontSize: 15,
    color: CustomerColors.textPrimary,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,

    backgroundColor: "#E5E7EB",

    justifyContent: "center",
    alignItems: "center",
  },

  completedCircle: {
    backgroundColor: "#22C55E",
  },

  activeCircle: {
    backgroundColor:
      CustomerColors.primary,
  },

  number: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 14,
  },

  activeNumber: {
    color: "#FFFFFF",
  },

  line: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
  },

  activeLine: {
    backgroundColor: "#22C55E",
  },
});