import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type CallSessionStatus =
  | "ringing"
  | "accepted"
  | "connected"
  | "declined"
  | "missed"
  | "ended"
  | "failed";

export type CallParticipantSnapshotInput = {
  name: string;

  image?: string;

  service?: string;
};

export type CreateCustomerCallSessionInput = {
  customerId: string;

  workerId: string;

  customerSnapshot?: CallParticipantSnapshotInput;

  workerSnapshot?: CallParticipantSnapshotInput;
};

export type CustomerCallSession = {
  id: string;

  callerId: string;

  callerRole: "customer";

  calleeId: string;

  calleeRole: "worker";

  status: CallSessionStatus;

  createdAt: Date | null;

  acceptedAt: Date | null;

  connectedAt: Date | null;

  endedAt: Date | null;
};

/* ============================================================
   CONSTANTS
============================================================ */

const CALLS_COLLECTION =
  "calls";

/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function cleanHttpsImage(
  value: unknown,
): string {
  const image =
    cleanString(
      value,
    );

  return image.startsWith(
    "https://",
  )
    ? image
    : "";
}

function normalizeSnapshot(
  snapshot:
    | CallParticipantSnapshotInput
    | undefined,
) {
  if (
    !snapshot
  ) {
    return null;
  }

  const name =
    cleanString(
      snapshot.name,
    );

  if (
    !name
  ) {
    return null;
  }

  return {
    name,

    image:
      cleanHttpsImage(
        snapshot.image,
      ),

    service:
      cleanString(
        snapshot.service,
      ),
  };
}

function toDate(
  value: unknown,
): Date | null {
  return value instanceof Timestamp
    ? value.toDate()
    : null;
}

function isCallStatus(
  value: unknown,
): value is CallSessionStatus {
  return (
    value === "ringing" ||
    value === "accepted" ||
    value === "connected" ||
    value === "declined" ||
    value === "missed" ||
    value === "ended" ||
    value === "failed"
  );
}

/* ============================================================
   CREATE CUSTOMER -> WORKER CALL
============================================================ */

export async function createCustomerCallSession({
  customerId,
  workerId,
  customerSnapshot,
  workerSnapshot,
}: CreateCustomerCallSessionInput): Promise<string> {
  const normalizedCustomerId =
    cleanString(
      customerId,
    );

  const normalizedWorkerId =
    cleanString(
      workerId,
    );

  if (
    !normalizedCustomerId
  ) {
    throw new Error(
      "Customer ID is required.",
    );
  }

  if (
    !normalizedWorkerId
  ) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  if (
    normalizedCustomerId ===
    normalizedWorkerId
  ) {
    throw new Error(
      "You cannot call yourself.",
    );
  }

  const normalizedCustomerSnapshot =
    normalizeSnapshot(
      customerSnapshot,
    );

  const normalizedWorkerSnapshot =
    normalizeSnapshot(
      workerSnapshot,
    );

  const callDocument = {
    /* ========================================================
       UNIFIED PARTICIPANTS
    ======================================================== */

    callerId:
      normalizedCustomerId,

    callerRole:
      "customer" as const,

    calleeId:
      normalizedWorkerId,

    calleeRole:
      "worker" as const,

    /* ========================================================
       DISPLAY SNAPSHOTS
    ======================================================== */

    callerSnapshot:
      normalizedCustomerSnapshot,

    calleeSnapshot:
      normalizedWorkerSnapshot,

    /* ========================================================
       CALL STATE
    ======================================================== */

    status:
      "ringing" as const,

    createdAt:
      serverTimestamp(),

    acceptedAt:
      null,

    connectedAt:
      null,

    endedAt:
      null,

    endedBy:
      null,
  };

  const reference =
    await addDoc(
      collection(
        db,
        CALLS_COLLECTION,
      ),
      callDocument,
    );

  return reference.id;
}

/* ============================================================
   SUBSCRIBE TO CUSTOMER CALL SESSION
============================================================ */

export function subscribeToCallSession(
  callId: string,
  onChange: (
    session: CustomerCallSession,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedCallId =
    cleanString(
      callId,
    );

  if (
    !normalizedCallId
  ) {
    throw new Error(
      "Call ID is required.",
    );
  }

  return onSnapshot(
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    ),

    (
      snapshot,
    ) => {
      if (
        !snapshot.exists()
      ) {
        return;
      }

      const data =
        snapshot.data();

      if (
        !isCallStatus(
          data.status,
        )
      ) {
        console.error(
          "INVALID_CALL_STATUS:",
          {
            callId:
              snapshot.id,

            status:
              data.status,
          },
        );

        return;
      }

      const callerId =
        cleanString(
          data.callerId,
        );

      const calleeId =
        cleanString(
          data.calleeId,
        );

      if (
        !callerId ||
        !calleeId
      ) {
        console.error(
          "INVALID_CALL_PARTICIPANTS:",
          {
            callId:
              snapshot.id,
          },
        );

        return;
      }

      onChange({
        id:
          snapshot.id,

        callerId,

        callerRole:
          "customer",

        calleeId,

        calleeRole:
          "worker",

        status:
          data.status,

        createdAt:
          toDate(
            data.createdAt,
          ),

        acceptedAt:
          toDate(
            data.acceptedAt,
          ),

        connectedAt:
          toDate(
            data.connectedAt,
          ),

        endedAt:
          toDate(
            data.endedAt,
          ),
      });
    },

    (
      error,
    ) => {
      console.error(
        "CUSTOMER_CALL_SUBSCRIPTION_ERROR:",
        error,
      );

      onError?.(
        error,
      );
    },
  );
}

/* ============================================================
   END CUSTOMER CALL
============================================================ */

export async function endCustomerCallSession(
  callId: string,
  customerId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(
      callId,
    );

  const normalizedCustomerId =
    cleanString(
      customerId,
    );

  if (
    !normalizedCallId ||
    !normalizedCustomerId
  ) {
    return;
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  await runTransaction(
    db,
    async (
      transaction,
    ) => {
      const snapshot =
        await transaction.get(
          callRef,
        );

      if (
        !snapshot.exists()
      ) {
        return;
      }

      const data =
        snapshot.data();

      const callerId =
        cleanString(
          data.callerId,
        );

      const calleeId =
        cleanString(
          data.calleeId,
        );

      const status =
        data.status;

      const isParticipant =
        callerId ===
          normalizedCustomerId ||
        calleeId ===
          normalizedCustomerId;

      if (
        !isParticipant
      ) {
        throw new Error(
          "You are not a participant in this call.",
        );
      }

      if (
        status ===
          "ended" ||
        status ===
          "declined" ||
        status ===
          "missed"
      ) {
        return;
      }

      transaction.update(
        callRef,
        {
          status:
            "ended",

          endedAt:
            serverTimestamp(),

          endedBy:
            normalizedCustomerId,
        },
      );
    },
  );
}