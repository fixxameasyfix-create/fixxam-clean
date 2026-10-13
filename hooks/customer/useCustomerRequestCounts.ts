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

export type CustomerRequestCounts = {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
};

type CustomerRequestCountsResult = {
  counts: CustomerRequestCounts;
  loading: boolean;
};

type RequestStatusItem = {
  status: string;
};

/* ============================================================
   INITIAL COUNTS
============================================================ */

function createEmptyCounts(): CustomerRequestCounts {
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

export default function useCustomerRequestCounts(): CustomerRequestCountsResult {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    requests,
    setRequests,
  ] = useState<
    RequestStatusItem[]
  >([]);

  const [
    requestsLoading,
    setRequestsLoading,
  ] = useState(false);

  /* ==========================================================
     SERVICE REQUESTS
  ========================================================== */

  useEffect(() => {
    if (!user) {
      setRequests([]);
      setRequestsLoading(
        false,
      );

      return;
    }

    setRequestsLoading(
      true,
    );

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

    const unsubscribe =
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

          setRequests(
            next,
          );

          setRequestsLoading(
            false,
          );
        },

        error => {
          if (__DEV__) {
            console.error(
              "CUSTOMER_REQUEST_COUNTS_ERROR:",
              error,
            );
          }

          setRequests([]);

          setRequestsLoading(
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
    useMemo<CustomerRequestCounts>(
      () => {
        const next =
          createEmptyCounts();

        next.total =
          requests.length;

        for (
          const request of requests
        ) {
          switch (
            normalizeStatus(
              request.status,
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
        requests,
      ],
    );

  /* ==========================================================
     LOADING
  ========================================================== */

  const loading =
    authLoading ||
    requestsLoading;

  return {
    counts,
    loading,
  };
}