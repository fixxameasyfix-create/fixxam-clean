import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

export const storesCollection = collection(db, "stores");

export const storeDoc = (id: string) =>
  doc(db, "stores", id);