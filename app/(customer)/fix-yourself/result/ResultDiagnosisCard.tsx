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
  diagnosis: string;
}

/* ==============================================================
   COMPONENT
============================================================== */

function ResultDiagnosisCard({
  diagnosis,
}: Props) {
  const diagnosisText =
    useMemo(() => {
      if (
        typeof diagnosis !==
        "string"
      ) {
        return "Diagnosis unavailable.";
      }

      const value =
        diagnosis.trim();

      return (
        value ||
        "Diagnosis unavailable."
      );
    }, [
      diagnosis,
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
            name="brain"
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
          Fixxam Diagnosis
        </AppText>
      </View>

      {/* ========================================================
          DIAGNOSIS
      ======================================================== */}

      <View
        style={styles.content}
      >
        <AppText
          variant="body"
          style={styles.text}
        >
          {diagnosisText}
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

    text: {
      color:
        Colors.textPrimary,

      lineHeight: 22,
    },
  });

export default memo(
  ResultDiagnosisCard,
);