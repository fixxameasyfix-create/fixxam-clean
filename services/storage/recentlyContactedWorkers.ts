// services/storage/recentlyContactedWorkers.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX =
  "@fixxam/recently_contacted_workers_v3";

const LEGACY_STORAGE_KEY =
  "@fixxam/recently_contacted_workers_v1";

const OLD_GLOBAL_STORAGE_KEY =
  "@fixxam/recently_contacted_workers_v2";

const MAX_RECENT_WORKERS = 10;

export type RecentlyContactedWorker = {
  id: string;
  name: string;
  service: string;
  rating: number;
  image: string;
  contactedAt: string;
};

export type RecentlyContactedWorkerInput = {
  id: string;
  name?: string;
  service?: string;
  rating?: number;
  image?: string;
};

type Listener = (
  recentWorkers: RecentlyContactedWorker[],
) => void;

/**
 * Listeners are isolated per account.
 *
 * Account A must never receive Account B's
 * Recently Called updates.
 */
const listeners =
  new Map<string, Set<Listener>>();

let writeQueue: Promise<void> =
  Promise.resolve();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeUserId(
  value: unknown,
): string {
  return cleanString(value);
}

function getStorageKey(
  userId: string,
): string {
  return `${STORAGE_KEY_PREFIX}:${encodeURIComponent(
    userId,
  )}`;
}

function normalizeRating(
  value: unknown,
): number {
  const rating =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(0, rating),
  );
}

function normalizeImage(
  value: unknown,
): string {
  /**
   * Keep the original image source.
   *
   * Supported examples:
   * - https://...
   * - http://...
   * - gs://...
   * - Firebase Storage path
   */
  return cleanString(value);
}

/* -------------------------------------------------------------------------- */
/* Placeholder Detection                                                      */
/* -------------------------------------------------------------------------- */

function isFallbackWorkerName(
  value: unknown,
): boolean {
  const name =
    cleanString(value);

  return (
    !name ||
    name === "Worker" ||
    name === "Fixxam Worker"
  );
}

function isFallbackService(
  value: unknown,
): boolean {
  const service =
    cleanString(value);

  return (
    !service ||
    service === "Service Provider"
  );
}

/* -------------------------------------------------------------------------- */
/* Worker Normalization                                                       */
/* -------------------------------------------------------------------------- */

