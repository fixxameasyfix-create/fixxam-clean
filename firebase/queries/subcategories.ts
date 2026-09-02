import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export function getSubcategories(categoryId: string) {
  return getDocs(
    query(
      collection(db, "subcategories"),
      where("categoryId", "==", categoryId),
      orderBy("name")
    )
  );
}