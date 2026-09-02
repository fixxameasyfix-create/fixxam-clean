import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import {
  onAuthStateChanged,
  type User,
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

import WorkerOrdersHeader from "@/components/workerorders/WorkerOrdersHeader";

import WorkerOrdersOverview from "@/components/workerorders/WorkerOrderOverview";

import WorkerOrdersFilters from "@/components/workerorders/WorkerOrdersFilters";

import WorkerOrdersEmpty from "@/components/workerorders/WorkerOrdersEmpty";

import WorkerServiceOrderCard from "@/components/workerorders/WorkerServiceOrderCard";

import WorkerMarketOrderCard from "@/components/workerorders/WorkerMarketOrderCard";

import type {
  WorkerFilterType,
  WorkerOrder,
  WorkerOrderCounts,
  WorkerMarketOrder,
} from "@/types/workerOrders";

/* ==============================================================
   FIRESTORE DATA
============================================================== */

type FirestoreData = Record<
  string,
  unknown
>;

/* ==============================================================
   COMBINED ITEM
============================================================== */

type CombinedOrder =
  | {
      type: "service";
      order: WorkerOrder;
      createdAt: number;
    }
  | {
      type: "market";
      order: WorkerMarketOrder;
      createdAt: number;
    };

/* ==============================================================
   SCREEN
============================================================== */

export default function WorkerOrdersScreen() {
  /* ============================================================
     AUTH
  ============================================================ */

  const [
    user,
    setUser,
  ] = useState<User | null>(
    auth.currentUser,
  );

  /* ============================================================
     FILTER
  ============================================================ */

  const [
    selectedFilter,
    setSelectedFilter,
  ] = useState<WorkerFilterType>(
    "all",
  );

  /* ============================================================
     SERVICE ORDERS
  ============================================================ */

  const [
    serviceOrders,
    setServiceOrders,
  ] = useState<WorkerOrder[]>(
    [],
  );

  /* ============================================================
     MARKET ORDERS
  ============================================================ */

  const [
    marketOrders,
    setMarketOrders,
  ] = useState<WorkerMarketOrder[]>(
    [],
  );

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
        (currentUser) => {
          /* -----------------------------------------------
             CLEAN OLD LISTENERS
          ------------------------------------------------ */

          unsubscribeBookings?.();
          unsubscribeMarket?.();

          unsubscribeBookings =
            undefined;

          unsubscribeMarket =
            undefined;

          /* -----------------------------------------------
             SIGNED OUT
          ------------------------------------------------ */

          if (!currentUser) {
            setUser(null);
            setServiceOrders([]);
            setMarketOrders([]);
            setError(null);
            setLoading(false);

            return;
          }

          /* -----------------------------------------------
             SIGNED IN
          ------------------------------------------------ */

          setUser(
            currentUser,
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
                "workerId",
                "==",
                currentUser.uid,
              ),
            );

          unsubscribeBookings =
            onSnapshot(
              bookingsQuery,

              (snapshot) => {
                const nextOrders =
                  snapshot.docs
                    .map(
                      (
                        document,
                      ) =>
                        normalizeWorkerOrder(
                          document.id,
                          document.data(),
                        ),
                    )
                    .sort(
                      (
                        a,
                        b,
                      ) =>
                        getTimestampMillis(
                          b.createdAt,
                        ) -
                        getTimestampMillis(
                          a.createdAt,
                        ),
                    );

                setServiceOrders(
                  nextOrders,
                );

                setLoading(
                  false,
                );

                setError(null);
              },

              (listenerError) => {
                console.error(
                  "WORKER_SERVICE_ORDERS_ERROR:",
                  listenerError,
                );

                setServiceOrders([]);
                setLoading(false);

                setError(
                  "Unable to load your jobs. Please try again.",
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
                "workerId",
                "==",
                currentUser.uid,
              ),
            );

          unsubscribeMarket =
            onSnapshot(
              marketQuery,

              (snapshot) => {
                const nextOrders =
                  snapshot.docs
                    .map(
                      (
                        document,
                      ) =>
                        normalizeWorkerMarketOrder(
                          document.id,
                          document.data(),
                        ),
                    )
                    .sort(
                      (
                        a,
                        b,
                      ) =>
                        getTimestampMillis(
                          b.createdAt,
                        ) -
                        getTimestampMillis(
                          a.createdAt,
                        ),
                    );

                setMarketOrders(
                  nextOrders,
                );

                /*
                 * Important:
                 * Do not turn off loading here because
                 * service listener also controls initial loading.
                 */
              },

              (listenerError) => {
                console.error(
                  "WORKER_MARKET_ORDERS_ERROR:",
                  listenerError,
                );

                setMarketOrders([]);
              },
            );
        },
      );

    return () => {
      unsubscribeBookings?.();
      unsubscribeMarket?.();
      unsubscribeAuth();
    };
  }, []);

  /* ============================================================
     COUNTS
  ============================================================ */

  const counts =
    useMemo<WorkerOrderCounts>(
      () => {
        const result: WorkerOrderCounts = {
          all: 0,
          pending: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
        };

        for (const order of serviceOrders) {
          addStatusCount(
            result,
            order.status,
          );
        }

        for (const order of marketOrders) {
          addStatusCount(
            result,
            order.status,
          );
        }

        result.all =
          serviceOrders.length +
          marketOrders.length;

        return result;
      },
      [
        serviceOrders,
        marketOrders,
      ],
    );

  /* ============================================================
     FILTER SERVICE ORDERS
  ============================================================ */

  const filteredServiceOrders =
    useMemo(
      () =>
        serviceOrders.filter(
          (order) =>
            matchesFilter(
              order.status,
              selectedFilter,
            ),
        ),
      [
        serviceOrders,
        selectedFilter,
      ],
    );

  /* ============================================================
     FILTER MARKET ORDERS
  ============================================================ */

  const filteredMarketOrders =
    useMemo(
      () =>
        marketOrders.filter(
          (order) =>
            matchesFilter(
              order.status,
              selectedFilter,
            ),
        ),
      [
        marketOrders,
        selectedFilter,
      ],
    );

  /* ============================================================
     COMBINE ORDERS
  ============================================================ */

  const combinedOrders =
    useMemo<CombinedOrder[]>(
      () => {
        const serviceItems: CombinedOrder[] =
          filteredServiceOrders.map(
            (order) => ({
              type: "service",
              order,
              createdAt:
                getTimestampMillis(
                  order.createdAt,
                ),
            }),
          );

        const marketItems: CombinedOrder[] =
          filteredMarketOrders.map(
            (order) => ({
              type: "market",
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
      },
      [
        filteredServiceOrders,
        filteredMarketOrders,
      ],
    );

  /* ============================================================
     TOTAL JOBS
  ============================================================ */

  const totalJobs =
    serviceOrders.length +
    marketOrders.length;

  /* ============================================================
     BACK
  ============================================================ */

  const handleBack =
    useCallback(() => {
      router.back();
    }, []);

  /* ============================================================
     MANAGE
  ============================================================ */

  const handleManage =
    useCallback(() => {
    }, []);

  /* ============================================================
     FILTER
  ============================================================ */

  const handleFilterChange =
    useCallback(
      (
        filter: WorkerFilterType,
      ) => {
        setSelectedFilter(
          filter,
        );
      },
      [],
    );

  /* ============================================================
     SERVICE ORDER PRESS
  ============================================================ */

  const handleServiceOrderPress =
    useCallback(
      (order: WorkerOrder) => {
        router.push({
          pathname:
            "/(worker)/orders/[orderId]",
          params: {
            orderId:
              order.id,
          },
        });
      },
      [],
    );

  /* ============================================================
     MARKET ORDER PRESS
  ============================================================ */

  const handleMarketOrderPress =
    useCallback(
      (
        order: WorkerMarketOrder,
      ) => {
        router.push({
          pathname:
            "/(worker)/orders/market/[market]",
          params: {
            market:
              order.id,
          },
        });
      },
      [],
    );

  /* ============================================================
     NOT AUTHENTICATED
  ============================================================ */

  if (!user) {
    return (
      <AppScreen
        contentContainerStyle={
          styles.screen
        }
      >
        <View
          style={
            styles.authContainer
          }
        >
          <View
            style={
              styles.authIcon
            }
          >
            <Ionicons
              name="person-outline"
              size={28}
              color="#2563EB"
            />
          </View>

          <AppText
            weight="bold"
            style={
              styles.authTitle
            }
          >
            Sign in required
          </AppText>

          <AppText
            center
            style={
              styles.authText
            }
          >
            Please sign in to view
            your jobs.
          </AppText>
        </View>
      </AppScreen>
    );
  }

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
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
        {/* ======================================================
            HEADER
        ====================================================== */}

        <WorkerOrdersHeader
          onBack={
            handleBack
          }
          onManage={
            handleManage
          }
        />

        {/* ======================================================
            OVERVIEW
        ====================================================== */}

        <WorkerOrdersOverview
          counts={
            counts
          }
          onManage={
            handleManage
          }
        />

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <WorkerOrdersFilters
          selectedFilter={
            selectedFilter
          }
          counts={
            counts
          }
          totalJobs={
            totalJobs
          }
          onChange={
            handleFilterChange
          }
        />

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error ? (
          <View
            style={
              styles.errorContainer
            }
          >
            <AppText
              weight="bold"
              style={
                styles.errorTitle
              }
            >
              Something went wrong
            </AppText>

            <AppText
              style={
                styles.errorText
              }
            >
              {error}
            </AppText>
          </View>
        ) : null}

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading ? (
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
              Loading your jobs...
            </AppText>
          </View>
        ) : combinedOrders.length ===
          0 ? (
          <WorkerOrdersEmpty
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
                   SERVICE
                ========================================== */

                if (
                  item.type ===
                  "service"
                ) {
                  return (
                    <WorkerServiceOrderCard
                      key={`service-${item.order.id}`}
                      order={
                        item.order
                      }
                      onPress={
                        handleServiceOrderPress
                      }
                    />
                  );
                }

                /* ==========================================
                   MARKET
                ========================================== */

                return (
                  <WorkerMarketOrderCard
                    key={`market-${item.order.id}`}
                    order={
                      item.order
                    }
                    onPress={
                      handleMarketOrderPress
                    }
                  />
                );
              },
            )}
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

