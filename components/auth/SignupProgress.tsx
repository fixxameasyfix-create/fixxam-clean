import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
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

export interface SignupProgressProps {
  currentStep: number;

  totalSteps: number;

  role?: FixxamRole;

  /*
   * Legacy support.
   */
  variant?: "customer" | "worker";
}

function SignupProgress({
  currentStep,
  totalSteps,

  role = "customer",
  variant,
}: SignupProgressProps) {
  const resolvedRole: FixxamRole =
    variant ?? role;

  const roleColors =
    resolvedRole === "worker"
      ? WorkerColors
      : CustomerColors;

  const safeTotalSteps =
    useMemo(
      () =>
        Math.max(
          1,
          Math.floor(totalSteps),
        ),
      [totalSteps],
    );

  const safeCurrentStep =
    useMemo(
      () =>
        Math.min(
          safeTotalSteps,
          Math.max(
            1,
            Math.floor(currentStep),
          ),
        ),
      [
        currentStep,
        safeTotalSteps,
      ],
    );

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Sign up progress"
      accessibilityValue={{
        min: 1,
        max: safeTotalSteps,
        now: safeCurrentStep,
        text: `Step ${safeCurrentStep} of ${safeTotalSteps}`,
      }}
      style={styles.container}
    >
      <AppText
        variant="label"
        center
        style={styles.title}
      >
        Step {safeCurrentStep} of{" "}
        {safeTotalSteps}
      </AppText>

      <View style={styles.row}>
        {Array.from({
          length: safeTotalSteps,
        }).map((_, index) => {
          const step = index + 1;

          const completed =
            step < safeCurrentStep;

          const active =
            step === safeCurrentStep;

          return (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.circle,

                  completed
                    ? styles.completedCircle
                    : null,

                  active
                    ? {
                        backgroundColor:
                          roleColors.primary,
                      }
                    : null,
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
                    {step}
                  </AppText>
                )}
              </View>

              {step !==
              safeTotalSteps ? (
                <View
                  style={[
                    styles.line,

                    completed
                      ? styles.completedLine
                      : null,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    marginBottom:
      FixxamTokens.spacing.lg,
  },

  title: {
    marginBottom:
      FixxamTokens.spacing.md,
  },

  row: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
  },

  circle: {
    width:
      FixxamTokens.size.avatarXs,

    height:
      FixxamTokens.size.avatarXs,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius:
      FixxamTokens.radius.full,

    backgroundColor:
      Colors.disabledBackground,
  },

  completedCircle: {
    backgroundColor:
      Colors.success,
  },

  line: {
    flex: 1,

    height:
      FixxamTokens.spacing.xxs,

    backgroundColor:
      Colors.divider,
  },

  completedLine: {
    backgroundColor:
      Colors.success,
  },
});

export default memo(
  SignupProgress,
);