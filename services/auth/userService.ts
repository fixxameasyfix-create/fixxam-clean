import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  usersCollection,
} from "@/firebase/collections/users";

import { User } from "@/types/user";

export async function getUser(
  id: string
) {
  return getDoc(
    doc(db, "users", id)
  );
}

export async function getUsers() {
  return getDocs(
    usersCollection
  );
}

export async function updateUser(
  id: string,
  data: Partial<User>
) {
  return updateDoc(
    doc(db, "users", id),
    data
  );
}