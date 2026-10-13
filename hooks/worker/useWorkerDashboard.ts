import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  BOOKING_STATUS,
} from "@/constants/bookingStatus";

/* ==============================================================
   TYPES
============================================================== */

type DashboardStats = {
  pending: number;
  active: number;
  negotiating: number;
  completed: number;
  rating: number;
  reviewCount: number;
};

type PublicWorkerProfile = {
  rating?: number;
  totalReviews?: number;

  online?: boolean;
};

/* ==============================================================
   DEFAULTS
============================================================== */

const EMPTY_STATS: DashboardStats = {
  pending: 0,
  active: 0,
  negotiating: 0,
  completed: 0,
  rating: 0,
  reviewCount: 0,
};

/* ==============================================================
   HELPERS
============================================================== */

function getSafeRating(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

function getSafeReviewCount(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(value),
  );
}

/* ==============================================================
   HOOK
============================================================== */

export default function useWorkerDashboard() {
  /* ============================================================
     AUTH USER
  ============================================================ */

  const [
    user,
    setUser,
  ] = useState<User | null>(
    auth.currentUser,
  );

  /* ============================================================
     STATE
  ============================================================ */

  const [
    loading,
    setLoading,
  ] = useState<boolean>(
    true,
  );

  const [
    pending,
    setPending,
  ] = useState<number>(0);

  const [
    active,
    setActive,
  ] = useState<number>(0);

  const [
    negotiating,
    setNegotiating,
  ] = useState<number>(0);

  const [
    completed,
    setCompleted,
  ] = useState<number>(0);

  const [
    rating,
    setRating,
  ] = useState<number>(0);

  const [
    reviewCount,
    setReviewCount,
  ] = useState<number>(0);

  const [
    online,
    setOnline,
  ] = useState<boolean>(
    false,
  );

  const [
    updatingOnline,
    setUpdatingOnline,
  ] = useState<boolean>(
    false,
  );

  /* ============================================================
     REFS
  ============================================================ */

  const onlineRef =
    useRef<boolean>(
      false,
    );

  const updatingOnlineRef =
    useRef<boolean>(
      false,
    );

  /* ============================================================
     AUTH STATE
  ============================================================ */

  useEffect(() => {
    let mounted =
      true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        currentUser => {
          if (!mounted) {
            return;
          }

          setUser(
            currentUser,
          );
        },
      );

    return () => {
      mounted =
        false;

      unsubscribe();
    };
  }, []);

  /* ============================================================
     KEEP ONLINE REF CURRENT
  ============================================================ */

  useEffect(() => {
    onlineRef.current =
      online;
  }, [
    online,
  ]);

  /* ============================================================
     RESET DASHBOARD
  ============================================================ */

  const resetDashboard =
    useCallback(() => {
      setPending(
        EMPTY_STATS.pending,
      );

      setActive(
        EMPTY_STATS.active,
      );

      setNegotiating(
        EMPTY_STATS.negotiating,
      );

      setCompleted(
        EMPTY_STATS.completed,
      );

      setRating(
        EMPTY_STATS.rating,
      );

      setReviewCount(
        EMPTY_STATS.reviewCount,
      );

      setOnline(
        false,
      );

      onlineRef.current =
        false;

      setUpdatingOnline(
        false,
      );

      updatingOnlineRef.current =
        false;
    }, []);

  /* ============================================================
     FIRESTORE LISTENERS
  ============================================================ */

  useEffect(() => {
    const workerId =
      user?.uid?.trim() ??
      "";

    /* ==========================================================
       NO AUTHENTICATED USER
    ========================================================== */

    if (!workerId) {
      resetDashboard();

      setLoading(
        false,
      );

      return;
    }

    let mounted =
      true;

    let userProfileReady =
      false;

    let publicProfileReady =
      false;

    let bookingsReady =
      false;

    setLoading(
      true,
    );

    /* ==========================================================
       LOADING CONTROL
    ========================================================== */

    const finishLoading =
      () => {
        if (!mounted) {
          return;
        }

        if (
          userProfileReady &&
          publicProfileReady &&
          bookingsReady
        ) {
          setLoading(
            false,
          );
        }
      };

    /* ==========================================================
       PRIVATE WORKER PROFILE

       Canonical worker-side source for online/offline.
       users/{workerId}
    ========================================================== */

    const profileRef =
      doc(
        db,
        "users",
        workerId,
      );

    const unsubscribeProfile =
      onSnapshot(
        profileRef,

        snapshot => {
          if (!mounted) {
            return;
          }

          if (
            !snapshot.exists()
          ) {
            setOnline(
              false,
            );

            onlineRef.current =
              false;

            userProfileReady =
              true;

            finishLoading();

            return;
          }

          const data =
            snapshot.data();

          const nextOnline =
            data.online ===
            true;

          setOnline(
            nextOnline,
          );

          onlineRef.current =
            nextOnline;

          userProfileReady =
            true;

          finishLoading();
        },

        error => {
          console.error(
            "FIXXAM_WORKER_DASHBOARD_PROFILE_ERROR",
            {
              code:
                error.code,

              message:
                error.message,

              workerId,
            },
          );

          if (!mounted) {
            return;
          }

          setOnline(
            false,
          );

          onlineRef.current =
            false;

          userProfileReady =
            true;

          finishLoading();
        },
      );

    /* ==========================================================
       PUBLIC WORKER PROFILE

       Canonical public source for:
       - worker rating
       - total reviews
       - public online availability

       workerPublicProfiles/{workerId}
    ========================================================== */

    const publicProfileRef =
      doc(
        db,
        "workerPublicProfiles",
        workerId,
      );

    const unsubscribePublicProfile =
      onSnapshot(
        publicProfileRef,

        snapshot => {
          if (!mounted) {
            return;
          }

          if (
            !snapshot.exists()
          ) {
            setRating(
              0,
            );

            setReviewCount(
              0,
            );

            publicProfileReady =
              true;

            finishLoading();

            return;
          }

          const data =
            snapshot.data() as PublicWorkerProfile;

          setRating(
            getSafeRating(
              data.rating,
            ),
          );

          setReviewCount(
            getSafeReviewCount(
              data.totalReviews,
            ),
          );

          publicProfileReady =
            true;

          finishLoading();
        },

        error => {
          console.error(
            "FIXXAM_WORKER_DASHBOARD_PUBLIC_PROFILE_ERROR",
            {
              code:
                error.code,

              message:
                error.message,

              workerId,
            },
          );

          if (!mounted) {
            return;
          }

          setRating(
            0,
          );

          setReviewCount(
            0,
          );

          publicProfileReady =
            true;

          finishLoading();
        },
      );

    /* ==========================================================
       WORKER BOOKINGS

       Used only for existing dashboard job statistics.

       Home job overview may use useWorkerOrderCounts instead,
       but these values remain here for existing callers.
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
      );

    const unsubscribeBookings =
      onSnapshot(
        bookingsQuery,

        snapshot => {
          if (!mounted) {
            return;
          }

          let pendingCount =
            0;

          let activeCount =
            0;

          let negotiatingCount =
            0;

          let completedCount =
            0;

          snapshot.forEach(
            bookingDoc => {
              const booking =
                bookingDoc.data();

              const status =
                booking.status;

              switch (status) {
                case BOOKING_STATUS.PENDING_ESTIMATE:
                  pendingCount +=
                    1;
                  break;

                case BOOKING_STATUS.NEGOTIATING:
                  negotiatingCount +=
                    1;
                  break;

                case BOOKING_STATUS.ACCEPTED:
                case BOOKING_STATUS.ON_THE_WAY:
                case BOOKING_STATUS.IN_PROGRESS:
                  activeCount +=
                    1;
                  break;

                case BOOKING_STATUS.COMPLETED:
                  completedCount +=
                    1;
                  break;

                default:
                  break;
              }
            },
          );

          setPending(
            pendingCount,
          );

          setActive(
            activeCount,
          );

          setNegotiating(
            negotiatingCount,
          );

          setCompleted(
            completedCount,
          );

          bookingsReady =
            true;

          finishLoading();
        },

        error => {
          console.error(
            "FIXXAM_WORKER_DASHBOARD_BOOKINGS_ERROR",
            {
              code:
                error.code,

              message:
                error.message,

              workerId,
            },
          );

          if (!mounted) {
            return;
          }

          setPending(
            0,
          );

          setActive(
            0,
          );

          setNegotiating(
            0,
          );

          setCompleted(
            0,
          );

          bookingsReady =
            true;

          finishLoading();
        },
      );

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return () => {
      mounted =
        false;

      unsubscribeProfile();

      unsubscribePublicProfile();

      unsubscribeBookings();
    };
  }, [
    user?.uid,
    resetDashboard,
  ]);

  /* ============================================================
     TOGGLE ONLINE

     Writes availability to BOTH:
     - users/{workerId}
     - workerPublicProfiles/{workerId}

     This keeps the private worker account and public customer
     view synchronized.
  ============================================================ */

  const toggleOnline =
    useCallback(
      async (
        value: boolean,
      ) => {
        const workerId =
          user?.uid?.trim() ??
          "";

        if (!workerId) {
          return;
        }

        /* ======================================================
           PREVENT DUPLICATE / RAPID WRITES
        ====================================================== */

        if (
          updatingOnlineRef.current
        ) {
          return;
        }

        if (
          value ===
          onlineRef.current
        ) {
          return;
        }

        const previousValue =
          onlineRef.current;

        updatingOnlineRef.current =
          true;

        setUpdatingOnline(
          true,
        );

        /* ======================================================
           OPTIMISTIC UI
        ====================================================== */

        onlineRef.current =
          value;

        setOnline(
          value,
        );

        try {
          const batch =
            writeBatch(
              db,
            );

          const privateProfileRef =
            doc(
              db,
              "users",
              workerId,
            );

          const publicProfileRef =
            doc(
              db,
              "workerPublicProfiles",
              workerId,
            );

          const timestamp =
            serverTimestamp();

          /* ====================================================
             PRIVATE PROFILE
          ==================================================== */

          batch.update(
            privateProfileRef,
            {
              online:
                value,

              onlineUpdatedAt:
                timestamp,
            },
          );

          /* ====================================================
             PUBLIC PROFILE
          ==================================================== */

          batch.update(
            publicProfileRef,
            {
              online:
                value,

              onlineUpdatedAt:
                timestamp,
            },
          );

          await batch.commit();
        } catch (error) {
          /* ====================================================
             ROLLBACK UI

             onSnapshot will also restore the server truth.
          ==================================================== */

          onlineRef.current =
            previousValue;

          setOnline(
            previousValue,
          );

          console.error(
            "FIXXAM_WORKER_DASHBOARD_ONLINE_UPDATE_ERROR",
            {
              code:
                typeof error ===
                  "object" &&
                error !==
                  null &&
                "code" in
                  error
                  ? String(
                      (
                        error as {
                          code:
                            unknown;
                        }
                      ).code,
                    )
                  : "unknown",

              message:
                error instanceof
                Error
                  ? error.message
                  : String(
                      error,
                    ),

              workerId,

              requestedOnline:
                value,
            },
          );
        } finally {
          updatingOnlineRef.current =
            false;

          setUpdatingOnline(
            false,
          );
        }
      },
      [
        user?.uid,
      ],
    );

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    loading,

    pending,
    active,
    negotiating,
    completed,

    rating,
    reviewCount,

    online,
    updatingOnline,
    toggleOnline,
  };
}