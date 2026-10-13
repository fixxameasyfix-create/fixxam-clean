import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

export type SavedWorker = {
  id: string;
  workerId: string;
  customerId: string;

  workerName?: string;
  workerPhotoUrl?: string;

  customerName?: string;
  customerPhotoUrl?: string;

  createdAt?: unknown;
  updatedAt?: unknown;
};

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function buildSavedWorkerId(
  workerId: string,
  customerId: string,
): string {
  return `${workerId}_${customerId}`;
}

function buildPersonName(
  data: Record<string, unknown>,
): string {
  const fullName =
    cleanString(data.fullName);

  if (fullName) {
    return fullName;
  }

  const displayName =
    cleanString(data.displayName);

  if (displayName) {
    return displayName;
  }

  const name = [
    cleanString(data.firstName),
    cleanString(data.otherName),
    cleanString(data.surname),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name;
}

function getPhotoUrl(
  data: Record<string, unknown>,
): string {
  return (
    cleanString(data.photoUrl) ||
    cleanString(data.photoURL) ||
    cleanString(data.profilePhotoUrl) ||
    cleanString(data.profileImageUrl) ||
    cleanString(data.avatarUrl)
  );
}

/* ==============================================================
   SAVE WORKER
============================================================== */

export async function saveWorker(
  workerId: string,
): Promise<void> {
  const customer = auth.currentUser;

  if (!customer) {
    throw new Error("AUTH_REQUIRED");
  }

  const safeWorkerId =
    cleanString(workerId);

  if (!safeWorkerId) {
    throw new Error("INVALID_WORKER_ID");
  }

  if (safeWorkerId === customer.uid) {
    throw new Error("CANNOT_SAVE_SELF");
  }

  /* ============================================================
     CUSTOMER PROFILE
  ============================================================ */

  const customerRef = doc(
    db,
    "users",
    customer.uid,
  );

  const customerSnapshot =
    await getDoc(customerRef);

  if (!customerSnapshot.exists()) {
    throw new Error(
      "CUSTOMER_PROFILE_NOT_FOUND",
    );
  }

  const customerData =
    customerSnapshot.data() as Record<
      string,
      unknown
    >;

  const customerName =
    buildPersonName(customerData);

  const customerPhotoUrl =
    getPhotoUrl(customerData);

  /* ============================================================
     SAVE DOCUMENT
  ============================================================ */

  const savedWorkerId =
    buildSavedWorkerId(
      safeWorkerId,
      customer.uid,
    );

  const savedWorkerRef = doc(
    db,
    "savedWorkers",
    savedWorkerId,
  );

  const existingSnapshot =
    await getDoc(savedWorkerRef);

  if (existingSnapshot.exists()) {
    return;
  }

  await setDoc(
    savedWorkerRef,
    {
      workerId: safeWorkerId,

      customerId:
        customer.uid,

      customerName,

      customerPhotoUrl,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );
}

/* ==============================================================
   UNSAVE WORKER
============================================================== */

export async function unsaveWorker(
  workerId: string,
): Promise<void> {
  const customer =
    auth.currentUser;

  if (!customer) {
    throw new Error(
      "AUTH_REQUIRED",
    );
  }

  const safeWorkerId =
    cleanString(workerId);

  if (!safeWorkerId) {
    throw new Error(
      "INVALID_WORKER_ID",
    );
  }

  const savedWorkerId =
    buildSavedWorkerId(
      safeWorkerId,
      customer.uid,
    );

  await deleteDoc(
    doc(
      db,
      "savedWorkers",
      savedWorkerId,
    ),
  );
}

/* ==============================================================
   CHECK IF WORKER IS SAVED
============================================================== */

export function subscribeToWorkerSavedState(
  workerId: string,
  onChange: (
    saved: boolean,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const customer =
    auth.currentUser;

  const safeWorkerId =
    cleanString(workerId);

  if (
    !customer ||
    !safeWorkerId
  ) {
    onChange(false);

    return () => {};
  }

  const savedWorkerId =
    buildSavedWorkerId(
      safeWorkerId,
      customer.uid,
    );

  const savedWorkerRef =
    doc(
      db,
      "savedWorkers",
      savedWorkerId,
    );

  return onSnapshot(
    savedWorkerRef,

    snapshot => {
      onChange(
        snapshot.exists(),
      );
    },

    error => {
      console.error(
        "SAVED_WORKER_STATE_ERROR:",
        error,
      );

      onError?.(
        error,
      );
    },
  );
}



/* ==============================================================
   SUBSCRIBE TO SAVED WORKERS COUNT
============================================================== */

export function subscribeToSavedWorkersCount(
  onChange: (count: number) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const customer = auth.currentUser;

  if (!customer) {
    onChange(0);
    return () => {};
  }

  const savedWorkersQuery = query(
    collection(db, "savedWorkers"),
    where("customerId", "==", customer.uid),
  );

  return onSnapshot(
    savedWorkersQuery,
    (snapshot) => {
      onChange(snapshot.size);
    },
    (error) => {
      console.error(
        "SAVED_WORKERS_COUNT_SUBSCRIPTION_ERROR:",
        error,
      );

      onError?.(error);
    },
  );
}

/* ==============================================================
   SUBSCRIBE TO ALL SAVED WORKERS
============================================================== */

export function subscribeToSavedWorkers(
  onChange: (
    workers: SavedWorker[],
  ) => void,

  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const customer =
    auth.currentUser;

  if (!customer) {
    onChange([]);

    return () => {};
  }

  /* ============================================================
     CUSTOMER SAVED WORKERS QUERY
  ============================================================ */

  const savedWorkersQuery =
    query(
      collection(
        db,
        "savedWorkers",
      ),

      where(
        "customerId",
        "==",
        customer.uid,
      ),
    );

  return onSnapshot(
    savedWorkersQuery,

    async snapshot => {
      try {
        const results:
          SavedWorker[] =
          await Promise.all(
            snapshot.docs.map(
              async savedDoc => {
                const data =
                  savedDoc.data() as Record<
                    string,
                    unknown
                  >;

                const workerId =
                  cleanString(
                    data.workerId,
                  );

                let workerName =
                  "";

                let workerPhotoUrl =
                  "";

                /* ==================================================
                   GET WORKER PUBLIC PROFILE

                   IMPORTANT:
                   We use workerPublicProfiles instead of users
                   because users/{workerId} is private.
                ================================================== */

                if (workerId) {
                  const workerRef =
                    doc(
                      db,
                      "workerPublicProfiles",
                      workerId,
                    );

                  const workerSnapshot =
                    await getDoc(
                      workerRef,
                    );

                  if (
                    workerSnapshot.exists()
                  ) {
                    const workerData =
                      workerSnapshot.data() as Record<
                        string,
                        unknown
                      >;

                    workerName =
                      buildPersonName(
                        workerData,
                      );

                    workerPhotoUrl =
                      getPhotoUrl(
                        workerData,
                      );
                  }
                }

                return {
                  id:
                    savedDoc.id,

                  workerId,

                  customerId:
                    cleanString(
                      data.customerId,
                    ),

                  workerName:
                    workerName ||
                    "Saved Worker",

                  workerPhotoUrl,

                  customerName:
                    cleanString(
                      data.customerName,
                    ),

                  customerPhotoUrl:
                    cleanString(
                      data.customerPhotoUrl,
                    ),

                  createdAt:
                    data.createdAt,

                  updatedAt:
                    data.updatedAt,
                };
              },
            ),
          );

        /* ========================================================
           NEWEST SAVED WORKERS FIRST

           Client-side sorting means we don't need
           a Firestore composite index.
        ======================================================== */

        results.sort(
          (a, b) => {
            const aTime =
              getTimestampValue(
                a.createdAt,
              );

            const bTime =
              getTimestampValue(
                b.createdAt,
              );

            return bTime - aTime;
          },
        );

        onChange(results);
      } catch (error) {
        console.error(
          "SAVED_WORKERS_LOAD_ERROR:",
          error,
        );

        onError?.(
          error instanceof Error
            ? error
            : new Error(
                "Unable to load saved workers.",
              ),
        );
      }
    },

    error => {
      console.error(
        "SAVED_WORKERS_SUBSCRIPTION_ERROR:",
        error,
      );

      onError?.(
        error,
      );
    },
  );
}

/* ==============================================================
   TIMESTAMP HELPER
============================================================== */

function getTimestampValue(
  value: unknown,
): number {
  if (!value) {
    return 0;
  }

  if (
    typeof value ===
      "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (
      value as {
        toMillis?: unknown;
      }
    ).toMillis ===
      "function"
  ) {
    return (
      value as {
        toMillis: () => number;
      }
    ).toMillis();
  }

  if (
    value instanceof Date
  ) {
    return value.getTime();
  }

  return 0;
}