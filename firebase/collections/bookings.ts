import {
  collection,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const bookingsCollection =
  collection(db, "bookings");

export const bookingDoc = (
  id: string
) => doc(db, "bookings", id);