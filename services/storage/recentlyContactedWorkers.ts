import AsyncStorage from "@react-native-async-storage/async-storage";

/* ============================================================
   TYPES
============================================================ */

export type RecentlyContactedWorker = {
  id: string;

  name: string;

  service: string;

  rating: number;

  image: string;

  contactedAt: string;
};

export type SaveRecentlyContactedWorkerInput =
  Pick<
    RecentlyContactedWorker,
    | "id"
    | "name"
    | "service"
    | "rating"
    | "image"
  >;

type RecentlyContactedListener = (
  workers: RecentlyContactedWorker[],
) => void;

/* ============================================================
   CONSTANTS
============================================================ */

const STORAGE_VERSION =
  "v2";

/*
 * v1 previously contained phoneNumber.
 *
 * We migrate its useful data to v2
 * and remove the old key from the device.
 */
const LEGACY_STORAGE_VERSION =
  "v1";

const MAX_RECENT_WORKERS =
  20;

/* ============================================================
   LOCAL SUBSCRIPTIONS
============================================================ */

const listenersByUser =
  new Map<
    string,
    Set<RecentlyContactedListener>
  >();

/* ============================================================
   WRITE QUEUE
============================================================ */

/*
 * AsyncStorage read -> modify -> write is not atomic.
 *
 * Serialize writes per customer so two call sessions
 * cannot overwrite each other's recent-call history.
 */
const writeQueueByUser =
  new Map<
    string,
    Promise<void>
  >();

/* ============================================================
   HELPERS
============================================================ */

function normalizeUserId(
  userId: string,
): string {
  return userId.trim();
}

function cleanString(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function normalizeRating(
  value: unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      value,
    ),
  );
}

/* ============================================================
   STORAGE KEYS
============================================================ */

function getStorageKey(
  userId: string,
): string {
  return `fixxam:customer:${userId}:recently-contacted:${STORAGE_VERSION}`;
}

function getLegacyStorageKey(
  userId: string,
): string {
  return `fixxam:customer:${userId}:recently-contacted:${LEGACY_STORAGE_VERSION}`;
}

/* ============================================================
   NOTIFY SUBSCRIBERS
============================================================ */

function notifyListeners(
  userId: string,
  workers: RecentlyContactedWorker[],
): void {
  const listeners =
    listenersByUser.get(
      userId,
    );

  if (
    !listeners ||
    listeners.size ===
      0
  ) {
    return;
  }

  listeners.forEach(
    (
      listener,
    ) => {
      try {
        listener(
          workers,
        );
      } catch (
        error
      ) {
        console.error(
          "RECENTLY_CONTACTED_LISTENER_ERROR:",
          error,
        );
      }
    },
  );
}

/* ============================================================
   SUBSCRIBE
============================================================ */

export function subscribeToRecentlyContactedWorkers(
  userId: string,
  listener: RecentlyContactedListener,
): () => void {
  const normalizedUserId =
    normalizeUserId(
      userId,
    );

  if (
    !normalizedUserId
  ) {
    return () =>
      undefined;
  }

  let listeners =
    listenersByUser.get(
      normalizedUserId,
    );

  if (
    !listeners
  ) {
    listeners =
      new Set<RecentlyContactedListener>();

    listenersByUser.set(
      normalizedUserId,
      listeners,
    );
  }

  listeners.add(
    listener,
  );

  return () => {
    const currentListeners =
      listenersByUser.get(
        normalizedUserId,
      );

    if (
      !currentListeners
    ) {
      return;
    }

    currentListeners.delete(
      listener,
    );

    if (
      currentListeners.size ===
      0
    ) {
      listenersByUser.delete(
        normalizedUserId,
      );
    }
  };
}

/* ============================================================
   NORMALIZE STORED WORKER
============================================================ */

