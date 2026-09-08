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
  WorkerColors,
} from "@/theme";

/* ============================================================
   TYPES
============================================================ */

type Props = {
  serviceName: string;

  address: string;

  date: string;

  time?: string;

  description?: string;
};

type DetailItemProps = {
  icon: AppIconName;

  label: string;

  value: string;

  description?: boolean;

  last?: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function getSafeText(
  value: unknown,
  fallback: string,
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return fallback;
}

/* ============================================================
   DETAIL ITEM
============================================================ */

const DetailItem =
  memo(
    function DetailItem({
      icon,
      label,
      value,
      description = false,
      last = false,
    }: DetailItemProps) {
      return (
        <View
          style={[
            styles.item,

            last
              ? styles.lastItem
              : null,
          ]}
        >
          <View
            style={
              styles.iconContainer
            }
          >
            <AppIcon
              name={icon}
              role="worker"
              size="sm"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <View
            style={
              styles.content
            }
          >
            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.label
              }
            >
              {label}
            </AppText>

            <AppText
              variant={
                description
                  ? "body"
                  : "bodyMedium"
              }
              weight={
                description
                  ? "regular"
                  : "medium"
              }
              style={
                description
                  ? styles.description
                  : styles.value
              }
            >
              {value}
            </AppText>
          </View>
        </View>
      );
    },
  );

DetailItem.displayName =
  "WorkerOrderServiceDetailItem";

/* ============================================================
   COMPONENT
============================================================ */

function WorkerOrderService({
  serviceName,
  address,
  date,
  time,
  description,
}: Props) {
  const safeServiceName =
    getSafeText(
      serviceName,
      "Service Booking",
    );

  const safeAddress =
    getSafeText(
      address,
      "Location not available",
    );

  const safeDate =
    getSafeText(
      date,
      "Date not available",
    );

  const safeTime =
    getSafeText(
      time,
      "",
    );

  const safeDescription =
    getSafeText(
      description,
      "No description provided.",
    );

  const dateTime =
    safeTime
      ? `${safeDate} • ${safeTime}`
      : safeDate;

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          TITLE
      ====================================================== */}

      <AppText
        variant="heading3"
        weight="bold"
        style={
          styles.title
        }
      >
        Service Details
      </AppText>

      {/* ======================================================
          SERVICE
      ====================================================== */}

      <DetailItem
        icon="service"
        label="Service"
        value={
          safeServiceName
        }
      />

      {/* ======================================================
          LOCATION
      ====================================================== */}

      <DetailItem
        icon="location"
        label="Service Location"
        value={
          safeAddress
        }
      />

      {/* ======================================================
          DATE & TIME
      ====================================================== */}

      <DetailItem
        icon="calendar"
        label="Date & Time"
        value={
          dateTime
        }
      />

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      <DetailItem
        icon="file"
        label="Description"
        value={
          safeDescription
        }
        description
        last
      />
    </View>
  );
}

/* ============================================================
   MEMO
============================================================ */

WorkerOrderService.displayName =
  "WorkerOrderService";

export default memo(
  WorkerOrderService,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginBottom:
        FixxamTokens.spacing.lg,

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
       TITLE
    ======================================================== */

    title: {
      marginBottom:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       ITEM
    ======================================================== */

    item: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },

    lastItem: {
      marginBottom: 0,
    },

    /* ========================================================
       ICON
    ======================================================== */

    iconContainer: {
      width:
        FixxamTokens.size.minimumTouchTarget,

      height:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
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

    label: {
      marginBottom:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textMuted,
    },

    value: {
      lineHeight: 20,

      color:
        Colors.textPrimary,
    },

    description: {
      lineHeight: 21,

      color:
        Colors.textSecondary,
    },
  });