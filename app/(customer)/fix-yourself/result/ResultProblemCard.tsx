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
  problem: string;
}

export default function ResultProblemCard({
  problem,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="text-box-search-outline"
            size={18}
            color={CustomerColors.primary}
          />
        </View>

        <AppText
          size="lg"
          weight="bold"
          style={styles.title}
        >
          Your Problem
        </AppText>
      </View>

      <View style={styles.content}>
        <AppText style={styles.problem}>
          {problem}
        </AppText>
      </View>
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

    content: {
      padding: 12,

      borderRadius: 12,

      backgroundColor:
        CustomerColors.diagnosisBackground,

      borderWidth: 1,

      borderColor:
        CustomerColors.border,
    },

    problem: {
      fontSize: 14,

      lineHeight: 22,

      color:
        CustomerColors.primaryText,
    },
  });