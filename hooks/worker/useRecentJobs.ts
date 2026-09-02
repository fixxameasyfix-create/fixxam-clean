import {
  collection,
  limit,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

export type RecentJobStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "canceled"
  | "expired"
  | "unknown";

export type RecentJob = {
  id: string;
  type?: "booking" | "market";
  [key: string]: unknown;
};

export type RecentJobsState = {
  jobs: RecentJob[];
  loading: boolean;
  error: Error | null;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_RECENT_JOBS = 2;

const BOOKING_READ_LIMIT = 25;

const MARKET_ORDER_READ_LIMIT = 25;

const EXCLUDED_STATUSES =
  new Set<RecentJobStatus>([
    "completed",
    "cancelled",
    "canceled",
    "expired",
  ]);

/* ==============================================================
   STRING
============================================================== */

function getString(
  value: unknown,
): string {
  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  return "";
}

/* ==============================================================
   STATUS
============================================================== */

function normalizeStatus(
  value: unknown,
): RecentJobStatus {
  const status =
    getString(value)
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");

  switch (status) {
    case "pending":
      return "pending";

    case "accepted":
      return "accepted";

    case "in-progress":
      return "in-progress";

    case "completed":
      return "completed";

    case "cancelled":
      return "cancelled";

    case "canceled":
      return "canceled";

    case "expired":
      return "expired";

    default:
      return "unknown";
  }
}

/* ==============================================================
   ACTIVE JOB
============================================================== */

function isActiveJob(
  job: RecentJob,
): boolean {
  const status =
    normalizeStatus(
      job.status,
    );

  return !EXCLUDED_STATUSES.has(
    status,
  );
}

/* ==============================================================
   TIMESTAMP
============================================================== */

export function getTimestamp(
  value: unknown,
): number {
  if (!value) {
    return 0;
  }

  if (
    value instanceof Date
  ) {
    const time =
      value.getTime();

    return Number.isFinite(
      time,
    )
      ? time
      : 0;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value < 10_000_000_000
      ? value * 1000
      : value;
  }

  if (
    typeof value === "string"
  ) {
    const time =
      new Date(
        value,
      ).getTime();

    return Number.isFinite(
      time,
    )
      ? time
      : 0;
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    const timestamp =
      value as {
        toDate?: unknown;
        seconds?: unknown;
      };

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      try {
        const date =
          timestamp.toDate();

        if (
          date instanceof Date
        ) {
          const time =
            date.getTime();

          return Number.isFinite(
            time,
          )
            ? time
            : 0;
        }
      } catch {
        return 0;
      }
    }

    if (
      typeof timestamp.seconds ===
        "number" &&
      Number.isFinite(
        timestamp.seconds,
      )
    ) {
      return (
        timestamp.seconds *
        1000
      );
    }
  }

  return 0;
}

/* ==============================================================
   DOCUMENT
============================================================== */

function mapDocument(
  snapshot:
    QueryDocumentSnapshot<DocumentData>,
): RecentJob {
  return {
    ...(snapshot.data() as Record<
      string,
      unknown
    >),

    id: snapshot.id,
  };
}

/* ==============================================================
   SORT
============================================================== */

function sortNewestFirst(
  jobs: RecentJob[],
): RecentJob[] {
  return [...jobs].sort(
    (a, b) => {
      const aTime =
        getTimestamp(
          a.createdAt ??
            a.date ??
            a.updatedAt,
        );

      const bTime =
        getTimestamp(
          b.createdAt ??
            b.date ??
            b.updatedAt,
        );

      return (
        bTime -
        aTime
      );
    },
  );
}

/* ==============================================================
   UNIQUE
============================================================== */

function uniqueJobs(
  jobs: RecentJob[],
): RecentJob[] {
  const map =
    new Map<
      string,
      RecentJob
    >();

  for (const job of jobs) {
    if (!job.id) {
      continue;
    }

    map.set(
      `${job.type ?? "unknown"}-${job.id}`,
      job,
    );
  }

  return Array.from(
    map.values(),
  );
}

/* ==============================================================
   HOOK
============================================================== */

export function useRecentJobs(): RecentJobsState {
  const [
    bookingJobs,
    setBookingJobs,
  ] =
    useState<RecentJob[]>(
      [],
    );

  const [
    marketJobs,
    setMarketJobs,
  ] =
    useState<RecentJob[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<Error | null>(
      null,
    );

  useEffect(() => {
    const workerId =
      auth.currentUser?.uid ?? "";

    if (!workerId) {
      setBookingJobs([]);
      setMarketJobs([]);
      setLoading(false);
      setError(null);

      return;
    }

    let mounted = true;

    let bookingsLoaded = false;
    let marketOrdersLoaded = false;

    const finishLoading =
      () => {
        if (!mounted) {
          return;
        }

        if (
          bookingsLoaded &&
          marketOrdersLoaded
        ) {
          setLoading(false);
        }
      };

    setLoading(true);
    setError(null);

    /* ==========================================================
       BOOKINGS
    ========================================================== */

    const bookingsQuery =
      query(
        collection(
          db,
          "bookings",
        ),

        where(
          "workerId",
          "==",
          workerId,
        ),

        limit(
          BOOKING_READ_LIMIT,
        ),
      );

    const unsubscribeBookings =
      onSnapshot(
        bookingsQuery,

        (snapshot) => {
          if (!mounted) {
            return;
          }

          const bookings =
            snapshot.docs
              .map(
                mapDocument,
              )
              .map(
                (job) => ({
                  ...job,
                  type: "booking" as const,
                }),
              )
              .filter(
                isActiveJob,
              );

          setBookingJobs(
            bookings,
          );

          bookingsLoaded = true;

          finishLoading();
        },

        (firebaseError) => {
          if (!mounted) {
            return;
          }

          console.error(
            "FIXXAM_RECENT_BOOKINGS_ERROR:",
            firebaseError,
          );

          setBookingJobs([]);

          setError(
            firebaseError,
          );

          bookingsLoaded = true;

          finishLoading();
        },
      );

    /* ==========================================================
       MARKET ORDERS
    ========================================================== */

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

        limit(
          MARKET_ORDER_READ_LIMIT,
        ),
      );

    const unsubscribeMarketOrders =
      onSnapshot(
        marketOrdersQuery,

        (snapshot) => {
          if (!mounted) {
            return;
          }

          const marketOrders =
            snapshot.docs
              .map(
                mapDocument,
              )
              .map(
                (job) => ({
                  ...job,
                  type: "market" as const,
                }),
              )
              .filter(
                isActiveJob,
              );

          setMarketJobs(
            marketOrders,
          );

          marketOrdersLoaded =
            true;

          finishLoading();
        },

        (firebaseError) => {
          if (!mounted) {
            return;
          }

          console.error(
            "FIXXAM_RECENT_MARKET_ORDERS_ERROR:",
            firebaseError,
          );

          setMarketJobs([]);

          setError(
            firebaseError,
          );

          marketOrdersLoaded =
            true;

          finishLoading();
        },
      );

    return () => {
      mounted = false;

      unsubscribeBookings();
      unsubscribeMarketOrders();
    };
  }, []);

  /* ============================================================
     FINAL JOBS
  ============================================================ */

  const jobs =
    useMemo<RecentJob[]>(
      () => {
        const combined =
          uniqueJobs([
            ...bookingJobs,
            ...marketJobs,
          ]);

        const active =
          combined.filter(
            isActiveJob,
          );

        const sorted =
          sortNewestFirst(
            active,
          );

        /*
         * IMPORTANT:
         *
         * Booking + Market orders
         * dukansu suna cikin list daya.
         *
         * MAX = 2 kawai.
         */
        return sorted.slice(
          0,
          MAX_RECENT_JOBS,
        );
      },
      [
        bookingJobs,
        marketJobs,
      ],
    );

  /* ============================================================
     RESULT
  ============================================================ */

  return useMemo(
    () => ({
      jobs,
      loading,
      error,
    }),
    [
      jobs,
      loading,
      error,
    ],
  );
}

/* ==============================================================
   DEFAULT
============================================================== */

export default useRecentJobs;