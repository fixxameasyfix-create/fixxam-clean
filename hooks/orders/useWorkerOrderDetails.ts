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

import {
  cleanString,
  mapWorkerBooking,
  type WorkerBooking,
} from "@/utils/worker/workerOrderDetails";

/* ==============================================================
   TYPES
============================================================== */

export type WorkerOfferState =
  | "none"
  | "sent"
  | "counter";

type WorkerOrderDerivedState = {
  hasCustomerCounter: boolean;

  hasWorkerCounter: boolean;

  offerState: WorkerOfferState;

  canDeclineRequest: boolean;

  hasPhotos: boolean;
};

type UseWorkerOrderDetailsResult =
  WorkerOrderDerivedState & {
    authReady: boolean;

    workerId: string | null;

    booking: WorkerBooking | null;

    loading: boolean;

    error: string | null;
  };

/* ==============================================================
   HOOK
============================================================== */

export default function useWorkerOrderDetails(
  orderId: string,
): UseWorkerOrderDetailsResult {
  /* ============================================================
     SAFE ORDER ID
  ============================================================ */

  const resolvedOrderId =
    useMemo(
      () =>
        cleanString(
          orderId,
        ),
      [
        orderId,
      ],
    );

  /* ============================================================
     AUTH
  ============================================================ */

  const [
    authReady,
    setAuthReady,
  ] =
    useState(false);

  const [
    workerId,
    setWorkerId,
  ] =
    useState<
      string | null
    >(null);

  /* ============================================================
     BOOKING
  ============================================================ */

  const [
    booking,
    setBooking,
  ] =
    useState<WorkerBooking | null>(
      null,
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
    useState<
      string | null
    >(null);

  /* ============================================================
     AUTH LISTENER
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        user => {
          const uid =
            cleanString(
              user?.uid,
            );

          setWorkerId(
            uid || null,
          );

          setAuthReady(
            true,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* ============================================================
     BOOKING LISTENER
  ============================================================ */

  useEffect(() => {
    if (!authReady) {
      return;
    }

    /* ==========================================================
       SIGNED OUT
    ========================================================== */

    if (!workerId) {
      setBooking(
        null,
      );

      setLoading(
        false,
      );

      setError(
        "Please sign in to view this order.",
      );

      return;
    }

    /* ==========================================================
       INVALID ORDER ID
    ========================================================== */

    if (!resolvedOrderId) {
      setBooking(
        null,
      );

      setLoading(
        false,
      );

      setError(
        "This order could not be found.",
      );

      return;
    }

    /* ==========================================================
       START LOADING
    ========================================================== */

    setLoading(
      true,
    );

    setError(
      null,
    );

    const bookingRef =
      doc(
        db,
        "bookings",
        resolvedOrderId,
      );

    /* ==========================================================
       REALTIME LISTENER
    ========================================================== */

    const unsubscribe =
      onSnapshot(
        bookingRef,

        snapshot => {
          /* ====================================================
             NOT FOUND
          ==================================================== */

          if (
            !snapshot.exists()
          ) {
            setBooking(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "This order no longer exists.",
            );

            return;
          }

          const data =
            snapshot.data();

          /* ====================================================
             SECURITY / OWNERSHIP
          ==================================================== */

          const bookingWorkerId =
            cleanString(
              data.workerId,
            );

          if (
            bookingWorkerId !==
            workerId
          ) {
            setBooking(
              null,
            );

            setLoading(
              false,
            );

            setError(
              "You do not have access to this order.",
            );

            return;
          }

          /* ====================================================
             MAP BOOKING
          ==================================================== */

          const mappedBooking =
            mapWorkerBooking(
              snapshot.id,
              data,
            );

          setBooking(
            mappedBooking,
          );

          setLoading(
            false,
          );

          setError(
            null,
          );
        },

        snapshotError => {
          console.error(
            "WORKER_ORDER_DETAILS_LISTENER_ERROR",
            snapshotError,
          );

          setBooking(
            null,
          );

          setLoading(
            false,
          );

          setError(
            "Unable to load this order. Please try again.",
          );
        },
      );

    /* ==========================================================
       CLEANUP
    ========================================================== */

    return unsubscribe;
  }, [
    authReady,
    resolvedOrderId,
    workerId,
  ]);

  /* ============================================================
     DERIVED STATE
  ============================================================ */

  const derivedState =
    useMemo<WorkerOrderDerivedState>(
      () => {
        /* ======================================================
           NO BOOKING
        ====================================================== */

        if (!booking) {
          return {
            hasCustomerCounter:
              false,

            hasWorkerCounter:
              false,

            offerState:
              "none",

            canDeclineRequest:
              false,

            hasPhotos:
              false,
          };
        }

        /* ======================================================
           CUSTOMER COUNTER OFFER
        ====================================================== */

        const hasCustomerCounter =
          booking.counterOfferStatus ===
            "sent" &&
          booking.counterOfferBy ===
            "customer" &&
          typeof booking.counterOfferAmount ===
            "number" &&
          Number.isFinite(
            booking.counterOfferAmount,
          ) &&
          booking.counterOfferAmount >
            0;

        /* ======================================================
           WORKER COUNTER OFFER
        ====================================================== */

        const hasWorkerCounter =
          booking.counterOfferStatus ===
            "sent" &&
          booking.counterOfferBy ===
            "worker" &&
          typeof booking.counterOfferAmount ===
            "number" &&
          Number.isFinite(
            booking.counterOfferAmount,
          ) &&
          booking.counterOfferAmount >
            0;

        /* ======================================================
           OFFER STATE

           Explicit type prevents TypeScript from widening
           this value to generic `string`.
        ====================================================== */

        const offerState:
          WorkerOfferState =
          hasCustomerCounter
            ? "counter"
            : booking.offerStatus ===
                  "sent" ||
                hasWorkerCounter
              ? "sent"
              : "none";

        /* ======================================================
           DECLINE PERMISSION
        ====================================================== */

        const canDeclineRequest =
          booking.status ===
            "pending" &&
          booking.offerStatus !==
            "sent" &&
          booking.offerStatus !==
            "accepted" &&
          !hasCustomerCounter;

        /* ======================================================
           PHOTOS
        ====================================================== */

        const hasPhotos =
          Array.isArray(
            booking.photos,
          ) &&
          booking.photos.length >
            0;

        return {
          hasCustomerCounter,

          hasWorkerCounter,

          offerState,

          canDeclineRequest,

          hasPhotos,
        };
      },
      [
        booking,
      ],
    );

  /* ============================================================
     RETURN
  ============================================================ */

  return {
    authReady,

    workerId,

    booking,

    loading,

    error,

    hasCustomerCounter:
      derivedState.hasCustomerCounter,

    hasWorkerCounter:
      derivedState.hasWorkerCounter,

    offerState:
      derivedState.offerState,

    canDeclineRequest:
      derivedState.canDeclineRequest,

    hasPhotos:
      derivedState.hasPhotos,
  };
}