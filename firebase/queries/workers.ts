import {
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import {
  usersCollection,
  userDoc,
} from "@/firebase/collections/users";

/* Get One */

export function getWorker(id: string) {
  return getDoc(userDoc(id));
}

/* Get All Workers */

export function getWorkers(limitCount = 100) {
  return getDocs(
    query(
      usersCollection,
      where("activeRole", "==", "worker"),
      orderBy("workerProfile.latitude"),
      limit(limitCount),
    ),
  );
}

/* By Category */

export function getWorkersByCategory(
  categoryId: string,
) {
  return getDocs(
    query(
      usersCollection,
      where("activeRole", "==", "worker"),
      where(
        "workerProfile.category",
        "==",
        categoryId,
      ),
    ),
  );
}

/* By Subcategory */

export function getWorkersBySubcategory(
  subcategoryId: string,
) {
  return getDocs(
    query(
      usersCollection,
      where("activeRole", "==", "worker"),
      where(
        "workerProfile.subcategory",
        "==",
        subcategoryId,
      ),
    ),
  );
}

/* By Service */

export function getWorkersByService(
  serviceId: string,
) {
  return getDocs(
    query(
      usersCollection,
      where("activeRole", "==", "worker"),
      where("available", "==", true),
      where(
        "workerProfile.selectedServices",
        "array-contains",
        serviceId,
      ),
    ),
  );
}

/* By State */

export function getWorkersByState(
  state: string,
) {
  return getDocs(
    query(
      usersCollection,
      where("activeRole", "==", "worker"),
      where(
        "workerProfile.state",
        "==",
        state,
      ),
    ),
  );
}

/* By LGA */

export function getWorkersByLga(
  lga: string,
) {
  return getDocs(
    query(
      usersCollection,
      where("activeRole", "==", "worker"),
      where(
        "workerProfile.lga",
        "==",
        lga,
      ),
    ),
  );
}

/* Get Current User */

export function getUser(id: string) {
  return getDoc(userDoc(id));
}