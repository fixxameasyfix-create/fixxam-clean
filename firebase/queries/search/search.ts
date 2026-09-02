import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "@/firebase/config";

const workersRef = collection(db, "users");
const servicesRef = collection(db, "services");

export async function searchWorkers() {
  return getDocs(
    query(
      workersRef,
      where("activeRole", "==", "worker"),
      where("available", "==", true),
      limit(100)
    )
  );
}

export async function searchServices() {
  return getDocs(
    query(
      servicesRef,
      where("active", "==", true),
      limit(100)
    )
  );
}