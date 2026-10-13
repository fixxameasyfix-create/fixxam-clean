import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import useWorkerOrderCounts from "@/hooks/worker/useWorkerOrderCounts";

/* ============================================================
   TYPES
============================================================ */

export type WorkerJobPerformance = {
  rating: number;
  jobsDone: number;
  reviews: number;
  jobSuccess: number;
};

type WorkerJobPerformanceResult = {
  performance: WorkerJobPerformance;
  loading: boolean;
};

/* ============================================================
   HELPERS
============================================================ */

function toSafeNumber(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return value;
}

function toSafeCount(
  value: unknown,
): number {
  return Math.max(
    0,
    Math.floor(
      toSafeNumber(value),
    ),
  );
}

function toSafeRating(
  value: unknown,
): number {
  return Math.min(
    5,
    Math.max(
      0,
      toSafeNumber(value),
    ),
  );
}

function calculateJobSuccess(
  completed: number,
  cancelled: number,
): number {
  const resolvedJobs =
    completed + cancelled;

  if (resolvedJobs <= 0) {
    return 0;
  }

  const percentage =
    (completed / resolvedJobs) *
    100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(percentage),
    ),
  );
}

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerJobPerformance(): WorkerJobPerformanceResult {
  /* ==========================================================
     ORDER COUNTS
  ========================================================== */

  const {
    counts,
    loading: orderCountsLoading,
  } = useWorkerOrderCounts();

  /* ==========================================================
     PUBLIC PROFILE
  ========================================================== */

  const [
    profileRating,
    setProfileRating,
  ] = useState(0);

  const [
    profileReviews,
    setProfileReviews,
  ] = useState(0);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  /* ==========================================================
     PUBLIC PROFILE LISTENER
  ========================================================== */

  useEffect(() => {
    let unsubscribeProfile:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        user => {
          unsubscribeProfile?.();
          unsubscribeProfile =
            undefined;

          setProfileRating(0);
          setProfileReviews(0);
          setProfileLoading(true);

          if (!user) {
            setProfileLoading(false);
            return;
          }

          const profileRef =
            doc(
              db,
              "workerPublicProfiles",
              user.uid,
            );

          unsubscribeProfile =
            onSnapshot(
              profileRef,

              snapshot => {
                if (!snapshot.exists()) {
                  setProfileRating(0);
                  setProfileReviews(0);
                  setProfileLoading(false);

                  return;
                }

                const data =
                  snapshot.data();

                /*
                 * Canonical worker rating.
                 */
                setProfileRating(
                  toSafeRating(
                    data.rating,
                  ),
                );

                /*
                 * Canonical review count.
                 *
                 * Kada mu yi amfani da totalRatings
                 * a matsayin fallback saboda quick rating
                 * da review aggregation systems ne daban.
                 */
                setProfileReviews(
                  toSafeCount(
                    data.totalReviews,
                  ),
                );

                setProfileLoading(false);
              },

              error => {
                if (__DEV__) {
                  console.error(
                    "WORKER_JOB_PERFORMANCE_PROFILE_ERROR:",
                    error,
                  );
                }

                setProfileRating(0);
                setProfileReviews(0);
                setProfileLoading(false);
              },
            );
        },
      );

    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  /* ==========================================================
     PERFORMANCE
  ========================================================== */

  const performance =
    useMemo<WorkerJobPerformance>(
      () => {
        const jobsDone =
          toSafeCount(
            counts.completed,
          );

        const cancelled =
          toSafeCount(
            counts.cancelled,
          );

        return {
          rating:
            profileRating,

          jobsDone,

          reviews:
            profileReviews,

          jobSuccess:
            calculateJobSuccess(
              jobsDone,
              cancelled,
            ),
        };
      },
      [
        counts.completed,
        counts.cancelled,
        profileRating,
        profileReviews,
      ],
    );

  /* ==========================================================
     RETURN
  ========================================================== */

  return {
    performance,

    loading:
      orderCountsLoading ||
      profileLoading,
  };
}