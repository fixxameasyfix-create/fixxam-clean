import {
  collection,
  onSnapshot,
  query,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type WorkerSavedRecord = {
  id: string;

  workerId: string;

  customerId: string;

  customerName: string;

  customerPhotoUrl: string;

  createdAt: Timestamp | null;
};

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   SUBSCRIBE
============================================================ */

export function subscribeToWorkerSavedRecords(
  workerId: string,
  onChange: (
    records: WorkerSavedRecord[],
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const safeWorkerId =
    cleanString(
      workerId,
    );

  if (!safeWorkerId) {
    onChange([]);

    return () => {};
  }

  const savedQuery =
    query(
      collection(
        db,
        "savedWorkers",
      ),
      where(
        "workerId",
        "==",
        safeWorkerId,
      ),
    );

  return onSnapshot(
    savedQuery,

    snapshot => {
      const records =
        snapshot.docs
          .map(document => {
            const data =
              document.data();

            const createdAt =
              data.createdAt &&
              typeof data.createdAt.toMillis ===
                "function"
                ? (data.createdAt as Timestamp)
                : null;

            return {
              id:
                document.id,

              workerId:
                cleanString(
                  data.workerId,
                ),

              customerId:
                cleanString(
                  data.customerId,
                ),

              customerName:
                cleanString(
                  data.customerName,
                ) ||
                "Customer",

              customerPhotoUrl:
                cleanString(
                  data.customerPhotoUrl,
                ),

              createdAt,
            };
          })
          .filter(
            record =>
              record.workerId ===
                safeWorkerId &&
              Boolean(
                record.customerId,
              ),
          );

      /*
       * Sort on the client so this query
       * does not require a composite index.
       */
      records.sort(
        (
          first,
          second,
        ) =>
          (second.createdAt?.toMillis() ??
            0) -
          (first.createdAt?.toMillis() ??
            0),
      );

      onChange(
        records,
      );
    },

    error => {
      console.error(
        "WORKER_SAVED_RECORDS_ERROR:",
        error,
      );

      onError?.(
        error,
      );
    },
  );
}