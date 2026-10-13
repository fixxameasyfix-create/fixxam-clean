import {
  httpsCallable,
} from "firebase/functions";

import {
  auth,
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

type CachedCredentials = {
  credentials:
    LiveKitCallCredentials;

  expiresAt:
    number;
};

/* ============================================================
   CONSTANTS
============================================================ */

/*
 * Never use a token until the very last second.
 *
 * Refresh slightly before the server TTL expires.
 */
const TOKEN_EXPIRY_BUFFER_MS =
  45 * 1000;

/* ============================================================
   CALLABLE
============================================================ */

/*
 * Create the callable once.
 *
 * Do not recreate it on every call attempt.
 */
const getLiveKitCallTokenCallable =
  httpsCallable<
    GetLiveKitCallTokenRequest,
    GetLiveKitCallTokenResponse
  >(
    functions,
    "getLiveKitCallToken",
  );

/* ============================================================
   MEMORY CACHE
============================================================ */

/*
 * Cache is per authenticated user + call.
 *
 * This prevents accidentally reusing another
 * account's caller/callee token on the same device.
 */
const credentialsCache =
  new Map<
    string,
    CachedCredentials
  >();

/*
 * If multiple parts of the UI request the same
 * token simultaneously, only make one network call.
 */
const inFlightRequests =
  new Map<
    string,
    Promise<LiveKitCallCredentials>
  >();

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
    callId.length >
      128 ||
    callId.includes("/")
  ) {
    throw new Error(
      "Invalid Fixxam call ID.",
    );
  }

  return callId;
}

/* ============================================================
   CURRENT USER
============================================================ */

function getCurrentUserId(): string {
  const userId =
    auth.currentUser
      ?.uid
      ?.trim() ??
    "";

  if (
    !userId
  ) {
    throw new Error(
      "You must be signed in to use Fixxam Voice.",
    );
  }

  return userId;
}

/* ============================================================
   CACHE KEY
============================================================ */

function getCacheKey(
  userId: string,
  callId: string,
): string {
  return `${userId}:${callId}`;
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

  if (
    !token
  ) {
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

  if (
    !roomName
  ) {
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
    expiresInSeconds <=
      0
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
   READ CACHE
============================================================ */

function readCachedCredentials(
  cacheKey: string,
): LiveKitCallCredentials | null {
  const cached =
    credentialsCache.get(
      cacheKey,
    );

  if (
    !cached
  ) {
    return null;
  }

  if (
    Date.now() >=
    cached.expiresAt
  ) {
    credentialsCache.delete(
      cacheKey,
    );

    return null;
  }

  return cached.credentials;
}

/* ============================================================
   GET LIVEKIT CALL CREDENTIALS
============================================================ */

export async function getLiveKitCallCredentials(
  callIdValue: string,
  options?: {
    forceRefresh?: boolean;
  },
): Promise<LiveKitCallCredentials> {
  const callId =
    normalizeCallId(
      callIdValue,
    );

  const userId =
    getCurrentUserId();

  const cacheKey =
    getCacheKey(
      userId,
      callId,
    );

  /* ==========================================================
     FAST CACHE HIT
  ========================================================== */

  if (
    !options?.forceRefresh
  ) {
    const cached =
      readCachedCredentials(
        cacheKey,
      );

    if (
      cached
    ) {
      if (
        __DEV__
      ) {
        console.info(
          "FIXXAM_LIVEKIT_CREDENTIALS_CACHE_HIT:",
          {
            callId,
          },
        );
      }

      return cached;
    }
  }

  /* ==========================================================
     DEDUPLICATE NETWORK REQUEST
  ========================================================== */

  const existingRequest =
    inFlightRequests.get(
      cacheKey,
    );

  if (
    existingRequest
  ) {
    return existingRequest;
  }

  /* ==========================================================
     FETCH
  ========================================================== */

  const requestPromise =
    (async () => {
      try {
        const startedAt =
          Date.now();

        const result =
          await getLiveKitCallTokenCallable({
            callId,
          });

        const credentials =
          normalizeCredentials(
            result.data,
          );

        const ttlMs =
          credentials
            .expiresInSeconds *
          1000;

        const safeLifetimeMs =
          Math.max(
            1000,
            ttlMs -
              TOKEN_EXPIRY_BUFFER_MS,
          );

        credentialsCache.set(
          cacheKey,
          {
            credentials,

            expiresAt:
              Date.now() +
              safeLifetimeMs,
          },
        );

        if (
          __DEV__
        ) {
          console.info(
            "FIXXAM_LIVEKIT_CREDENTIALS_READY:",
            {
              callId,

              durationMs:
                Date.now() -
                startedAt,

              cached:
                true,
            },
          );
        }

        return credentials;
      } catch (
        error
      ) {
        credentialsCache.delete(
          cacheKey,
        );

        console.error(
          "FIXXAM_GET_LIVEKIT_CALL_CREDENTIALS_ERROR:",
          {
            callId,

            error,
          },
        );

        throw error;
      }
    })();

  inFlightRequests.set(
    cacheKey,
    requestPromise,
  );

  try {
    return await requestPromise;
  } finally {
    if (
      inFlightRequests.get(
        cacheKey,
      ) ===
      requestPromise
    ) {
      inFlightRequests.delete(
        cacheKey,
      );
    }
  }
}

/* ============================================================
   PREFETCH
============================================================ */

/*
 * Call this while the CALLER is still seeing "Ringing".
 *
 * Backend security allows only the caller to prefetch
 * during ringing.
 *
 * When shared voice screen later requests credentials,
 * they will already be available from memory.
 */
export function prefetchLiveKitCallCredentials(
  callIdValue: string,
): void {
  const callId =
    normalizeCallId(
      callIdValue,
    );

  void getLiveKitCallCredentials(
    callId,
  ).catch(
    error => {
      /*
       * Prefetch failure must not kill the call.
       *
       * The normal connection flow will retry when
       * the participant actually needs to join.
       */
      if (
        __DEV__
      ) {
        console.info(
          "FIXXAM_LIVEKIT_PREFETCH_SKIPPED:",
          {
            callId,

            error,
          },
        );
      }
    },
  );
}

/* ============================================================
   CLEAR ONE CALL
============================================================ */

export function clearLiveKitCallCredentials(
  callIdValue: string,
): void {
  const callId =
    normalizeCallId(
      callIdValue,
    );

  const userId =
    auth.currentUser
      ?.uid
      ?.trim();

  if (
    !userId
  ) {
    return;
  }

  const cacheKey =
    getCacheKey(
      userId,
      callId,
    );

  credentialsCache.delete(
    cacheKey,
  );

  inFlightRequests.delete(
    cacheKey,
  );
}