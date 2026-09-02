import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { router } from "expo-router";

import {
  onAuthStateChanged,
} from "firebase/auth";

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

import {
  auth,
  db,
} from "@/firebase/config";

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

/* ==============================================================
   SCREEN
============================================================== */

export default function OrdersScreen() {
  /* ============================================================
     AUTH
  ============================================================ */

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  /* ============================================================
     FILTER
  ============================================================ */

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<FilterType>("all");

  /* ============================================================
     SERVICE ORDERS
  ============================================================ */

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  /* ============================================================
     MARKET ORDERS
  ============================================================ */

  const [
    marketOrders,
    setMarketOrders,
  ] = useState<MarketOrder[]>([]);

  /* ============================================================
     LOADING
  ============================================================ */

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* ============================================================
     ERROR
  ============================================================ */

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /* ============================================================
     MANAGEMENT
  ============================================================ */

  const [
    managementVisible,
    setManagementVisible,
  ] = useState(false);

  /* ============================================================
     AUTH + FIRESTORE LISTENERS
  ============================================================ */

  useEffect(() => {
    let unsubscribeBookings:
      | (() => void)
      | undefined;

    let unsubscribeMarket:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          /* -----------------------------------------------
             CLEAN PREVIOUS LISTENERS
          ------------------------------------------------ */

          unsubscribeBookings?.();
          unsubscribeMarket?.();

          unsubscribeBookings =
            undefined;

          unsubscribeMarket =
            undefined;

          /* -----------------------------------------------
             NOT AUTHENTICATED
          ------------------------------------------------ */

          if (!user) {
            setAuthenticated(
              false,
            );

            setOrders([]);

            setMarketOrders([]);

            setError(null);

            setLoading(false);

            setManagementVisible(
              false,
            );

            return;
          }

          /* -----------------------------------------------
             AUTHENTICATED
          ------------------------------------------------ */

          setAuthenticated(
            true,
          );

          setLoading(true);

          setError(null);

          /* ==================================================
             SERVICE ORDERS
          ================================================== */

          const bookingsRef =
            collection(
              db,
              "bookings",
            );

          const bookingsQuery =
            query(
              bookingsRef,
              where(
                "customerId",
                "==",
                user.uid,
              ),
            );

          unsubscribeBookings =
            onSnapshot(
              bookingsQuery,

              (snapshot) => {
                const nextOrders =
                  snapshot.docs
                    .map(
                      (document) =>
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

                setOrders(
                  nextOrders,
                );

                setLoading(false);

                setError(null);
              },

              (snapshotError) => {
                console.error(
                  "CUSTOMER_ORDERS_LISTENER_ERROR:",
                  snapshotError,
                );

                setOrders([]);

                setLoading(false);

                setError(
                  getOrdersErrorMessage(
                    snapshotError,
                  ),
                );
              },
            );

          /* ==================================================
             MARKET ORDERS
          ================================================== */

          const marketRef =
            collection(
              db,
              "orders",
            );

          const marketQuery =
            query(
              marketRef,
              where(
                "customerId",
                "==",
                user.uid,
              ),
            );

          unsubscribeMarket =
            onSnapshot(
              marketQuery,

              (snapshot) => {
                const nextMarketOrders =
                  snapshot.docs
                    .map(
                      (document) =>
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
              },

              (marketError) => {
                console.error(
                  "CUSTOMER_MARKET_ORDERS_LISTENER_ERROR:",
                  marketError,
                );

                setMarketOrders(
                  [],
                );
              },
            );
        },
      );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      unsubscribeBookings?.();

      unsubscribeMarket?.();

      unsubscribeAuth();
    };
  }, []);

  /* ============================================================
     ORDER COUNTS
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
        orders,
        marketOrders,
      ],
    );

  /* ============================================================
     FILTER SERVICE ORDERS
  ============================================================ */

  const filteredOrders =
    useMemo(() => {
      switch (
        selectedFilter
      ) {
        case "pending":
          return orders.filter(
            (order) =>
              order.status ===
              "pending",
          );

        case "active":
          return orders.filter(
            (order) =>
              order.status ===
                "accepted" ||
              order.status ===
                "in-progress",
          );

        case "completed":
          return orders.filter(
            (order) =>
              order.status ===
              "completed",
          );

        case "cancelled":
          return orders.filter(
            (order) =>
              order.status ===
                "cancelled" ||
              order.status ===
                "expired",
          );

        case "all":
        default:
          return orders;
      }
    }, [
      orders,
      selectedFilter,
    ]);

  /* ============================================================
     FILTER MARKET ORDERS
  ============================================================ */

  const filteredMarketOrders =
    useMemo(() => {
      switch (
        selectedFilter
      ) {
        case "pending":
          return marketOrders.filter(
            (order) =>
              order.status ===
              "pending",
          );

        case "active":
          return marketOrders.filter(
            (order) =>
              order.status ===
                "accepted" ||
              order.status ===
                "in-progress",
          );

        case "completed":
          return marketOrders.filter(
            (order) =>
              order.status ===
              "completed",
          );

        case "cancelled":
          return marketOrders.filter(
            (order) =>
              order.status ===
                "cancelled" ||
              order.status ===
                "expired",
          );

        case "all":
        default:
          return marketOrders;
      }
    }, [
      marketOrders,
      selectedFilter,
    ]);

  /* ============================================================
     COMBINE + SORT
  ============================================================ */

  const combinedOrders =
    useMemo(() => {
      const serviceItems =
        filteredOrders.map(
          (order) => ({
            type:
              "service" as const,

            order,

            createdAt:
              getTimestampMillis(
                order.createdAt,
              ),
          }),
        );

      const marketItems =
        filteredMarketOrders.map(
          (order) => ({
            type:
              "market" as const,

            order,

            createdAt:
              getTimestampMillis(
                order.createdAt,
              ),
          }),
        );

      return [
        ...serviceItems,
        ...marketItems,
      ].sort(
        (a, b) =>
          b.createdAt -
          a.createdAt,
      );
    }, [
      filteredOrders,
      filteredMarketOrders,
    ]);

  /* ============================================================
     HAS ORDERS
  ============================================================ */

  const hasOrders =
    combinedOrders.length >
    0;

  /* ============================================================
     LOGIN
  ============================================================ */

  const handleLogin =
    useCallback(() => {
      router.push(
        "/(auth)/login",
      );
    }, []);

  /* ============================================================
     VIEW SERVICE ORDER
  ============================================================ */

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

  /* ============================================================
     VIEW MARKET ORDER
  ============================================================ */

  const handleViewMarketOrder =
    useCallback(
      (order: MarketOrder) => {
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

  /* ============================================================
     OPEN MANAGEMENT
  ============================================================ */

  const handleOpenManagement =
    useCallback(() => {
      if (!authenticated) {
        return;
      }

      setManagementVisible(
        true,
      );
    }, [
      authenticated,
    ]);

  /* ============================================================
     MANAGEMENT FILTER
  ============================================================ */

  const handleManagementFilter =
    useCallback(
      (
        filter: OrderDeletionFilter,
      ) => {
        if (!authenticated) {
          return;
        }

        setSelectedFilter(
          filter,
        );
      },
      [
        authenticated,
      ],
    );

  /* ============================================================
     AFTER DELETE
  ============================================================ */

  const handleDeleted =
    useCallback(() => {
      setSelectedFilter(
        "all",
      );
    }, []);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <OrdersHeader
            authenticated={
              authenticated
            }
            onManage={
              handleOpenManagement
            }
          />

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <OrderSummary
            counts={
              orderCounts
            }
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
                    key={
                      filter.key
                    }
                    onPress={() =>
                      setSelectedFilter(
                        filter.key,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityState={{
                      selected:
                        active,
                    }}
                    style={[
                      styles.filterButton,

                      active &&
                        styles.filterButtonActive,
                    ]}
                  >
                    <AppText
                      weight="bold"
                      style={[
                        styles.filterText,

                        active &&
                          styles.filterTextActive,
                      ]}
                    >
                      {
                        filter.label
                      }
                    </AppText>
                  </Pressable>
                );
              },
            )}
          </ScrollView>

          {/* ==================================================
              CONTENT
          ================================================== */}

          {!authenticated ? (
            <OrderEmptyState
              filter={
                selectedFilter
              }
              onLogin={
                handleLogin
              }
            />
          ) : loading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="small"
                color="#2563EB"
              />

              <AppText
                style={
                  styles.loadingText
                }
              >
                Loading your
                orders...
              </AppText>
            </View>
          ) : error ? (
            <OrderEmptyState
              filter={
                selectedFilter
              }
              error={error}
            />
          ) : !hasOrders ? (
            <OrderEmptyState
              filter={
                selectedFilter
              }
            />
          ) : (
            <View
              style={
                styles.ordersList
              }
            >
              {combinedOrders.map(
                (item) => {
                  /* ==========================================
                     SERVICE ORDER
                  ========================================== */

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

                  /* ==========================================
                     MARKET ORDER

                     MarketOrderCard itself handles:
                     - chat listener
                     - customer arrow ↑
                     - seller arrow ↓
                     - normal order arrow
                  ========================================== */

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
          )}
        </ScrollView>
      </AppScreen>

      {/* ========================================================
          ORDER MANAGEMENT
      ======================================================== */}

      {authenticated ? (
        <OrderDeletionManager
          visible={
            managementVisible
          }
          counts={
            orderCounts
          }
          selectedFilter={
            selectedFilter
          }
          onClose={() =>
            setManagementVisible(
              false,
            )
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
      flex: 1,
      width: "100%",
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingHorizontal: 14,
      paddingTop: 6,
      paddingBottom: 30,
    },

    /* ========================================================
       FILTERS
    ======================================================== */

    filterContent: {
      paddingTop: 11,
      paddingBottom: 2,
      paddingRight: 4,
      gap: 6,
    },

    filterButton: {
      minHeight: 32,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    filterButtonActive: {
      backgroundColor:
        "#2563EB",
      borderColor:
        "#2563EB",
    },

    filterText: {
      fontSize: 9.5,
      color: "#64748B",
    },

    filterTextActive: {
      color: "#FFFFFF",
    },

    /* ========================================================
       ORDERS
    ======================================================== */

    ordersList: {
      marginTop: 8,
      gap: 7,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      minHeight: 220,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 8,
      fontSize: 10,
      color: "#64748B",
    },
  });