function normalizeStoredWorker(
  value: unknown,
): RecentlyContactedWorker | null {
  if (
    !value ||
    typeof value !==
      "object"
  ) {
    return null;
  }

  /*
   * Use a generic record intentionally.
   *
   * Legacy v1 records may contain
   * additional fields such as phoneNumber.
   *
   * We only pick safe fields needed by v2.
   */
  const worker =
    value as Record<
      string,
      unknown
    >;

  const id =
    cleanString(
      worker.id,
    );

  const name =
    cleanString(
      worker.name,
    );

  const service =
    cleanString(
      worker.service,
    );

  const image =
    cleanString(
      worker.image,
    );

  const contactedAt =
    cleanString(
      worker.contactedAt,
    );

  const rating =
    normalizeRating(
      worker.rating,
    );

  if (
    !id ||
    !contactedAt
  ) {
    return null;
  }

  const contactedTime =
    Date.parse(
      contactedAt,
    );

  if (
    !Number.isFinite(
      contactedTime,
    )
  ) {
    return null;
  }

  return {
    id,

    name:
      name ||
      "Worker",

    service:
      service ||
      "Service Provider",

    rating,

    image,

    contactedAt,
  };
}

/* ============================================================
   PARSE STORED WORKERS
============================================================ */

function parseStoredWorkers(
  raw: string,
): RecentlyContactedWorker[] {
  let parsed:
    unknown;

  try {
    parsed =
      JSON.parse(
        raw,
      );
  } catch (
    error
  ) {
    console.error(
      "PARSE_RECENTLY_CONTACTED_WORKERS_ERROR:",
      error,
    );

    return [];
  }

  if (
    !Array.isArray(
      parsed,
    )
  ) {
    return [];
  }

  const normalized =
    parsed
      .map(
        normalizeStoredWorker,
      )
      .filter(
        (
          worker,
        ): worker is RecentlyContactedWorker =>
          worker !==
          null,
      )
      .sort(
        (
          first,
          second,
        ) =>
          Date.parse(
            second.contactedAt,
          ) -
          Date.parse(
            first.contactedAt,
          ),
      );

  /*
   * Keep only the newest occurrence
   * of each worker.
   */
  const seenWorkerIds =
    new Set<string>();

  const uniqueWorkers:
    RecentlyContactedWorker[] =
    [];

  for (
    const worker of
    normalized
  ) {
    if (
      seenWorkerIds.has(
        worker.id,
      )
    ) {
      continue;
    }

    seenWorkerIds.add(
      worker.id,
    );

    uniqueWorkers.push(
      worker,
    );

    if (
      uniqueWorkers.length >=
      MAX_RECENT_WORKERS
    ) {
      break;
    }
  }

  return uniqueWorkers;
}

/* ============================================================
   SERIALIZE WORKERS
============================================================ */

function serializeWorkers(
  workers: RecentlyContactedWorker[],
): string {
  return JSON.stringify(
    workers,
  );
}

/* ============================================================
   QUEUE WRITE
============================================================ */

function enqueueUserWrite(
  userId: string,
  operation: () => Promise<void>,
): Promise<void> {
  const previous =
    writeQueueByUser.get(
      userId,
    ) ??
    Promise.resolve();

  const next =
    previous
      .catch(
        () =>
          undefined,
      )
      .then(
        operation,
      );

  writeQueueByUser.set(
    userId,
    next,
  );

  void next.finally(
    () => {
      if (
        writeQueueByUser.get(
          userId,
        ) ===
        next
      ) {
        writeQueueByUser.delete(
          userId,
        );
      }
    },
  );

  return next;
}

/* ============================================================
   GET RECENT WORKERS
============================================================ */

export async function getRecentlyContactedWorkers(
  userId: string,
): Promise<
  RecentlyContactedWorker[]
