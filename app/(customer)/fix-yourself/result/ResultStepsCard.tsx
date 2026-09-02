import React from "react";

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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface Props {
  steps: string[];
}

export default function ResultStepsCard({
  steps,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="hammer-wrench"
            size={18}
            color={CustomerColors.primary}
          />
        </View>

        <AppText
          size="lg"
          weight="bold"
          style={styles.title}
        >
          Things You Can Try
        </AppText>
      </View>

      {steps.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="information-outline"
            size={18}
            color={
              CustomerColors.textSecondary
            }
          />

          <AppText
            style={styles.emptyText}
            color={
              CustomerColors.textSecondary
            }
          >
            No troubleshooting steps
            are available.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {steps.map(
            (step, index) => (
              <View
                key={`${index}-${step}`}
                style={[
                  styles.item,
                  index <
                    steps.length - 1 &&
                    styles.itemBorder,
                ]}
              >
                <View
                  style={
                    styles.numberBadge
                  }
                >
                  <AppText
                    weight="bold"
                    color="#FFFFFF"
                    style={
                      styles.numberText
                    }
                  >
                    {index + 1}
                  </AppText>
                </View>

                <AppText
                  style={styles.text}
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

const styles =
  StyleSheet.create({
    card: {
      padding:
        FixxamTokens.spacing.md,

      gap:
        FixxamTokens.spacing.sm,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 2,
    },

    iconContainer: {
      width: 34,

      height: 34,

      borderRadius: 17,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        CustomerColors.diagnosisBackground,
    },

    title: {
      marginLeft: 10,
    },

    list: {
      borderRadius: 12,

      overflow: "hidden",

      backgroundColor:
        CustomerColors.card,

      borderWidth: 1,

      borderColor:
        CustomerColors.border,
    },

    item: {
      flexDirection: "row",

      alignItems: "flex-start",

      paddingHorizontal: 12,

      paddingVertical: 10,
    },

    itemBorder: {
      borderBottomWidth: 1,

      borderBottomColor:
        CustomerColors.border,
    },

    numberBadge: {
      width: 24,

      height: 24,

      borderRadius: 12,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        CustomerColors.primary,

      marginTop: 1,
    },

    numberText: {
      fontSize: 12,
    },

    text: {
      flex: 1,

      marginLeft: 10,

      fontSize: 14,

      lineHeight: 21,

      color:
        CustomerColors.primaryText,
    },

    emptyState: {
      flexDirection: "row",

      alignItems: "center",

      paddingVertical: 10,
    },

    emptyText: {
      flex: 1,

      marginLeft: 8,

      fontSize: 14,

      lineHeight: 20,
    },
  });