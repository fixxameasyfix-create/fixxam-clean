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
  auth,
  db,
} from "@/firebase/config";

import {
  getOrderTimestamp,
  mapWorkerMarketOrder,
  mapWorkerServiceOrder,
} from "@/utils/orders/workerOrderUtils";

import type {
  WorkerMarketOrder,
  WorkerServiceOrder,
} from "@/types/workerOrders";

/* ============================================================
   TYPES
============================================================ */

export type WorkerOrderFilter =
  | "all"
  | "pending"
  | "active"
  | "completed"
  | "cancelled";

export type WorkerOrder =
  | WorkerServiceOrder
  | WorkerMarketOrder;

export type WorkerOrderCounts = {
  all: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

type UseWorkerOrdersResult = {
  orders: WorkerOrder[];
  serviceOrders: WorkerServiceOrder[];
  marketOrders: WorkerMarketOrder[];
  counts: WorkerOrderCounts;
  total: number;
  loading: boolean;
  error: string | null;
};

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerOrders(): UseWorkerOrdersResult {
  const [serviceOrders, setServiceOrders] =
    useState<WorkerServiceOrder[]>([]);

  const [marketOrders, setMarketOrders] =
    useState<WorkerMarketOrder[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  /* ==========================================================
     FIREBASE REALTIME
  ========================================================== */

  useEffect(() => {
    const workerId =
      auth.currentUser?.uid;

    if (!workerId) {
      setServiceOrders([]);
      setMarketOrders([]);
      setLoading(false);
      setError(
        "Please sign in to view your orders.",
      );

      return;
    }

    setLoading(true);
    setError(null);

    let bookingsReady = false;
    let marketReady = false;

    const updateLoading = () => {
      if (
        bookingsReady &&
        marketReady
      ) {
        setLoading(false);
      }
    };

    /* ========================================================
       SERVICE BOOKINGS
    ======================================================== */

    const bookingsQuery = query(
      collection(
        db,
        "bookings",
      ),
      where(
        "workerId",
        "==",
        workerId,
      ),
    );

    const unsubscribeBookings =
      onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const nextOrders =
            snapshot.docs
              .map((document) =>
                mapWorkerServiceOrder(
                  document.id,
                  document.data(),
                ),
              )
              .filter(
                (
                  order: WorkerServiceOrder,
                ) =>
                  order.deletedByWorker !==
                  true,
              )
              .sort(
                (
                  a: WorkerServiceOrder,
                  b: WorkerServiceOrder,
                ) =>
                  getOrderTimestamp(
                    b.createdAt,
                  ) -
                  getOrderTimestamp(
                    a.createdAt,
                  ),
              );

          setServiceOrders(
            nextOrders,
          );

          bookingsReady = true;
          updateLoading();
        },
        (listenerError) => {
          console.error(
            "WORKER_SERVICE_ORDERS_ERROR",
            listenerError,
          );

          setError(
            "Unable to load service orders.",
          );

          bookingsReady = true;
          updateLoading();
        },
      );

    /* ========================================================
       MARKET ORDERS
    ======================================================== */

    const marketOrdersQuery = query(
      collection(
        db,
        "orders",
      ),
      where(
        "workerId",
        "==",
        workerId,
      ),
    );

    const unsubscribeMarket =
      onSnapshot(
        marketOrdersQuery,
        (snapshot) => {
          const nextOrders =
            snapshot.docs
              .map((document) =>
                mapWorkerMarketOrder(
                  document.id,
                  document.data(),
                ),
              )
              .filter(
                (
                  order: WorkerMarketOrder,
                ) =>
                  order.deletedByWorker !==
                  true,
              )
              .sort(
                (
                  a: WorkerMarketOrder,
                  b: WorkerMarketOrder,
                ) =>
                  getOrderTimestamp(
                    b.createdAt,
                  ) -
                  getOrderTimestamp(
                    a.createdAt,
                  ),
              );

          setMarketOrders(
            nextOrders,
          );

          marketReady = true;
          updateLoading();
        },
        (listenerError) => {
          console.error(
            "WORKER_MARKET_ORDERS_ERROR",
            listenerError,
          );

          setError(
            "Unable to load market orders.",
          );

          marketReady = true;
          updateLoading();
        },
      );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      unsubscribeBookings();
      unsubscribeMarket();
    };
  }, []);

  /* ==========================================================
     ALL ORDERS
  ========================================================== */

  const orders = useMemo<WorkerOrder[]>(
    () => {
      return [
        ...serviceOrders,
        ...marketOrders,
      ].sort(
        (
          a: WorkerOrder,
          b: WorkerOrder,
        ) =>
          getOrderTimestamp(
            b.createdAt,
          ) -
          getOrderTimestamp(
            a.createdAt,
          ),
      );
    },
    [
      serviceOrders,
      marketOrders,
    ],
  );

  /* ==========================================================
     COUNTS
  ========================================================== */

  const counts =
    useMemo<WorkerOrderCounts>(
      () => {
        const result: WorkerOrderCounts =
          {
            all: orders.length,
            pending: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
          };

        for (
          const order of orders
        ) {
          switch (
            order.status
          ) {
            case "pending":
              result.pending += 1;
              break;

            case "accepted":
            case "in-progress":
              result.active += 1;
              break;

            case "completed":
              result.completed += 1;
              break;

            case "cancelled":
            case "expired":
              result.cancelled += 1;
              break;

            default:
              break;
          }
        }

        return result;
      },
      [orders],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    orders,
    serviceOrders,
    marketOrders,
    counts,
    total: orders.length,
    loading,
    error,
  };
}