import {
  createUserWithEmailAndPassword,
} from "@/firebase/firebaseAuth";

import {
  auth,
  db,
} from "@/firebase/config";

import type { User } from "firebase/auth";

import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

type Props = {
  firstName: string;
  surname: string;
  otherName: string;

  email: string;
  phone: string;

  password: string;

  photoURL: string | null;
};

export async function registerCustomer({
  firstName,
  surname,
  otherName,
  email,
  phone,
  password,
  photoURL,
}: Props): Promise<User> {
  const user = auth.currentUser;

  /* ============================================================
     NEW CUSTOMER
  ============================================================ */

  if (!user) {
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

    const newUser =
      userCredential.user;

    await setDoc(
      doc(db, "users", newUser.uid),
      {
        uid: newUser.uid,

        roles: ["customer"],
        activeRole: "customer",

        firstName:
          firstName.trim(),

        surname:
          surname.trim(),

        otherName:
          otherName.trim(),

        email:
          email.trim(),

        phone:
          phone.trim(),

        photoURL,

        createdAt:
          serverTimestamp(),
      },
    );

    return newUser;
  }

  /* ============================================================
     EXISTING USER — ADD CUSTOMER ROLE
  ============================================================ */

  const userRef =
    doc(
      db,
      "users",
      user.uid,
    );

  const existingUser =
    await getDoc(userRef);

  if (existingUser.exists()) {
    await updateDoc(
      userRef,
      {
        roles:
          arrayUnion("customer"),

        activeRole:
          "customer",

        firstName:
          firstName.trim(),

        surname:
          surname.trim(),

        otherName:
          otherName.trim(),

        email:
          email.trim(),

        phone:
          phone.trim(),

        photoURL,

        updatedAt:
          serverTimestamp(),
      },
    );

    return user;
  }

  /* ============================================================
     USER AUTH EXISTS BUT FIRESTORE PROFILE DOES NOT
  ============================================================ */

  await setDoc(
    userRef,
    {
      uid: user.uid,

      roles: ["customer"],
      activeRole: "customer",

      firstName:
        firstName.trim(),

      surname:
        surname.trim(),

      otherName:
        otherName.trim(),

      email:
        email.trim(),

      phone:
        phone.trim(),

      photoURL,

      createdAt:
        serverTimestamp(),
    },
  );

  return user;
}