function normalizeWorker(
  value: unknown,
): RecentlyContactedWorker | null {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const worker =
    value as Partial<RecentlyContactedWorker>;

  const id =
    cleanString(worker.id);

  if (!id) {
    return null;
  }

  return {
    id,

    name:
      cleanString(worker.name) ||
      "Worker",

    service:
      cleanString(worker.service) ||
      "Service Provider",

    rating:
      normalizeRating(
        worker.rating,
      ),

    image:
      normalizeImage(
        worker.image,
      ),

    contactedAt:
      cleanString(
        worker.contactedAt,
      ) ||
      new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

function parseWorkers(
  raw: string | null,
): RecentlyContactedWorker[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const workers: RecentlyContactedWorker[] =
      [];

    const seenIds =
      new Set<string>();

    for (const item of parsed) {
      const worker =
        normalizeWorker(item);

      if (!worker) {
        continue;
      }

      if (
        seenIds.has(worker.id)
      ) {
        continue;
      }

      seenIds.add(worker.id);

      workers.push(worker);

      if (
        workers.length >=
        MAX_RECENT_WORKERS
      ) {
        break;
      }
    }

    return workers;
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Listeners                                                                  */
/* -------------------------------------------------------------------------- */

function cloneWorkers(
  workers: RecentlyContactedWorker[],
): RecentlyContactedWorker[] {
  return workers.map(
    worker => ({
      ...worker,
    }),
  );
}

function notifyListeners(
  userId: string,
  workers: RecentlyContactedWorker[],
): void {
  const normalizedUserId =
    normalizeUserId(userId);

  if (!normalizedUserId) {
    return;
  }

  const userListeners =
    listeners.get(
      normalizedUserId,
    );

  if (!userListeners) {
    return;
  }

  const snapshot =
    cloneWorkers(workers);

  userListeners.forEach(
    listener => {
      try {
        listener(snapshot);
      } catch {
        /**
         * A listener must never break
         * storage operations.
         */
      }
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Write Queue                                                                */
/* -------------------------------------------------------------------------- */

function enqueueUserWrite(
  operation: () => Promise<void>,
): Promise<void> {
  const next =
    writeQueue.then(
      operation,
      operation,
    );

  /**
   * Keep the queue alive even when
   * the current operation fails.
   */
  writeQueue =
    next.then(
      () => undefined,
      () => undefined,
    );

  return next;
}

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

async function writeWorkers(
  userId: string,
  workers: RecentlyContactedWorker[],
): Promise<void> {
  const normalizedUserId =
    normalizeUserId(userId);

  if (!normalizedUserId) {
    return;
  }

  const normalized =
    workers
      .map(normalizeWorker)
      .filter(
        (
          worker,
        ): worker is RecentlyContactedWorker =>
          worker !== null,
      )
      .slice(
        0,
        MAX_RECENT_WORKERS,
      );

  await AsyncStorage.setItem(
    getStorageKey(
      normalizedUserId,
    ),
    JSON.stringify(normalized),
  );

  notifyListeners(
    normalizedUserId,
    normalized,
  );
}

/* -------------------------------------------------------------------------- */
/* Get                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Get Recently Called for ONE account only.
 *
 * Every account has its own AsyncStorage key.
 *
 * IMPORTANT:
 * We intentionally do NOT read/migrate the old
 * global v2 storage because those records cannot
 * safely be assigned to a specific account.
 */
export async function getRecentlyContactedWorkers(
  userId?: string,
): Promise<RecentlyContactedWorker[]> {
  const normalizedUserId =
    normalizeUserId(userId);

  if (!normalizedUserId) {
    return [];
  }

  try {
    const storageKey =
      getStorageKey(
        normalizedUserId,
      );

    const currentRaw =
      await AsyncStorage.getItem(
        storageKey,
      );

    if (currentRaw === null) {
      /**
       * No data exists for this account.
       *
       * Do NOT load:
       *
       * - @fixxam/recently_contacted_workers_v2
       * - @fixxam/recently_contacted_workers_v1
       *
       * because they are not account-specific.
       */
      return [];
    }

    const workers =
      parseWorkers(currentRaw);

    /**
     * Re-save sanitized account-specific data.
     */
    await AsyncStorage.setItem(
      storageKey,
      JSON.stringify(workers),
    );

    return workers;
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Add / Update                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Supports existing call patterns:
 *
 * 1. addRecentlyContactedWorker(
 *      worker,
 *      userId,
 *    )
 *
 * 2. addRecentlyContactedWorker(
 *      userId,
 *      worker,
 *    )
 *
 * 3. addRecentlyContactedWorker(
 *      workerId,
 *      userId,
 *    )
 *
 * 4. addRecentlyContactedWorker(
 *      workerId,
 *    )
 *
 * Pattern 4 is intentionally ignored now because
 * Recently Called MUST belong to a specific account.
 */
export async function addRecentlyContactedWorker(
  workerOrUserId:
    | RecentlyContactedWorkerInput
    | string,

  userIdOrWorker?:
    | string
    | RecentlyContactedWorkerInput,
): Promise<void> {
  let worker:
    RecentlyContactedWorkerInput;

  let userId:
    | string
    | undefined;

  /* ---------------------------------------------------------------------- */
  /* Pattern 1: worker + userId                                             */
  /* ---------------------------------------------------------------------- */

  if (
    typeof workerOrUserId ===
      "object" &&
    workerOrUserId !== null
  ) {
    worker =
      workerOrUserId;

    userId =
      typeof userIdOrWorker ===
      "string"
        ? cleanString(
            userIdOrWorker,
          ) || undefined
        : undefined;
  }

  /* ---------------------------------------------------------------------- */
  /* Pattern 2: userId + worker                                             */
  /* ---------------------------------------------------------------------- */

  else if (
    typeof workerOrUserId ===
      "string" &&
    typeof userIdOrWorker ===
      "object" &&
    userIdOrWorker !== null
  ) {
    userId =
      cleanString(
        workerOrUserId,
      ) || undefined;

    worker =
      userIdOrWorker;
  }

  /* ---------------------------------------------------------------------- */
  /* Pattern 3 / 4: workerId + userId                                      */
  /* ---------------------------------------------------------------------- */

  else {
    const workerId =
      cleanString(
        workerOrUserId,
      );

    if (!workerId) {
      return;
    }

    worker = {
      id: workerId,
    };

    userId =
      typeof userIdOrWorker ===
      "string"
        ? cleanString(
            userIdOrWorker,
          ) || undefined
        : undefined;
  }

  /**
   * Account isolation is mandatory.
   *
   * Never write a Recently Called worker
   * without knowing which account owns it.
   */
  const normalizedUserId =
    normalizeUserId(userId);

  if (!normalizedUserId) {
    return;
  }

  const normalizedWorkerId =
    cleanString(
      worker.id,
    );

  if (!normalizedWorkerId) {
    return;
  }

  await enqueueUserWrite(
    async () => {
      const current =
        await getRecentlyContactedWorkers(
          normalizedUserId,
        );

      const existingWorker =
        current.find(
          item =>
            item.id ===
            normalizedWorkerId,
        );

      /* ------------------------------------------------------------------ */
      /* IMAGE                                                               */
      /* ------------------------------------------------------------------ */

      const incomingImage =
        normalizeImage(
          worker.image,
        );

      /**
       * Keep existing image when the
       * latest call has no image.
       *
       * A valid incoming image wins.
       */
      const image =
        incomingImage ||
        existingWorker?.image ||
        "";

      /* ------------------------------------------------------------------ */
      /* NAME                                                                */
      /* ------------------------------------------------------------------ */

      const incomingName =
        cleanString(
          worker.name,
        );

      /**
       * Do not overwrite a real worker name
       * with:
       *
       * - ""
       * - "Worker"
       * - "Fixxam Worker"
       */
      const name =
        !isFallbackWorkerName(
          incomingName,
        )
          ? incomingName
          : existingWorker?.name &&
              !isFallbackWorkerName(
                existingWorker.name,
              )
            ? existingWorker.name
            : "Worker";

      /* ------------------------------------------------------------------ */
      /* SERVICE                                                             */
      /* ------------------------------------------------------------------ */

      const incomingService =
        cleanString(
          worker.service,
        );

      /**
       * Do not overwrite a real service
       * with "Service Provider".
       */
      const service =
        !isFallbackService(
          incomingService,
        )
          ? incomingService
          : existingWorker?.service &&
              !isFallbackService(
                existingWorker.service,
              )
            ? existingWorker.service
            : "Service Provider";

      /* ------------------------------------------------------------------ */
      /* RATING                                                              */
      /* ------------------------------------------------------------------ */

      const incomingRating =
        worker.rating !==
        undefined
          ? normalizeRating(
              worker.rating,
            )
          : 0;

      /**
       * Do not replace an existing
       * real rating with 0.
       */
      const rating =
        incomingRating > 0
          ? incomingRating
          : existingWorker?.rating ||
            0;

      /* ------------------------------------------------------------------ */
      /* UPDATED WORKER                                                      */
      /* ------------------------------------------------------------------ */

      const nextWorker:
        RecentlyContactedWorker =
        {
          id:
            normalizedWorkerId,

          name,

          service,

          rating,

          image,

          contactedAt:
            new Date().toISOString(),
        };

      /* ------------------------------------------------------------------ */
      /* MOVE WORKER TO TOP                                                  */
      /* ------------------------------------------------------------------ */

      const nextWorkers = [
        nextWorker,

        ...current.filter(
          item =>
            item.id !==
            normalizedWorkerId,
        ),
      ].slice(
        0,
        MAX_RECENT_WORKERS,
      );

      await writeWorkers(
        normalizedUserId,
        nextWorkers,
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Remove                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Remove one recently contacted worker
 * from ONE account only.
 */
export async function removeRecentlyContactedWorker(
  workerId: string,
  userId?: string,
): Promise<void> {
  const normalizedUserId =
    normalizeUserId(userId);

  const normalizedWorkerId =
    cleanString(workerId);

  if (
    !normalizedUserId ||
    !normalizedWorkerId
  ) {
    return;
  }

  await enqueueUserWrite(
    async () => {
      const current =
        await getRecentlyContactedWorkers(
          normalizedUserId,
        );

      const nextWorkers =
        current.filter(
          worker =>
            worker.id !==
            normalizedWorkerId,
        );

      if (
        nextWorkers.length ===
        current.length
      ) {
        return;
      }

      await writeWorkers(
        normalizedUserId,
        nextWorkers,
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Clear                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Clear Recently Called for ONE account.
 *
 * This does NOT clear another account's data.
 */
export async function clearRecentlyContactedWorkers(
  userId?: string,
): Promise<void> {
  const normalizedUserId =
    normalizeUserId(userId);

  if (!normalizedUserId) {
    return;
  }

  await enqueueUserWrite(
    async () => {
      await AsyncStorage.removeItem(
        getStorageKey(
          normalizedUserId,
        ),
      );

      notifyListeners(
        normalizedUserId,
        [],
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Subscribe                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Subscribe to Recently Called for ONE account.
 *
 * Example:
 *
 * subscribeToRecentlyContactedWorkers(
 *   currentUserId,
 *   recentWorkers => {
 *     ...
 *   },
 * );
 */
export function subscribeToRecentlyContactedWorkers(
  userId: string,
  listener: Listener,
): () => void {
  const normalizedUserId =
    normalizeUserId(userId);

  if (!normalizedUserId) {
    return () => undefined;
  }

  let userListeners =
    listeners.get(
      normalizedUserId,
    );

  if (!userListeners) {
    userListeners =
      new Set<Listener>();

    listeners.set(
      normalizedUserId,
      userListeners,
    );
  }

  userListeners.add(
    listener,
  );

  /**
   * Immediately load this account's
   * Recently Called list.
   */
  void getRecentlyContactedWorkers(
    normalizedUserId,
  )
    .then(
      recentWorkers => {
        const currentListeners =
          listeners.get(
            normalizedUserId,
          );

        if (
          !currentListeners?.has(
            listener,
          )
        ) {
          return;
        }

        listener(
          cloneWorkers(
            recentWorkers,
          ),
        );
      },
    )
    .catch(() => {
      /**
       * Initial read failure must not
       * break the subscription.
       */
    });

  /**
   * Unsubscribe.
   */
  return () => {
    const currentListeners =
      listeners.get(
        normalizedUserId,
      );

    if (!currentListeners) {
      return;
    }

    currentListeners.delete(
      listener,
    );

    if (
      currentListeners.size ===
      0
    ) {
      listeners.delete(
        normalizedUserId,
      );
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Legacy Cleanup                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Removes the old global Recently Called
 * storage.
 *
 * We intentionally do NOT migrate it because
 * it is impossible to know which account owns
 * those records.
 */
export async function clearLegacyRecentlyContactedWorkers(): Promise<void> {
  await enqueueUserWrite(
    async () => {
      await AsyncStorage.multiRemove([
        LEGACY_STORAGE_KEY,
        OLD_GLOBAL_STORAGE_KEY,
      ]);
    },
  );
}