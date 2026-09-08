import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  type ListRenderItemInfo,
  StyleSheet,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

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
  AppIcon,
  AppScreen,
  AppText,
} from "@/components/ui";

import {
  Colors,
  FixxamTokens,
  WorkerColors,
} from "@/theme";

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
  WorkerMarketOrder,
  WorkerOrder,
  WorkerOrderCounts,
} from "@/types/workerOrders";

/* ==============================================================
   TYPES
============================================================== */

type FirestoreData = Record<
  string,
  unknown
>;

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
  ] =
    useState<User | null>(
      auth.currentUser,
    );

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  /* ============================================================
     FILTER
  ============================================================ */

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<WorkerFilterType>(
      "all",
    );

  /* ============================================================
     SERVICE ORDERS
  ============================================================ */

  const [
    serviceOrders,
    setServiceOrders,
  ] =
    useState<WorkerOrder[]>(
      [],
    );

  const [
    serviceLoading,
    setServiceLoading,
  ] =
    useState(false);

  const [
    serviceError,
    setServiceError,
  ] =
    useState<string | null>(
      null,
    );

  /* ============================================================
     MARKET ORDERS
  ============================================================ */

  const [
    marketOrders,
    setMarketOrders,
  ] =
    useState<
      WorkerMarketOrder[]
    >([]);

  const [
    marketLoading,
    setMarketLoading,
  ] =
    useState(false);

  const [
    marketError,
    setMarketError,
  ] =
    useState<string | null>(
      null,
    );

  /* ============================================================
     AUTH + FIRESTORE
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
        currentUser => {
          /* -----------------------------------------------
             REMOVE PREVIOUS LISTENERS
          ------------------------------------------------ */

          unsubscribeBookings?.();
          unsubscribeMarket?.();

          unsubscribeBookings =
            undefined;

          unsubscribeMarket =
            undefined;

          setAuthReady(
            true,
          );

          /* -----------------------------------------------
             RESET USER DATA
          ------------------------------------------------ */

          setServiceOrders(
            [],
          );

          setMarketOrders(
            [],
          );

          setServiceError(
            null,
          );

          setMarketError(
            null,
          );

          /* -----------------------------------------------
             SIGNED OUT
          ------------------------------------------------ */

          if (!currentUser) {
            setUser(
              null,
            );

            setServiceLoading(
              false,
            );

            setMarketLoading(
              false,
            );

            return;
          }

          /* -----------------------------------------------
             SIGNED IN
          ------------------------------------------------ */

          setUser(
            currentUser,
          );

          setServiceLoading(
            true,
          );

          setMarketLoading(
            true,
          );

          /* ==================================================
             SERVICE ORDERS
          ================================================== */

          const bookingsQuery =
            query(
              collection(
                db,
                "bookings",
              ),

              where(
                "workerId",
                "==",
                currentUser.uid,
              ),
            );

          unsubscribeBookings =
            onSnapshot(
              bookingsQuery,

              snapshot => {
                const nextOrders =
                  snapshot.docs
                    .map(document =>
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

                setServiceError(
                  null,
                );

                setServiceLoading(
                  false,
                );
              },

              listenerError => {
                console.error(
                  "WORKER_SERVICE_ORDERS_ERROR:",
                  listenerError,
                );

                setServiceLoading(
                  false,
                );

                setServiceError(
                  "Some service jobs could not be loaded.",
                );
              },
            );

          /* ==================================================
             MARKET ORDERS
          ================================================== */

          const marketQuery =
            query(
              collection(
                db,
                "orders",
              ),

              where(
                "workerId",
                "==",
                currentUser.uid,
              ),
            );

          unsubscribeMarket =
            onSnapshot(
              marketQuery,

              snapshot => {
                const nextOrders =
                  snapshot.docs
                    .map(document =>
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

                setMarketError(
                  null,
                );

                setMarketLoading(
                  false,
                );
              },

              listenerError => {
                console.error(
                  "WORKER_MARKET_ORDERS_ERROR:",
                  listenerError,
                );

                setMarketLoading(
                  false,
                );

                setMarketError(
                  "Some market orders could not be loaded.",
                );
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
     LOADING
  ============================================================ */

  const loading =
    serviceLoading ||
    marketLoading;

  /* ============================================================
     ERROR
  ============================================================ */

  const error =
    useMemo(() => {
      if (
        serviceError &&
        marketError
      ) {
        return "Unable to load your jobs. Please try again.";
      }

      return (
        serviceError ??
        marketError
      );
    }, [
      marketError,
      serviceError,
    ]);

  /* ============================================================
     COUNTS
  ============================================================ */

  const counts =
    useMemo<WorkerOrderCounts>(
      () => {
        const result: WorkerOrderCounts =
          {
            all: 0,

            pending: 0,

            active: 0,

            completed: 0,

            cancelled: 0,
          };

        for (
          const order of
          serviceOrders
        ) {
          addStatusCount(
            result,
            order.status,
          );
        }

        for (
          const order of
          marketOrders
        ) {
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
        marketOrders,
        serviceOrders,
      ],
    );

  /* ============================================================
     FILTERED SERVICE ORDERS
  ============================================================ */

  const filteredServiceOrders =
    useMemo(
      () =>
        serviceOrders.filter(
          order =>
            matchesFilter(
              order.status,
              selectedFilter,
            ),
        ),
      [
        selectedFilter,
        serviceOrders,
      ],
    );

  /* ============================================================
     FILTERED MARKET ORDERS
  ============================================================ */

  const filteredMarketOrders =
    useMemo(
      () =>
        marketOrders.filter(
          order =>
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
     COMBINED ORDERS
  ============================================================ */

  const combinedOrders =
    useMemo<CombinedOrder[]>(
      () => {
        const serviceItems: CombinedOrder[] =
          filteredServiceOrders.map(
            order => ({
              type:
                "service",

              order,

              createdAt:
                getTimestampMillis(
                  order.createdAt,
                ),
            }),
          );

        const marketItems: CombinedOrder[] =
          filteredMarketOrders.map(
            order => ({
              type:
                "market",

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
          (
            a,
            b,
          ) =>
            b.createdAt -
            a.createdAt,
        );
      },
      [
        filteredMarketOrders,
        filteredServiceOrders,
      ],
    );

  /* ============================================================
     TOTAL
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

     Existing screen has no verified route/action for Manage.
     Preserve behavior instead of inventing navigation.
  ============================================================ */

  const handleManage =
    useCallback(() => {
      // Intentionally left without navigation.
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
     SERVICE ORDER
  ============================================================ */

  const handleServiceOrderPress =
    useCallback(
      (
        order: WorkerOrder,
      ) => {
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
     MARKET ORDER
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
     RENDER ORDER
  ============================================================ */

  const renderOrder =
    useCallback(
      ({
        item,
      }: ListRenderItemInfo<CombinedOrder>) => {
        if (
          item.type ===
          "service"
        ) {
          return (
            <WorkerServiceOrderCard
              order={
                item.order
              }
              onPress={
                handleServiceOrderPress
              }
            />
          );
        }

        return (
          <WorkerMarketOrderCard
            order={
              item.order
            }
            onPress={
              handleMarketOrderPress
            }
          />
        );
      },
      [
        handleMarketOrderPress,
        handleServiceOrderPress,
      ],
    );

  /* ============================================================
     AUTH RESOLVING
  ============================================================ */

  if (!authReady) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <ActivityIndicator
          size="large"
          color={
            WorkerColors.primary
          }
        />

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.stateText
          }
        >
          Loading your account...
        </AppText>
      </AppScreen>
    );
  }

  /* ============================================================
     NOT AUTHENTICATED
  ============================================================ */

  if (!user) {
    return (
      <AppScreen
        role="worker"
        contentContainerStyle={
          styles.stateScreen
        }
      >
        <View
          style={
            styles.authIcon
          }
        >
          <AppIcon
            name="profile"
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
            styles.authTitle
          }
        >
          Sign in required
        </AppText>

        <AppText
          variant="body"
          tone="secondary"
          center
          style={
            styles.authText
          }
        >
          Please sign in to view your jobs.
        </AppText>
      </AppScreen>
    );
  }

  /* ============================================================
     LIST HEADER
  ============================================================ */

  const listHeader =
    (
      <>
        <WorkerOrdersHeader
          onBack={
            handleBack
          }
          onManage={
            handleManage
          }
        />

        <WorkerOrdersOverview
          counts={
            counts
          }
          onManage={
            handleManage
          }
        />

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

        {error ? (
          <View
            style={
              styles.errorContainer
            }
          >
            <View
              style={
                styles.errorHeader
              }
            >
              <AppIcon
                name="error"
                size="sm"
                color={
                  Colors.error
                }
              />

              <AppText
                variant="bodyMedium"
                weight="bold"
                style={
                  styles.errorTitle
                }
              >
                Some jobs could not be loaded
              </AppText>
            </View>

            <AppText
              variant="caption"
              style={
                styles.errorText
              }
            >
              {error}
            </AppText>
          </View>
        ) : null}
      </>
    );

  /* ============================================================
     SCREEN
  ============================================================ */

  return (
    <AppScreen
      role="worker"
      contentContainerStyle={
        styles.screen
      }
    >
      <FlatList
        data={
          loading
            ? []
            : combinedOrders
        }
        renderItem={
          renderOrder
        }
        keyExtractor={
          item =>
            `${item.type}-${item.order.id}`
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
        ListHeaderComponent={
          listHeader
        }
        ItemSeparatorComponent={
          OrderSeparator
        }
        ListEmptyComponent={
          loading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  WorkerColors.primary
                }
              />

              <AppText
                variant="body"
                tone="secondary"
                center
                style={
                  styles.loadingText
                }
              >
                Loading your jobs...
              </AppText>
            </View>
          ) : error ? null : (
            <WorkerOrdersEmpty
              filter={
                selectedFilter
              }
            />
          )
        }
      />
    </AppScreen>
  );
}

/* ==============================================================
   SEPARATOR
============================================================== */

function OrderSeparator() {
  return (
    <View
      style={
        styles.orderSeparator
      }
    />
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
    normalizeStatus(
      status,
    );

  switch (normalized) {
    case "pending":
      counts.pending +=
        1;
      break;

    case "accepted":
    case "in-progress":
      counts.active +=
        1;
      break;

    case "completed":
      counts.completed +=
        1;
      break;

    case "cancelled":
    case "canceled":
    case "expired":
      counts.cancelled +=
        1;
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
    normalizeStatus(
      status,
    );

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
          "in-progress"
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

  const serviceIcon =
    getString(
      data.serviceIcon,
      "tools",
    );

  const offerAmount =
    getOptionalNumber(
      data.offerAmount,
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

    status:
      normalizeWorkerStatus(
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
    normalizeStatus(
      value,
    );

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
    normalizeStatus(
      value,
    );

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
  for (
    const value of
    values
  ) {
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

function parseSafeNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value ===
      "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    const parsed =
      Number(
        value
          .replace(
            /[₦,\s]/g,
            "",
          )
          .trim(),
      );

    if (
      Number.isFinite(
        parsed,
      )
    ) {
      return parsed;
    }
  }

  return undefined;
}

function getNumber(
  ...values: unknown[]
): number {
  for (
    const value of
    values
  ) {
    const parsed =
      parseSafeNumber(
        value,
      );

    if (
      parsed !==
      undefined
    ) {
      return parsed;
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
  for (
    const value of
    values
  ) {
    const parsed =
      parseSafeNumber(
        value,
      );

    if (
      parsed !==
      undefined
    ) {
      return parsed;
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
    Number.isFinite(value)
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
  for (
    const value of
    values
  ) {
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

    if (
      millis > 0
    ) {
      return new Date(
        millis,
      ).toLocaleDateString(
        "en-NG",
        {
          day:
            "numeric",

          month:
            "short",

          year:
            "numeric",
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
    /* ==========================================================
       SCREEN
    ========================================================== */

    screen: {
      flex: 1,

      width: "100%",

      paddingHorizontal: 0,

      paddingTop: 0,

      paddingBottom: 0,

      backgroundColor:
        Colors.background,
    },

    content: {
      flexGrow: 1,

      paddingHorizontal:
        FixxamTokens.spacing.lg,

      paddingTop:
        FixxamTokens.spacing.sm,

      paddingBottom:
        FixxamTokens.spacing.xxl,
    },

    orderSeparator: {
      height:
        FixxamTokens.spacing.sm,
    },

    /* ==========================================================
       LOADING
    ========================================================== */

    loadingContainer: {
      minHeight: 220,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      marginTop:
        FixxamTokens.spacing.sm,

      color:
        Colors.textSecondary,
    },

    /* ==========================================================
       ERROR
    ========================================================== */

    errorContainer: {
      marginTop:
        FixxamTokens.spacing.sm,

      marginBottom:
        FixxamTokens.spacing.md,

      padding:
        FixxamTokens.spacing.md,

      borderWidth: 1,

      borderColor:
        Colors.error,

      borderRadius:
        FixxamTokens.radius.md,

      backgroundColor:
        Colors.errorSoft,
    },

    errorHeader: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap:
        FixxamTokens.spacing.sm,
    },

    errorTitle: {
      flex: 1,

      color:
        Colors.error,
    },

    errorText: {
      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 18,

      color:
        Colors.error,
    },

    /* ==========================================================
       AUTH / INITIAL STATE
    ========================================================== */

    stateScreen: {
      flex: 1,

      paddingHorizontal:
        FixxamTokens.spacing.xl,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        Colors.background,
    },

    stateText: {
      marginTop:
        FixxamTokens.spacing.md,

      color:
        Colors.textSecondary,
    },

    authIcon: {
      width:
        FixxamTokens.size.avatarXl,

      height:
        FixxamTokens.size.avatarXl,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        FixxamTokens.radius.xl,

      backgroundColor:
        WorkerColors.primarySoft,
    },

    authTitle: {
      marginTop:
        FixxamTokens.spacing.lg,

      color:
        Colors.textPrimary,
    },

    authText: {
      maxWidth: 300,

      marginTop:
        FixxamTokens.spacing.sm,

      lineHeight: 20,

      color:
        Colors.textSecondary,
    },
  });