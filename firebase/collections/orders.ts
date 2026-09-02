import {
  collection,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const ordersCollection =
  collection(db, "orders");

export const orderDoc = (
  id: string
) => doc(db, "orders", id);