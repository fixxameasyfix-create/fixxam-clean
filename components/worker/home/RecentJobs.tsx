import React, { useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import { AppText } from "@/components/ui";

import {
  JobCardSkeleton,
} from "@/components/common/loading";

import useRecentJobs, {
  getTimestamp,
  type RecentJob,
} from "@/hooks/worker/useRecentJobs";

import WorkerMarketOrderCard from "@/components/workerorders/WorkerMarketOrderCard";
import WorkerOrderCard from "@/components/workerorders/WorkerOrderCard";

import type {
  WorkerMarketOrder,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type RecentItem =
  | {
      type: "booking";
      data: WorkerServiceOrder;
    }
  | {
      type: "market";
      data: WorkerMarketOrder;
    };

/* ==============================================================
   HELPERS
============================================================== */

function isValidJob(
  job: unknown,
): job is RecentJob {
  if (
    !job ||
    typeof job !== "object"
  ) {
    return false;
  }

  const item =
    job as {
      id?: unknown;
    };

  return (
    typeof item.id === "string" &&
    item.id.trim().length > 0
  );
}

/* ==============================================================
   GET JOB TYPE
============================================================== */

function getJobType(
  job: RecentJob,
): "booking" | "market" {
  if (job.type === "market") {
    return "market";
  }

  return "booking";
}

/* ==============================================================
   TYPE GUARDS
============================================================== */

function isWorkerServiceOrder(
  job: RecentJob,
): job is RecentJob & WorkerServiceOrder {
  return (
    getJobType(job) === "booking"
  );
}

function isWorkerMarketOrder(
  job: RecentJob,
): job is RecentJob & WorkerMarketOrder {
  return (
    getJobType(job) === "market"
  );
}

/* ==============================================================
   COMPONENT
============================================================== */

export default function RecentJobs() {
  const {
    loading,
    error,
    jobs,
  } = useRecentJobs();

  /* ============================================================
     PREPARE RECENT ITEMS
  ============================================================ */

  const recentItems =
    useMemo<RecentItem[]>(
      () => {
        if (
          !Array.isArray(jobs)
        ) {
          return [];
        }

        return jobs
          .filter(
            isValidJob,
          )
          .map<RecentItem | null>(
            (job) => {
              const type =
                getJobType(job);

              /* ==================================================
                 MARKET
              ================================================== */

              if (
                type === "market" &&
                isWorkerMarketOrder(job)
              ) {
                return {
                  type: "market",
                  data:
                    job as WorkerMarketOrder,
                };
              }

              /* ==================================================
                 SERVICE / BOOKING
              ================================================== */

              if (
                isWorkerServiceOrder(job)
              ) {
                return {
                  type: "booking",
                  data:
                    job as WorkerServiceOrder,
                };
              }

              return null;
            },
          )
          .filter(
            (
              item,
            ): item is RecentItem =>
              item !== null,
          )
          .sort(
            (a, b) => {
              const aTime =
                getTimestamp(
                  a.data.createdAt ??
                    a.data.updatedAt ??
                    a.data.date,
                );

              const bTime =
                getTimestamp(
                  b.data.createdAt ??
                    b.data.updatedAt ??
                    b.data.date,
                );

              return (
                bTime -
                aTime
              );
            },
          )
          .slice(0, 2);
      },
      [jobs],
    );

  /* ============================================================
     VIEW ALL
  ============================================================ */

  const handleViewAll =
    () => {
      router.push(
        "/(worker)/(tabs)/orders",
      );
    };

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
        <View
          style={
            styles.header
          }
        >
          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            Recent Jobs
          </AppText>

          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View all orders"
            accessibilityHint="Open the worker orders page"
            onPress={
              handleViewAll
            }
          >
            <AppText
              weight="bold"
              style={
                styles.seeAll
              }
            >
              See All
            </AppText>
          </Pressable>
        </View>

        <View
          style={
            styles.list
          }
        >
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      </View>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    error &&
    recentItems.length === 0
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.header
          }
        >
          <AppText
            weight="bold"
            style={
              styles.title
            }
          >
            Recent Jobs
          </AppText>

          <Pressable
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View all orders"
            accessibilityHint="Open the worker orders page"
            onPress={
              handleViewAll
            }
          >
            <AppText
              weight="bold"
              style={
                styles.seeAll
              }
            >
              See All
            </AppText>
          </Pressable>
        </View>

        <View
          style={
            styles.empty
          }
        >
          <AppText
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            Unable to Load Recent Jobs
          </AppText>

          <AppText
            style={
              styles.emptyText
            }
          >
            Please check your connection
            and try again.
          </AppText>
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
      {/* ========================================================
          HEADER
      ======================================================== */}

      <View
        style={
          styles.header
        }
      >
        <AppText
          weight="bold"
          style={
            styles.title
          }
        >
          Recent Jobs
        </AppText>

        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View all orders"
          accessibilityHint="Open the worker orders page"
          onPress={
            handleViewAll
          }
        >
          <AppText
            weight="bold"
            style={
              styles.seeAll
            }
          >
            See All
          </AppText>
        </Pressable>
      </View>

      {/* ========================================================
          EMPTY
      ======================================================== */}

      {recentItems.length === 0 ? (
        <View
          style={
            styles.empty
          }
        >
          <AppText
            weight="bold"
            style={
              styles.emptyTitle
            }
          >
            No Recent Jobs
          </AppText>

          <AppText
            style={
              styles.emptyText
            }
          >
            New bookings and marketplace
            orders will appear here.
          </AppText>
        </View>
      ) : (
        <View
          style={
            styles.list
          }
        >
          {recentItems.map(
            (item) => {
              /* ================================================
                 SERVICE BOOKING
              ================================================= */

              if (
                item.type ===
                "booking"
              ) {
                const order =
                  item.data;

                return (
                  <WorkerOrderCard
                    key={`booking-${order.id}`}
                    order={order}
                    onPress={(
                      selectedOrder,
                    ) => {
                      const orderId =
                        String(
                          selectedOrder.id ??
                            "",
                        ).trim();

                      if (
                        !orderId
                      ) {
                        return;
                      }

                      router.push({
                        pathname:
                          "/(worker)/orders/[orderId]",
                        params: {
                          orderId,
                        },
                      });
                    }}
                  />
                );
              }

              /* ================================================
                 MARKET ORDER
              ================================================= */

              const order =
                item.data;

              return (
                <WorkerMarketOrderCard
                  key={`market-${order.id}`}
                  order={order}
                  onPress={(
                    selectedOrder,
                  ) => {
                    const marketId =
                      String(
                        selectedOrder.id ??
                          "",
                      ).trim();

                    if (
                      !marketId
                    ) {
                      return;
                    }

                    router.push({
                      pathname:
                        "/(worker)/orders/market/[market]",
                      params: {
                        market:
                          marketId,
                      },
                    });
                  }}
                />
              );
            },
          )}
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      marginTop: 28,
      marginBottom: 20,
    },

    list: {
      gap: 12,
    },

    header: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 16,
    },

    title: {
      fontSize: 22,
      color: "#0F172A",
    },

    seeAll: {
      color: "#FF6B00",
      fontSize: 15,
    },

    empty: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 24,

      paddingVertical: 32,
      paddingHorizontal: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity:
        0.05,

      shadowRadius:
        10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    emptyTitle: {
      fontSize: 20,
      color: "#0F172A",
      marginBottom: 8,
      textAlign: "center",
    },

    emptyText: {
      color: "#64748B",
      textAlign: "center",
      lineHeight: 22,
      fontSize: 15,
    },
  });