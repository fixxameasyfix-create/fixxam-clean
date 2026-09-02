import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";

import { AppText } from "@/components/ui";

import {
  CustomerColors,
  WorkerColors,
} from "@/theme";

type Props = {
  step: number;
  totalSteps?: number;
  variant?: "customer" | "worker";
};

export default function WorkerSignupSteps({
  step,
  totalSteps = 5,
  variant = "worker",
}: Props) {
  const primary =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  return (
    <View style={styles.container}>
      <AppText
        weight="bold"
        style={styles.stepText}
      >
        Step {step} of {totalSteps}
      </AppText>

      <View style={styles.progressContainer}>
        {Array.from({
          length: totalSteps,
        }).map((_, index) => {
          const active =
            index + 1 <= step;

          const current =
            index + 1 === step;

          return (
            <React.Fragment
              key={index}
            >
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor:
                      active
                        ? primary
                        : "#F3F4F6",

                    borderColor:
                      active
                        ? primary
                        : "#D1D5DB",

                    transform: [
                      {
                        scale: current
                          ? 1.1
                          : 1,
                      },
                    ],
                  },
                ]}
              >
                <AppText
                  style={[
                    styles.number,
                    {
                      color: active
                        ? "#FFFFFF"
                        : "#94A3B8",
                    },
                  ]}
                >
                  {index + 1}
                </AppText>
              </View>

              {index !==
                totalSteps - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        index + 1 <
                        step
                          ? primary
                          : "#E5E7EB",
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      <AppText
        style={styles.title}
      >
        {step === 1 &&
          "Personal Information"}

        {step === 2 &&
          "Contact Information"}

        {step === 3 &&
          "Professional Information"}

        {step === 4 &&
          "Security & Photo"}

        {step === 5 &&
          "Review Information"}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 22,
  },

  stepText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 10,
  },

  status: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 18,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,

    borderWidth: 2,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  number: {
    fontSize: 17,
    fontWeight: "800",
  },

  line: {
    flex: 1,
    height: 4,

    marginHorizontal: 8,

    borderRadius: 999,
  },

  title: {
    textAlign: "center",

    fontSize: 22,
    fontWeight: "800",

    color: "#0B2D6B",

    marginTop: 2,
  },
});