/* ==============================================================
   STATUS COUNT
============================================================== */

function addStatusCount(
  counts: WorkerOrderCounts,
  status: unknown,
) {
  const normalized =
    normalizeStatus(status);

  switch (normalized) {
    case "pending":
      counts.pending += 1;
      break;

    case "accepted":
    case "in-progress":
    case "in_progress":
      counts.active += 1;
      break;

    case "completed":
      counts.completed += 1;
      break;

    case "cancelled":
    case "canceled":
    case "expired":
      counts.cancelled += 1;
      break;
  }
}

/* ==============================================================
   FILTER MATCH
============================================================== */

function matchesFilter(
  status: unknown,
  filter: WorkerFilterType,
): boolean {
  const normalized =
    normalizeStatus(status);

  switch (filter) {
    case "pending":
      return (
        normalized ===
        "pending"
      );

    case "active":
      return (
        normalized ===
          "accepted" ||
        normalized ===
          "in-progress" ||
        normalized ===
          "in_progress"
      );

    case "completed":
      return (
        normalized ===
        "completed"
      );

    case "cancelled":
      return (
        normalized ===
          "cancelled" ||
        normalized ===
          "canceled" ||
        normalized ===
          "expired"
      );

    case "all":
    default:
      return true;
  }
}

/* ==============================================================
   STATUS NORMALIZATION
============================================================== */

