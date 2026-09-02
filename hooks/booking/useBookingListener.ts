import {
  useEffect,
  useState,
} from "react";

import {
  listenBooking,
} from "@/firebase/queries/bookings/listenBooking";

export default function useBookingListener(
  bookingId?: string,
) {

  const [
    booking,
    setBooking,
  ] = useState<any>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    if (!bookingId) {

      setLoading(false);

      return;

    }

    const unsubscribe =
      listenBooking(

        bookingId,

        (data: any) => {

          setBooking(data);

          setLoading(false);

        },

      );

    return unsubscribe;

  }, [bookingId]);

  return {

    booking,

    loading,

  };

}