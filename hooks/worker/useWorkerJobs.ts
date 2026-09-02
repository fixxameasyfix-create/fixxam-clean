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
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

type Tab =
  | "pending"
  | "active"
  | "completed";

export default function useWorkerJobs(

  workerId: string,

  tab: Tab,

) {

  const [

    jobs,

    setJobs,

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

    );

    return onSnapshot(

      q,

      (snapshot) => {

        const data = snapshot.docs

          .map((doc) => ({

            id: doc.id,

            ...doc.data(),

          }))

          .filter((job: any) => {

            if (tab === "pending") {

              return [

                "pending_estimate",

                "negotiating",

              ].includes(
                job.status,
              );

            }

            if (tab === "active") {

              return [

                "accepted",

                "enroute",

                "in_progress",

              ].includes(
                job.status,
              );

            }

            return job.status === "completed";

          });

        setJobs(data);

      },

    );

  }, [

    workerId,

    tab,

  ]);

  return jobs;

}