> {
  const normalizedUserId =
    normalizeUserId(
      userId,
    );

  if (
    !normalizedUserId
  ) {
    return [];
  }

  const currentKey =
    getStorageKey(
      normalizedUserId,
    );

  const legacyKey =
    getLegacyStorageKey(
      normalizedUserId,
    );

  try {
    const [
      currentEntry,
      legacyEntry,
    ] =
      await AsyncStorage.multiGet(
        [
          currentKey,
          legacyKey,
        ],
      );

    const currentRaw =
      currentEntry[1];

    const legacyRaw =
      legacyEntry[1];

    /* ========================================================
       CURRENT V2 STORAGE
    ======================================================== */

    if (
      currentRaw
    ) {
      const workers =
        parseStoredWorkers(
          currentRaw,
        );

      /*
       * Re-save sanitized v2 data.
       *
       * This ensures unexpected legacy fields
       * such as phoneNumber are not retained.
       */
      const sanitizedRaw =
        serializeWorkers(
          workers,
        );

      if (
        sanitizedRaw !==
        currentRaw
      ) {
        await AsyncStorage.setItem(
          currentKey,
          sanitizedRaw,
        );
      }

      /*
       * Remove remaining v1 storage because
       * it may still contain worker numbers.
       */
      if (
        legacyRaw
      ) {
        await AsyncStorage.removeItem(
          legacyKey,
        );
      }

      return workers;
    }

    /* ========================================================
       MIGRATE V1 -> V2
    ======================================================== */

    if (
      legacyRaw
    ) {
      const migratedWorkers =
        parseStoredWorkers(
          legacyRaw,
        );

      await AsyncStorage.setItem(
        currentKey,
        serializeWorkers(
          migratedWorkers,
        ),
      );

      /*
       * Delete v1 after successful migration.
       *
       * This permanently removes legacy
       * phoneNumber values from AsyncStorage.
       */
      await AsyncStorage.removeItem(
        legacyKey,
      );

      return migratedWorkers;
    }

    return [];
  } catch (
    error
  ) {
    console.error(
      "GET_RECENTLY_CONTACTED_WORKERS_ERROR:",
      error,
    );

    return [];
  }
}

/* ============================================================
   ADD RECENT WORKER
============================================================ */

export async function addRecentlyContactedWorker(
  userId: string,
  worker: SaveRecentlyContactedWorkerInput,
): Promise<void> {
  const normalizedUserId =
    normalizeUserId(
      userId,
    );

  const normalizedWorkerId =
    cleanString(
      worker.id,
    );

  if (
    !normalizedUserId ||
    !normalizedWorkerId
  ) {
    return;
  }

  return enqueueUserWrite(
    normalizedUserId,
    async () => {
      try {
        const current =
          await getRecentlyContactedWorkers(
            normalizedUserId,
          );

        const nextWorker: RecentlyContactedWorker =
          {
            id:
              normalizedWorkerId,

            name:
              cleanString(
                worker.name,
              ) ||
              "Worker",

            service:
              cleanString(
                worker.service,
              ) ||
              "Service Provider",

            rating:
              normalizeRating(
                worker.rating,
              ),

            image:
              cleanString(
                worker.image,
              ),

            contactedAt:
              new Date().toISOString(),
          };

        /*
         * Calling the same worker again
         * moves them to the top and
         * refreshes contactedAt.
         */
        const next:
          RecentlyContactedWorker[] =
          [
            nextWorker,

            ...current.filter(
              (
                existingWorker,
              ) =>
                existingWorker.id !==
                normalizedWorkerId,
            ),
          ].slice(
            0,
            MAX_RECENT_WORKERS,
          );

        await AsyncStorage.setItem(
          getStorageKey(
            normalizedUserId,
          ),
          serializeWorkers(
            next,
          ),
        );

        notifyListeners(
          normalizedUserId,
          next,
        );
      } catch (
        error
      ) {
        console.error(
          "ADD_RECENTLY_CONTACTED_WORKER_ERROR:",
          error,
        );

        throw error;
      }
    },
  );
}

/* ============================================================
   CLEAR RECENT WORKERS
============================================================ */

export async function clearRecentlyContactedWorkers(
  userId: string,
): Promise<void> {
  const normalizedUserId =
    normalizeUserId(
      userId,
    );

  if (
    !normalizedUserId
  ) {
    return;
  }

  return enqueueUserWrite(
    normalizedUserId,
    async () => {
      try {
        /*
         * Remove both versions.
         *
         * v1 is also removed because it may
         * contain old worker phone numbers.
         */
        await AsyncStorage.multiRemove(
          [
            getStorageKey(
              normalizedUserId,
            ),

            getLegacyStorageKey(
              normalizedUserId,
            ),
          ],
        );

        notifyListeners(
          normalizedUserId,
          [],
        );
      } catch (
        error
      ) {
        console.error(
          "CLEAR_RECENTLY_CONTACTED_WORKERS_ERROR:",
          error,
        );

        throw error;
      }
    },
  );
}