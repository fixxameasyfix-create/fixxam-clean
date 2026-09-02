import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function getWorkerDetails(
  workerId: string,
) {
  const workerRef = doc(
    db,
    "users",
    workerId,
  );

  const snapshot =
    await getDoc(workerRef);

  if (!snapshot.exists()) {
    throw new Error(
      "Worker not found.",
    );
  }

  return snapshot;
}