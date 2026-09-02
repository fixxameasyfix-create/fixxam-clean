import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export interface AvailableService {
  id: string;
  name: string;
}

export async function getAvailableServices(): Promise<
  AvailableService[]
> {
  const snapshot = await getDocs(
    collection(db, "services"),
  );

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
    };
  });
}