function normalizeStatus(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .toLowerCase()
    .replace(
      /_/g,
      "-",
    );
}

/* ==============================================================
   SERVICE ORDER NORMALIZATION
============================================================== */

function normalizeWorkerOrder(
  id: string,
  data: FirestoreData,
): WorkerOrder {
  const createdAt =
    data.createdAt ??
    data.date ??
    data.requestedAt ??
    null;

  const serviceName =
    getString(
      data.serviceName,
      data.service,
      data.title,
      "Service",
    );

  const customerName =
    getString(
      data.customerName,
      data.customerDisplayName,
      "Customer",
    );

  const customerPhoto =
    getString(
      data.customerPhoto,
      data.customerImage,
      data.customerAvatar,
    );

  const location =
    getString(
      data.location,
      data.address,
      data.serviceAddress,
      "Address unavailable",
    );

  const date =
    getOrderDate(
      data.date,
      data.createdAt,
      data.requestedAt,
    );

  const status =
    normalizeWorkerStatus(
      data.status,
    );

  const serviceIcon =
    getString(
      data.serviceIcon,
      "tools",
    );

  return {
    ...data,

    id,

    serviceName,

    customerName,

    ...(customerPhoto
      ? {
          customerPhoto,
        }
      : {}),

    location,

    date,

    createdAt,

    serviceIcon:
      serviceIcon as WorkerOrder["serviceIcon"],

    ...(typeof data.serviceColor ===
    "string"
      ? {
          serviceColor:
            data.serviceColor,
        }
      : {}),

    ...(typeof data.serviceBackgroundColor ===
    "string"
      ? {
          serviceBackgroundColor:
            data.serviceBackgroundColor,
        }
      : {}),

    status,

    ...(getOptionalNumber(
      data.offerAmount,
    ) !== undefined
      ? {
          offerAmount:
            getOptionalNumber(
              data.offerAmount,
            ),
        }
      : {}),

    ...(typeof data.offerStatus ===
    "string"
      ? {
          offerStatus:
            data.offerStatus as WorkerOrder["offerStatus"],
        }
      : {}),
  } as WorkerOrder;
}

