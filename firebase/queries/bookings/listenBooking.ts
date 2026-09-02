import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

export function listenBooking(
  bookingId: string,
  callback: (booking: any) => void,
) {

  return onSnapshot(

    doc(
      db,
      "bookings",
      bookingId,
    ),

    (snapshot) => {

      if (!snapshot.exists()) {
        return;
      }

    const data = snapshot.data();

console.log(
  "FIREBASE REAL DATA:",
  data.status,
);

callback({

  id: snapshot.id,

  ...data,

});

    },

  );

}