import {
  useEffect,
  useState,
} from "react";

import { listenPendingBookingsCount } from "@/firebase/queries/bookings/listenPendingBookingsCount";

export default function usePendingBookingsCount() {
  const [count, setCount] =
    useState(0);

  useEffect(() => {
    const unsubscribe =
      listenPendingBookingsCount(
        setCount,
      );

    return unsubscribe;
  }, []);

  return count;
}