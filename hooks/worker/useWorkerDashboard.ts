import {
  useCallback,
  useEffect,
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
  updateDoc,
  where,
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
  ] = useState<boolean>(false);

  /* ============================================================
     AUTH STATE
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          if (!mounted) {
            return;
          }

          setUser(
            currentUser,
          );
        },
      );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

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

      setOnline(false);
    }, []);

  /* ============================================================
     FIRESTORE LISTENERS
  ============================================================ */

  useEffect(() => {
    const workerId =
      user?.uid?.trim() ?? "";

    /* ==========================================================
       NO AUTHENTICATED USER
    ========================================================== */

    if (!workerId) {
      resetDashboard();
      setLoading(false);

      return;
    }

    let mounted = true;

    let profileReady = false;
    let bookingsReady = false;

    setLoading(true);

    /* ==========================================================
       LOADING CONTROL
    ========================================================== */

    const finishLoading =
      () => {
        if (!mounted) {
          return;
        }

        if (
          profileReady &&
          bookingsReady
        ) {
          setLoading(false);
        }
      };

    /* ==========================================================
       WORKER PROFILE
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

        (snapshot) => {
          if (!mounted) {
            return;
          }

          if (
            !snapshot.exists()
          ) {
            setOnline(false);

            profileReady = true;
            finishLoading();

            return;
          }

          const data =
            snapshot.data();

          setOnline(
            data.online === true,
          );

          profileReady = true;
          finishLoading();
        },

        (error) => {
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

          setOnline(false);

          profileReady = true;
          finishLoading();
        },
      );

    /* ==========================================================
       WORKER BOOKINGS
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

        (snapshot) => {
          if (!mounted) {
            return;
          }

          let pendingCount = 0;
          let activeCount = 0;
          let negotiatingCount = 0;
          let completedCount = 0;

          let totalRating = 0;
          let ratings = 0;

          snapshot.forEach(
            (bookingDoc) => {
              const booking =
                bookingDoc.data();

              const status =
                booking.status;

              /* ==================================================
                 STATUS
              ================================================== */

              switch (status) {
                case BOOKING_STATUS.PENDING_ESTIMATE:
                  pendingCount += 1;
                  break;

                case BOOKING_STATUS.NEGOTIATING:
                  negotiatingCount += 1;
                  break;

                case BOOKING_STATUS.ACCEPTED:
                case BOOKING_STATUS.ON_THE_WAY:
                case BOOKING_STATUS.IN_PROGRESS:
                  activeCount += 1;
                  break;

                case BOOKING_STATUS.COMPLETED:
                  completedCount += 1;
                  break;

                default:
                  break;
              }

              /* ==================================================
                 RATING
              ================================================== */

              const bookingRating =
                booking.rating;

              if (
                typeof bookingRating ===
                  "number" &&
                Number.isFinite(
                  bookingRating,
                ) &&
                bookingRating >= 1 &&
                bookingRating <= 5
              ) {
                totalRating +=
                  bookingRating;

                ratings += 1;
              }
            },
          );

          /* ======================================================
             UPDATE STATE
          ====================================================== */

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

          setReviewCount(
            ratings,
          );

          setRating(
            ratings > 0
              ? Number(
                  (
                    totalRating /
                    ratings
                  ).toFixed(1),
                )
              : 0,
          );

          bookingsReady = true;
          finishLoading();
        },

        (error) => {
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

          /*
           * Keep Worker Home usable
           * even when Firestore denies
           * the booking listener.
           */

          setPending(0);
          setActive(0);
          setNegotiating(0);
          setCompleted(0);
          setRating(0);
          setReviewCount(0);

          bookingsReady = true;
          finishLoading();
        },
      );

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return () => {
      mounted = false;

      unsubscribeProfile();
      unsubscribeBookings();
    };
  }, [
    user?.uid,
    resetDashboard,
  ]);

  /* ============================================================
     TOGGLE ONLINE
  ============================================================ */

  const toggleOnline =
    useCallback(
      async (
        value: boolean,
      ) => {
        const workerId =
          user?.uid?.trim() ?? "";

        if (!workerId) {
          return;
        }

        const previousValue =
          online;

        /* ------------------------------------------------------
           Optimistic UI
        ------------------------------------------------------ */

        setOnline(value);

        try {
          await updateDoc(
            doc(
              db,
              "users",
              workerId,
            ),
            {
              online: value,
            },
          );
        } catch (error) {
          /* ----------------------------------------------------
             Rollback
          ---------------------------------------------------- */

          setOnline(
            previousValue,
          );

          console.error(
            "FIXXAM_WORKER_DASHBOARD_ONLINE_UPDATE_ERROR",
            {
              code:
                typeof error ===
                  "object" &&
                error !== null &&
                "code" in error
                  ? String(
                      (
                        error as {
                          code: unknown;
                        }
                      ).code,
                    )
                  : "unknown",

              message:
                error instanceof Error
                  ? error.message
                  : String(error),

              workerId,
            },
          );
        }
      },
      [
        user?.uid,
        online,
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
    toggleOnline,
  };
}