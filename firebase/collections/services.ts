import {
  collection,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const servicesCollection = collection(
  db,
  "services",
);

export const serviceDoc = (id: string) =>
  doc(db, "services", id);