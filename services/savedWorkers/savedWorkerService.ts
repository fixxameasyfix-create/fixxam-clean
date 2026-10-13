import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/firebase/config";

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function buildSavedWorkerId(
  workerId: string,
  customerId: string,
): string {
  return `${workerId}_${customerId}`;
}

function buildCustomerName(
  data: Record<string, unknown>,
): string {
  const fullName =
    cleanString(
      data.fullName,
    );

  if (fullName) {
    return fullName;
  }

  const name =
    [
      cleanString(
        data.firstName,
      ),

      cleanString(
        data.otherName,
      ),

      cleanString(
        data.surname,
      ),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  return (
    name ||
    "Customer"
  );
}

/* ==============================================================
   SAVE WORKER
============================================================== */

export async function saveWorker(
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
    cleanString(
      workerId,
    );

  if (!safeWorkerId) {
    throw new Error(
      "INVALID_WORKER_ID",
    );
  }

  if (
    safeWorkerId ===
    customer.uid
  ) {
    throw new Error(
      "CANNOT_SAVE_SELF",
    );
  }

  /* ============================================================
     CUSTOMER PROFILE
  ============================================================ */

  const customerRef =
    doc(
      db,
      "users",
      customer.uid,
    );

  const customerSnapshot =
    await getDoc(
      customerRef,
    );

  if (
    !customerSnapshot.exists()
  ) {
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
    buildCustomerName(
      customerData,
    );

  const customerPhotoUrl =
    cleanString(
      customerData.photoUrl,
    ) ||
    cleanString(
      customerData.photoURL,
    );

  /* ============================================================
     SAVE DOCUMENT
  ============================================================ */

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

  /*
   * Deterministic document ID prevents
   * duplicate customer → worker saves.
   *
   * We intentionally do not overwrite an
   * existing record. This also prevents a
   * normal repeated tap from changing the
   * original saved time.
   */
  const existingSnapshot =
    await getDoc(
      savedWorkerRef,
    );

  if (
    existingSnapshot.exists()
  ) {
    return;
  }

  await setDoc(
    savedWorkerRef,
    {
      workerId:
        safeWorkerId,

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
    cleanString(
      workerId,
    );

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
   REALTIME SAVED STATE
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
    cleanString(
      workerId,
    );

  if (
    !customer ||
    !safeWorkerId
  ) {
    onChange(
      false,
    );

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