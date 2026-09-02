import { useEffect, useState } from "react";

import { auth, db } from "@/firebase/config";

import {
  BOOKING_STATUS,
} from "@/constants/bookingStatus";

import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

export default function useWorkerDashboard() {
  const workerId =
    auth.currentUser?.uid ?? "";

  const [loading, setLoading] =
    useState(true);

  const [pending, setPending] =
    useState(0);

  const [active, setActive] =
    useState(0);

  const [negotiating, setNegotiating] =
    useState(0);

  const [completed, setCompleted] =
    useState(0);

  const [rating, setRating] =
    useState(0);

  const [reviewCount, setReviewCount] =
    useState(0);

  const [online, setOnline] =
    useState(false);

  useEffect(() => {
    if (!workerId) {
      setLoading(false);
      return;
    }

    const unsubscribeProfile =
      onSnapshot(
        doc(db, "users", workerId),
        (snapshot) => {
          if (snapshot.exists()) {
            setOnline(
              snapshot.data().online ??
                false,
            );
          }
        },
      );

    const unsubscribeBookings =
      onSnapshot(
        query(
          collection(db, "bookings"),
          where(
            "workerId",
            "==",
            workerId,
          ),
        ),
        (snapshot) => {
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

              switch (booking.status) {
                case BOOKING_STATUS.PENDING_ESTIMATE:
                  pendingCount++;
                  break;

                case BOOKING_STATUS.NEGOTIATING:
                  negotiatingCount++;
                  break;

                case BOOKING_STATUS.ACCEPTED:
                case BOOKING_STATUS.ON_THE_WAY:
                case BOOKING_STATUS.IN_PROGRESS:
                  activeCount++;
                  break;

                case BOOKING_STATUS.COMPLETED:
                  completedCount++;
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

          setReviewCount(
            ratings,
          );

          setRating(
            ratings === 0
              ? 0
              : totalRating / ratings,
          );

          setLoading(false);
        },
      );

    return () => {
      unsubscribeProfile();
      unsubscribeBookings();
    };
  }, [workerId]);

  const toggleOnline = async (
    value: boolean,
  ) => {
    setOnline(value);

    if (!workerId) {
      return;
    }

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
    } catch {
      setOnline(!value);
    }
  };

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