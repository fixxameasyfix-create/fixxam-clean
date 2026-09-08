import React, {
  memo,
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
} from "@/theme";

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

/* ==============================================================
   TYPES
============================================================== */

type Step = {
  title: string;
  icon: AppIconName;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const STEPS: readonly Step[] = [
  {
    title: "Inspect",
    icon: "search",
  },
  {
    title: "Confirm",
    icon: "check",
  },
  {
    title: "Pay",
    icon: "payment",
  },
];

/* ==============================================================
   COMPONENT
============================================================== */

function PayAfterDelivery() {
  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          MAIN ICON
      ====================================================== */}

      <View
        style={
          styles.iconBox
        }
      >
        <AppIcon
          name="shield"
          role="customer"
          size="md"
          state="active"
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={
          styles.content
        }
      >
        <AppText
          variant="bodyMedium"
          weight="bold"
          numberOfLines={1}
        >
          Pay After Delivery
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          numberOfLines={2}
          style={
            styles.subtitle
          }
        >
          Inspect your items, confirm and then pay
        </AppText>

        {/* ====================================================
            STEPS
        ==================================================== */}

        <View
          style={
            styles.steps
          }
        >
          {STEPS.map(
            (
              step,
              index,
            ) => (
              <React.Fragment
                key={
                  step.title
                }
              >
                <View
                  style={
                    styles.step
                  }
                >
                  <View
                    style={
                      styles.stepIconBox
                    }
                  >
                    <AppIcon
                      name={
                        step.icon
                      }
                      role="customer"
                      size="xs"
                      state="muted"
                    />
                  </View>

                  <AppText
                    variant="caption"
                    tone="secondary"
                    numberOfLines={1}
                    style={
                      styles.stepText
                    }
                  >
                    {step.title}
                  </AppText>
                </View>

                {index <
                STEPS.length -
                  1 ? (
                  <View
                    style={
                      styles.connector
                    }
                  >
                    <AppIcon
                      name="next"
                      role="customer"
                      size="xs"
                      color={
                        Colors.disabled
                      }
                    />
                  </View>
                ) : null}
              </React.Fragment>
            ),
          )}
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    /* ========================================================
       CONTAINER
    ======================================================== */

    container: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.lg,

      marginTop:
        FixxamTokens.spacing.xs,

      marginBottom:
        FixxamTokens.spacing.lg,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    /* ========================================================
       MAIN ICON
    ======================================================== */

    iconBox: {
      width: 50,

      height: 50,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       CONTENT
    ======================================================== */

    content: {
      flex: 1,

      minWidth: 0,

      marginLeft:
        FixxamTokens.spacing.md,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },

    /* ========================================================
       STEPS
    ======================================================== */

    steps: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop:
        FixxamTokens.spacing.sm,
    },

    step: {
      minWidth: 42,

      alignItems:
        "center",
    },

    stepIconBox: {
      width: 28,

      height: 28,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.sm,

      backgroundColor:
        Colors.surface,
    },

    stepText: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign:
        "center",
    },

    /* ========================================================
       CONNECTOR
    ======================================================== */

    connector: {
      flex: 1,

      minWidth: 10,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginHorizontal:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.md,
    },
  });

export default memo(
  PayAfterDelivery,
);