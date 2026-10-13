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

/* ============================================================
   TYPES
============================================================ */

export type CustomerMarketCounts = {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

type CustomerMarketCountsResult = {
  counts: CustomerMarketCounts;
  loading: boolean;
};

type MarketOrderItem = {
  status: string;
};

/* ============================================================
   HELPERS
============================================================ */

function createEmptyCounts(): CustomerMarketCounts {
  return {
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };
}

function normalizeValue(
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

function isMarketOrder(
  data: Record<
    string,
    unknown
  >,
): boolean {
  const orderType =
    normalizeValue(
      data.orderType,
    );

  const type =
    normalizeValue(
      data.type,
    );

  return (
    orderType === "market" ||
    type === "market"
  );
}

/* ============================================================
   HOOK
============================================================ */

export default function useCustomerMarketCounts(): CustomerMarketCountsResult {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    orders,
    setOrders,
  ] = useState<
    MarketOrderItem[]
  >([]);

  const [
    ordersLoading,
    setOrdersLoading,
  ] = useState(false);

  /* ==========================================================
     MARKET ORDERS
  ========================================================== */

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(
        false,
      );

      return;
    }

    setOrdersLoading(
      true,
    );

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

    const unsubscribe =
      onSnapshot(
        marketQuery,
        snapshot => {
          const next =
            snapshot.docs
              .filter(
                document => {
                  const data =
                    document.data();

                  if (
                    data.deletedByCustomer ===
                    true
                  ) {
                    return false;
                  }

                  return isMarketOrder(
                    data,
                  );
                },
              )
              .map(
                document => ({
                  status:
                    normalizeValue(
                      document.data()
                        .status,
                    ),
                }),
              );

          setOrders(
            next,
          );

          setOrdersLoading(
            false,
          );
        },
        error => {
          if (__DEV__) {
            console.error(
              "CUSTOMER_MARKET_COUNTS_ERROR:",
              error,
            );
          }

          setOrders([]);
          setOrdersLoading(
            false,
          );
        },
      );

    return () => {
      unsubscribe();
    };
  }, [
    user,
  ]);

  /* ==========================================================
     COUNTS
  ========================================================== */

  const counts =
    useMemo<CustomerMarketCounts>(
      () => {
        const next =
          createEmptyCounts();

        next.total =
          orders.length;

        for (
          const order of orders
        ) {
          switch (
            normalizeValue(
              order.status,
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
        orders,
      ],
    );

  /* ==========================================================
     RESULT
  ========================================================== */

  const loading =
    authLoading ||
    ordersLoading;

  return {
    counts,
    loading,
  };
}