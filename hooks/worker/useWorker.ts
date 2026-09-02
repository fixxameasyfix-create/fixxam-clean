import { useEffect, useState } from "react";

import {
  doc,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export type Worker = {
  uid: string;
  name: string;
  photoUrl: string;
  service: string;
  rating: number;
  location: string;
};

export default function useWorker(workerId?: string) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workerId) {
      setWorker(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", workerId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setWorker(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data() as DocumentData;

        setWorker({
          uid: snapshot.id,

          name: [
            data.firstName,
            data.otherName,
            data.surname,
          ]
            .filter(Boolean)
            .join(" "),

          photoUrl:
            data.workerProfile?.photoUrl ?? "",

          service:
            data.workerProfile?.category ??
            "Worker",

          rating: Number(data.rating ?? 0),

          location:
            data.workerProfile?.location ??
            data.location ??
            "",
        });

        setLoading(false);
      },
      (error) => {
        console.log("WORKER ERROR:", error);
        setWorker(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [workerId]);

  return {
    worker,
    loading,
  };
}