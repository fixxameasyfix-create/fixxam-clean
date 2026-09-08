import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  step: number;

  totalSteps?: number;

  variant?: "customer" | "worker";
};

/* ============================================================
   CONSTANTS
============================================================ */

const STEP_TITLES = [
  "Personal Information",
  "Contact Information",
  "Professional Information",
  "Security & Photo",
  "Review Information",
] as const;

/* ============================================================
   COMPONENT
============================================================ */

function WorkerSignupSteps({
  step,
  totalSteps = 5,
  variant = "worker",
}: Props) {
  const safeTotalSteps =
    Math.max(
      1,
      Math.floor(totalSteps),
    );

  const safeStep =
    Math.min(
      safeTotalSteps,
      Math.max(
        1,
        Math.floor(step),
      ),
    );

  const primary =
    variant === "worker"
      ? WorkerColors.primary
      : CustomerColors.primary;

  const title =
    useMemo(
      () =>
        STEP_TITLES[
          safeStep - 1
        ] ?? `Step ${safeStep}`,
      [safeStep],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      <AppText
        variant="body"
        weight="bold"
        center
        style={
          styles.stepText
        }
      >
        Step {safeStep} of {safeTotalSteps}
      </AppText>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 1,
          max: safeTotalSteps,
          now: safeStep,
        }}
        style={
          styles.progressContainer
        }
      >
        {Array.from({
          length:
            safeTotalSteps,
        }).map(
          (
            _,
            index,
          ) => {
            const stepNumber =
              index + 1;

            const active =
              stepNumber <=
              safeStep;

            const current =
              stepNumber ===
              safeStep;

            const connectorActive =
              stepNumber <
              safeStep;

            return (
              <React.Fragment
                key={
                  stepNumber
                }
              >
                <View
                  style={[
                    styles.circle,

                    {
                      backgroundColor:
                        active
                          ? primary
                          : Colors.disabledBackground,

                      borderColor:
                        active
                          ? primary
                          : Colors.disabled,

                      transform: [
                        {
                          scale:
                            current
                              ? 1.1
                              : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <AppText
                    variant="bodyLarge"
                    weight="bold"
                    style={{
                      color:
                        active
                          ? Colors.textInverse
                          : Colors.textMuted,
                    }}
                  >
                    {
                      stepNumber
                    }
                  </AppText>
                </View>

                {index !==
                safeTotalSteps -
                  1 ? (
                  <View
                    style={[
                      styles.line,

                      {
                        backgroundColor:
                          connectorActive
                            ? primary
                            : Colors.divider,
                      },
                    ]}
                  />
                ) : null}
              </React.Fragment>
            );
          },
        )}
      </View>

      <AppText
        variant="heading2"
        weight="bold"
        center
        style={[
          styles.title,

          {
            color:
              primary,
          },
        ]}
      >
        {title}
      </AppText>
    </View>
  );
}

export default memo(
  WorkerSignupSteps,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.xl,
    },

    stepText: {
      marginBottom:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    progressContainer: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    circle: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      borderRadius:
        FixxamTokens.radius.full,

      borderWidth: 2,

      justifyContent:
        "center",

      alignItems:
        "center",

      ...FixxamTokens.shadow.card,
    },

    line: {
      flex: 1,

      height: 4,

      marginHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.full,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.xxs,
    },
  });