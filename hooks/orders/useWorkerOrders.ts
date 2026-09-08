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
  type FirestoreError,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

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
   HELPERS
============================================================ */

function getFirebaseErrorMessage(
  error: unknown,
): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  ) {
    const firebaseError =
      error as FirestoreError;

    return `${firebaseError.code}: ${firebaseError.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Firestore error.";
}

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
    let mounted = true;

    let unsubscribeBookings:
      | (() => void)
      | undefined;

    let unsubscribeMarket:
      | (() => void)
      | undefined;

    let bookingsReady = false;
    let marketReady = false;

    const updateLoading = () => {
      if (
        mounted &&
        bookingsReady &&
        marketReady
      ) {
        setLoading(false);
      }
    };

    const handleUser = (
      user: User | null,
    ) => {
      if (!mounted) {
        return;
      }

      /* ======================================================
         NOT SIGNED IN
      ====================================================== */

      if (!user) {
        setServiceOrders([]);
        setMarketOrders([]);
        setLoading(false);
        setError(
          "Please sign in to view your orders.",
        );

        return;
      }

      const workerId =
        user.uid.trim();

      if (!workerId) {
        setServiceOrders([]);
        setMarketOrders([]);
        setLoading(false);
        setError(
          "Unable to identify the worker account.",
        );

        return;
      }

      /* ======================================================
         RESET
      ====================================================== */

      setLoading(true);
      setError(null);

      bookingsReady = false;
      marketReady = false;

      /* ======================================================
         SERVICE BOOKINGS
      ====================================================== */

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

      unsubscribeBookings =
        onSnapshot(
          bookingsQuery,

          (snapshot) => {
            if (!mounted) {
              return;
            }

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
            if (!mounted) {
              return;
            }

            console.error(
              "WORKER_SERVICE_ORDERS_ERROR",
              {
                code:
                  listenerError.code,
                message:
                  listenerError.message,
              },
            );

            setServiceOrders([]);

            setError(
              `Unable to load service orders: ${getFirebaseErrorMessage(
                listenerError,
              )}`,
            );

            bookingsReady = true;
            updateLoading();
          },
        );

      /* ======================================================
         MARKET ORDERS
      ====================================================== */

      const marketOrdersQuery =
        query(
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

      unsubscribeMarket =
        onSnapshot(
          marketOrdersQuery,

          (snapshot) => {
            if (!mounted) {
              return;
            }

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
            if (!mounted) {
              return;
            }

            console.error(
              "WORKER_MARKET_ORDERS_ERROR",
              {
                code:
                  listenerError.code,
                message:
                  listenerError.message,
              },
            );

            setMarketOrders([]);

            setError(
              `Unable to load market orders: ${getFirebaseErrorMessage(
                listenerError,
              )}`,
            );

            marketReady = true;
            updateLoading();
          },
        );
    };

    /* ========================================================
       AUTH STATE
    ======================================================== */

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        handleUser,
      );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
  mounted = false;

  unsubscribeAuth();

  unsubscribeBookings?.();

  unsubscribeMarket?.();
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