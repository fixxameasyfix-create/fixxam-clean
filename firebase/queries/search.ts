import {
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  getPublicWorkers,
} from "@/firebase/queries/workerPublicProfiles";

import {
  servicesCollection,
} from "@/firebase/collections/services";

/**
 * Search publicly available workers.
 *
 * Customer-facing worker data comes from
 * workerPublicProfiles, not private users.
 */
export function searchWorkers() {
  return getPublicWorkers();
}

/**
 * Search active services from Firestore.
 */
export function searchServices() {
  return getDocs(
    query(
      servicesCollection,
      where(
        "active",
        "==",
        true,
      ),
    ),
  );
}