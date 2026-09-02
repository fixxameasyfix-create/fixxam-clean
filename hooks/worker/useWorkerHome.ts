import {
  useEffect,
  useState,
} from "react";

import {
  auth,
  db,
} from "@/firebase/config";

import {
  doc,
  getDoc,
} from "firebase/firestore";

export default function useWorkerHome() {

  const [name, setName] =
    useState("");

  useEffect(() => {

    async function load() {

      const uid =
        auth.currentUser?.uid;

      if (!uid) {
        return;
      }

      const snapshot =
        await getDoc(
          doc(
            db,
            "users",
            uid,
          ),
        );

      if (!snapshot.exists()) {
        return;
      }

      const data =
        snapshot.data();

      setName(
        data.firstName ?? "",
      );

    }

    load();

  }, []);

  return {
    name,
  };

}