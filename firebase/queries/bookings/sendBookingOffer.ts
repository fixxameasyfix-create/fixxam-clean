import {
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";


export async function sendBookingOffer(
  bookingId: string,
  data: {
    price: number;
    message: string;
  }
) {

  console.log(
    "SENDING OFFER",
    bookingId,
    data
  );


  await updateDoc(
    doc(
      db,
      "bookings",
      bookingId
    ),
    {

      status: "negotiating",

      offerPrice:
        data.price,

      offerMessage:
        data.message,

      lastOfferBy:
        "worker",

      updatedAt:
        serverTimestamp(),

    }
  );

}