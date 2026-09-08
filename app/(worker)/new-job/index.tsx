import React, {
  memo,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppScreen,
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

import WorkerMarketOrderCard from "@/components/workerorders/WorkerMarketOrderCard";
import WorkerOrderCard from "@/components/workerorders/WorkerOrderCard";

import useWorkerOrders from "@/hooks/orders/useWorkerOrders";

import type {
  WorkerMarketOrder,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type NewJobItem =
  | {
      type: "service";
      data: WorkerServiceOrder;
    }
  | {
      type: "market";
      data: WorkerMarketOrder;
    };

type NewJobLabelProps = {
  icon: AppIconName;

  label: string;
};

/* ==============================================================
   HELPERS
============================================================== */

function getTime(
  value: unknown,
): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis === "function"
  ) {
    try {
      const result =
        (
          value as {
            toMillis: () => number;
          }
        ).toMillis();

      return Number.isFinite(
        result,
      )
        ? result
        : 0;
    } catch {
      return 0;
    }
  }

  if (
    value instanceof Date
  ) {
    const time =
      value.getTime();

    return Number.isFinite(
      time,
    )
      ? time
      : 0;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const parsed =
      Date.parse(
        value,
      );

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  return 0;
}

function getSafeCount(
  value: unknown,
): number {
  const count =
    Number(
      value,
    );

  if (
    !Number.isFinite(count) ||
    count <= 0
  ) {
    return 0;
  }

  return Math.floor(
    count,
  );
}

function getOrderId(
  value: unknown,
): string {
  return String(
    value ?? "",
  ).trim();
}

/* ==============================================================
   SCREEN
============================================================== */

export default function NewJobsScreen() {
  /* ============================================================
     ORDERS
  ============================================================ */

  const {
    serviceOrders,
    marketOrders,
    counts,
    loading,
    error,
  } =
    useWorkerOrders();

  /*
   * Keep counts.pending as the
   * single source of truth.
   */
  const pendingCount =
    getSafeCount(
      counts.pending,
    );

  /* ============================================================
     NEW JOBS LIST
  ============================================================ */

  const newJobs =
    useMemo<NewJobItem[]>(
      () => {
        const serviceJobs:
          NewJobItem[] =
          Array.isArray(
            serviceOrders,
          )
            ? serviceOrders
                .filter(
                  (
                    order:
                      WorkerServiceOrder,
                  ) =>
                    order.status ===
                      "pending" &&
                    order.deletedByWorker !==
                      true,
                )
                .map(
                  (
                    order:
                      WorkerServiceOrder,
                  ) => ({
                    type:
                      "service",

                    data:
                      order,
                  }),
                )
            : [];

        const marketJobs:
          NewJobItem[] =
          Array.isArray(
            marketOrders,
          )
            ? marketOrders
                .filter(
                  (
                    order:
                      WorkerMarketOrder,
                  ) =>
                    order.status ===
                      "pending" &&
                    order.deletedByWorker !==
                      true,
                )
                .map(
                  (
                    order:
                      WorkerMarketOrder,
                  ) => ({
                    type:
                      "market",

                    data:
                      order,
                  }),
                )
            : [];

        return [
          ...serviceJobs,
          ...marketJobs,
        ].sort(
          (
            a,
            b,
          ) => {
            const aTime =
              getTime(
                a.data
                  .createdAt ??
                  a.data
                    .updatedAt ??
                  a.data.date,
              );

            const bTime =
              getTime(
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
        );
      },
      [
        marketOrders,
        serviceOrders,
      ],
    );

  /* ============================================================
     OPEN SERVICE ORDER
  ============================================================ */

  const handleOpenServiceOrder =
    (
      order:
        WorkerServiceOrder,
    ) => {
      const orderId =
        getOrderId(
          order.id,
        );

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
    };

  /* ============================================================
     OPEN MARKET ORDER
  ============================================================ */

  const handleOpenMarketOrder =
    (
      order:
        WorkerMarketOrder,
    ) => {
      const marketId =
        getOrderId(
          order.id,
        );

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
    };

  /* ============================================================
     HEADER
  ============================================================ */

  const renderHeader =
    () => (
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
            name="notifications"
            role="worker"
            size="md"
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
          <View
            style={
              styles.titleRow
            }
          >
            <AppText
              variant="heading2"
              weight="bold"
              style={
                styles.title
              }
            >
              New Jobs
            </AppText>

            {pendingCount >
            0 ? (
              <View
                style={
                  styles.countBadge
                }
                accessibilityLabel={`${pendingCount} pending jobs`}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={
                    styles.countText
                  }
                >
                  {pendingCount >
                  99
                    ? "99+"
                    : pendingCount}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            style={
              styles.subtitle
            }
          >
            New customer requests and market orders waiting for your response.
          </AppText>
        </View>
      </View>
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        {renderHeader()}

        <View
          style={
            styles.loadingContainer
          }
        >
          <View
            style={
              styles.stateIcon
            }
          >
            <ActivityIndicator
              size="small"
              color={
                WorkerColors.primary
              }
            />
          </View>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.loadingText
            }
          >
            Checking for new jobs...
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (
    error &&
    newJobs.length === 0
  ) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.screen
        }
      >
        {renderHeader()}

        <View
          style={
            styles.emptyCard
          }
        >
          <View
            style={[
              styles.stateIcon,
              styles.errorIcon,
            ]}
          >
            <AppIcon
              name="wifi-off"
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
            Unable to Load Jobs
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={
              styles.emptyText
            }
          >
            We couldn&apos;t load your new jobs. Please check your connection and try again.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      <FlatList<NewJobItem>
        data={
          newJobs
        }
        keyExtractor={(
          item,
          index,
        ) => {
          const id =
            getOrderId(
              item.data.id,
            );

          return id
            ? `${item.type}-${id}`
            : `${item.type}-${index}`;
        }}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyCard
            }
          >
            <View
              style={
                styles.stateIcon
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
              No New Jobs
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={
                styles.emptyText
              }
            >
              New service requests and market orders assigned to you will appear here automatically.
            </AppText>
          </View>
        }
        renderItem={({
          item,
        }) => {
          /* ====================================================
             SERVICE
          ==================================================== */

          if (
            item.type ===
            "service"
          ) {
            return (
              <View
                style={
                  styles.orderWrapper
                }
              >
                <NewJobLabel
                  icon="jobs"
                  label="NEW SERVICE REQUEST"
                />

                <WorkerOrderCard
                  order={
                    item.data
                  }
                  onPress={
                    handleOpenServiceOrder
                  }
                />
              </View>
            );
          }

          /* ====================================================
             MARKET
          ==================================================== */

          return (
            <View
              style={
                styles.orderWrapper
              }
            >
              <NewJobLabel
                icon="cart"
                label="NEW MARKET ORDER"
              />

              <WorkerMarketOrderCard
                order={
                  item.data
                }
                onPress={
                  handleOpenMarketOrder
                }
              />
            </View>
          );
        }}
      />
    </AppScreen>
  );
}

/* ==============================================================
   NEW JOB LABEL
============================================================== */

const NewJobLabel =
  memo(
    function NewJobLabel({
      icon,
      label,
    }: NewJobLabelProps) {
      return (
        <View
          style={
            styles.newJobLabel
          }
        >
          <View
            style={
              styles.newJobDot
            }
          />

          <AppIcon
            name={
              icon
            }
            role="worker"
            size="xs"
            color={
              WorkerColors.primary
            }
          />

          <AppText
            variant="caption"
            weight="bold"
            numberOfLines={1}
            style={
              styles.newJobLabelText
            }
          >
            {label}
          </AppText>
        </View>
      );
    },
  );

NewJobLabel.displayName =
  "NewJobLabel";

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      backgroundColor:
        Colors.background,
    },

    list: {
      flexGrow: 1,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    /* ==========================================================
       HEADER
    ========================================================== */

    header: {
      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.lg,

      flexDirection:
        "row",

      alignItems:
        "center",
    },

    headerIcon: {
      width:
        FixxamTokens.size.iconBox,

      height:
        FixxamTokens.size.iconBox,

      marginRight:
        FixxamTokens.spacing.md,

      flexShrink: 0,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    headerContent: {
      flex: 1,

      minWidth: 0,
    },

    titleRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    title: {
      color:
        Colors.textPrimary,
    },

    countBadge: {
      minWidth: 26,

      height: 26,

      paddingHorizontal:
        FixxamTokens.spacing.xs,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    countText: {
      color:
        Colors.textInverse,
    },

    subtitle: {
      marginTop:
        FixxamTokens.spacing.xxs,

      lineHeight: 18,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loadingContainer: {
      minHeight: 240,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       STATES
    ========================================================== */

    emptyCard: {
      marginTop:
        FixxamTokens.spacing.sm,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      paddingVertical:
        FixxamTokens.spacing.xxxl,

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

    stateIcon: {
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
        FixxamTokens.radius.lg,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    errorIcon: {
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

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       ORDERS
    ========================================================== */

    orderWrapper: {
      marginBottom:
        FixxamTokens.spacing.md,
    },

    newJobLabel: {
      minHeight: 32,

      marginBottom:
        FixxamTokens.spacing.xs,

      paddingHorizontal:
        FixxamTokens.spacing.sm,

      flexDirection:
        "row",

      alignItems:
        "center",

      alignSelf:
        "flex-start",

      gap:
        FixxamTokens.spacing.xs,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    newJobDot: {
      width: 7,

      height: 7,

      flexShrink: 0,

      borderRadius:
        FixxamTokens.radius.full,

      backgroundColor:
        WorkerColors.primary,
    },

    newJobLabelText: {
      letterSpacing: 0.3,

      color:
        WorkerColors.primary,
    },
  });