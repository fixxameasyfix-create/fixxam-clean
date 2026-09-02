import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import useWorkerDashboard from "@/hooks/worker/useWorkerDashboard";

import {
  StatCardSkeleton,
} from "@/components/common/loading";

import {
  AppText,
} from "@/components/ui";

import WorkerStatusCard from "./WorkerStatusCard";

/* ==============================================================
   TYPES
============================================================== */

type JobItemProps = {
  label: string;
  value: number;
  icon: React.ComponentProps<
    typeof Ionicons
  >["name"];
  iconColor: string;
  backgroundColor: string;
};

/* ==============================================================
   WORKER STATS
============================================================== */

export default function WorkerStats() {
  const dashboard =
    useWorkerDashboard();

  const {
    loading,
    pending,
    active,
    completed,
    rating,
    reviewCount,
    online,
    toggleOnline,
  } = dashboard;

  /*
   * Some versions of useWorkerDashboard
   * may not expose cancelled yet.
   */
  const cancelled =
    "cancelled" in dashboard &&
    typeof dashboard.cancelled ===
      "number"
      ? dashboard.cancelled
      : 0;

  /* ============================================================
     TOTAL JOBS
  ============================================================ */

  const totalJobs =
    pending +
    active +
    cancelled +
    completed;

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View
        style={
          styles.container
        }
      >
        {/* ====================================================
            JOB BALANCE SKELETON
        ==================================================== */}

        <View
          style={
            styles.balanceSkeleton
          }
        >
          <StatCardSkeleton />
        </View>

        {/* ====================================================
            ONLINE / OFFLINE
        ==================================================== */}

        <WorkerStatusCard
          rating={0}
          reviewCount={0}
          online={false}
          onToggleOnline={
            toggleOnline
          }
        />
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
          JOB BALANCE CARD
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
          {/* TOTAL JOBS */}

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
              <Ionicons
                name="briefcase-outline"
                size={17}
                color="#64748B"
              />

              <AppText
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
                <Ionicons
                  name="stats-chart-outline"
                  size={13}
                  color="#FF6B00"
                />

                <AppText
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
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#16A34A"
              />
            </View>

            <AppText
              weight="bold"
              style={
                styles.completedValue
              }
            >
              {completed}
            </AppText>

            <AppText
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
          {/* PENDING */}

          <JobItem
            label="Pending"
            value={pending}
            icon="time-outline"
            iconColor="#F97316"
            backgroundColor="#FFF3E8"
          />

          <View
            style={
              styles.verticalLine
            }
          />

          {/* ACTIVE */}

          <JobItem
            label="Active"
            value={active}
            icon="briefcase-outline"
            iconColor="#16A34A"
            backgroundColor="#ECFDF5"
          />

          <View
            style={
              styles.verticalLine
            }
          />

          {/* CANCELLED */}

          <JobItem
            label="Cancelled"
            value={cancelled}
            icon="close-circle-outline"
            iconColor="#DC2626"
            backgroundColor="#FEF2F2"
          />

          <View
            style={
              styles.verticalLine
            }
          />

          {/* COMPLETED */}

          <JobItem
            label="Completed"
            value={completed}
            icon="checkmark-circle-outline"
            iconColor="#16A34A"
            backgroundColor="#ECFDF5"
          />
        </View>
      </View>

      {/* ======================================================
          ONLINE / OFFLINE CARD
      ====================================================== */}

      <View
        style={
          styles.statusCard
        }
      >
        <WorkerStatusCard
          rating={rating}
          reviewCount={reviewCount}
          online={online}
          onToggleOnline={
            toggleOnline
          }
        />
      </View>
    </View>
  );
}

/* ==============================================================
   JOB ITEM
============================================================== */

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
        <Ionicons
          name={icon}
          size={15}
          color={iconColor}
        />
      </View>

      <AppText
        weight="bold"
        style={
          styles.jobValue
        }
      >
        {value}
      </AppText>

      <AppText
        style={
          styles.jobLabel
        }
        numberOfLines={1}
      >
        {label}
      </AppText>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 10,
      marginBottom: 12,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    balanceSkeleton: {
      marginBottom: 12,
    },

    /* ========================================================
       BALANCE CARD
    ======================================================== */

    balanceCard: {
      width: "100%",

      backgroundColor:
        "#FFFFFF",

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#E2E8F0",

      paddingHorizontal: 16,

      paddingTop: 15,

      paddingBottom: 14,

      shadowColor:
        "#000000",

      shadowOpacity: 0.06,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
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

      gap: 7,
    },

    balanceLabel: {
      fontSize: 13,

      color: "#64748B",
    },

    totalRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginTop: 3,

      gap: 9,
    },

    totalValue: {
      fontSize: 34,

      lineHeight: 40,

      color: "#0F172A",
    },

    jobsBadge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 4,

      backgroundColor:
        "#FFF7ED",

      borderRadius: 999,

      paddingHorizontal: 8,

      paddingVertical: 5,
    },

    badgeText: {
      fontSize: 9,

      color: "#FF6B00",
    },

    /* ========================================================
       COMPLETED
    ======================================================== */

    completedBox: {
      alignItems:
        "flex-end",

      justifyContent:
        "center",

      minWidth: 72,

      marginLeft: 10,
    },

    completedIcon: {
      width: 30,

      height: 30,

      borderRadius: 10,

      backgroundColor:
        "#ECFDF5",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    completedValue: {
      marginTop: 3,

      fontSize: 18,

      lineHeight: 22,

      color: "#16A34A",
    },

    completedLabel: {
      marginTop: 1,

      fontSize: 9,

      color: "#64748B",
    },

    /* ========================================================
       DIVIDER
    ======================================================== */

    divider: {
      height: 1,

      backgroundColor:
        "#F1F5F9",

      marginTop: 14,

      marginBottom: 12,
    },

    /* ========================================================
       BREAKDOWN
    ======================================================== */

    breakdown: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      width: "100%",
    },

    jobItem: {
      flex: 1,

      alignItems:
        "center",

      justifyContent:
        "center",

      minWidth: 0,
    },

    jobIcon: {
      width: 32,

      height: 32,

      borderRadius: 10,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    jobValue: {
      marginTop: 5,

      fontSize: 15,

      lineHeight: 18,

      color: "#0F172A",
    },

    jobLabel: {
      marginTop: 1,

      fontSize: 8.5,

      lineHeight: 12,

      color: "#64748B",

      textAlign:
        "center",
    },

    verticalLine: {
      width: 1,

      height: 42,

      backgroundColor:
        "#E2E8F0",
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusCard: {
      marginTop: 12,
    },
  });