import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";


export type BookingOffer = {

  id: string;

  sender:
    | "worker"
    | "customer";

  amount: number;

  message: string;

  createdAt?: any;

};



export function listenOffers(

  bookingId: string,

  callback: (
    offers: BookingOffer[]
  ) => void,

) {


  const offersQuery = query(

    collection(
      db,
      "bookings",
      bookingId,
      "offers",
    ),

    orderBy(
      "createdAt",
      "asc",
    ),

  );



  return onSnapshot(

    offersQuery,

    (snapshot) => {


      const offers =
        snapshot.docs.map(
          (doc) => ({

            id:
              doc.id,

            ...doc.data(),

          } as BookingOffer)

        );


      callback(
        offers
      );


    },

  );

}