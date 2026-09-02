import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  storesCollection,
} from "@/firebase/collections/stores";

import { Store } from "@/types/store";

/* Create */

export async function createStore(
  store: Store
) {
  return addDoc(storesCollection, store);
}

/* Get One */

export async function getStore(
  id: string
) {
  return getDoc(
    doc(db, "stores", id)
  );
}

/* Get All */

export async function getStores() {
  return getDocs(storesCollection);
}

/* By Owner */

export async function getStoreByOwner(
  ownerId: string
) {
  return getDocs(
    query(
      storesCollection,
      where("ownerId", "==", ownerId)
    )
  );
}

/* Active */

export async function getActiveStores() {
  return getDocs(
    query(
      storesCollection,
      where("active", "==", true)
    )
  );
}

/* Update */

export async function updateStore(
  id: string,
  data: Partial<Store>
) {
  return updateDoc(
    doc(db, "stores", id),
    data
  );
}

/* Delete */

export async function deleteStore(
  id: string
) {
  return deleteDoc(
    doc(db, "stores", id)
  );
}