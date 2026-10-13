import {
  collection,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

export const shopsCollection =
  collection(
    db,
    "shops",
  );