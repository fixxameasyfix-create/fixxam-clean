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
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type WorkerOrder = DocumentData & {
  id: string;
};

/* ============================================================
   HOOK
============================================================ */

export default function useWorkerOrders(
  workerId: string,
): WorkerOrder[] {
  const [orders, setOrders] =
    useState<WorkerOrder[]>([]);

  useEffect(() => {
    const id = workerId.trim();

    if (!id) {
      setOrders([]);
      return;
    }

    const ordersQuery = query(
      collection(db, "bookings"),
      where("workerId", "==", id),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubscribe = onSnapshot(
      ordersQuery,

      (snapshot) => {
        const nextOrders: WorkerOrder[] =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setOrders(nextOrders);
      },

      (listenerError) => {
        console.error(
          "WORKER_ORDERS_LISTENER_ERROR",
          listenerError,
        );

        setOrders([]);
      },
    );

    return unsubscribe;
  }, [workerId]);

  return orders;
}