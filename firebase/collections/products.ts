import { collection, doc } from "firebase/firestore";
import { db } from "@/firebase/config";

export const productsCollection = collection(
  db,
  "products"
);

export const productDoc = (id: string) =>
  doc(db, "products", id);