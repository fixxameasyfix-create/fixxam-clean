import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

export default function useWorkerOrders(
  workerId: string,
) {

  const [
    orders,
    setOrders,
  ] = useState<any[]>([]);

  useEffect(() => {

    if (!workerId) {

      return;

    }

    const q = query(

      collection(
        db,
        "bookings",
      ),

      where(
        "workerId",
        "==",
        workerId,
      ),

      orderBy(
        "createdAt",
        "desc",
      ),

      limit(5),

    );

    return onSnapshot(

      q,

      (snapshot) => {

        setOrders(

          snapshot.docs.map(
            (doc) => ({

              id: doc.id,

              ...doc.data(),

            }))

        );

      },

    );

  }, [workerId]);

  return orders;

}