/* ==============================================================
   MARKET ORDER NORMALIZATION
============================================================== */

function normalizeWorkerMarketOrder(
  id: string,
  data: FirestoreData,
): WorkerMarketOrder {
  /* ============================================================
     PRODUCTS
     
     IMPORTANT:
     The product image/name is normally stored inside:
     
     products[0].image
     products[0].name
     
     This is the reason the Order Details page can show
     the image while the WorkerMarketOrderCard could not.
  ============================================================ */

  const products =
    Array.isArray(
      data.products,
    )
      ? data.products.filter(
          (
            product,
          ): product is Record<
            string,
            unknown
          > =>
            typeof product ===
              "object" &&
            product !== null,
        )
      : [];

  /* ============================================================
     FIRST PRODUCT
  ============================================================ */

  const firstProduct =
    products[0];

  /* ============================================================
     PRODUCT NAME
  ============================================================ */

  const productName =
    getString(
      firstProduct?.name,
      firstProduct?.productName,

      data.productName,
      data.name,
      data.title,

      "Market Order",
    );

  /* ============================================================
     PRODUCT IMAGE
     
     Priority:
     
     1. products[0].image
     2. products[0].productImage
     3. products[0].imageUrl
     4. products[0].photo
     5. old top-level productImage
     6. old top-level image
     7. old top-level imageUrl
  ============================================================ */

  const productImage =
    getString(
      firstProduct?.image,
      firstProduct?.productImage,
      firstProduct?.imageUrl,
      firstProduct?.photo,
      firstProduct?.productPhoto,

      data.productImage,
      data.image,
      data.imageUrl,
      data.productPhoto,
    );

  /* ============================================================
     CUSTOMER
  ============================================================ */

  const customerName =
    getString(
      data.customerName,
      data.customerDisplayName,
      "Customer",
    );

  const customerPhoto =
    getString(
      data.customerPhoto,
      data.customerImage,
      data.customerAvatar,
    );

  /* ============================================================
     AMOUNT
  ============================================================ */

  const amount =
    getNumber(
      data.amount,
      data.total,
      data.price,
    );

  /* ============================================================
     OFFER
  ============================================================ */

  const offerAmount =
    getOptionalNumber(
      data.offerAmount,
      data.counterOfferAmount,
    );

  /* ============================================================
     ADDRESS
  ============================================================ */

  const address =
    getString(
      data.address,
      data.deliveryAddress,
      data.location,
    );

  /* ============================================================
     DATE
  ============================================================ */

  const date =
    getOrderDate(
      data.createdAt,
      data.date,
      data.requestedAt,
    );

  /* ============================================================
     ITEM COUNT
     
     Use the real products array first.
     
     Example:
     
     Car Battery x3
     Hammer x1
     Tool x1
     Other x1
     
     = 6 items
  ============================================================ */

  const calculatedItemCount =
    products.reduce(
      (
        total,
        product,
      ) => {
        const quantity =
          getNumber(
            product.quantity,
            1,
          );

        return (
          total +
          Math.max(
            1,
            Math.floor(
              quantity,
            ),
          )
        );
      },
      0,
    );

  const itemCount =
    calculatedItemCount > 0
      ? calculatedItemCount
      : Math.max(
          1,
          Math.floor(
            getNumber(
              data.itemCount,
              data.quantity,
              1,
            ),
          ),
        );

  /* ============================================================
     CREATED AT
  ============================================================ */

  const createdAt =
    data.createdAt ??
    data.date ??
    data.requestedAt ??
    null;

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    ...data,

    id,

    amount,

    productName,

    /*
     * This is the important field for
     * WorkerMarketOrderCard.
     */
    ...(productImage
      ? {
          productImage,
        }
      : {}),

    customerName,

    ...(customerPhoto
      ? {
          customerPhoto,
        }
      : {}),

    ...(address
      ? {
          address,
        }
      : {}),

    date,

    createdAt,

    itemCount,

    status:
      normalizeWorkerMarketStatus(
        data.status,
      ),

    ...(offerAmount !==
    undefined
      ? {
          offerAmount,
        }
      : {}),

    ...(typeof data.offerStatus ===
    "string"
      ? {
          offerStatus:
            data.offerStatus as WorkerMarketOrder["offerStatus"],
        }
      : {}),
  } as WorkerMarketOrder;
}

