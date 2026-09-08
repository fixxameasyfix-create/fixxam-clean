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
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  workerName: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   COMPONENT
============================================================== */

function CustomerServiceProgressCard({
  workerName,
}: Props) {
  const safeWorkerName =
    cleanText(workerName) ||
    "Your worker";

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Service in progress. ${safeWorkerName} has started working on your service.`}
    >
      {/* ======================================================
          ICON
      ====================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <AppIcon
          name="service"
          size="md"
          color={
            Colors.success
          }
        />
      </View>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <View
        style={styles.content}
      >
        <View
          style={styles.titleRow}
        >
          <AppText
            variant="caption"
            weight="bold"
            style={styles.title}
          >
            SERVICE IN PROGRESS
          </AppText>

          <View
            style={
              styles.statusDot
            }
          />
        </View>

        <AppText
          variant="caption"
          style={
            styles.description
          }
        >
          {safeWorkerName} has started working on your service.
        </AppText>

        <AppText
          variant="caption"
          tone="secondary"
          style={styles.helper}
        >
          You can contact the worker if you need to discuss anything.
        </AppText>
      </View>
    </View>
  );
}

export default memo(
  CustomerServiceProgressCard,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      flexDirection: "row",

      alignItems: "center",

      borderWidth: 1,

      borderColor:
        Colors.success,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.successSoft,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width: 52,

      height: 52,

      flexShrink: 0,

      alignItems: "center",

      justifyContent: "center",

      borderRadius:
        FixxamTokens.radius.md,

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

    titleRow: {
      flexDirection: "row",

      alignItems: "center",

      flexWrap: "wrap",
    },

    title: {
      letterSpacing: 0.3,

      color:
        Colors.success,
    },

    statusDot: {
      width: 7,

      height: 7,

      marginLeft:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.success,
    },

    description: {
      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 17,

      color:
        Colors.textPrimary,
    },

    helper: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 16,
    },
  });