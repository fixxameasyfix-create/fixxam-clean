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

import { router } from "expo-router";

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

import WorkerMarketOrderCard from "@/components/workerorders/WorkerMarketOrderCard";
import WorkerServiceOrderCard from "@/components/workerorders/WorkerServiceOrderCard";

import useRecentJobs, {
  getTimestamp,
  type RecentJob,
} from "@/hooks/worker/useRecentJobs";

import type {
  WorkerMarketOrder,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type RecentServiceItem = {
  type: "service";
  data: WorkerServiceOrder;
};

type RecentMarketItem = {
  type: "market";
  data: WorkerMarketOrder;
};

type RecentItem =
  | RecentServiceItem
  | RecentMarketItem;

/* ==============================================================
   HELPERS
============================================================== */

function getSafeId(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  return "";
}

function isValidJob(job: unknown): job is RecentJob {
  if (!job || typeof job !== "object") {
    return false;
  }

  const value = job as { id?: unknown };

  return getSafeId(value.id).length > 0;
}

function isWorkerServiceOrder(
  job: RecentJob,
): job is RecentJob & WorkerServiceOrder {
  return job.type !== "market";
}

function isWorkerMarketOrder(
  job: RecentJob,
): job is RecentJob & WorkerMarketOrder {
  return job.type === "market";
}

/* ==============================================================
   SECTION HEADER
============================================================== */

const RecentJobsHeader = memo(
  function RecentJobsHeader({
    onViewAll,
  }: {
    onViewAll: () => void;
  }) {
    return (
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIcon}>
            <AppIcon
              name="jobs"
              role="worker"
              size="sm"
              color={WorkerColors.primary}
            />
          </View>

          <AppText
            variant="heading2"
            weight="bold"
            style={styles.title}
          >
            Recent Jobs
          </AppText>
        </View>

        <Pressable
          onPress={onViewAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="View all jobs"
          accessibilityHint="Opens your jobs page"
          style={({ pressed }) => [
            styles.seeAllButton,
            pressed && styles.pressed,
          ]}
        >
          <AppText
            variant="bodyMedium"
            weight="semibold"
            style={styles.seeAll}
          >
            See All
          </AppText>

          <AppIcon
            name="next"
            role="worker"
            size="xs"
            color={WorkerColors.primary}
          />
        </Pressable>
      </View>
    );
  },
);

RecentJobsHeader.displayName = "RecentJobsHeader";

/* ==============================================================
   COMPONENT
============================================================== */

function RecentJobs() {
  const { loading, error, jobs } = useRecentJobs();

  /* ============================================================
     PREPARE RECENT ITEMS
  ============================================================ */

  const recentItems = useMemo<RecentItem[]>(() => {
    if (!Array.isArray(jobs)) {
      return [];
    }

    const items: RecentItem[] = [];

    for (const job of jobs) {
      if (!isValidJob(job)) {
        continue;
      }

      if (isWorkerMarketOrder(job)) {
        items.push({
          type: "market",
          data: job,
        });

        continue;
      }

      if (isWorkerServiceOrder(job)) {
        items.push({
          type: "service",
          data: job,
        });
      }
    }

    return items
      .sort((a, b) => {
        const aTime = getTimestamp(
          a.data.createdAt ??
            a.data.updatedAt ??
            a.data.date,
        );

        const bTime = getTimestamp(
          b.data.createdAt ??
            b.data.updatedAt ??
            b.data.date,
        );

        return bTime - aTime;
      })
      .slice(0, 2);
  }, [jobs]);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleViewAll = useCallback(() => {
    router.push("/(worker)/(tabs)/orders");
  }, []);

  const handleServicePress = useCallback(
    (selectedOrder: WorkerServiceOrder) => {
      const orderId = getSafeId(selectedOrder.id);

      if (!orderId) {
        return;
      }

      router.push({
        pathname: "/(worker)/orders/[orderId]",
        params: { orderId },
      });
    },
    [],
  );

  const handleMarketPress = useCallback(
    (selectedOrder: WorkerMarketOrder) => {
      const marketId = getSafeId(selectedOrder.id);

      if (!marketId) {
        return;
      }

      router.push({
        pathname: "/(worker)/orders/market/[market]",
        params: { market: marketId },
      });
    },
    [],
  );

  /* ============================================================
     MARKET CHAT NAVIGATION
  ============================================================ */

  const handleMarketChatPress = useCallback(
    (selectedOrder: WorkerMarketOrder) => {
      const orderId = getSafeId(selectedOrder.id);

      if (!orderId) {
        return;
      }

      // Ensure this pathname matches the actual chat
      // screen file inside your app directory.
      router.push({
        pathname: "/(worker)/orders/market/chat",
        params: { orderId },
      });
    },
    [],
  );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <View style={styles.container}>
        <RecentJobsHeader onViewAll={handleViewAll} />

        <View style={styles.list}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </View>
      </View>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error && recentItems.length === 0) {
    return (
      <View style={styles.container}>
        <RecentJobsHeader onViewAll={handleViewAll} />

        <View style={styles.state}>
          <View style={[styles.stateIcon, styles.errorIcon]}>
            <AppIcon
              name="error"
              size="lg"
              color={Colors.error}
            />
          </View>

          <AppText
            variant="heading3"
            weight="semibold"
            center
            style={styles.stateTitle}
          >
            Unable to Load Jobs
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={styles.stateText}
          >
            Check your connection and try again.
          </AppText>
        </View>
      </View>
    );
  }

  /* ============================================================
     MAIN
  ============================================================ */

  return (
    <View style={styles.container}>
      <RecentJobsHeader onViewAll={handleViewAll} />

      {recentItems.length === 0 ? (
        <View style={styles.state}>
          <View style={styles.stateIcon}>
            <AppIcon
              name="jobs"
              role="worker"
              size="lg"
              color={WorkerColors.primary}
            />
          </View>

          <AppText
            variant="heading3"
            weight="semibold"
            center
            style={styles.stateTitle}
          >
            No Recent Jobs
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={styles.stateText}
          >
            Your latest jobs will appear here.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {recentItems.map((item) => {
            if (item.type === "service") {
              const order = item.data;

              return (
                <WorkerServiceOrderCard
                  key={`service-${getSafeId(order.id)}`}
                  order={order}
                  onPress={handleServicePress}
                />
              );
            }

            const order = item.data;

            return (
              <WorkerMarketOrderCard
                key={`market-${getSafeId(order.id)}`}
                order={order}
                onPress={handleMarketPress}
                onChatPress={handleMarketChatPress}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ==============================================================
   MEMO
============================================================== */

RecentJobs.displayName = "RecentJobs";

export default memo(RecentJobs);

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: FixxamTokens.spacing.xl,
    marginBottom: FixxamTokens.spacing.lg,
  },

  header: {
    marginBottom: FixxamTokens.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: FixxamTokens.spacing.sm,
  },

  headerTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
  },

  headerIcon: {
    width: FixxamTokens.size.minimumTouchTarget,
    height: FixxamTokens.size.minimumTouchTarget,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.md,
    backgroundColor: WorkerColors.primarySoft,
  },

  title: {
    flexShrink: 1,
    color: Colors.textPrimary,
  },

  seeAllButton: {
    minHeight: FixxamTokens.size.minimumTouchTarget,
    flexShrink: 0,
    paddingHorizontal: FixxamTokens.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: FixxamTokens.spacing.xs,
    borderRadius: FixxamTokens.radius.md,
  },

  seeAll: {
    color: WorkerColors.primary,
  },

  list: {
    gap: FixxamTokens.spacing.md,
  },

  state: {
    width: "100%",
    minHeight: 200,
    paddingHorizontal: FixxamTokens.spacing.xl,
    paddingVertical: FixxamTokens.spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },

  stateIcon: {
    width: 56,
    height: 56,
    marginBottom: FixxamTokens.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.lg,
    backgroundColor: WorkerColors.primarySoft,
  },

  errorIcon: {
    backgroundColor: Colors.errorSoft,
  },

  stateTitle: {
    color: Colors.textPrimary,
  },

  stateText: {
    maxWidth: 280,
    marginTop: FixxamTokens.spacing.xs,
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  pressed: {
    opacity: FixxamTokens.motion.pressedOpacity,
    transform: [
      {
        scale: FixxamTokens.motion.scalePressed,
      },
    ],
  },
});