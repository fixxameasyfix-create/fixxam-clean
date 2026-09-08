import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type FixxamCallRole =
  | "customer"
  | "worker";

export type FixxamCallStatus =
  | "ringing"
  | "accepted"
  | "connected"
  | "declined"
  | "missed"
  | "ended"
  | "failed";

/* ============================================================
   PARTICIPANT SNAPSHOT
============================================================ */

/**
 * Safe public display information captured
 * when the call is created.
 *
 * Never place phone numbers or other private
 * profile information here.
 */
export type FixxamCallParticipantSnapshot = {
  name: string;

  image: string;

  service: string;
};

/* ============================================================
   CALL SESSION
============================================================ */

export type FixxamCallSession = {
  id: string;

  callerId: string;

  callerRole: FixxamCallRole;

  calleeId: string;

  calleeRole: FixxamCallRole;

  callerSnapshot:
    | FixxamCallParticipantSnapshot
    | null;

  calleeSnapshot:
    | FixxamCallParticipantSnapshot
    | null;

  status: FixxamCallStatus;

  createdAt: Date | null;

  acceptedAt: Date | null;

  connectedAt: Date | null;

  endedAt: Date | null;

  endedBy: string | null;
};

/* ============================================================
   INCOMING CALL SUBSCRIPTION INPUT
============================================================ */

type SubscribeIncomingCallsInput = {
  userId: string;

  role: FixxamCallRole;

  onIncomingCall: (
    call: FixxamCallSession,
  ) => void;

  onNoIncomingCall?: () => void;

  onError?: (
    error: Error,
  ) => void;
};

/* ============================================================
   CONSTANTS
============================================================ */

const CALLS_COLLECTION =
  "calls";

/* ============================================================
   STRING HELPER
============================================================ */

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/* ============================================================
   HTTPS IMAGE HELPER
============================================================ */

function cleanHttpsImage(
  value: unknown,
): string {
  const image =
    cleanString(
      value,
    );

  if (
    !image.startsWith(
      "https://",
    )
  ) {
    return "";
  }

  return image;
}

/* ============================================================
   CALL ROLE VALIDATION
============================================================ */

function isCallRole(
  value: unknown,
): value is FixxamCallRole {
  return (
    value === "customer" ||
    value === "worker"
  );
}

/* ============================================================
   CALL STATUS VALIDATION
============================================================ */

function isCallStatus(
  value: unknown,
): value is FixxamCallStatus {
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
   FIRESTORE TIMESTAMP -> DATE
============================================================ */

function toDate(
  value: unknown,
): Date | null {
  if (
    value instanceof Timestamp
  ) {
    return value.toDate();
  }

  return null;
}

/* ============================================================
   PARTICIPANT SNAPSHOT MAPPER
============================================================ */

function mapParticipantSnapshot(
  value: unknown,
): FixxamCallParticipantSnapshot | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const name =
    cleanString(
      data.name,
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
        data.image,
      ),

    service:
      cleanString(
        data.service,
      ),
  };
}

/* ============================================================
   CALL SESSION MAPPER
============================================================ */

function mapCallSession(
  id: string,
  value: unknown,
): FixxamCallSession | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  /* ==========================================================
     PARTICIPANTS
  ========================================================== */

  const callerId =
    cleanString(
      data.callerId,
    );

  const calleeId =
    cleanString(
      data.calleeId,
    );

  /* ==========================================================
     VALIDATION
  ========================================================== */

  if (
    !callerId ||
    !calleeId ||
    !isCallRole(
      data.callerRole,
    ) ||
    !isCallRole(
      data.calleeRole,
    ) ||
    !isCallStatus(
      data.status,
    )
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "INVALID_FIXXAM_CALL_DOCUMENT:",
        {
          callId:
            id,

          hasCallerId:
            Boolean(
              callerId,
            ),

          hasCalleeId:
            Boolean(
              calleeId,
            ),

          callerRole:
            data.callerRole,

          calleeRole:
            data.calleeRole,

          status:
            data.status,
        },
      );
    }

    return null;
  }

  /* ==========================================================
     SNAPSHOTS
  ========================================================== */

  const callerSnapshot =
    mapParticipantSnapshot(
      data.callerSnapshot,
    );

  const calleeSnapshot =
    mapParticipantSnapshot(
      data.calleeSnapshot,
    );

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    id,

    callerId,

    callerRole:
      data.callerRole,

    calleeId,

    calleeRole:
      data.calleeRole,

    callerSnapshot,

    calleeSnapshot,

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

    endedBy:
      cleanString(
        data.endedBy,
      ) ||
      null,
  };
}

