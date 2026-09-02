import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export function listenPendingBookingsCount(
  callback: (count: number) => void,
) {
  const bookingsQuery = query(
    collection(db, "bookings"),
    where("status", "==", "pending_estimate"),
  );

  return onSnapshot(
    bookingsQuery,
    (snapshot) => {
      callback(snapshot.size);
    },
  );
}