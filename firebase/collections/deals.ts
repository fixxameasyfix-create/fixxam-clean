import {
  collection,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export const dealsCollection =
  collection(db, "deals");