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
  jobsCompleted: number;

  reviewsReceived: number;

  averageRating: number;
};

type PerformanceItem = {
  key: string;

  label: string;

  value: string;

  icon:
    | "jobs"
    | "reviews"
    | "star";
};

/* ============================================================
   HELPERS
============================================================ */

function safeCount(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

function safeRating(
  value: number,
): number {
  if (
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

function formatRating(
  value: number,
): string {
  const rating =
    safeRating(value);

  if (rating <= 0) {
    return "—";
  }

  return rating.toFixed(1);
}

/* ============================================================
   COMPONENT
============================================================ */

function RecentPerformanceCard({
  jobsCompleted,
  reviewsReceived,
  averageRating,
}: Props) {
  const items =
    useMemo<PerformanceItem[]>(
      () => [
        {
          key: "jobs",

          label:
            "Jobs Completed",

          value:
            safeCount(
              jobsCompleted,
            ).toLocaleString(),

          icon: "jobs",
        },

        {
          key: "reviews",

          label:
            "Reviews Received",

          value:
            safeCount(
              reviewsReceived,
            ).toLocaleString(),

          icon: "reviews",
        },

        {
          key: "rating",

          label:
            "Average Rating",

          value:
            formatRating(
              averageRating,
            ),

          icon: "star",
        },
      ],
      [
        averageRating,
        jobsCompleted,
        reviewsReceived,
      ],
    );

  return (
    <View>
      {/* =====================================================
          SECTION TITLE
      ===================================================== */}

      <AppText
        variant="bodyMedium"
        weight="semibold"
        style={
          styles.sectionTitle
        }
      >
        Recent Performance
      </AppText>

      {/* =====================================================
          CARD
      ===================================================== */}

      <View
        style={
          styles.card
        }
      >
        {/* ===================================================
            PERIOD
        =================================================== */}

        <View
          style={
            styles.periodHeader
          }
        >
          <View
            style={
              styles.periodIcon
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
              styles.periodContent
            }
          >
            <AppText
              variant="bodyMedium"
              weight="semibold"
              style={
                styles.periodTitle
              }
            >
              Last 30 days
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
            >
              Your recent work activity
            </AppText>
          </View>
        </View>

        {/* ===================================================
            PERFORMANCE ITEMS
        =================================================== */}

        <View
          style={
            styles.items
          }
        >
          {items.map(
            (
              item,
              index,
            ) => {
              const isLast =
                index ===
                items.length -
                  1;

              return (
                <View
                  key={
                    item.key
                  }
                  style={[
                    styles.row,

                    !isLast
                      ? styles.rowBorder
                      : null,
                  ]}
                >
                  <View
                    style={
                      styles.rowLeft
                    }
                  >
                    <View
                      style={
                        styles.rowIcon
                      }
                    >
                      <AppIcon
                        name={
                          item.icon
                        }
                        role="worker"
                        size="xs"
                        color={
                          WorkerColors.primary
                        }
                      />
                    </View>

                    <AppText
                      variant="body"
                      numberOfLines={1}
                      style={
                        styles.rowLabel
                      }
                    >
                      {item.label}
                    </AppText>
                  </View>

                  <View
                    style={
                      styles.valueContainer
                    }
                  >
                    <AppText
                      variant="bodyMedium"
                      weight="semibold"
                      style={
                        styles.rowValue
                      }
                    >
                      {item.value}
                    </AppText>

                    {item.key ===
                      "rating" &&
                    item.value !==
                      "—" ? (
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
                </View>
              );
            },
          )}
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default memo(
  RecentPerformanceCard,
);

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    sectionTitle: {
      marginLeft:
        FixxamTokens.spacing.xxs,

      marginBottom:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       CARD
    ======================================================== */

    card: {
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
       PERIOD HEADER
    ======================================================== */

    periodHeader: {
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

    periodIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    periodContent: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,
    },

    periodTitle: {
      color:
        Colors.textPrimary,
    },

    /* ========================================================
       ITEMS
    ======================================================== */

    items: {
      width:
        "100%",
    },

    row: {
      minHeight:
        56,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    rowBorder: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,

      borderBottomColor:
        Colors.divider,
    },

    rowLeft: {
      flex:
        1,

      minWidth:
        0,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    rowIcon: {
      width:
        32,

      height:
        32,

      flexShrink:
        0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    rowLabel: {
      flex:
        1,

      minWidth:
        0,

      marginLeft:
        FixxamTokens.spacing.sm,

      color:
        Colors.textPrimary,
    },

    valueContainer: {
      marginLeft:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xxs,
    },

    rowValue: {
      color:
        Colors.textPrimary,
    },
  });