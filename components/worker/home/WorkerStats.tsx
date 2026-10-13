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

import useWorkerDashboard from "@/hooks/worker/useWorkerDashboard";
import useWorkerOrderCounts from "@/hooks/worker/useWorkerOrderCounts";

import {
  StatCardSkeleton,
} from "@/components/common/loading";

import WorkerStatusCard from "./WorkerStatusCard";

/* ==============================================================
   TYPES
============================================================== */

type JobItemProps = {
  label: string;

  value: number;

  icon: AppIconName;

  iconColor: string;

  backgroundColor: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeCount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

/* ==============================================================
   JOB ITEM
============================================================== */

const JobItem =
  memo(
    function JobItem({
      label,
      value,
      icon,
      iconColor,
      backgroundColor,
    }: JobItemProps) {
      return (
        <View
          style={
            styles.jobItem
          }
        >
          <View
            style={[
              styles.jobIcon,

              {
                backgroundColor,
              },
            ]}
          >
            <AppIcon
              name={
                icon
              }
              size="sm"
              color={
                iconColor
              }
            />
          </View>

          <AppText
            variant="bodyMedium"
            weight="bold"
            style={
              styles.jobValue
            }
          >
            {value}
          </AppText>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={1}
            center
            style={
              styles.jobLabel
            }
          >
            {label}
          </AppText>
        </View>
      );
    },
  );

JobItem.displayName =
  "WorkerStatsJobItem";

/* ==============================================================
   WORKER STATS
============================================================== */

function WorkerStats() {
  /* ============================================================
     DASHBOARD

     Rating, reviews and online status continue to use the
     existing worker dashboard source.
  ============================================================ */

  const dashboard =
    useWorkerDashboard();

  /* ============================================================
     ORDER COUNTS

     This is the same source used by Orders / Profile so that
     all three screens always display the same job counts.
  ============================================================ */

  const orderStats =
    useWorkerOrderCounts();

  const {
    rating,
    reviewCount,
    online,
    toggleOnline,
  } = dashboard;

  /* ============================================================
     LOADING
  ============================================================ */

  const loading =
    dashboard.loading ||
    orderStats.loading;

  /* ============================================================
     COUNTS
  ============================================================ */

  const pending =
    getSafeCount(
      orderStats.counts.pending,
    );

  const active =
    getSafeCount(
      orderStats.counts.active,
    );

  const completed =
    getSafeCount(
      orderStats.counts.completed,
    );

  const cancelled =
    getSafeCount(
      orderStats.counts.cancelled,
    );

  const totalJobs =
    getSafeCount(
      orderStats.counts.all,
    );

  /* ============================================================
     LOADING UI
  ============================================================ */

  if (loading) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.balanceSkeleton
          }
        >
          <StatCardSkeleton />
        </View>

        <View
          pointerEvents="none"
          style={
            styles.loadingStatus
          }
        >
          <WorkerStatusCard
            rating={0}
            reviewCount={0}
            online={false}
            onToggleOnline={
              toggleOnline
            }
          />
        </View>
      </View>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ======================================================
          JOB OVERVIEW
      ====================================================== */}

      <View
        style={
          styles.balanceCard
        }
      >
        {/* ====================================================
            TOP SUMMARY
        ==================================================== */}

        <View
          style={
            styles.balanceTop
          }
        >
          <View
            style={
              styles.totalSection
            }
          >
            <View
              style={
                styles.balanceLabelRow
              }
            >
              <AppIcon
                name="jobs"
                size="sm"
                color={
                  Colors.textSecondary
                }
              />

              <AppText
                variant="caption"
                weight="bold"
                style={
                  styles.balanceLabel
                }
              >
                Total Jobs
              </AppText>
            </View>

            <View
              style={
                styles.totalRow
              }
            >
              <AppText
                variant="heading1"
                weight="bold"
                style={
                  styles.totalValue
                }
              >
                {totalJobs}
              </AppText>

              <View
                style={
                  styles.jobsBadge
                }
              >
                <AppIcon
                  name="grid"
                  role="worker"
                  size="xs"
                  color={
                    WorkerColors.primary
                  }
                />

                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.badgeText
                  }
                >
                  Overview
                </AppText>
              </View>
            </View>
          </View>

          {/* ==================================================
              COMPLETED SUMMARY
          ================================================== */}

          <View
            style={
              styles.completedBox
            }
          >
            <View
              style={
                styles.completedIcon
              }
            >
              <AppIcon
                name="success"
                size="sm"
                color={
                  Colors.success
                }
              />
            </View>

            <AppText
              variant="heading3"
              weight="bold"
              style={
                styles.completedValue
              }
            >
              {completed}
            </AppText>

            <AppText
              variant="caption"
              tone="secondary"
              style={
                styles.completedLabel
              }
            >
              Completed
            </AppText>
          </View>
        </View>

        {/* ====================================================
            DIVIDER
        ==================================================== */}

        <View
          style={
            styles.divider
          }
        />

        {/* ====================================================
            JOB BREAKDOWN
        ==================================================== */}

        <View
          style={
            styles.breakdown
          }
        >
          <JobItem
            label="Pending"
            value={
              pending
            }
            icon="clock"
            iconColor={
              Colors.warning
            }
            backgroundColor={
              Colors.warningSoft
            }
          />

          <View
            style={
              styles.verticalLine
            }
          />

          <JobItem
            label="Active"
            value={
              active
            }
            icon="jobs"
            iconColor={
              Colors.info
            }
            backgroundColor={
              Colors.infoSoft
            }
          />

          <View
            style={
              styles.verticalLine
            }
          />

          <JobItem
            label="Cancelled"
            value={
              cancelled
            }
            icon="error"
            iconColor={
              Colors.error
            }
            backgroundColor={
              Colors.errorSoft
            }
          />

          <View
            style={
              styles.verticalLine
            }
          />

          <JobItem
            label="Completed"
            value={
              completed
            }
            icon="success"
            iconColor={
              Colors.success
            }
            backgroundColor={
              Colors.successSoft
            }
          />
        </View>
      </View>

      {/* ======================================================
          ONLINE / OFFLINE
      ====================================================== */}

      <View
        style={
          styles.statusCard
        }
      >
        <WorkerStatusCard
          rating={
            rating
          }
          reviewCount={
            reviewCount
          }
          online={
            online
          }
          onToggleOnline={
            toggleOnline
          }
        />
      </View>
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

