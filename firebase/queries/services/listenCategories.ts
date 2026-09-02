import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export function listenCategories(
  callback: (data: ServiceCategory[]) => void,
) {
  const q = query(
    collection(db, "categories"),
    where("active", "==", true),
    orderBy("order"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const categories: ServiceCategory[] = [
        {
          id: "all",
          name: "All",
          icon: "apps",
          color: "#2563EB",
        },
        ...snapshot.docs.map((doc) => {
          const item = doc.data();

          return {
            id: doc.id,
            name: item.name ?? "",
            icon: item.icon,
            color: item.color,
          };
        }),
      ];

      callback(categories);
    },
    console.error,
  );
}