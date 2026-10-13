import React, {
  memo,
  useMemo,
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
   CONTENT
============================================================== */

function getEmptyContent(
  filter: WorkerFilterType,
): EmptyContent {
  switch (filter) {
    case "pending":
      return {
        title: "No new requests",
        description:
          "New job requests will appear here when they become available.",
      };

    case "active":
      return {
        title: "No active jobs",
        description:
          "Jobs you accept or start will appear here.",
      };

    case "completed":
      return {
        title: "No completed jobs",
        description:
          "Jobs you complete will appear here.",
      };

    case "cancelled":
      return {
        title: "No cancelled jobs",
        description:
          "Cancelled and expired jobs will appear here.",
      };

    case "all":
    default:
      return {
        title: "No jobs yet",
        description:
          "Your jobs will appear here when you receive them.",
      };
  }
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerOrdersEmpty({
  filter,
}: WorkerOrdersEmptyProps) {
  const content =
    useMemo(
      () =>
        getEmptyContent(
          filter,
        ),
      [
        filter,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
      accessible
      accessibilityLabel={`${content.title}. ${content.description}`}
    >
      <View
        style={
          styles.iconContainer
        }
      >
        <AppIcon
          name="jobs"
          role="worker"
          size="md"
          color={
            WorkerColors.primary
          }
        />
      </View>

      <AppText
        variant="heading3"
        weight="semibold"
        center
        style={
          styles.title
        }
      >
        {content.title}
      </AppText>

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

      minHeight: 240,

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
      width: 56,

      height: 56,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    title: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textPrimary,
    },

    description: {
      maxWidth: 280,

      marginTop:
        FixxamTokens.spacing.xs,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });