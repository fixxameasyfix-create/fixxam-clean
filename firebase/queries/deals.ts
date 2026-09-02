import {
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  dealsCollection,
} from "@/firebase/collections/deals";

import type {
  Deal,
} from "@/types/deal";

export async function createDeal(
  deal: Deal,
) {
  return addDoc(
    dealsCollection,
    deal,
  );
}

export async function getDeals() {
  return getDocs(
    dealsCollection,
  );
}

export async function getActiveProductDeals() {
  return getDocs(
    query(
      dealsCollection,
      where("type", "==", "product"),
      where("status", "==", "active"),
    ),
  );
}

export async function getActiveServiceDeals() {
  return getDocs(
    query(
      dealsCollection,
      where("type", "==", "service"),
      where("status", "==", "active"),
    ),
  );
}