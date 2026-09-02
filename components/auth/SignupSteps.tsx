import React from "react";
import {
  View,
 Pressable,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { AppCard, AppText } from "@/components/ui";

import {
  CustomerColors,
  WorkerColors,
  FixxamTokens,
} from "@/theme";

interface Step {
  number: number;
  title: string;
  subtitle?: string;
}

interface Props {
  currentStep: number;
  steps: Step[];
  onStepPress?: (step: number) => void;
  variant?: "customer" | "worker";
}

export default function SignupSteps({
  currentStep,
  steps,
  onStepPress,
  variant = "customer",
}: Props) {

  const primary =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

    const totalSteps = steps.length;
      
  return (
  <View style={styles.container}>

    {steps.map((step) => {

      const completed =
        currentStep > step.number;

      const active =
        currentStep === step.number;

      return (
        <Pressable
          key={step.number}
          disabled={step.number > currentStep}
          onPress={() =>
            onStepPress?.(step.number)
          }
        >
          <AppCard style={styles.card}>

            <View style={styles.row}>

              <View
                style={[
                  styles.circle,
                  completed
                    ? styles.completed
                    : active
                    ? {
                        backgroundColor:
                          primary,
                      }
                    : styles.pending,
                ]}
              >
  
                {completed ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="#FFFFFF"
                  />
                ) : (
                  <AppText
                    style={[
                      styles.number,
                      !active &&
                        styles.pendingNumber,
                    ]}
                  >
                    {step.number}
                  </AppText>
                )}

              </View>

              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                }}
              >

                <AppText
                  style={[
                    styles.title,
                    active && {
                      color: primary,
                    },
                  ]}
                >
                  {step.title}
                </AppText>

                {!!step.subtitle && (
                  <AppText
                    style={styles.subtitle}
                  >
                    {step.subtitle}
                  </AppText>
                )}

              </View>

              {completed ? (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#22C55E"
                />
              ) : active ? (
                <Ionicons
                  name="ellipse"
                  size={12}
                  color={primary}
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="#9CA3AF"
                />
              )}

            </View>

          </AppCard>
        </Pressable>
      );

    })}

  </View>
);
}
const styles = StyleSheet.create({

  container: {
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 16,
  },

  card: {
    paddingVertical: 10,
    paddingHorizontal: 14,

    marginBottom: 8,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#EEF2F7",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  circle: {
    width: 30,
    height: 30,

    borderRadius: 15,

    justifyContent: "center",
    alignItems: "center",
  },

  completed: {
    backgroundColor: "#22C55E",
  },

  pending: {
    backgroundColor: "#E5E7EB",
  },

  number: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  pendingNumber: {
    color: "#6B7280",
  },

  title: {
    fontSize: 15,
    fontWeight: "700",

    color: "#111827",
  },

  subtitle: {
    marginTop: 2,

    fontSize: 12,

    color: "#94A3B8",
  }
});