import { auth } from "@/firebase/config";

import {
  createCallSession,
  endCall,
  subscribeToCall,
  type FixxamCallParticipantSnapshot,
  type FixxamCallSession,
  type FixxamCallStatus,
} from "./callSession";

/* ============================================================
   TYPES
============================================================ */

export type CallSessionStatus =
  FixxamCallStatus;

export type CallParticipantSnapshotInput = {
  name: string;
  image?: string;
  service?: string;
};

export type CreateCustomerCallSessionInput = {
  customerId: string;
  workerId: string;

  customerSnapshot?:
    | CallParticipantSnapshotInput
    | null;

  workerSnapshot?:
    | CallParticipantSnapshotInput
    | null;
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
   MAP SHARED CALL -> CUSTOMER CALL
============================================================ */

function toCustomerCallSession(
  call: FixxamCallSession,
): CustomerCallSession | null {
  /*
   * This compatibility service represents
   * customer -> worker calls only.
   *
   * The shared call service supports:
   *
   * customer -> worker
   * worker -> customer
   *
   * Worker-originated calls are therefore
   * handled by the shared call service.
   */

  if (
    call.callerRole !== "customer" ||
    call.calleeRole !== "worker"
  ) {
    return null;
  }

  return {
    id: call.id,

    callerId:
      call.callerId,

    callerRole:
      "customer",

    calleeId:
      call.calleeId,

    calleeRole:
      "worker",

    status:
      call.status,

    createdAt:
      call.createdAt,

    acceptedAt:
      call.acceptedAt,

    connectedAt:
      call.connectedAt,

    endedAt:
      call.endedAt,
  };
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

  if (!normalizedCustomerId) {
    throw new Error(
      "Customer ID is required.",
    );
  }

  if (!normalizedWorkerId) {
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

  /*
   * Authentication guard.
   *
   * Firestore rules remain the authoritative
   * security boundary.
   */
  const currentUserId =
    auth.currentUser?.uid;

  if (!currentUserId) {
    throw new Error(
      "You must be signed in to make a call.",
    );
  }

  if (
    currentUserId !==
    normalizedCustomerId
  ) {
    throw new Error(
      "You are not authorized to start this call.",
    );
  }

  /*
   * Use the unified call engine.
   *
   * The shared service handles:
   *
   * - authentication
   * - duplicate active calls
   * - customer -> worker calls
   * - worker -> customer calls
   * - reverse-direction detection
   * - participant snapshots
   * - Firestore persistence
   * - call lifecycle
   */
  return createCallSession({
    callerId:
      normalizedCustomerId,

    callerRole:
      "customer",

    calleeId:
      normalizedWorkerId,

    calleeRole:
      "worker",

    callerSnapshot:
      customerSnapshot,

    calleeSnapshot:
      workerSnapshot,
  });
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
): () => void {
  const normalizedCallId =
    cleanString(
      callId,
    );

  if (!normalizedCallId) {
    throw new Error(
      "Call ID is required.",
    );
  }

  return subscribeToCall(
    normalizedCallId,

    (call) => {
      const customerCall =
        toCustomerCallSession(
          call,
        );

      /*
       * Ignore worker-originated calls.
       *
       * This compatibility API is specifically
       * for the customer -> worker direction.
       *
       * The unified call service should be used
       * for both directions.
       */
      if (!customerCall) {
        return;
      }

      onChange(
        customerCall,
      );
    },

    onError,
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

  if (!normalizedCallId) {
    throw new Error(
      "Call ID is required.",
    );
  }

  if (!normalizedCustomerId) {
    throw new Error(
      "Customer ID is required.",
    );
  }

  /*
   * Client-side authentication guard.
   *
   * Firestore rules remain the authoritative
   * security boundary.
   */
  const currentUserId =
    auth.currentUser?.uid;

  if (!currentUserId) {
    throw new Error(
      "You must be signed in to end this call.",
    );
  }

  if (
    currentUserId !==
    normalizedCustomerId
  ) {
    throw new Error(
      "You are not authorized to end this call.",
    );
  }

  await endCall(
    normalizedCallId,
    normalizedCustomerId,
  );
}