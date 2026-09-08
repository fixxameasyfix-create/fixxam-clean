import {
  httpsCallable,
} from "firebase/functions";

import {
  functions,
} from "@/firebase/config";

/* ============================================================
   TYPES
============================================================ */

export type LiveKitParticipantRole =
  | "customer"
  | "worker";

export type LiveKitCallCredentials = {
  token: string;

  url: string;

  roomName: string;

  participantRole:
    LiveKitParticipantRole;

  expiresInSeconds: number;
};

type GetLiveKitCallTokenRequest = {
  callId: string;
};

type GetLiveKitCallTokenResponse = {
  token?: unknown;

  url?: unknown;

  roomName?: unknown;

  participantRole?: unknown;

  expiresInSeconds?: unknown;
};

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

function isParticipantRole(
  value: unknown,
): value is LiveKitParticipantRole {
  return (
    value === "customer" ||
    value === "worker"
  );
}

/* ============================================================
   VALIDATE CALL ID
============================================================ */

function normalizeCallId(
  value: string,
): string {
  const callId =
    value.trim();

  if (
    !callId ||
    callId.length > 128 ||
    callId.includes("/")
  ) {
    throw new Error(
      "Invalid Fixxam call ID.",
    );
  }

  return callId;
}

/* ============================================================
   VALIDATE SERVER RESPONSE
============================================================ */

function normalizeCredentials(
  value:
    GetLiveKitCallTokenResponse,
): LiveKitCallCredentials {
  const token =
    cleanString(
      value.token,
    );

  const url =
    cleanString(
      value.url,
    );

  const roomName =
    cleanString(
      value.roomName,
    );

  const participantRole =
    value.participantRole;

  const expiresInSeconds =
    value.expiresInSeconds;

  if (!token) {
    throw new Error(
      "LiveKit token is missing.",
    );
  }

  if (
    !url ||
    !url.startsWith(
      "wss://",
    )
  ) {
    throw new Error(
      "LiveKit server URL is invalid.",
    );
  }

  if (!roomName) {
    throw new Error(
      "LiveKit room name is missing.",
    );
  }

  if (
    !isParticipantRole(
      participantRole,
    )
  ) {
    throw new Error(
      "LiveKit participant role is invalid.",
    );
  }

  if (
    typeof expiresInSeconds !==
      "number" ||
    !Number.isFinite(
      expiresInSeconds,
    ) ||
    expiresInSeconds <= 0
  ) {
    throw new Error(
      "LiveKit token expiration is invalid.",
    );
  }

  return {
    token,

    url,

    roomName,

    participantRole,

    expiresInSeconds,
  };
}

/* ============================================================
   GET LIVEKIT CALL CREDENTIALS
============================================================ */

export async function getLiveKitCallCredentials(
  callIdValue: string,
): Promise<LiveKitCallCredentials> {
  const callId =
    normalizeCallId(
      callIdValue,
    );

  const callable =
    httpsCallable<
      GetLiveKitCallTokenRequest,
      GetLiveKitCallTokenResponse
    >(
      functions,
      "getLiveKitCallToken",
    );

  try {
    const result =
      await callable({
        callId,
      });

    return normalizeCredentials(
      result.data,
    );
  } catch (error) {
    console.error(
      "FIXXAM_GET_LIVEKIT_CALL_CREDENTIALS_ERROR:",
      error,
    );

    throw error;
  }
}