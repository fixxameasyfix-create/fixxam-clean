import React, {
  memo,
  useMemo,
} from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppCard,
  AppText,
} from "@/components/ui";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

interface Props {
  steps: string[];
}

/* ==============================================================
   COMPONENT
============================================================== */

function ResultStepsCard({
  steps,
}: Props) {
  const cleanSteps =
    useMemo(() => {
      if (
        !Array.isArray(
          steps,
        )
      ) {
        return [];
      }

      const seen =
        new Set<string>();

      return steps.reduce<
        string[]
      >(
        (
          items,
          step,
        ) => {
          if (
            typeof step !==
            "string"
          ) {
            return items;
          }

          const value =
            step.trim();

          if (!value) {
            return items;
          }

          const key =
            value.toLocaleLowerCase();

          if (
            seen.has(key)
          ) {
            return items;
          }

          seen.add(key);

          items.push(value);

          return items;
        },
        [],
      );
    }, [
      steps,
    ]);

  return (
    <AppCard
      style={styles.card}
    >
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={
            styles.iconContainer
          }
        >
          <MaterialCommunityIcons
            name="hammer-wrench"
            size={18}
            color={
              CustomerColors.primary
            }
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={styles.title}
        >
          Things You Can Try
        </AppText>
      </View>

      {/* ========================================================
          EMPTY
      ======================================================== */}

      {cleanSteps.length ===
      0 ? (
        <View
          style={
            styles.emptyState
          }
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={
              Colors.textMuted
            }
          />

          <AppText
            variant="body"
            tone="secondary"
            style={
              styles.emptyText
            }
          >
            No troubleshooting steps are available.
          </AppText>
        </View>
      ) : (
        /* ======================================================
           STEPS
        ====================================================== */

        <View
          style={styles.list}
        >
          {cleanSteps.map(
            (
              step,
              index,
            ) => (
              <View
                key={`${index}-${step}`}
                style={[
                  styles.item,

                  index <
                  cleanSteps.length -
                    1
                    ? styles.itemBorder
                    : null,
                ]}
              >
                <View
                  style={
                    styles.numberBadge
                  }
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={
                      styles.numberText
                    }
                  >
                    {index + 1}
                  </AppText>
                </View>

                <AppText
                  variant="body"
                  style={
                    styles.text
                  }
                >
                  {step}
                </AppText>
              </View>
            ),
          )}
        </View>
      )}
    </AppCard>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      flexDirection: "row",

      alignItems: "center",
    },

    iconContainer: {
      width: 34,

      height: 34,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    title: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      overflow: "hidden",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.surface,
    },

    item: {
      flexDirection: "row",

      alignItems:
        "flex-start",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    itemBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    numberBadge: {
      width: 26,

      height: 26,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      marginTop: 1,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primary,
    },

    numberText: {
      color:
        Colors.textInverse,
    },

    text: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,

      lineHeight: 21,
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyState: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.disabledBackground,
    },

    emptyText: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      lineHeight: 20,
    },
  });

export default memo(
  ResultStepsCard,
);