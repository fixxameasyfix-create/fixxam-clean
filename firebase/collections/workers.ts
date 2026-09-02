import {
  collection,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const workersCollection = collection(
  db,
  "workers"
);

export const workerDoc = (id: string) =>
  doc(db, "workers", id);