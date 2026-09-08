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
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   TYPES
============================================================== */

type Props = {
  verified: boolean;

  online: boolean;

  completedJobs?: number;

  arrivalTime?: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

function normalizeCount(
  value: unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

function WorkerBadges({
  verified,
  online,
  completedJobs,
  arrivalTime,
}: Props) {
  const safeArrivalTime =
    cleanString(
      arrivalTime,
    );

  const safeCompletedJobs =
    normalizeCount(
      completedJobs,
    );

  const jobsLabel =
    useMemo(() => {
      if (
        safeCompletedJobs ===
        null
      ) {
        return "";
      }

      return `${safeCompletedJobs} ${
        safeCompletedJobs === 1
          ? "Job"
          : "Jobs"
      }`;
    }, [
      safeCompletedJobs,
    ]);

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          VERIFIED
      ====================================================== */}

      {verified ? (
        <View
          style={[
            styles.badge,
            styles.verifiedBadge,
          ]}
        >
          <AppIcon
            name="verified"
            role="customer"
            size="xs"
            state="success"
          />

          <AppText
            variant="caption"
            weight="semibold"
            style={
              styles.verifiedText
            }
          >
            Verified
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          AVAILABILITY
      ====================================================== */}

      <View
        style={[
          styles.badge,

          online
            ? styles.availableBadge
            : styles.offlineBadge,
        ]}
      >
        <View
          style={[
            styles.dot,

            online
              ? styles.onlineDot
              : styles.offlineDot,
          ]}
        />

        <AppText
          variant="caption"
          weight="semibold"
          style={
            online
              ? styles.availableText
              : styles.offlineText
          }
        >
          {online
            ? "Available"
            : "Offline"}
        </AppText>
      </View>

      {/* ======================================================
          ARRIVAL
      ====================================================== */}

      {safeArrivalTime ? (
        <View
          style={[
            styles.badge,
            styles.arrivalBadge,
          ]}
        >
          <AppIcon
            name="clock"
            role="customer"
            size="xs"
            color={
              Colors.info
            }
          />

          <AppText
            variant="caption"
            weight="semibold"
            numberOfLines={1}
            style={
              styles.arrivalText
            }
          >
            {safeArrivalTime}
          </AppText>
        </View>
      ) : null}

      {/* ======================================================
          JOBS
      ====================================================== */}

      {safeCompletedJobs !==
      null ? (
        <View
          style={[
            styles.badge,
            styles.jobsBadge,
          ]}
        >
          <AppIcon
            name="jobs"
            role="customer"
            size="xs"
            state="active"
          />

          <AppText
            variant="caption"
            weight="semibold"
            style={
              styles.jobsText
            }
          >
            {jobsLabel}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      gap:
        FixxamTokens.spacing.xs,

      marginTop:
        FixxamTokens.spacing.sm,
    },

    /* ========================================================
       BASE BADGE
    ======================================================== */

    badge: {
      minHeight: 30,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.chip,
    },

    /* ========================================================
       VERIFIED
    ======================================================== */

    verifiedBadge: {
      backgroundColor:
        Colors.successSoft,
    },

    verifiedText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.success,
    },

    /* ========================================================
       AVAILABLE
    ======================================================== */

    availableBadge: {
      backgroundColor:
        Colors.successSoft,
    },

    availableText: {
      color:
        Colors.success,
    },

    onlineDot: {
      backgroundColor:
        Colors.success,
    },

    /* ========================================================
       OFFLINE
    ======================================================== */

    offlineBadge: {
      backgroundColor:
        Colors.disabledBackground,
    },

    offlineText: {
      color:
        Colors.textSecondary,
    },

    offlineDot: {
      backgroundColor:
        Colors.textMuted,
    },

    /* ========================================================
       STATUS DOT
    ======================================================== */

    dot: {
      width: 8,

      height: 8,

      marginRight:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,
    },

    /* ========================================================
       ARRIVAL
    ======================================================== */

    arrivalBadge: {
      backgroundColor:
        Colors.infoSoft,
    },

    arrivalText: {
      maxWidth: 150,

      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        Colors.info,
    },

    /* ========================================================
       JOBS
    ======================================================== */

    jobsBadge: {
      backgroundColor:
        CustomerColors.primarySoft,
    },

    jobsText: {
      marginLeft:
        FixxamTokens.spacing.xs,

      color:
        CustomerColors.primary,
    },
  });

export default memo(
  WorkerBadges,
);