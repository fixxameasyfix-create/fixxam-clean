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

import type {
  FixYourselfResult,
} from "@/services/fixxamAi";

import {
  CustomerColors,
  FixxamTokens,
} from "@/theme";

interface Props {
  result: FixYourselfResult;
}

export default function ResultSummaryCard({
  result,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="check-decagram"
            size={18}
            color={CustomerColors.success}
          />
        </View>

        <AppText
          size="lg"
          weight="bold"
          style={styles.title}
        >
          Diagnosis Complete
        </AppText>
      </View>

      <InfoRow
        label="Service"
        value={
          result.matchedService ||
          "Not Identified"
        }
      />

      <InfoRow
        label="Confidence"
        value={`${result.confidence}%`}
      />

      <InfoRow
        label="Professional"
        value={
          result.professionalRequired
            ? "Required"
            : "Not Required"
        }
        valueColor={
          result.professionalRequired
            ? CustomerColors.warning
            : CustomerColors.success
        }
        badge
      />

      <InfoRow
        label="Emergency"
        value={
          result.emergency
            ? "Yes"
            : "No"
        }
        valueColor={
          result.emergency
            ? CustomerColors.error
            : CustomerColors.success
        }
        badge
        isLast
      />
    </AppCard>
  );
}

interface RowProps {
  label: string;

  value: string;

  valueColor?: string;

  badge?: boolean;

  isLast?: boolean;
}

function InfoRow({
  label,
  value,
  valueColor = CustomerColors.primaryText,
  badge = false,
  isLast = false,
}: RowProps) {
  const badgeBackground =
    valueColor ===
    CustomerColors.success
      ? CustomerColors.successBackground
      : valueColor ===
          CustomerColors.warning
        ? CustomerColors.professionalBackground
        : CustomerColors.emergencyBackground;

  return (
    <View
      style={[
        styles.row,
        isLast &&
          styles.lastRow,
      ]}
    >
      <AppText
        style={styles.label}
      >
        {label}
      </AppText>

      {badge ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                badgeBackground,
            },
          ]}
        >
          <AppText
            size="xs"
            weight="bold"
            color={valueColor}
          >
            {value}
          </AppText>
        </View>
      ) : (
        <AppText
          weight="semibold"
          style={styles.value}
          color={valueColor}
        >
          {value}
        </AppText>
      )}
    </View>
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

      marginBottom: 4,
    },

    iconContainer: {
      width: 34,

      height: 34,

      borderRadius: 17,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        CustomerColors.successBackground,
    },

    title: {
      marginLeft: 10,
    },

    row: {
      flexDirection: "row",

      justifyContent:
        "space-between",

      alignItems: "center",

      paddingVertical: 8,

      borderBottomWidth: 1,

      borderBottomColor:
        CustomerColors.border,
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    label: {
      fontSize: 14,

      color:
        CustomerColors.textSecondary,
    },

    value: {
      fontSize: 14,
    },

    badge: {
      paddingHorizontal: 10,

      paddingVertical: 4,

      borderRadius: 999,
    },
  });