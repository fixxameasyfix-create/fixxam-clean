import React, {
  useCallback,
  useMemo,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import type {
  ListRenderItem,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

import WorkerMarketOrderCard from "@/components/workerorders/WorkerMarketOrderCard";
import WorkerServiceOrderCard from "@/components/workerorders/WorkerServiceOrderCard";
import WorkerShopRequestCard from "@/components/workerorders/WorkerShopRequestCard";

import useWorkerOrders from "@/hooks/orders/useWorkerOrders";

import type {
  FirebaseShopRequest,
} from "@/types/firebaseShopRequest";

import type {
  WorkerMarketOrder,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type ServiceJobItem = {
  type: "service";
  data: WorkerServiceOrder;
};

type MarketJobItem = {
  type: "market";
  data: WorkerMarketOrder;
};

type ShopRequestJobItem = {
  type: "shop-request";
  data: FirebaseShopRequest;
};

type NewJobItem =
  | ServiceJobItem
  | MarketJobItem
  | ShopRequestJobItem;

/* ==============================================================
   HELPERS
============================================================== */

function getTime(value: unknown): number {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (
      value as { toMillis?: unknown }
    ).toMillis === "function"
  ) {
    try {
      const result = (
        value as { toMillis: () => number }
      ).toMillis();

      return Number.isFinite(result) ? result : 0;
    } catch {
      return 0;
    }
  }

  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : 0;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getItemTime(item: NewJobItem): number {
  if (item.type === "shop-request") {
    return getTime(
      item.data.createdAt ?? item.data.updatedAt,
    );
  }

  return getTime(
    item.data.createdAt ??
      item.data.updatedAt ??
      item.data.date,
  );
}

function getSafeCount(value: unknown): number {
  const count = Number(value);

  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }

  return Math.floor(count);
}

function getOrderId(value: unknown): string {
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

/* ==============================================================
   SCREEN
============================================================== */

export default function NewJobsScreen() {
  const {
    serviceOrders,
    marketOrders,
    shopRequests,
    counts,
    loading,
    error,
  } = useWorkerOrders();

  const pendingCount = getSafeCount(counts.pending);

  /* ============================================================
     NEW JOBS
  ============================================================ */

  const newJobs = useMemo<NewJobItem[]>(() => {
    const serviceJobs: ServiceJobItem[] =
      Array.isArray(serviceOrders)
        ? serviceOrders
            .filter(
              (order: WorkerServiceOrder) =>
                order.status === "pending" &&
                order.deletedByWorker !== true,
            )
            .map((order: WorkerServiceOrder) => ({
              type: "service",
              data: order,
            }))
        : [];

    const marketJobs: MarketJobItem[] =
      Array.isArray(marketOrders)
        ? marketOrders
            .filter(
              (order: WorkerMarketOrder) =>
                order.status === "pending" &&
                order.deletedByWorker !== true,
            )
            .map((order: WorkerMarketOrder) => ({
              type: "market",
              data: order,
            }))
        : [];

    const shopJobs: ShopRequestJobItem[] =
      Array.isArray(shopRequests)
        ? shopRequests
            .filter(
              (request: FirebaseShopRequest) =>
                request.status === "pending",
            )
            .map((request: FirebaseShopRequest) => ({
              type: "shop-request",
              data: request,
            }))
        : [];

    return [
      ...serviceJobs,
      ...marketJobs,
      ...shopJobs,
    ].sort(
      (a, b) => getItemTime(b) - getItemTime(a),
    );
  }, [marketOrders, serviceOrders, shopRequests]);

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleOpenServiceOrder = useCallback(
    (order: WorkerServiceOrder) => {
      const orderId = getOrderId(order.id);

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

  const handleOpenMarketOrder = useCallback(
    (order: WorkerMarketOrder) => {
      const marketId = getOrderId(order.id);

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

  const handleOpenMarketChat = useCallback(
    (order: WorkerMarketOrder) => {
      const orderId = getOrderId(order.id);

      if (!orderId) {
        return;
      }

      // Replace with the actual worker-market chat route
      // if your app uses a different pathname.
      router.push({
        pathname: "/(worker)/orders/market/chat",
        params: { orderId },
      });
    },
    [],
  );

  const handleOpenShopRequest = useCallback(
    (request: FirebaseShopRequest) => {
      const requestId = getOrderId(request.id);

      if (!requestId) {
        return;
      }

      router.push({
        pathname:
          "/(worker)/orders/shop-request/[requestId]",
        params: { requestId },
      });
    },
    [],
  );

  /* ============================================================
     HEADER
  ============================================================ */

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <AppText
              variant="heading2"
              weight="bold"
              style={styles.title}
            >
              New Jobs
            </AppText>

            {pendingCount > 0 ? (
              <View
                accessible
                accessibilityLabel={`${pendingCount} pending jobs`}
                style={styles.countBadge}
              >
                <AppText
                  variant="caption"
                  weight="bold"
                  style={styles.countText}
                >
                  {pendingCount > 99 ? "99+" : pendingCount}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText
            variant="caption"
            tone="secondary"
            numberOfLines={2}
            style={styles.subtitle}
          >
            Requests waiting for your response
          </AppText>
        </View>
      </View>
    ),
    [pendingCount],
  );

  /* ============================================================
     RENDER ITEM
  ============================================================ */

  const renderItem = useCallback<ListRenderItem<NewJobItem>>(
    ({ item }) => {
      if (item.type === "shop-request") {
        return (
          <WorkerShopRequestCard
            request={item.data}
            onPress={handleOpenShopRequest}
          />
        );
      }

      if (item.type === "service") {
        return (
          <WorkerServiceOrderCard
            order={item.data}
            onPress={handleOpenServiceOrder}
          />
        );
      }

      return (
        <WorkerMarketOrderCard
          order={item.data}
          onPress={handleOpenMarketOrder}
          onChatPress={handleOpenMarketChat}
        />
      );
    },
    [
      handleOpenMarketChat,
      handleOpenMarketOrder,
      handleOpenServiceOrder,
      handleOpenShopRequest,
    ],
  );

  /* ============================================================
     KEY
  ============================================================ */

  const keyExtractor = useCallback(
    (item: NewJobItem, index: number) => {
      const id = getOrderId(item.data.id);

      return id
        ? `${item.type}-${id}`
        : `${item.type}-${index}`;
    },
    [],
  );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={styles.screen}
      >
        {renderHeader()}

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={WorkerColors.primary}
          />

          <AppText
            variant="body"
            tone="secondary"
            center
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

  if (error && newJobs.length === 0) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={styles.screen}
      >
        {renderHeader()}

        <View style={styles.emptyState}>
          <View style={[styles.stateIcon, styles.errorIcon]}>
            <AppIcon
              name="wifi-off"
              size="lg"
              color={Colors.error}
            />
          </View>

          <AppText
            variant="heading3"
            weight="bold"
            center
            style={styles.emptyTitle}
          >
            Unable to Load Jobs
          </AppText>

          <AppText
            variant="body"
            tone="secondary"
            center
            style={styles.emptyText}
          >
            Check your connection and try again.
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
      contentContainerStyle={styles.screen}
    >
      <FlatList<NewJobItem>
        data={newJobs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
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
              weight="bold"
              center
              style={styles.emptyTitle}
            >
              No New Jobs
            </AppText>

            <AppText
              variant="body"
              tone="secondary"
              center
              style={styles.emptyText}
            >
              New requests will appear here automatically.
            </AppText>
          </View>
        }
        ItemSeparatorComponent={ItemSeparator}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={7}
      />
    </AppScreen>
  );
}

/* ==============================================================
   ITEM SEPARATOR
============================================================== */

function ItemSeparator() {
  return <View style={styles.separator} />;
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: FixxamTokens.spacing.lg,
    backgroundColor: Colors.background,
  },

  list: {
    flexGrow: 1,
    paddingBottom: FixxamTokens.spacing.xxxl,
  },

  separator: {
    height: FixxamTokens.spacing.md,
  },

  header: {
    paddingTop: FixxamTokens.spacing.sm,
    paddingBottom: FixxamTokens.spacing.lg,
  },

  headerContent: {
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: FixxamTokens.spacing.sm,
  },

  title: {
    color: Colors.textPrimary,
  },

  countBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: FixxamTokens.spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.full,
    backgroundColor: WorkerColors.primary,
  },

  countText: {
    color: Colors.textInverse,
  },

  subtitle: {
    marginTop: FixxamTokens.spacing.xxs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },

  loadingContainer: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: FixxamTokens.spacing.md,
    color: Colors.textSecondary,
  },

  emptyState: {
    minHeight: 280,
    paddingHorizontal: FixxamTokens.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  stateIcon: {
    width: FixxamTokens.size.avatarLg,
    height: FixxamTokens.size.avatarLg,
    marginBottom: FixxamTokens.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: FixxamTokens.radius.lg,
    backgroundColor: WorkerColors.primarySoft,
  },

  errorIcon: {
    backgroundColor: Colors.errorSoft,
  },

  emptyTitle: {
    color: Colors.textPrimary,
  },

  emptyText: {
    maxWidth: 300,
    marginTop: FixxamTokens.spacing.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});