WorkerStats.displayName =
  "WorkerStats";

export default memo(
  WorkerStats,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",
    },

    /* ========================================================
       LOADING
    ======================================================== */

    balanceSkeleton: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    loadingStatus: {
      opacity:
        FixxamTokens.motion
          .disabledOpacity,
    },

    /* ========================================================
       BALANCE CARD
    ======================================================== */

    balanceCard: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.md,

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
       TOP
    ======================================================== */

    balanceTop: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    totalSection: {
      flex: 1,

      minWidth: 0,
    },

    balanceLabelRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,
    },

    balanceLabel: {
      color:
        Colors.textSecondary,
    },

    totalRow: {
      marginTop:
        FixxamTokens.spacing.xs,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    totalValue: {
      color:
        Colors.textPrimary,
    },

    jobsBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      paddingVertical:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    badgeText: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       COMPLETED
    ======================================================== */

    completedBox: {
      minWidth: 76,

      marginLeft:
        FixxamTokens.spacing.sm,

      alignItems:
        "flex-end",

      justifyContent:
        "center",
    },

    completedIcon: {
      width: 32,

      height: 32,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.successSoft,
    },

    completedValue: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.success,
    },

    completedLabel: {
      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height:
        StyleSheet.hairlineWidth,

      marginTop:
        FixxamTokens.spacing.md,

      marginBottom:
        FixxamTokens.spacing.md,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       BREAKDOWN
    ======================================================== */

    breakdown: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    jobItem: {
      flex: 1,

      minWidth: 0,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    jobIcon: {
      width: 34,

      height: 34,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.md,
    },

    jobValue: {
      marginTop:
        FixxamTokens.spacing.xs,

      color:
        Colors.textPrimary,
    },

    jobLabel: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xxs,

      color:
        Colors.textSecondary,
    },

    verticalLine: {
      width:
        StyleSheet.hairlineWidth,

      height: 42,

      backgroundColor:
        Colors.divider,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusCard: {
      marginTop:
        FixxamTokens.spacing.md,
    },
  });