/* ==============================================================
   SERVICE STATUS
============================================================== */

function normalizeWorkerStatus(
  value: unknown,
): WorkerOrder["status"] {
  const status =
    normalizeStatus(value);

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
   MARKET STATUS
============================================================== */

function normalizeWorkerMarketStatus(
  value: unknown,
): WorkerMarketOrder["status"] {
  const status =
    normalizeStatus(value);

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
    case "canceled":
      return "cancelled";

    case "expired":
      return "expired";

    case "pending":
    default:
      return "pending";
  }
}

/* ==============================================================
   STRING
============================================================== */

function getString(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (
      typeof value ===
      "number"
    ) {
      return String(
        value,
      );
    }
  }

  return "";
}

/* ==============================================================
   NUMBER
============================================================== */

function getNumber(
  ...values: unknown[]
): number {
  for (const value of values) {
    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return value;
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      const parsed =
        Number(value);

      if (
        Number.isFinite(
          parsed,
        )
      ) {
        return parsed;
      }
    }
  }

  return 0;
}

/* ==============================================================
   OPTIONAL NUMBER
============================================================== */

function getOptionalNumber(
  ...values: unknown[]
): number | undefined {
  for (const value of values) {
    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return value;
    }

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      const parsed =
        Number(value);

      if (
        Number.isFinite(
          parsed,
        )
      ) {
        return parsed;
      }
    }
  }

  return undefined;
}

/* ==============================================================
   TIMESTAMP
============================================================== */

function getTimestampMillis(
  value: unknown,
): number {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    const parsed =
      new Date(
        value,
      ).getTime();

    return Number.isFinite(
      parsed,
    )
      ? parsed
      : 0;
  }

  if (
    typeof value ===
      "object" &&
    value !== null
  ) {
    const timestamp =
      value as {
        toMillis?: () => number;
        toDate?: () => Date;
      };

    if (
      typeof timestamp.toMillis ===
      "function"
    ) {
      try {
        return timestamp.toMillis();
      } catch {
        return 0;
      }
    }

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      try {
        return timestamp
          .toDate()
          .getTime();
      } catch {
        return 0;
      }
    }
  }

  return 0;
}

/* ==============================================================
   DATE
============================================================== */

function getOrderDate(
  ...values: unknown[]
): string {
  for (const value of values) {
    if (
      typeof value ===
      "string"
    ) {
      const clean =
        value.trim();

      if (clean) {
        return clean;
      }
    }

    const millis =
      getTimestampMillis(
        value,
      );

    if (millis > 0) {
      return new Date(
        millis,
      ).toLocaleDateString(
        "en-NG",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        },
      );
    }
  }

  return "Date unavailable";
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

    ordersList: {
      gap: 8,
    },

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

    errorContainer: {
      marginTop: 5,
      padding: 12,
      borderRadius: 12,
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
    },

    errorTitle: {
      fontSize: 10,
      color: "#B91C1C",
    },

    errorText: {
      marginTop: 3,
      fontSize: 9,
      lineHeight: 14,
      color: "#DC2626",
    },

    authContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    authIcon: {
      width: 60,
      height: 60,
      borderRadius: 19,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    authTitle: {
      marginTop: 13,
      fontSize: 16,
      color: "#0F172A",
    },

    authText: {
      marginTop: 5,
      fontSize: 10,
      lineHeight: 15,
      color: "#64748B",
    },
  });