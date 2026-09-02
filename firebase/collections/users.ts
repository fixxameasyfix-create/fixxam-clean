import {
  collection,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const usersCollection =
  collection(db, "users");

export const userDoc = (
  id: string
) => doc(db, "users", id);