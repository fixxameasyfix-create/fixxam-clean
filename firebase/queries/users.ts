import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  where,
  query,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  usersCollection,
} from "@/firebase/collections/users";

import { User } from "@/types/user";

/* ============================================================
   AUTH READY
============================================================ */

async function requireAuthenticatedUser() {
  await auth.authStateReady();

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  return user;
}

/* ============================================================
   USER
   Private user data.
   Login required.
============================================================ */

export async function getUser(
  id: string,
) {
  await requireAuthenticatedUser();

  return getDoc(
    doc(
      db,
      "users",
      id,
    ),
  );
}

export async function getUsers() {
  await requireAuthenticatedUser();

  return getDocs(
    usersCollection,
  );
}

/* ============================================================
   PUBLIC WORKERS
   Customer Home can call this without login.
============================================================ */

export async function getWorkers() {
  const workersQuery = query(
    collection(
      db,
      "workerPublicProfiles",
    ),
    where(
      "available",
      "==",
      true,
    ),
  );

  return getDocs(
    workersQuery,
  );
}

/* ============================================================
   UPDATE USER
   Private action.
   Login required.
============================================================ */

export async function updateUser(
  id: string,
  data: Partial<User>,
) {
  await requireAuthenticatedUser();

  return updateDoc(
    doc(
      db,
      "users",
      id,
    ),
    data,
  );
}