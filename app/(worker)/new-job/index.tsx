import React, { useMemo } from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import Ionicons from "@expo/vector-icons/Ionicons";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import WorkerMarketOrderCard from "@/components/workerorders/WorkerMarketOrderCard";
import WorkerOrderCard from "@/components/workerorders/WorkerOrderCard";

import useWorkerOrders from "@/hooks/orders/useWorkerOrders";

import { auth } from "@/firebase/config";

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

/* ==============================================================
   HELPERS
============================================================== */

function getTime(value: unknown): number {
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
      return (
        value as {
          toMillis: () => number;
        }
      ).toMillis();
    } catch {
      return 0;
    }
  }

  if (value instanceof Date) {
    const time = value.getTime();

    return Number.isFinite(time)
      ? time
      : 0;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

/* ==============================================================
   SCREEN
============================================================== */

export default function NewJobsScreen() {
  /* ============================================================
     WORKER ID
  ============================================================ */

  const workerId =
    auth.currentUser?.uid ?? "";

  /* ============================================================
     ORDERS
  ============================================================ */

  const {
    serviceOrders,
    marketOrders,
    loading,
    error,
  } = useWorkerOrders();

  /* ============================================================
     NEW JOBS
  ============================================================ */

  const newJobs = useMemo<NewJobItem[]>(() => {
    const serviceJobs: NewJobItem[] =
      Array.isArray(serviceOrders)
        ? serviceOrders
            .filter(
              (order: WorkerServiceOrder) =>
                order.status === "pending" &&
                order.deletedByWorker !== true,
            )
            .map(
              (order: WorkerServiceOrder) => ({
                type: "service",
                data: order,
              }),
            )
        : [];

    const marketJobs: NewJobItem[] =
      Array.isArray(marketOrders)
        ? marketOrders
            .filter(
              (order: WorkerMarketOrder) =>
                order.status === "pending" &&
                order.deletedByWorker !== true,
            )
            .map(
              (order: WorkerMarketOrder) => ({
                type: "market",
                data: order,
              }),
            )
        : [];

    return [
      ...serviceJobs,
      ...marketJobs,
    ].sort((a, b) => {
      const aTime = getTime(
        a.data.createdAt ??
          a.data.updatedAt ??
          a.data.date,
      );

      const bTime = getTime(
        b.data.createdAt ??
          b.data.updatedAt ??
          b.data.date,
      );

      return bTime - aTime;
    });
  }, [
    serviceOrders,
    marketOrders,
  ]);

  /* ============================================================
     OPEN SERVICE ORDER
  ============================================================ */

  const handleOpenServiceOrder = (
    order: WorkerServiceOrder,
  ) => {
    const orderId = String(
      order.id ?? "",
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
  };

  /* ============================================================
     OPEN MARKET ORDER
  ============================================================ */

  const handleOpenMarketOrder = (
    order: WorkerMarketOrder,
  ) => {
    const marketId = String(
      order.id ?? "",
    ).trim();

    if (!marketId) {
      return;
    }

    router.push({
      pathname:
        "/(worker)/orders/market/[market]",
      params: {
        market: marketId,
      },
    });
  };

  /* ============================================================
     HEADER
  ============================================================ */

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerIcon}>
        <Ionicons
          name="notifications-outline"
          size={23}
          color="#FF6B00"
        />
      </View>

      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <AppText
            weight="bold"
            style={styles.title}
          >
            New Jobs
          </AppText>

          {newJobs.length > 0 && (
            <View style={styles.countBadge}>
              <AppText
                weight="bold"
                style={styles.countText}
              >
                {newJobs.length}
              </AppText>
            </View>
          )}
        </View>

        <AppText style={styles.subtitle}>
          New customer requests and market
          orders waiting for your response.
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
          <ActivityIndicator
            size="small"
            color="#FF6B00"
          />

          <AppText
            style={styles.loadingText}
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
        contentContainerStyle={
          styles.screen
        }
      >
        {renderHeader()}

        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cloud-offline-outline"
              size={30}
              color="#64748B"
            />
          </View>

          <AppText
            weight="bold"
            style={styles.emptyTitle}
          >
            Unable to Load Jobs
          </AppText>

          <AppText
            style={styles.emptyText}
          >
            {String(error)}
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
      contentContainerStyle={
        styles.screen
      }
    >
      <FlatList<NewJobItem>
        data={newJobs}
        keyExtractor={(item) =>
          `${item.type}-${item.data.id}`
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
        }
        ListHeaderComponent={
          renderHeader
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="briefcase-outline"
                size={30}
                color="#FF6B00"
              />
            </View>

            <AppText
              weight="bold"
              style={styles.emptyTitle}
            >
              No New Jobs
            </AppText>

            <AppText
              style={styles.emptyText}
            >
              New service requests and market
              orders assigned to you will
              appear here automatically.
            </AppText>
          </View>
        }
        renderItem={({ item }) => {
          /* ====================================================
             SERVICE
          ==================================================== */

          if (item.type === "service") {
            return (
              <View
                style={
                  styles.orderWrapper
                }
              >
                <NewJobLabel
                  icon="briefcase-outline"
                  label="NEW SERVICE REQUEST"
                />

                <WorkerOrderCard
                  order={item.data}
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
                icon="cart-outline"
                label="NEW MARKET ORDER"
              />

              <WorkerMarketOrderCard
                order={item.data}
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

function NewJobLabel({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
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

      <Ionicons
        name={icon}
        size={14}
        color="#FF6B00"
      />

      <AppText
        weight="bold"
        style={
          styles.newJobLabelText
        }
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
    screen: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 16,
    },

    list: {
      paddingBottom: 40,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 18,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: "#FFF7ED",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    headerContent: {
      flex: 1,
      minWidth: 0,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    title: {
      fontSize: 25,
      lineHeight: 31,
      color: "#0F172A",
    },

    countBadge: {
      minWidth: 25,
      height: 25,
      paddingHorizontal: 7,
      borderRadius: 999,
      backgroundColor: "#FF6B00",
      alignItems: "center",
      justifyContent: "center",
    },

    countText: {
      fontSize: 12,
      color: "#FFFFFF",
    },

    subtitle: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    loadingContainer: {
      minHeight: 220,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 10,
      color: "#64748B",
      fontSize: 13,
    },

    emptyCard: {
      marginTop: 12,
      borderRadius: 22,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 24,
      paddingVertical: 42,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },

    emptyIcon: {
      width: 62,
      height: 62,
      borderRadius: 20,
      backgroundColor: "#FFF7ED",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },

    emptyTitle: {
      fontSize: 19,
      color: "#0F172A",
      textAlign: "center",
    },

    emptyText: {
      marginTop: 7,
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      color: "#64748B",
    },

    orderWrapper: {
      marginBottom: 14,
    },

    newJobLabel: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 7,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#FFF7ED",
    },

    newJobDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: "#F59E0B",
    },

    newJobLabelText: {
      fontSize: 9,
      color: "#C2410C",
      letterSpacing: 0.2,
    },
  });