import {
  collection,
  doc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const categoriesCollection =
  collection(db, "categories");

export const categoryDoc = (
  id: string
) => doc(db, "categories", id);