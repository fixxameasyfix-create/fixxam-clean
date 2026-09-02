import {
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { categoriesCollection } from "@/firebase/collections/categories";

export async function getCategories() {
  return getDocs(
    query(
      categoriesCollection,
      where("active", "==", true),
      orderBy("order")
    )
  );
}