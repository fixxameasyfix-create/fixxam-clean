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
  FixYourselfResult,
} from "@/services/fixxamAi";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

interface Props {
  result: FixYourselfResult;
}

type StatusTone =
  | "success"
  | "warning"
  | "error";

interface RowProps {
  label: string;

  value: string;

  status?: StatusTone;

  badge?: boolean;

  isLast?: boolean;
}

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function getConfidenceLabel(
  value: unknown,
): string {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    return "Unavailable";
  }

  const confidence =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(parsed),
      ),
    );

  return `${confidence}%`;
}

function getStatusColors(
  status: StatusTone,
) {
  switch (status) {
    case "success":
      return {
        text:
          Colors.success,

        background:
          Colors.successSoft,
      };

    case "warning":
      return {
        text:
          Colors.warning,

        background:
          Colors.warningSoft,
      };

    case "error":
      return {
        text:
          Colors.error,

        background:
          Colors.errorSoft,
      };
  }
}

/* ==============================================================
   COMPONENT
============================================================== */

function ResultSummaryCard({
  result,
}: Props) {
  const serviceName =
    useMemo(
      () =>
        cleanString(
          result.matchedService,
        ) ||
        "Not Identified",
      [
        result.matchedService,
      ],
    );

  const confidence =
    useMemo(
      () =>
        getConfidenceLabel(
          result.confidence,
        ),
      [
        result.confidence,
      ],
    );

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
            name="check-decagram"
            size={18}
            color={
              Colors.success
            }
          />
        </View>

        <AppText
          variant="bodyLarge"
          weight="bold"
          style={styles.title}
        >
          Diagnosis Complete
        </AppText>
      </View>

      {/* ========================================================
          SUMMARY
      ======================================================== */}

      <View
        style={styles.summary}
      >
        <InfoRow
          label="Service"
          value={
            serviceName
          }
        />

        <InfoRow
          label="Confidence"
          value={
            confidence
          }
        />

        <InfoRow
          label="Professional"
          value={
            result.professionalRequired
              ? "Required"
              : "Not Required"
          }
          status={
            result.professionalRequired
              ? "warning"
              : "success"
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
          status={
            result.emergency
              ? "error"
              : "success"
          }
          badge
          isLast
        />
      </View>
    </AppCard>
  );
}

/* ==============================================================
   INFO ROW
============================================================== */

function InfoRow({
  label,
  value,
  status,
  badge = false,
  isLast = false,
}: RowProps) {
  const statusColors =
    status
      ? getStatusColors(
          status,
        )
      : null;

  return (
    <View
      style={[
        styles.row,

        isLast
          ? styles.lastRow
          : null,
      ]}
    >
      <AppText
        variant="body"
        tone="secondary"
        style={
          styles.label
        }
      >
        {label}
      </AppText>

      {badge &&
      statusColors ? (
        <View
          style={[
            styles.badge,

            {
              backgroundColor:
                statusColors.background,
            },
          ]}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={{
              color:
                statusColors.text,
            }}
          >
            {value}
          </AppText>
        </View>
      ) : (
        <AppText
          variant="body"
          weight="semibold"
          numberOfLines={2}
          style={
            styles.value
          }
        >
          {value}
        </AppText>
      )}
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
        Colors.successSoft,
    },

    title: {
      flex: 1,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       SUMMARY
    ======================================================== */

    summary: {
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

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.md,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.sm,

      borderBottomWidth: 1,

      borderBottomColor:
        Colors.divider,
    },

    lastRow: {
      borderBottomWidth: 0,
    },

    label: {
      flexShrink: 0,
    },

    value: {
      flex: 1,

      textAlign: "right",

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       BADGE
    ======================================================== */

    badge: {
      flexShrink: 0,

      minHeight: 28,

      alignItems: "center",

      justifyContent: "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.chip,
    },
  });

export default memo(
  ResultSummaryCard,
);