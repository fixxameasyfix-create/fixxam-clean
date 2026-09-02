import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";


export async function getBooking(
  bookingId: string,
) {

  const bookingRef =
    doc(
      db,
      "bookings",
      bookingId,
    );


  const snapshot =
    await getDoc(
      bookingRef,
    );


  if (!snapshot.exists()) {

    return null;

  }


  return {

    id: snapshot.id,

    ...snapshot.data(),

  };

}