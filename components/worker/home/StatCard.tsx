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

import type {
  AppIconName,
} from "@/components/ui/AppIcon";

import {
  Colors,
  FixxamTokens,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  title: string;

  value: string | number;

  icon: AppIconName;

  iconColor: string;

  iconBackground: string;

  trend?: string;
};

/* ============================================================
   COMPONENT
============================================================ */

function StatCard({
  title,
  value,
  icon,
  iconColor,
  iconBackground,
  trend,
}: Props) {
  const displayTrend =
    typeof trend === "string"
      ? trend.trim()
      : "";

  return (
    <View
      style={
        styles.card
      }
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <AppIcon
          name={
            icon
          }
          size="md"
          color={
            iconColor
          }
        />
      </View>

      {/* ======================================================
          VALUE
      ====================================================== */}

      <AppText
        variant="heading2"
        weight="bold"
        numberOfLines={1}
        style={
          styles.value
        }
      >
        {value}
      </AppText>

      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="bodyMedium"
        weight="bold"
        numberOfLines={1}
        style={
          styles.title
        }
      >
        {title}
      </AppText>

      {/* ======================================================
          TREND
      ====================================================== */}

      {displayTrend ? (
        <View
          style={
            styles.trendContainer
          }
        >
          <AppIcon
            name="arrow-up"
            size="xs"
            color={
              Colors.success
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.trend
            }
          >
            {displayTrend}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

StatCard.displayName =
  "StatCard";

export default memo(
  StatCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    card: {
      flex: 1,

      padding:
        FixxamTokens.spacing.lg,

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,
    },

    /* ========================================================
       TEXT
    ======================================================== */

    value: {
      color:
        Colors.textPrimary,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       TREND
    ======================================================== */

    trendContainer: {
      marginTop:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    trend: {
      flexShrink: 1,

      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.success,
    },
  });