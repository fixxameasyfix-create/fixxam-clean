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
  WorkerColors,
} from "@/theme";

import type {
  WorkerFilterType,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type WorkerOrdersEmptyProps = {
  filter: WorkerFilterType;
};

type EmptyContent = {
  title: string;

  description: string;
};

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrdersEmpty({
  filter,
}: WorkerOrdersEmptyProps) {
  const content =
    getEmptyContent(
      filter,
    );

  return (
    <View
      style={
        styles.container
      }
      accessibilityRole="text"
      accessibilityLabel={`${content.title}. ${content.description}`}
    >
      {/* ========================================================
          ICON
      ======================================================== */}

      <View
        style={
          styles.iconContainer
        }
      >
        <AppIcon
          name="jobs"
          role="worker"
          size="lg"
          color={
            WorkerColors.primary
          }
        />
      </View>

      {/* ========================================================
          TITLE
      ======================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        center
        style={
          styles.title
        }
      >
        {content.title}
      </AppText>

      {/* ========================================================
          DESCRIPTION
      ======================================================== */}

      <AppText
        variant="body"
        tone="secondary"
        center
        style={
          styles.description
        }
      >
        {content.description}
      </AppText>
    </View>
  );
}

/* ==============================================================
   EMPTY CONTENT
============================================================== */

function getEmptyContent(
  filter: WorkerFilterType,
): EmptyContent {
  switch (filter) {
    case "pending":
      return {
        title:
          "No new requests",

        description:
          "New service requests and market orders will appear here.",
      };

    case "active":
      return {
        title:
          "No active jobs",

        description:
          "Accepted and ongoing jobs or orders will appear here.",
      };

    case "completed":
      return {
        title:
          "No completed jobs",

        description:
          "Completed jobs and market orders will appear here.",
      };

    case "cancelled":
      return {
        title:
          "No cancelled jobs",

        description:
          "Cancelled or expired jobs and orders will appear here.",
      };

    case "all":
    default:
      return {
        title:
          "No jobs yet",

        description:
          "Your service requests and market orders will appear here.",
      };
  }
}

/* ==============================================================
   MEMO
============================================================== */

WorkerOrdersEmpty.displayName =
  "WorkerOrdersEmpty";

export default memo(
  WorkerOrdersEmpty,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      minHeight: 260,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    iconContainer: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    description: {
      maxWidth: 320,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });