import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  AppScreen,
  AppText,
} from "@/components/ui";

import AppLoader from "@/components/common/AppLoader";

import { db } from "@/firebase/config";

import { useAuth } from "@/hooks/useAuth";

import OrderDeletionManager, {
  type OrderDeletionCounts,
  type OrderDeletionFilter,
} from "@/components/orders/OrderDeletionManager";

import OrderCard from "@/components/customerorders/orderCard";
import MarketOrderCard from "@/components/customerorders/marketOrderCard";
import OrderEmptyState from "@/components/customerorders/orderEmptyState";
import OrdersHeader from "@/components/customerorders/ordersHeader";
import OrderSummary from "@/components/customerorders/ordersSummary";

import type {
  FilterType,
  MarketOrder,
  Order,
} from "@/components/customerorders/orders.types";

import {
  FILTERS,
  getOrdersErrorMessage,
  getTimestampMillis,
  mapFirestoreOrder,
  mapMarketOrder,
} from "@/components/customerorders/orders.utils";

import {
  Colors,
  CustomerColors,
  FixxamTokens,
} from "@/theme";

/* ==============================================================
   HELPERS
============================================================== */

function matchesFilter(
  status: string,
  filter: FilterType,
): boolean {
  switch (filter) {
    case "pending":
      return status === "pending";

    case "active":
      return (
        status === "accepted" ||
        status === "in-progress"
      );

    case "completed":
      return status === "completed";

    case "cancelled":
      return (
        status === "cancelled" ||
        status === "expired"
      );

    case "all":
    default:
      return true;
  }
}

/* ==============================================================
   SCREEN
============================================================== */

export default function OrdersScreen() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const authenticated =
    Boolean(user);

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<FilterType>("all");

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    marketOrders,
    setMarketOrders,
  ] =
    useState<MarketOrder[]>([]);

  const [
    serviceLoading,
    setServiceLoading,
  ] = useState(false);

  const [
    marketLoading,
    setMarketLoading,
  ] = useState(false);

  const [
    serviceError,
    setServiceError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    marketError,
    setMarketError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    managementVisible,
    setManagementVisible,
  ] = useState(false);

  /* ============================================================
     FIRESTORE LISTENERS
  ============================================================ */

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setMarketOrders([]);

      setServiceLoading(false);
      setMarketLoading(false);

      setServiceError(null);
      setMarketError(null);

      setManagementVisible(false);

      return;
    }

    setServiceLoading(true);
    setMarketLoading(true);

    setServiceError(null);
    setMarketError(null);

    /* ========================================================
       SERVICE ORDERS
    ======================================================== */

    const bookingsQuery = query(
      collection(
        db,
        "bookings",
      ),
      where(
        "customerId",
        "==",
        user.uid,
      ),
    );

    const unsubscribeBookings =
      onSnapshot(
        bookingsQuery,

        (snapshot) => {
          const nextOrders =
            snapshot.docs
              .map((document) =>
                mapFirestoreOrder(
                  document.id,
                  document.data(),
                ),
              )
              .sort(
                (a, b) =>
                  getTimestampMillis(
                    b.createdAt,
                  ) -
                  getTimestampMillis(
                    a.createdAt,
                  ),
              );

          setOrders(nextOrders);

          setServiceLoading(false);
          setServiceError(null);
        },

        (error) => {
          console.error(
            "CUSTOMER_ORDERS_LISTENER_ERROR:",
            error,
          );

          setOrders([]);

          setServiceLoading(false);

          setServiceError(
            getOrdersErrorMessage(
              error,
            ),
          );
        },
      );

    /* ========================================================
       MARKET ORDERS
    ======================================================== */

    const marketQuery = query(
      collection(
        db,
        "orders",
      ),
      where(
        "customerId",
        "==",
        user.uid,
      ),
    );

    const unsubscribeMarket =
      onSnapshot(
        marketQuery,

        (snapshot) => {
          const nextMarketOrders =
            snapshot.docs
              .map((document) =>
                mapMarketOrder(
                  document.id,
                  document.data(),
                ),
              )
              .sort(
                (a, b) =>
                  getTimestampMillis(
                    b.createdAt,
                  ) -
                  getTimestampMillis(
                    a.createdAt,
                  ),
              );

          setMarketOrders(
            nextMarketOrders,
          );

          setMarketLoading(false);
          setMarketError(null);
        },

        (error) => {
          console.error(
            "CUSTOMER_MARKET_ORDERS_LISTENER_ERROR:",
            error,
          );

          setMarketOrders([]);

          setMarketLoading(false);

          setMarketError(
            getOrdersErrorMessage(
              error,
            ),
          );
        },
      );

    return () => {
      unsubscribeBookings();
      unsubscribeMarket();
    };
  }, [user]);

  /* ============================================================
     COUNTS
  ============================================================ */

  const orderCounts =
    useMemo<OrderDeletionCounts>(
      () => {
        const allOrders = [
          ...orders,
          ...marketOrders,
        ];

        return allOrders.reduce(
          (
            counts,
            order,
          ) => {
            switch (
              order.status
            ) {
              case "pending":
                counts.pending += 1;
                break;

              case "accepted":
              case "in-progress":
                counts.active += 1;
                break;

              case "completed":
                counts.completed += 1;
                break;

              case "cancelled":
              case "expired":
                counts.cancelled += 1;
                break;

              default:
                break;
            }

            return counts;
          },
          {
            pending: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
          },
        );
      },
      [
        marketOrders,
        orders,
      ],
    );

  /* ============================================================
     COMBINE + FILTER + SORT
  ============================================================ */

  const combinedOrders =
    useMemo(() => {
      const serviceItems =
        orders
          .filter((order) =>
            matchesFilter(
              order.status,
              selectedFilter,
            ),
          )
          .map((order) => ({
            type:
              "service" as const,

            order,

            createdAt:
              getTimestampMillis(
                order.createdAt,
              ),
          }));

      const marketItems =
        marketOrders
          .filter((order) =>
            matchesFilter(
              order.status,
              selectedFilter,
            ),
          )
          .map((order) => ({
            type:
              "market" as const,

            order,

            createdAt:
              getTimestampMillis(
                order.createdAt,
              ),
          }));

      return [
        ...serviceItems,
        ...marketItems,
      ].sort(
        (a, b) =>
          b.createdAt -
          a.createdAt,
      );
    }, [
      marketOrders,
      orders,
      selectedFilter,
    ]);

  const hasOrders =
    combinedOrders.length >
    0;

  const ordersLoading =
    serviceLoading ||
    marketLoading;

  const listenerError =
    serviceError ??
    marketError;

  /* ============================================================
     ACTIONS
  ============================================================ */

  const handleLogin =
    useCallback(() => {
      router.push(
        "/(auth)/login",
      );
    }, []);

  const handleViewOrder =
    useCallback(
      (order: Order) => {
        router.push({
          pathname:
            "/(customer)/orders/[orderId]",

          params: {
            orderId:
              order.id,
          },
        });
      },
      [],
    );

  const handleViewMarketOrder =
    useCallback(
      (
        order: MarketOrder,
      ) => {
        router.push({
          pathname:
            "/(customer)/orders/market/[orderId]",

          params: {
            orderId:
              order.id,
          },
        });
      },
      [],
    );

  const handleOpenManagement =
    useCallback(() => {
      if (!authenticated) {
        return;
      }

      setManagementVisible(
        true,
      );
    }, [authenticated]);

  const handleCloseManagement =
    useCallback(() => {
      setManagementVisible(
        false,
      );
    }, []);

  const handleManagementFilter =
    useCallback(
      (
        filter:
          OrderDeletionFilter,
      ) => {
        if (!authenticated) {
          return;
        }

        setSelectedFilter(
          filter,
        );
      },
      [authenticated],
    );

  const handleDeleted =
    useCallback(() => {
      setSelectedFilter(
        "all",
      );
    }, []);

  /* ============================================================
     UI
  ============================================================ */

  return (
    <>
      <AppScreen
        role="customer"
        padded={false}
        scrollEnabled
        contentContainerStyle={
          styles.screen
        }
      >
        <View style={styles.content}>
          <OrdersHeader
            authenticated={
              authenticated
            }
            onManage={
              handleOpenManagement
            }
          />

          <OrderSummary
            counts={orderCounts}
            authenticated={
              authenticated
            }
            onManage={
              handleOpenManagement
            }
          />

          {/* ==================================================
              FILTERS
          ================================================== */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterContent
            }
          >
            {FILTERS.map(
              (filter) => {
                const active =
                  selectedFilter ===
                  filter.key;

                return (
                  <Pressable
                    key={filter.key}
                    onPress={() =>
                      setSelectedFilter(
                        filter.key,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${filter.label} orders`}
                    accessibilityState={{
                      selected:
                        active,
                    }}
                    style={({
                      pressed,
                    }) => [
                      styles.filterButton,

                      active
                        ? styles.filterButtonActive
                        : null,

                      pressed
                        ? styles.filterPressed
                        : null,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      weight="semibold"
                      style={{
                        color: active
                          ? Colors.textInverse
                          : Colors.textSecondary,
                      }}
                    >
                      {filter.label}
                    </AppText>
                  </Pressable>
                );
              },
            )}
          </ScrollView>

          {/* ==================================================
              CONTENT
          ================================================== */}

          {authLoading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <AppLoader
                role="customer"
                size="sm"
                message="Checking your account..."
              />
            </View>
          ) : !authenticated ? (
            <OrderEmptyState
              filter={
                selectedFilter
              }
              onLogin={
                handleLogin
              }
            />
          ) : ordersLoading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <AppLoader
                role="customer"
                size="sm"
                message="Loading your orders..."
              />
            </View>
          ) : !hasOrders &&
            listenerError ? (
            <OrderEmptyState
              filter={
                selectedFilter
              }
              error={
                listenerError
              }
            />
          ) : !hasOrders ? (
            <OrderEmptyState
              filter={
                selectedFilter
              }
            />
          ) : (
            <>
              {listenerError ? (
                <View
                  style={
                    styles.warning
                  }
                >
                  <AppText
                    variant="caption"
                    tone="warning"
                  >
                    Some orders could
                    not be loaded.
                  </AppText>
                </View>
              ) : null}

              <View
                style={
                  styles.ordersList
                }
              >
                {combinedOrders.map(
                  (item) => {
                    if (
                      item.type ===
                      "service"
                    ) {
                      return (
                        <OrderCard
                          key={`service-${item.order.id}`}
                          order={
                            item.order
                          }
                          onPress={() =>
                            handleViewOrder(
                              item.order,
                            )
                          }
                        />
                      );
                    }

                    return (
                      <MarketOrderCard
                        key={`market-${item.order.id}`}
                        order={
                          item.order
                        }
                        onPress={() =>
                          handleViewMarketOrder(
                            item.order,
                          )
                        }
                      />
                    );
                  },
                )}
              </View>
            </>
          )}
        </View>
      </AppScreen>

      {authenticated ? (
        <OrderDeletionManager
          visible={
            managementVisible
          }
          counts={orderCounts}
          selectedFilter={
            selectedFilter
          }
          onClose={
            handleCloseManagement
          }
          onFilterSelect={
            handleManagementFilter
          }
          onDeleted={
            handleDeleted
          }
        />
      ) : null}
    </>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles =
  StyleSheet.create({
    screen: {
      flexGrow: 1,

      backgroundColor:
        Colors.background,
    },

    content: {
      width: "100%",

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxxl,
    },

    filterContent: {
      paddingTop:
        FixxamTokens.spacing.md,

      paddingBottom:
        FixxamTokens.spacing.xs,

      paddingRight:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.sm,
    },

    filterButton: {
      minHeight:
        FixxamTokens.size
          .minimumTouchTarget,

      paddingHorizontal:
        FixxamTokens.spacing.md,

      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,

      borderColor:
        Colors.border,

      borderRadius:
  FixxamTokens.radius.chip,

      backgroundColor:
        Colors.surface,
    },

    filterButtonActive: {
      borderColor:
        CustomerColors.primary,

      backgroundColor:
        CustomerColors.primary,
    },

    filterPressed: {
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

    ordersList: {
      marginTop:
        FixxamTokens.spacing.sm,

      gap:
        FixxamTokens.spacing.sm,
    },

    loadingContainer: {
      minHeight: 220,

      alignItems: "center",
      justifyContent: "center",
    },

    warning: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.xs,

      padding:
        FixxamTokens.spacing.sm,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.warningSoft,
    },
  });