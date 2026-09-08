import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export function listenPendingBookingsCount(
  workerId: string,
  callback: (count: number) => void,
) {
  const normalizedWorkerId =
    workerId.trim();

  if (!normalizedWorkerId) {
    callback(0);
    return () => {};
  }

  const bookingsQuery = query(
    collection(db, "bookings"),
    where(
      "workerId",
      "==",
      normalizedWorkerId,
    ),
    where(
      "status",
      "==",
      "pending",
    ),
  );

  return onSnapshot(
    bookingsQuery,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error(
        "WORKER_PENDING_BOOKINGS_COUNT_ERROR",
        error,
      );

      callback(0);
    },
  );
}