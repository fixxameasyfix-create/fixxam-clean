import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "@/firebase/config";

import {
  listenPendingBookingsCount,
} from "@/firebase/queries/bookings/listenPendingBookingsCount";

export default function usePendingBookingsCount() {
  const [count, setCount] =
    useState(0);

  useEffect(() => {
    let unsubscribeBookings:
      | (() => void)
      | undefined;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (user) => {
          unsubscribeBookings?.();
          unsubscribeBookings =
            undefined;

          if (!user?.uid) {
            setCount(0);
            return;
          }

          unsubscribeBookings =
            listenPendingBookingsCount(
              user.uid,
              setCount,
            );
        },
      );

    return () => {
      unsubscribeAuth();
      unsubscribeBookings?.();
    };
  }, []);

  return count;
}