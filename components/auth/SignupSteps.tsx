import React, { memo } from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppCard,
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
  type FixxamRole,
} from "@/theme";

export interface SignupStep {
  number: number;
  title: string;
  subtitle?: string;
}

export interface SignupStepsProps {
  currentStep: number;

  steps: SignupStep[];

  onStepPress?: (
    step: number,
  ) => void;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";
}

function SignupSteps({
  currentStep,
  steps,
  onStepPress,

  role = "customer",
  variant,
}: SignupStepsProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const roleColors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  return (
    <View style={styles.container}>
      {steps.map((step) => {
        const completed =
          step.number < currentStep;

        const active =
          step.number === currentStep;

        const pending =
          step.number > currentStep;

        const canPress =
          !pending &&
          Boolean(onStepPress);

        return (
          <AppCard
            key={step.number}
            role={resolvedRole}
            variant={
              active
                ? "accent"
                : "outlined"
            }
            disabled={pending}
            onPress={
              canPress
                ? () =>
                    onStepPress?.(
                      step.number,
                    )
                : undefined
            }
            accessibilityLabel={`${step.title}${
              completed
                ? ", completed"
                : active
                  ? ", current step"
                  : ", upcoming step"
            }`}
            style={styles.card}
          >
            <View style={styles.row}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor:
                      completed
                        ? Colors.success
                        : active
                          ? roleColors.primary
                          : Colors
                              .disabledBackground,
                  },
                ]}
              >
                {completed ? (
                  <AppIcon
                    name="check"
                    role={resolvedRole}
                    size="xs"
                    color={
                      Colors.textInverse
                    }
                    strokeWidth="strong"
                  />
                ) : (
                  <AppText
                    variant="caption"
                    weight="semibold"
                    style={{
                      color: active
                        ? Colors.textInverse
                        : Colors.textSecondary,
                    }}
                  >
                    {step.number}
                  </AppText>
                )}
              </View>

              <View
                style={
                  styles.textContainer
                }
              >
                <AppText
                  variant="bodyMedium"
                  role={resolvedRole}
                  tone={
                    active
                      ? "primary"
                      : pending
                        ? "muted"
                        : "default"
                  }
                  numberOfLines={1}
                >
                  {step.title}
                </AppText>

                {step.subtitle ? (
                  <AppText
                    variant="caption"
                    tone={
                      pending
                        ? "muted"
                        : "secondary"
                    }
                    numberOfLines={2}
                    style={
                      styles.subtitle
                    }
                  >
                    {step.subtitle}
                  </AppText>
                ) : null}
              </View>

              {completed ? (
                <AppIcon
                  name="success"
                  role={resolvedRole}
                  size="sm"
                  state="success"
                />
              ) : (
                <AppIcon
                  name="next"
                  role={resolvedRole}
                  size="sm"
                  state={
                    active
                      ? "active"
                      : "muted"
                  }
                />
              )}
            </View>
          </AppCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    gap:
      FixxamTokens.spacing.sm,

    marginTop:
      FixxamTokens.spacing.xl,

    marginBottom:
      FixxamTokens.spacing.md,
  },

  card: {
    width: "100%",

    padding:
      FixxamTokens.spacing.md,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepCircle: {
    width:
      FixxamTokens.size.avatarXs,

    height:
      FixxamTokens.size.avatarXs,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,
  },

  textContainer: {
    flex: 1,
    minWidth: 0,

    marginHorizontal:
      FixxamTokens.spacing.md,
  },

  subtitle: {
    marginTop:
      FixxamTokens.spacing.xxs,
  },
});

export default memo(
  SignupSteps,
);