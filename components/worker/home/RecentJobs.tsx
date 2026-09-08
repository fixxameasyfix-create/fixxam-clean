import React, {
  memo,
  useCallback,
  useMemo,
} from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

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

function getJobType(
  job: RecentJob,
): "booking" | "market" {
  /*
   * Preserve existing behaviour:
   * anything that is not explicitly market
   * is treated as a service booking.
   */
  return job.type === "market"
    ? "market"
    : "booking";
}

function isWorkerServiceOrder(
  job: RecentJob,
): job is RecentJob &
  WorkerServiceOrder {
  return (
    getJobType(job) ===
    "booking"
  );
}

function isWorkerMarketOrder(
  job: RecentJob,
): job is RecentJob &
  WorkerMarketOrder {
  return (
    getJobType(job) ===
    "market"
  );
}

/* ==============================================================
   SECTION HEADER
============================================================== */

const RecentJobsHeader =
  memo(
    function RecentJobsHeader({
      onViewAll,
    }: {
      onViewAll: () => void;
    }) {
      return (
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerTitleRow
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

            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.title
              }
            >
              Recent Jobs
            </AppText>
          </View>

          <Pressable
            onPress={
              onViewAll
            }
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="View all orders"
            accessibilityHint="Open the worker orders page"
            style={({
              pressed,
            }) => [
              styles.seeAllButton,

              pressed
                ? styles.pressed
                : null,
            ]}
          >
            <AppText
              variant="bodyMedium"
              weight="bold"
              style={
                styles.seeAll
              }
            >
              See All
            </AppText>

            <AppIcon
              name="next"
              role="worker"
              size="xs"
              color={
                WorkerColors.primary
              }
            />
          </Pressable>
        </View>
      );
    },
  );

RecentJobsHeader.displayName =
  "RecentJobsHeader";

/* ==============================================================
   COMPONENT
============================================================== */

function RecentJobs() {
  const {
    loading,
    error,
    jobs,
  } =
    useRecentJobs();

  /* ============================================================
     PREPARE RECENT ITEMS
  ============================================================ */

  const recentItems =
    useMemo<RecentItem[]>(
      () => {
        if (
          !Array.isArray(
            jobs,
          )
        ) {
          return [];
        }

        return jobs
          .filter(
            isValidJob,
          )
          .map<RecentItem | null>(
            job => {
              const type =
                getJobType(
                  job,
                );

              /* ================================================
                 MARKET
              ================================================= */

              if (
                type ===
                  "market" &&
                isWorkerMarketOrder(
                  job,
                )
              ) {
                return {
                  type:
                    "market",

                  data:
                    job as WorkerMarketOrder,
                };
              }

              /* ================================================
                 SERVICE
              ================================================= */

              if (
                isWorkerServiceOrder(
                  job,
                )
              ) {
                return {
                  type:
                    "booking",

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
              item !==
              null,
          )
          .sort(
            (
              a,
              b,
            ) => {
              const aTime =
                getTimestamp(
                  a.data
                    .createdAt ??
                    a.data
                      .updatedAt ??
                    a.data.date,
                );

              const bTime =
                getTimestamp(
                  b.data
                    .createdAt ??
                    b.data
                      .updatedAt ??
                    b.data.date,
                );

              return (
                bTime -
                aTime
              );
            },
          )
          .slice(
            0,
            2,
          );
      },
      [
        jobs,
      ],
    );

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleViewAll =
    useCallback(() => {
      router.push(
        "/(worker)/(tabs)/orders",
      );
    }, []);

  const handleServicePress =
    useCallback(
      (
        selectedOrder: WorkerServiceOrder,
      ) => {
        const orderId =
          String(
            selectedOrder.id ??
              "",
          ).trim();

        if (!orderId) {
          return;
        }

        router.push({
          pathname:
            "/(worker)/orders/[orderId]",

          params: {
            orderId,
          },
        });
      },
      [],
    );

  const handleMarketPress =
    useCallback(
      (
        selectedOrder: WorkerMarketOrder,
      ) => {
        const marketId =
          String(
            selectedOrder.id ??
              "",
          ).trim();

        if (!marketId) {
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
      },
      [],
    );

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
        <RecentJobsHeader
          onViewAll={
            handleViewAll
          }
        />

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
    recentItems.length ===
      0
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <RecentJobsHeader
          onViewAll={
            handleViewAll
          }
        />

        <View
          style={
            styles.stateCard
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <AppIcon
              name="error"
              size="lg"
              color={
                Colors.error
              }
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            Unable to Load Recent Jobs
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            Please check your connection and try again.
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
      <RecentJobsHeader
        onViewAll={
          handleViewAll
        }
      />

      {/* ========================================================
          EMPTY
      ======================================================== */}

      {recentItems.length ===
      0 ? (
        <View
          style={
            styles.stateCard
          }
        >
          <View
            style={
              styles.emptyIcon
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

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={
              styles.emptyTitle
            }
          >
            No Recent Jobs
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            New bookings and marketplace orders will appear here.
          </AppText>
        </View>
      ) : (
        /* ======================================================
           JOBS
        ====================================================== */

        <View
          style={
            styles.list
          }
        >
          {recentItems.map(
            item => {
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
                    order={
                      order
                    }
                    onPress={
                      handleServicePress
                    }
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
                  order={
                    order
                  }
                  onPress={
                    handleMarketPress
                  }
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
   MEMO
============================================================== */

RecentJobs.displayName =
  "RecentJobs";

export default memo(
  RecentJobs,
);

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    container: {
      width: "100%",

      marginTop:
        FixxamTokens.spacing.xl,

      marginBottom:
        FixxamTokens.spacing.lg,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      marginBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap:
        FixxamTokens.spacing.sm,
    },

    headerTitleRow: {
      flex: 1,

      minWidth: 0,

      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    headerIcon: {
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

    title: {
      flexShrink: 1,

      color:
        Colors.textPrimary,
    },

    /* ========================================================
       SEE ALL
    ======================================================== */

    seeAllButton: {
      minHeight:
        FixxamTokens.size.minimumTouchTarget,

      flexShrink: 0,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.md,
    },

    seeAll: {
      color:
        WorkerColors.primary,
    },

    /* ========================================================
       LIST
    ======================================================== */

    list: {
      gap:
        FixxamTokens.spacing.md,
    },

    /* ========================================================
       EMPTY / ERROR
    ======================================================== */

    stateCard: {
      width: "100%",

      minHeight: 220,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        Colors.surface,

      ...FixxamTokens.shadow.card,
    },

    emptyIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    errorIcon: {
      width:
        FixxamTokens.size.avatarLg,

      height:
        FixxamTokens.size.avatarLg,

      marginBottom:
        FixxamTokens.spacing.md,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        Colors.errorSoft,
    },

    emptyTitle: {
      color:
        Colors.textPrimary,
    },

    emptyText: {
      maxWidth: 310,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 22,

      color:
        Colors.textSecondary,
    },

    /* ========================================================
       INTERACTION
    ======================================================== */

    pressed: {
      opacity:
        FixxamTokens.motion
          .pressedOpacity,

      transform: [
        {
          scale:
            FixxamTokens.motion
              .scalePressed,
        },
      ],
    },
  });