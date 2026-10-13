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

/* ============================================================
   TYPES
============================================================ */

type Props = {
  rating: number;

  jobsDone: number;

  reviews: number;

  jobSuccess: number;
};

type MetricItem = {
  key: string;

  value: string;

  label: string;

  icon:
    | "star"
    | "jobs"
    | "reviews"
    | "check";
};

/* ============================================================
   HELPERS
============================================================ */

function safeNumber(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    value,
  );
}

function formatRating(
  value: number,
): string {
  const rating =
    Math.min(
      5,
      safeNumber(value),
    );

  if (rating <= 0) {
    return "New";
  }

  return rating.toFixed(1);
}

function formatCount(
  value: number,
): string {
  return Math.floor(
    safeNumber(value),
  ).toLocaleString();
}

function formatPercentage(
  value: number,
): string {
  const percentage =
    Math.min(
      100,
      safeNumber(value),
    );

  return `${Math.round(
    percentage,
  )}%`;
}

/* ============================================================
   COMPONENT
============================================================ */

function JobPerformanceOverview({
  rating,
  jobsDone,
  reviews,
  jobSuccess,
}: Props) {
  const metrics =
    useMemo<MetricItem[]>(
      () => [
        {
          key: "rating",

          value:
            formatRating(
              rating,
            ),

          label: "Rating",

          icon: "star",
        },

        {
          key: "jobs",

          value:
            formatCount(
              jobsDone,
            ),

          label:
            "Jobs Done",

          icon: "jobs",
        },

        {
          key: "reviews",

          value:
            formatCount(
              reviews,
            ),

          label: "Reviews",

          icon: "reviews",
        },

        {
          key: "success",

          value:
            formatPercentage(
              jobSuccess,
            ),

          label:
            "Job Success",

          icon: "check",
        },
      ],
      [
        jobSuccess,
        jobsDone,
        rating,
        reviews,
      ],
    );

  return (
    <View
      style={
        styles.container
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={
          styles.header
        }
      >
        <View
          style={
            styles.headerIcon
          }
        >
          <AppIcon
            name="jobs"
            role="worker"
            size="sm"
            color={
              WorkerColors.primary
            }
          />
        </View>

        <View
          style={
            styles.headerContent
          }
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={
              styles.headerTitle
            }
          >
            Job Performance
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
          >
            Your overall work activity
          </AppText>
        </View>
      </View>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <View
        style={
          styles.metrics
        }
      >
        {metrics.map(
          (
            item,
            index,
          ) => {
            const isLeft =
              index % 2 === 0;

            const isTop =
              index < 2;

            return (
              <View
                key={
                  item.key
                }
                style={[
                  styles.metric,

                  isLeft
                    ? styles.metricRightBorder
                    : null,

                  isTop
                    ? styles.metricBottomBorder
                    : null,
                ]}
              >
                <View
                  style={
                    styles.metricValueRow
                  }
                >
                  <AppText
                    variant="heading3"
                    weight="semibold"
                    style={
                      styles.metricValue
                    }
                  >
                    {item.value}
                  </AppText>

                  {item.key ===
                  "rating" ? (
                    <AppIcon
                      name="star"
                      role="worker"
                      size="xs"
                      color={
                        WorkerColors.primary
                      }
                    />
                  ) : null}
                </View>

                <AppText
                  variant="caption"
                  tone="secondary"
                  style={
                    styles.metricLabel
                  }
                >
                  {item.label}
                </AppText>
              </View>
            );
          },
        )}
      </View>
    </View>
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  JobPerformanceOverview,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      overflow:
        "hidden",

      borderWidth:
        1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        Colors.surface,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        68,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    headerIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    headerContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    headerTitle: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       METRICS
    ======================================================== */

    metrics: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",
    },

    metric: {
      width:
        "50%",

      minHeight:
        92,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      paddingVertical:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    metricRightBorder: {
      borderRightWidth:
        StyleSheet.hairlineWidth,

      borderRightColor:
        Colors.divider,
    },

    metricBottomBorder: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    metricValueRow: {
      minHeight:
        28,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    metricValue: {
      color:
        WorkerColors.primary,
    },

    metricLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      textAlign:
        "center",
    },
  });