/* ============================================================
   GET CALL
============================================================ */

export async function getCallSession(
  callId: string,
): Promise<
  FixxamCallSession | null
> {
  const normalizedId =
    cleanString(
      callId,
    );

  if (
    !normalizedId
  ) {
    return null;
  }

  const snapshot =
    await getDoc(
      doc(
        db,
        CALLS_COLLECTION,
        normalizedId,
      ),
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  return mapCallSession(
    snapshot.id,
    snapshot.data(),
  );
}

/* ============================================================
   SUBSCRIBE TO CALL
============================================================ */

export function subscribeToCall(
  callId: string,
  onChange: (
    call: FixxamCallSession,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedId =
    cleanString(
      callId,
    );

  if (
    !normalizedId
  ) {
    throw new Error(
      "Call ID is required.",
    );
  }

  return onSnapshot(
    doc(
      db,
      CALLS_COLLECTION,
      normalizedId,
    ),

    (
      snapshot,
    ) => {
      if (
        !snapshot.exists()
      ) {
        return;
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (
        !call
      ) {
        return;
      }

      onChange(
        call,
      );
    },

    (
      error,
    ) => {
      console.error(
        "CALL_SUBSCRIPTION_ERROR:",
        error,
      );

      onError?.(
        error,
      );
    },
  );
}

/* ============================================================
   INCOMING CALL LISTENER
============================================================ */

export function subscribeToIncomingCalls({
  userId,
  role,
  onIncomingCall,
  onNoIncomingCall,
  onError,
}: SubscribeIncomingCallsInput): Unsubscribe {
  const normalizedUserId =
    cleanString(
      userId,
    );

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "User ID is required.",
    );
  }

  /* ==========================================================
     QUERY
  ========================================================== */

  const callsQuery =
    query(
      collection(
        db,
        CALLS_COLLECTION,
      ),

      where(
        "calleeId",
        "==",
        normalizedUserId,
      ),

      where(
        "status",
        "==",
        "ringing",
      ),

      limit(
        10,
      ),
    );

  /* ==========================================================
     LISTENER
  ========================================================== */

  return onSnapshot(
    callsQuery,

    (
      snapshot,
    ) => {
      const incomingCalls =
        snapshot.docs
          .map(
            (
              callDoc,
            ) =>
              mapCallSession(
                callDoc.id,
                callDoc.data(),
              ),
          )
          .filter(
            (
              call,
            ): call is FixxamCallSession =>
              Boolean(
                call &&
                call.calleeRole ===
                  role &&
                call.calleeId ===
                  normalizedUserId &&
                call.status ===
                  "ringing",
              ),
          )
          .sort(
            (
              a,
              b,
            ) =>
              (
                b.createdAt
                  ?.getTime() ??
                0
              ) -
              (
                a.createdAt
                  ?.getTime() ??
                0
              ),
          );

      const latestCall =
        incomingCalls[0];

      if (
        !latestCall
      ) {
        onNoIncomingCall?.();

        return;
      }

      onIncomingCall(
        latestCall,
      );
    },

    (
      error,
    ) => {
      console.error(
        "INCOMING_CALL_LISTENER_ERROR:",
        {
          userId:
            normalizedUserId,

          role,

          error,
        },
      );

      onError?.(
        error,
      );
    },
  );
}

/* ============================================================
   ACCEPT INCOMING CALL
============================================================ */

export async function acceptIncomingCall(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(
      callId,
    );

  const normalizedUserId =
    cleanString(
      userId,
    );

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    throw new Error(
      "Call ID and user ID are required.",
    );
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  /* ==========================================================
     TRANSACTION
  ========================================================== */

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
        throw new Error(
          "Call does not exist.",
        );
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (
        !call
      ) {
        throw new Error(
          "Invalid call session.",
        );
      }

      /* ======================================================
         ONLY CALLEE CAN ACCEPT
      ====================================================== */

      if (
        call.calleeId !==
        normalizedUserId
      ) {
        throw new Error(
          "You cannot accept this call.",
        );
      }

      /* ======================================================
         MUST STILL BE RINGING
      ====================================================== */

      if (
        call.status !==
        "ringing"
      ) {
        throw new Error(
          "This call is no longer ringing.",
        );
      }

      /* ======================================================
         ACCEPT
      ====================================================== */

      transaction.update(
        callRef,
        {
          status:
            "accepted",

          acceptedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   DECLINE INCOMING CALL
============================================================ */

export async function declineIncomingCall(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(
      callId,
    );

  const normalizedUserId =
    cleanString(
      userId,
    );

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    throw new Error(
      "Call ID and user ID are required.",
    );
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  /* ==========================================================
     TRANSACTION
  ========================================================== */

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
        throw new Error(
          "Call does not exist.",
        );
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (
        !call
      ) {
        throw new Error(
          "Invalid call session.",
        );
      }

      /* ======================================================
         ONLY CALLEE CAN DECLINE
      ====================================================== */

      if (
        call.calleeId !==
        normalizedUserId
      ) {
        throw new Error(
          "You cannot decline this call.",
        );
      }

      /* ======================================================
         ALREADY NOT RINGING
      ====================================================== */

      if (
        call.status !==
        "ringing"
      ) {
        return;
      }

      /* ======================================================
         DECLINE
      ====================================================== */

      transaction.update(
        callRef,
        {
          status:
            "declined",

          endedAt:
            serverTimestamp(),

          endedBy:
            normalizedUserId,
        },
      );
    },
  );
}

/* ============================================================
   MARK CALL CONNECTED
============================================================ */

/**
 * IMPORTANT:
 *
 * Do not call this immediately when the
 * callee presses Accept.
 *
 * Flow:
 *
 * ringing
 *   ↓
 * accepted
 *   ↓
 * realtime voice transport joins
 *   ↓
 * connected
 *
 * Later LiveKit integration should call this
 * after the voice room has successfully joined.
 */
export async function markCallConnected(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(
      callId,
    );

  const normalizedUserId =
    cleanString(
      userId,
    );

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    throw new Error(
      "Call ID and user ID are required.",
    );
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  /* ==========================================================
     TRANSACTION
  ========================================================== */

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
        throw new Error(
          "Call does not exist.",
        );
      }

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (
        !call
      ) {
        throw new Error(
          "Invalid call session.",
        );
      }

      /* ======================================================
         PARTICIPANT AUTHORIZATION
      ====================================================== */

      const isParticipant =
        call.callerId ===
          normalizedUserId ||
        call.calleeId ===
          normalizedUserId;

      if (
        !isParticipant
      ) {
        throw new Error(
          "You are not a participant in this call.",
        );
      }

      /* ======================================================
         ALREADY CONNECTED
      ====================================================== */

      if (
        call.status ===
        "connected"
      ) {
        return;
      }

      /* ======================================================
         MUST FIRST BE ACCEPTED
      ====================================================== */

      if (
        call.status !==
        "accepted"
      ) {
        throw new Error(
          "Call must be accepted before connecting.",
        );
      }

      /* ======================================================
         CONNECT
      ====================================================== */

      transaction.update(
        callRef,
        {
          status:
            "connected",

          connectedAt:
            serverTimestamp(),
        },
      );
    },
  );
}

