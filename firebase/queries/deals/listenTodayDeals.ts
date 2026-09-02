import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export function listenTodayDeals(
  callback: (deal: any | null) => void,
) {
  const dealsQuery = query(
    collection(db, "deals"),
    where("active", "==", true),
    orderBy("createdAt", "desc"),
    limit(1),
  );

  return onSnapshot(
    dealsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      callback({
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      });
    },
  );
}