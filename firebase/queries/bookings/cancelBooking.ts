import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

export async function cancelBooking(
  bookingId: string,
) {
  await updateDoc(
    doc(
      db,
      "bookings",
      bookingId,
    ),
    {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );
}