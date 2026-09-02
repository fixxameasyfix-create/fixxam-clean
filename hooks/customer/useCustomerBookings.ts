import {
  useEffect,
  useState,
} from "react";

import {
  listenCustomerBookings,
} from "@/firebase/queries/bookings";

import type { Booking } from "@/types/booking";

import { auth } from "@/firebase/config";

export default function useCustomerBookings() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const customerId =
      auth.currentUser?.uid;

    if (!customerId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe =
      listenCustomerBookings(
        customerId,
        (nextBookings) => {
          setBookings(
            nextBookings,
          );

          setLoading(false);
        },
        (error) => {
          console.error(
            "CUSTOMER_ACTIVITY_BOOKINGS_ERROR",
            error,
          );

          setBookings([]);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, []);

  return {
    bookings,
    loading,
  };
}