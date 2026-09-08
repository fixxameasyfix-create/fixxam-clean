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
  problem: string;
}

/* ==============================================================
   COMPONENT
============================================================== */

function ResultProblemCard({
  problem,
}: Props) {
  const problemText =
    useMemo(() => {
      if (
        typeof problem !==
        "string"
      ) {
        return "Problem description unavailable.";
      }

      const value =
        problem.trim();

      return (
        value ||
        "Problem description unavailable."
      );
    }, [
      problem,
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
            name="text-box-search-outline"
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
          Your Problem
        </AppText>
      </View>

      {/* ========================================================
          PROBLEM
      ======================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="body"
          style={styles.problem}
        >
          {problemText}
        </AppText>
      </View>
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

    content: {
      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    problem: {
      color:
        Colors.textPrimary,

      lineHeight: 22,
    },
  });

export default memo(
  ResultProblemCard,
);