/* ============================================================
   END CALL
============================================================ */

export async function endCall(
  callId: string,
  userId: string,
): Promise<void> {
  const normalizedCallId =
    cleanString(
      callId,
    );

  const normalizedUserId =
    cleanString(
      userId,
    );

  if (
    !normalizedCallId ||
    !normalizedUserId
  ) {
    return;
  }

  const callRef =
    doc(
      db,
      CALLS_COLLECTION,
      normalizedCallId,
    );

  /* ==========================================================
     TRANSACTION
  ========================================================== */

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

      const call =
        mapCallSession(
          snapshot.id,
          snapshot.data(),
        );

      if (
        !call
      ) {
        return;
      }

      /* ======================================================
         PARTICIPANT AUTHORIZATION
      ====================================================== */

      const isParticipant =
        call.callerId ===
          normalizedUserId ||
        call.calleeId ===
          normalizedUserId;

      if (
        !isParticipant
      ) {
        throw new Error(
          "You are not a participant in this call.",
        );
      }

      /* ======================================================
         TERMINAL STATUS
      ====================================================== */

      if (
        call.status ===
          "ended" ||
        call.status ===
          "declined" ||
        call.status ===
          "missed" ||
        call.status ===
          "failed"
      ) {
        return;
      }

      /* ======================================================
         END
      ====================================================== */

      transaction.update(
        callRef,
        {
          status:
            "ended",

          endedAt:
            serverTimestamp(),

          endedBy:
            normalizedUserId,
        },
      );
    },
  );
}