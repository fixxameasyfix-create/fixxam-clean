import {
  useEffect,
  useState,
} from "react";

import {
  listenOffers,
  BookingOffer,
} from "@/firebase/queries/bookings/listenOffers";


export default function useOffers(

  bookingId?: string,

) {


  const [
    offers,
    setOffers,
  ] = useState<BookingOffer[]>([]);



  const [
    loading,
    setLoading,
  ] = useState(true);



  useEffect(() => {


    if (!bookingId) {

      setOffers([]);

      setLoading(false);

      return;

    }



    const unsubscribe =

      listenOffers(

        bookingId,

        (data) => {

          setOffers(
            data
          );

          setLoading(false);

        },

      );



    return unsubscribe;


  }, [bookingId]);



  return {

    offers,

    loading,

  };


}