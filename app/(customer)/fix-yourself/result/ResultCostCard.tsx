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

import type {
  EstimatedCost,
} from "@/services/fixxamAi";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

interface Props {
  cost: EstimatedCost;

  estimatedTime: string;
}

interface InfoRowProps {
  icon:
    | "currency-ngn"
    | "clock-outline";

  value: string;
}

/* ==============================================================
   HELPERS
============================================================== */

function normalizeNumber(
  value: unknown,
): number | null {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return null;
  }

  return parsed;
}

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function formatAmount(
  value: number,
): string {
  return value.toLocaleString(
    "en-NG",
    {
      maximumFractionDigits: 2,
    },
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function ResultCostCard({
  cost,
  estimatedTime,
}: Props) {
  const costLabel =
    useMemo(() => {
      const min =
        normalizeNumber(
          cost?.min,
        );

      const max =
        normalizeNumber(
          cost?.max,
        );

      const currency =
        cleanString(
          cost?.currency,
        );

      if (
        min === null ||
        max === null
      ) {
        return "Cost unavailable";
      }

      const lower =
        Math.min(
          min,
          max,
        );

      const upper =
        Math.max(
          min,
          max,
        );

      const prefix =
        currency
          ? `${currency} `
          : "";

      if (
        lower === upper
      ) {
        return `${prefix}${formatAmount(
          lower,
        )}`;
      }

      return `${prefix}${formatAmount(
        lower,
      )} - ${formatAmount(
        upper,
      )}`;
    }, [
      cost,
    ]);

  const timeLabel =
    cleanString(
      estimatedTime,
    ) ||
    "Time estimate unavailable";

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
            name="cash-multiple"
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
          Cost & Time
        </AppText>
      </View>

      {/* ========================================================
          DETAILS
      ======================================================== */}

      <View
        style={styles.list}
      >
        <InfoRow
          icon="currency-ngn"
          value={costLabel}
        />

        <View
          style={styles.divider}
        />

        <InfoRow
          icon="clock-outline"
          value={timeLabel}
        />
      </View>
    </AppCard>
  );
}

/* ==============================================================
   INFO ROW
============================================================== */

function InfoRow({
  icon,
  value,
}: InfoRowProps) {
  return (
    <View
      style={styles.row}
    >
      <View
        style={
          styles.rowIcon
        }
      >
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={
            CustomerColors.primary
          }
        />
      </View>

      <AppText
        variant="body"
        weight="semibold"
        style={styles.value}
      >
        {value}
      </AppText>
    </View>
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
       DETAILS
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

    row: {
      minHeight: 48,

      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,
    },

    rowIcon: {
      width: 28,

      height: 28,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        CustomerColors.primarySoft,
    },

    value: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,

      lineHeight: 21,
    },

    divider: {
      height: 1,

      marginHorizontal:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },
  });

export default memo(
  ResultCostCard,
);