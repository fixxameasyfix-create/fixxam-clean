import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

import {
  useAuth,
} from "@/hooks/useAuth";

import {
  subscribeToCustomerShopRequests,
} from "@/services/shopRequestService";

/* ============================================================
   TYPES
============================================================ */

type CustomerOrderCounts = {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

type CustomerOrderCountsResult = {
  counts: CustomerOrderCounts;
  loading: boolean;
};

type OrderStatusItem = {
  status: string;
};

/* ============================================================
   INITIAL COUNTS
============================================================ */

function createEmptyCounts(): CustomerOrderCounts {
  return {
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };
}

/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(
      /[_\s]+/g,
      "-",
    );
}

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerOrderCounts(): CustomerOrderCountsResult {
  const {
    user,
    loading: authLoading,
  } =
    useAuth();

  const [
    serviceOrders,
    setServiceOrders,
  ] =
    useState<OrderStatusItem[]>(
      [],
    );

  const [
    marketOrders,
    setMarketOrders,
  ] =
    useState<OrderStatusItem[]>(
      [],
    );

  const [
    shopRequests,
    setShopRequests,
  ] =
    useState<OrderStatusItem[]>(
      [],
    );

  const [
    serviceLoading,
    setServiceLoading,
  ] =
    useState(false);

  const [
    marketLoading,
    setMarketLoading,
  ] =
    useState(false);

  const [
    shopLoading,
    setShopLoading,
  ] =
    useState(false);

  /* ==========================================================
     REALTIME SOURCES
  ========================================================== */

  useEffect(() => {
    if (!user) {
      setServiceOrders([]);
      setMarketOrders([]);
      setShopRequests([]);

      setServiceLoading(false);
      setMarketLoading(false);
      setShopLoading(false);

      return;
    }

    setServiceLoading(true);
    setMarketLoading(true);
    setShopLoading(true);

    /* ========================================================
       SERVICE BOOKINGS
    ======================================================== */

    const bookingsQuery =
      query(
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
        snapshot => {
          const next =
            snapshot.docs
              .filter(
                document =>
                  document.data()
                    .deletedByCustomer !==
                  true,
              )
              .map(
                document => ({
                  status:
                    normalizeStatus(
                      document.data()
                        .status,
                    ),
                }),
              );

          setServiceOrders(
            next,
          );

          setServiceLoading(
            false,
          );
        },
        error => {
          console.error(
            "CUSTOMER_ORDER_COUNTS_BOOKINGS_ERROR:",
            error,
          );

          setServiceOrders(
            [],
          );

          setServiceLoading(
            false,
          );
        },
      );

    /* ========================================================
       MARKET ORDERS
    ======================================================== */

    const marketQuery =
      query(
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
        snapshot => {
          const next =
            snapshot.docs
              .filter(
                document =>
                  document.data()
                    .deletedByCustomer !==
                  true,
              )
              .map(
                document => ({
                  status:
                    normalizeStatus(
                      document.data()
                        .status,
                    ),
                }),
              );

          setMarketOrders(
            next,
          );

          setMarketLoading(
            false,
          );
        },
        error => {
          console.error(
            "CUSTOMER_ORDER_COUNTS_MARKET_ERROR:",
            error,
          );

          setMarketOrders(
            [],
          );

          setMarketLoading(
            false,
          );
        },
      );

    /* ========================================================
       SHOP REQUESTS
    ======================================================== */

    const unsubscribeShopRequests =
      subscribeToCustomerShopRequests(
        user.uid,
        requests => {
          setShopRequests(
            requests.map(
              request => ({
                status:
                  normalizeStatus(
                    request.status,
                  ),
              }),
            ),
          );

          setShopLoading(
            false,
          );
        },
        error => {
          console.error(
            "CUSTOMER_ORDER_COUNTS_SHOP_ERROR:",
            error,
          );

          setShopRequests(
            [],
          );

          setShopLoading(
            false,
          );
        },
      );

    return () => {
      unsubscribeBookings();
      unsubscribeMarket();
      unsubscribeShopRequests();
    };
  }, [
    user,
  ]);

  /* ==========================================================
     COUNTS
  ========================================================== */

  const counts =
    useMemo<CustomerOrderCounts>(
      () => {
        const next =
          createEmptyCounts();

        const statuses = [
          ...serviceOrders,
          ...marketOrders,
          ...shopRequests,
        ];

        /*
         * IMPORTANT:
         *
         * Total means every visible customer order,
         * exactly like the "All" category.
         */
        next.total =
          statuses.length;

        for (
          const item of
          statuses
        ) {
          switch (
            normalizeStatus(
              item.status,
            )
          ) {
            case "pending":
              next.pending += 1;
              break;

            case "accepted":
            case "in-progress":
            case "on-the-way":
              next.active += 1;
              break;

            case "completed":
            case "delivered":
              next.completed += 1;
              break;

            case "cancelled":
            case "canceled":
            case "expired":
            case "declined":
              next.cancelled += 1;
              break;

            default:
              break;
          }
        }

        return next;
      },
      [
        marketOrders,
        serviceOrders,
        shopRequests,
      ],
    );

  const loading =
    authLoading ||
    serviceLoading ||
    marketLoading ||
    shopLoading;

  return {
    counts,
    loading,
  };
}