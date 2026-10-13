import {
  useEffect,
  useState,
} from "react";

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
  auth,
  db,
} from "@/firebase/config";

import {
  subscribeToWorkerShopRequests,
} from "@/services/shopRequestService";

import type {
  WorkerOrderCounts,
} from "@/types/workerOrders";

/* ============================================================
   TYPES
============================================================ */

type SourceCounts = {
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  all: number;
};

type WorkerOrderCountsResult = {
  counts: WorkerOrderCounts;
  loading: boolean;
};

/* ============================================================
   INITIAL COUNTS
============================================================ */

function createEmptyCounts(): WorkerOrderCounts {
  return {
    all: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };
}

function createEmptySourceCounts(): SourceCounts {
  return {
    all: 0,
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
   SERVICE STATUS

   This intentionally matches WorkerOrdersScreen behavior:
   unknown service statuses fall back to pending.
============================================================ */

function normalizeServiceStatus(
  value: unknown,
): string {
  const status =
    normalizeStatus(
      value,
    );

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
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

/* ============================================================
   MARKET STATUS

   This intentionally matches WorkerOrdersScreen behavior:
   unknown market statuses fall back to pending.
============================================================ */

function normalizeMarketStatus(
  value: unknown,
): string {
  const status =
    normalizeStatus(
      value,
    );

  switch (status) {
    case "accepted":
      return "accepted";

    case "in-progress":
    case "on-the-way":
      return "in-progress";

    case "completed":
    case "delivered":
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

/* ============================================================
   SOFT DELETE
============================================================ */

function isDeletedByWorker(
  value: unknown,
): boolean {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  return (
    data.deletedByWorker ===
    true
  );
}

/* ============================================================
   ADD STATUS
============================================================ */

function addStatusCount(
  counts: SourceCounts,
  status: unknown,
) {
  const normalized =
    normalizeStatus(
      status,
    );

  switch (normalized) {
    case "pending":
      counts.pending += 1;
      break;

    case "accepted":
    case "in-progress":
    case "on-the-way":
      counts.active += 1;
      break;

    case "completed":
    case "delivered":
      counts.completed += 1;
      break;

    case "cancelled":
    case "canceled":
    case "expired":
    case "declined":
      counts.cancelled += 1;
      break;
  }

  counts.all += 1;
}

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerOrderCounts(): WorkerOrderCountsResult {
  const [
    counts,
    setCounts,
  ] =
    useState<WorkerOrderCounts>(
      createEmptyCounts,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    let unsubscribeBookings:
      | (() => void)
      | undefined;

    let unsubscribeMarket:
      | (() => void)
      | undefined;

    let unsubscribeShopRequests:
      | (() => void)
      | undefined;

    let serviceCounts =
      createEmptySourceCounts();

    let marketCounts =
      createEmptySourceCounts();

    let shopCounts =
      createEmptySourceCounts();

    let serviceReady =
      false;

    let marketReady =
      false;

    let shopReady =
      false;

    const publishCounts =
      () => {
        setCounts({
          all:
            serviceCounts.all +
            marketCounts.all +
            shopCounts.all,

          pending:
            serviceCounts.pending +
            marketCounts.pending +
            shopCounts.pending,

          active:
            serviceCounts.active +
            marketCounts.active +
            shopCounts.active,

          completed:
            serviceCounts.completed +
            marketCounts.completed +
            shopCounts.completed,

          cancelled:
            serviceCounts.cancelled +
            marketCounts.cancelled +
            shopCounts.cancelled,
        });

        if (
          serviceReady &&
          marketReady &&
          shopReady
        ) {
          setLoading(false);
        }
      };

    const reset =
      () => {
        serviceCounts =
          createEmptySourceCounts();

        marketCounts =
          createEmptySourceCounts();

        shopCounts =
          createEmptySourceCounts();

        serviceReady =
          false;

        marketReady =
          false;

        shopReady =
          false;

        setCounts(
          createEmptyCounts(),
        );

        setLoading(true);
      };

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          unsubscribeBookings?.();
          unsubscribeMarket?.();
          unsubscribeShopRequests?.();

          unsubscribeBookings =
            undefined;

          unsubscribeMarket =
            undefined;

          unsubscribeShopRequests =
            undefined;

          reset();

          if (!user) {
            serviceReady =
              true;

            marketReady =
              true;

            shopReady =
              true;

            publishCounts();

            return;
          }

          /* ==================================================
             SERVICE BOOKINGS
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
                user.uid,
              ),
            );

          unsubscribeBookings =
            onSnapshot(
              bookingsQuery,
              snapshot => {
                const next =
                  createEmptySourceCounts();

                for (
                  const document of
                  snapshot.docs
                ) {
                  const data =
                    document.data();

                  if (
                    isDeletedByWorker(
                      data,
                    )
                  ) {
                    continue;
                  }

                  addStatusCount(
                    next,
                    normalizeServiceStatus(
                      data.status,
                    ),
                  );
                }

                serviceCounts =
                  next;

                serviceReady =
                  true;

                publishCounts();
              },
              error => {
                if (__DEV__) {
                  console.error(
                    "WORKER_ORDER_COUNTS_SERVICE_ERROR:",
                    error,
                  );
                }

                serviceCounts =
                  createEmptySourceCounts();

                serviceReady =
                  true;

                publishCounts();
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
                user.uid,
              ),
            );

          unsubscribeMarket =
            onSnapshot(
              marketQuery,
              snapshot => {
                const next =
                  createEmptySourceCounts();

                for (
                  const document of
                  snapshot.docs
                ) {
                  const data =
                    document.data();

                  if (
                    isDeletedByWorker(
                      data,
                    )
                  ) {
                    continue;
                  }

                  addStatusCount(
                    next,
                    normalizeMarketStatus(
                      data.status,
                    ),
                  );
                }

                marketCounts =
                  next;

                marketReady =
                  true;

                publishCounts();
              },
              error => {
                if (__DEV__) {
                  console.error(
                    "WORKER_ORDER_COUNTS_MARKET_ERROR:",
                    error,
                  );
                }

                marketCounts =
                  createEmptySourceCounts();

                marketReady =
                  true;

                publishCounts();
              },
            );

          /* ==================================================
             SHOP REQUESTS
          ================================================== */

          unsubscribeShopRequests =
            subscribeToWorkerShopRequests(
              user.uid,
              requests => {
                const next =
                  createEmptySourceCounts();

                for (
                  const request of
                  requests
                ) {
                  if (
                    isDeletedByWorker(
                      request,
                    )
                  ) {
                    continue;
                  }

                  addStatusCount(
                    next,
                    request.status,
                  );
                }

                shopCounts =
                  next;

                shopReady =
                  true;

                publishCounts();
              },
              error => {
                if (__DEV__) {
                  console.error(
                    "WORKER_ORDER_COUNTS_SHOP_ERROR:",
                    error,
                  );
                }

                shopCounts =
                  createEmptySourceCounts();

                shopReady =
                  true;

                publishCounts();
              },
            );
        },
      );

    return () => {
      unsubscribeBookings?.();
      unsubscribeMarket?.();
      unsubscribeShopRequests?.();
      unsubscribeAuth();
    };
  }, []);

  return {
    counts,
    loading,
  };
}