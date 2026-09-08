import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";

import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  db,
} from "@/firebase/config";

/* ============================================================
   PUBLIC WORKER PROFILE
============================================================ */

export type WorkerPublicProfile = {
  uid: string;

  firstName?: string;

  otherName?: string;

  surname?: string;

  name?: string;

  fullName?: string;

  rating?: number;

  online?: boolean;

  available?: boolean;

  /*
   * Legacy public image fields.
   *
   * New writes use:
   *
   * workerProfile.photoUrl
   */
  photoURL?: string;

  photoUrl?: string;

  category?: string;

  subcategory?: string;

  workerProfile?: {
    category?: string;

    subcategory?: string;

    experience?: string;

    about?: string;

    hourlyRate?: number;

    /*
     * Public worker profile image.
     *
     * Expected value:
     *
     * https://...
     *
     * or empty string.
     */
    photoUrl?: string;

    photoURL?: string;

    workGallery?: string[];

    latitude?: number | null;

    longitude?: number | null;

    selectedServices?: string[];

    serviceDetails?: {
      state?: string;

      subcategory?: string;
    };
  };

  updatedAt?: unknown;
};

export type PublicWorkerProfile =
  WorkerPublicProfile;

/* ============================================================
   CALL PUBLIC PROFILE
============================================================ */

export type WorkerCallPublicProfile = {
  id: string;

  name: string;

  service: string;

  rating: number;

  photoUrl: string;
};

/* ============================================================
   COLLECTION
============================================================ */

const workerPublicProfilesCollection =
  collection(
    db,
    "workerPublicProfiles",
  );

/* ============================================================
   CONSTANTS
============================================================ */

const WORKER_PROFILE_STORAGE_FOLDER =
  "workerProfiles";

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
   NUMBER HELPER
============================================================ */

function cleanNumber(
  value: unknown,
  fallback = 0,
): number {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : fallback;
}

/* ============================================================
   NULLABLE NUMBER
============================================================ */

function cleanNullableNumber(
  value: unknown,
): number | null {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : null;
}

/* ============================================================
   HTTPS URL
============================================================ */

function isHttpsUrl(
  value: string,
): boolean {
  return value.startsWith(
    "https://",
  );
}

/* ============================================================
   HTTP URL
============================================================ */

function isHttpUrl(
  value: string,
): boolean {
  return (
    value.startsWith(
      "https://",
    ) ||
    value.startsWith(
      "http://",
    )
  );
}

/* ============================================================
   FIREBASE STORAGE URL
============================================================ */

function isFirebaseStorageUrl(
  value: string,
): boolean {
  const normalized =
    cleanString(
      value,
    );

  if (
    !normalized
  ) {
    return false;
  }

  return (
    normalized.includes(
      "firebasestorage.googleapis.com",
    ) ||
    normalized.includes(
      "storage.googleapis.com",
    )
  );
}

/* ============================================================
   FIREBASE GS URL
============================================================ */

function isGsUrl(
  value: string,
): boolean {
  return value.startsWith(
    "gs://",
  );
}

/* ============================================================
   LOCAL IMAGE URI
============================================================ */

function isLocalFileUri(
  value: string,
): boolean {
  return (
    value.startsWith(
      "file://",
    ) ||
    value.startsWith(
      "content://",
    )
  );
}

/* ============================================================
   SAFE RATING
============================================================ */

function normalizeRating(
  value: unknown,
): number {
  return Math.min(
    5,
    Math.max(
      0,
      cleanNumber(
        value,
      ),
    ),
  );
}

/* ============================================================
   GET PUBLIC WORKER
============================================================ */

export async function getPublicWorker(
  workerId: string,
) {
  const normalizedId =
    cleanString(
      workerId,
    );

  if (
    !normalizedId
  ) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  return getDoc(
    doc(
      db,
      "workerPublicProfiles",
      normalizedId,
    ),
  );
}

/* ============================================================
   GET FRESH WORKER PROFILE PHOTO URL
============================================================ */

/**
 * Stable Firebase Storage path:
 *
 * workerProfiles/{workerId}/profile.jpg
 */
export async function getFreshWorkerProfilePhotoUrl(
  workerId: string,
): Promise<string> {
  const normalizedId =
    cleanString(
      workerId,
    );

  if (
    !normalizedId
  ) {
    return "";
  }

  const storagePath =
    `${WORKER_PROFILE_STORAGE_FOLDER}/${normalizedId}/profile.jpg`;

  try {
    const storage =
      getStorage();

    const storageRef =
      ref(
        storage,
        storagePath,
      );

    const downloadUrl =
      await getDownloadURL(
        storageRef,
      );

    if (
      !isHttpsUrl(
        downloadUrl,
      )
    ) {
      if (
        __DEV__
      ) {
        console.warn(
          "INVALID_FRESH_WORKER_PHOTO_URL:",
          {
            workerId:
              normalizedId,

            storagePath,

            downloadUrl,
          },
        );
      }

      return "";
    }

    return downloadUrl;
  } catch (
    error
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "FRESH_WORKER_PROFILE_PHOTO_ERROR:",
        {
          workerId:
            normalizedId,

          storagePath,

          error,
        },
      );
    }

    return "";
  }
}

/* ============================================================
   GET PUBLIC WORKER CALL PROFILE
============================================================ */

/**
 * Source used by the Fixxam in-app call screen.
 *
 * No private worker information is returned here.
 */
export async function getPublicWorkerCallProfile(
  workerId: string,
): Promise<
  WorkerCallPublicProfile | null
> {
  const normalizedId =
    cleanString(
      workerId,
    );

  if (
    !normalizedId
  ) {
    return null;
  }

  try {
    const snapshot =
      await getDoc(
        doc(
          db,
          "workerPublicProfiles",
          normalizedId,
        ),
      );

    if (
      !snapshot.exists()
    ) {
      return null;
    }

    const data =
      snapshot.data() as WorkerPublicProfile;

    /* ========================================================
       NAME
    ======================================================== */

    const generatedName =
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
        .filter(
          Boolean,
        )
        .join(
          " ",
        )
        .trim();

    const name =
      cleanString(
        data.fullName,
      ) ||
      cleanString(
        data.name,
      ) ||
      generatedName ||
      "Worker";

    /* ========================================================
       SERVICE
    ======================================================== */

    const service =
      cleanString(
        data.workerProfile
          ?.subcategory,
      ) ||
      cleanString(
        data.workerProfile
          ?.category,
      ) ||
      cleanString(
        data.subcategory,
      ) ||
      cleanString(
        data.category,
      ) ||
      "Service Provider";

    /* ========================================================
       RATING
    ======================================================== */

    const rating =
      normalizeRating(
        data.rating,
      );

    /* ========================================================
       PHOTO FROM FIRESTORE
    ======================================================== */

    let photoUrl =
      cleanString(
        data.workerProfile
          ?.photoUrl,
      ) ||
      cleanString(
        data.workerProfile
          ?.photoURL,
      ) ||
      cleanString(
        data.photoURL,
      ) ||
      cleanString(
        data.photoUrl,
      );

    /*
     * Only allow HTTPS URLs to leave
     * the public worker call profile.
     */
    if (
      photoUrl &&
      !isHttpsUrl(
        photoUrl,
      )
    ) {
      photoUrl =
        "";
    }

    /* ========================================================
       STORAGE FALLBACK
    ======================================================== */

    if (
      !photoUrl
    ) {
      photoUrl =
        await getFreshWorkerProfilePhotoUrl(
          normalizedId,
        );
    }

    if (
      __DEV__
    ) {
      console.log(
        "WORKER_CALL_PUBLIC_PROFILE:",
        {
          workerId:
            normalizedId,

          name,

          service,

          rating,

          hasPhoto:
            Boolean(
              photoUrl,
            ),
        },
      );
    }

    return {
      id:
        normalizedId,

      name,

      service,

      rating,

      photoUrl,
    };
  } catch (
    error
  ) {
    console.error(
      "GET_PUBLIC_WORKER_CALL_PROFILE_ERROR:",
      {
        workerId:
          normalizedId,

        error,
      },
    );

    return null;
  }
}

/* ============================================================
   GET ALL PUBLIC WORKERS
============================================================ */

export async function getPublicWorkers(): Promise<
  QuerySnapshot<DocumentData>
> {
  return getDocs(
    workerPublicProfilesCollection,
  );
}

/* ============================================================
   GET PUBLIC WORKERS BY SERVICE
============================================================ */

export async function getPublicWorkersByService(
  serviceId: string,
): Promise<
  QuerySnapshot<DocumentData>
> {
  const normalizedServiceId =
    cleanString(
      serviceId,
    );

  if (
    !normalizedServiceId
  ) {
    throw new Error(
      "Service ID is required.",
    );
  }

  const workersQuery =
    query(
      workerPublicProfilesCollection,

      where(
        "workerProfile.selectedServices",
        "array-contains",
        normalizedServiceId,
      ),
    );

  return getDocs(
    workersQuery,
  );
}

/* ============================================================
   TYPES USED BY SYNC
============================================================ */

type WorkerUserData = {
  uid?: string;

  firstName?: string;

  otherName?: string;

  surname?: string;

  fullName?: string;

  rating?: number;

  online?: boolean;

  available?: boolean;

  /*
   * Private source field.
   *
   * It may exist in the source user object,
   * but it is NEVER written to
   * workerPublicProfiles.
   */
  phoneNumber?: string;

  workerProfile?: {
    category?: string;

    subcategory?: string;

    experience?: string;

    about?: string;

    hourlyRate?: number;

    photoUrl?: string;

    photoURL?: string;

    workGallery?: string[];

    latitude?: number | null;

    longitude?: number | null;

    selectedServices?: string[];

    serviceDetails?: {
      state?: string;

      subcategory?: string;
    };
  };
};

/* ============================================================
   RESOLVE STORAGE URL
============================================================ */

async function resolveStorageUrl(
  source: string,
): Promise<string> {
  const normalizedSource =
    cleanString(
      source,
    );

  if (
    !normalizedSource
  ) {
    return "";
  }

  /* ==========================================================
     HTTPS
  ========================================================== */

  if (
    isHttpsUrl(
      normalizedSource,
    )
  ) {
    return normalizedSource;
  }

  /* ==========================================================
     HTTP REJECT
  ========================================================== */

  if (
    normalizedSource.startsWith(
      "http://",
    )
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "INSECURE_WORKER_IMAGE_URL_REJECTED:",
        {
          source:
            normalizedSource,
        },
      );
    }

    return "";
  }

  /* ==========================================================
     LOCAL FILE REJECT
  ========================================================== */

  if (
    isLocalFileUri(
      normalizedSource,
    )
  ) {
    return "";
  }

  /* ==========================================================
     FIREBASE STORAGE
  ========================================================== */

  try {
    const storage =
      getStorage();

    /*
     * Supports:
     *
     * gs://...
     *
     * and:
     *
     * workerProfiles/uid/profile.jpg
     */
    const storageRef =
      ref(
        storage,
        normalizedSource,
      );

    const downloadUrl =
      await getDownloadURL(
        storageRef,
      );

    return isHttpsUrl(
      downloadUrl,
    )
      ? downloadUrl
      : "";
  } catch (
    error
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "WORKER_STORAGE_URL_ERROR:",
        {
          source:
            normalizedSource,

          error,
        },
      );
    }

    return "";
  }
}

/* ============================================================
   UPLOAD / RESOLVE WORKER PROFILE IMAGE
============================================================ */

async function uploadWorkerProfileImage(
  userId: string,
  source: string,
): Promise<string> {
  const normalizedUserId =
    cleanString(
      userId,
    );

  const normalizedSource =
    cleanString(
      source,
    );

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "Worker user ID is required.",
    );
  }

  if (
    !normalizedSource
  ) {
    return "";
  }

  /* ==========================================================
     EXISTING HTTPS URL
  ========================================================== */

  if (
    isHttpsUrl(
      normalizedSource,
    )
  ) {
    /*
     * If this is already a Firebase
     * download URL, try to refresh it
     * from the stable path.
     */
    if (
      isFirebaseStorageUrl(
        normalizedSource,
      )
    ) {
      const freshUrl =
        await getFreshWorkerProfilePhotoUrl(
          normalizedUserId,
        );

      /*
       * Preserve the existing valid HTTPS
       * URL if the stable path cannot
       * currently be resolved.
       */
      return (
        freshUrl ||
        normalizedSource
      );
    }

    return normalizedSource;
  }

  /* ==========================================================
     HTTP REJECT
  ========================================================== */

  if (
    isHttpUrl(
      normalizedSource,
    )
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "INSECURE_WORKER_IMAGE_SOURCE_REJECTED:",
        {
          userId:
            normalizedUserId,
        },
      );
    }

    return "";
  }

  /* ==========================================================
     GS://
  ========================================================== */

  if (
    isGsUrl(
      normalizedSource,
    )
  ) {
    return resolveStorageUrl(
      normalizedSource,
    );
  }

  /* ==========================================================
     STORAGE PATH
  ========================================================== */

  if (
    !isLocalFileUri(
      normalizedSource,
    )
  ) {
    return resolveStorageUrl(
      normalizedSource,
    );
  }

  /* ==========================================================
     LOCAL IMAGE
  ========================================================== */

  try {
    const response =
      await fetch(
        normalizedSource,
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `Unable to read local image. HTTP ${response.status}`,
      );
    }

    const blob =
      await response.blob();

    if (
      !blob ||
      blob.size <= 0
    ) {
      throw new Error(
        "Selected image is empty.",
      );
    }

    /* ========================================================
       STORAGE
    ======================================================== */

    const storage =
      getStorage();

    const storagePath =
      `${WORKER_PROFILE_STORAGE_FOLDER}/${normalizedUserId}/profile.jpg`;

    const storageRef =
      ref(
        storage,
        storagePath,
      );

    /* ========================================================
       UPLOAD
    ======================================================== */

    await uploadBytes(
      storageRef,
      blob,
      {
        contentType:
          blob.type ||
          "image/jpeg",

        cacheControl:
          "public,max-age=3600",
      },
    );

    /* ========================================================
       DOWNLOAD URL
    ======================================================== */

    const downloadUrl =
      await getDownloadURL(
        storageRef,
      );

    if (
      !isHttpsUrl(
        downloadUrl,
      )
    ) {
      throw new Error(
        "Firebase did not return a valid HTTPS image URL.",
      );
    }

    if (
      __DEV__
    ) {
      console.log(
        "WORKER_IMAGE_UPLOADED:",
        {
          userId:
            normalizedUserId,

          storagePath,

          hasDownloadUrl:
            Boolean(
              downloadUrl,
            ),
        },
      );
    }

    return downloadUrl;
  } catch (
    error
  ) {
    console.error(
      "WORKER_PROFILE_IMAGE_UPLOAD_ERROR:",
      {
        userId:
          normalizedUserId,

        error,
      },
    );

    throw new Error(
      "Unable to upload worker profile image.",
    );
  }
}

/* ============================================================
   NORMALIZE WORK GALLERY
============================================================ */

function normalizeWorkGallery(
  value: unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item ===
          "string" &&
        item.trim().length >
          0,
    )
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      (
        item,
      ) =>
        isHttpsUrl(
          item,
        ) ||
        isGsUrl(
          item,
        ),
    )
    .slice(
      0,
      6,
    );
}

/* ============================================================
   GET EXISTING PHOTO
============================================================ */

async function getExistingPhotoUrl(
  userId: string,
): Promise<string> {
  const normalizedUserId =
    cleanString(
      userId,
    );

  if (
    !normalizedUserId
  ) {
    return "";
  }

  /* ==========================================================
     STABLE STORAGE PATH
  ========================================================== */

  const freshStorageUrl =
    await getFreshWorkerProfilePhotoUrl(
      normalizedUserId,
    );

  if (
    freshStorageUrl
  ) {
    return freshStorageUrl;
  }

  /* ==========================================================
     FIRESTORE FALLBACK
  ========================================================== */

  try {
    const snapshot =
      await getDoc(
        doc(
          db,
          "workerPublicProfiles",
          normalizedUserId,
        ),
      );

    if (
      !snapshot.exists()
    ) {
      return "";
    }

    const data =
      snapshot.data() as WorkerPublicProfile;

    const existingPhoto =
      cleanString(
        data.workerProfile
          ?.photoUrl,
      ) ||
      cleanString(
        data.workerProfile
          ?.photoURL,
      ) ||
      cleanString(
        data.photoURL,
      ) ||
      cleanString(
        data.photoUrl,
      );

    if (
      !existingPhoto
    ) {
      return "";
    }

    /*
     * Existing valid HTTPS public
     * image remains usable.
     */
    if (
      isHttpsUrl(
        existingPhoto,
      )
    ) {
      return existingPhoto;
    }

    if (
      isGsUrl(
        existingPhoto,
      )
    ) {
      return resolveStorageUrl(
        existingPhoto,
      );
    }

    if (
      isLocalFileUri(
        existingPhoto,
      )
    ) {
      if (
        __DEV__
      ) {
        console.warn(
          "OLD_TEMPORARY_WORKER_IMAGE_FOUND:",
          {
            userId:
              normalizedUserId,
          },
        );
      }

      return "";
    }

    return resolveStorageUrl(
      existingPhoto,
    );
  } catch (
    error
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "GET_EXISTING_WORKER_PHOTO_ERROR:",
        {
          userId:
            normalizedUserId,

          error,
        },
      );
    }

    return "";
  }
}

/* ============================================================
   SYNC WORKER PUBLIC PROFILE
============================================================ */

export async function syncWorkerPublicProfile(
  userId: string,
  user: WorkerUserData,
): Promise<void> {
  const normalizedUserId =
    cleanString(
      userId,
    );

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "Worker user ID is required.",
    );
  }

  const profile =
    user.workerProfile;

  /* ==========================================================
     NAME
  ========================================================== */

  const firstName =
    cleanString(
      user.firstName,
    );

  const otherName =
    cleanString(
      user.otherName,
    );

  const surname =
    cleanString(
      user.surname,
    );

  const suppliedFullName =
    cleanString(
      user.fullName,
    );

  const generatedName =
    [
      firstName,
      otherName,
      surname,
    ]
      .filter(
        Boolean,
      )
      .join(
        " ",
      )
      .trim();

  const fullName =
    suppliedFullName ||
    generatedName;

  /* ==========================================================
     PHOTO SOURCE
  ========================================================== */

  const photoSource =
    cleanString(
      profile?.photoUrl,
    ) ||
    cleanString(
      profile?.photoURL,
    );

  /* ==========================================================
     PHOTO
  ========================================================== */

  let photoUrl =
    "";

  if (
    photoSource
  ) {
    photoUrl =
      await uploadWorkerProfileImage(
        normalizedUserId,
        photoSource,
      );
  } else {
    photoUrl =
      await getExistingPhotoUrl(
        normalizedUserId,
      );
  }

  /* ==========================================================
     FINAL PHOTO SAFETY
  ========================================================== */

  if (
    photoUrl &&
    !isHttpsUrl(
      photoUrl,
    )
  ) {
    if (
      __DEV__
    ) {
      console.warn(
        "INVALID_FINAL_WORKER_PHOTO_URL:",
        {
          workerId:
            normalizedUserId,

          photoUrl,
        },
      );
    }

    photoUrl =
      "";
  }

  /* ==========================================================
     GALLERY
  ========================================================== */

  const workGallery =
    normalizeWorkGallery(
      profile?.workGallery,
    );

  /* ==========================================================
     RATING
  ========================================================== */

  const rating =
    normalizeRating(
      user.rating,
    );

  /* ==========================================================
     SELECTED SERVICES
  ========================================================== */

  const selectedServices =
    Array.isArray(
      profile
        ?.selectedServices,
    )
      ? profile!.selectedServices!
          .filter(
            (
              service,
            ): service is string =>
              typeof service ===
                "string" &&
              service.trim()
                .length >
                0,
          )
          .map(
            (
              service,
            ) =>
              service.trim(),
          )
      : [];

  /* ==========================================================
     PUBLIC PROFILE
  ========================================================== */

  const publicProfile = {
    uid:
      normalizedUserId,

    firstName,

    otherName,

    surname,

    fullName:
      fullName ||
      "Worker",

    name:
      fullName ||
      "Worker",

    rating,

    online:
      user.online ===
      true,

    available:
      user.available !==
      false,

    /*
     * Privacy migration.
     *
     * Remove any legacy phone fields
     * previously stored in this public document.
     */
    phoneNumber:
      deleteField(),

    phone:
      deleteField(),

    workerProfile: {
      category:
        cleanString(
          profile?.category,
        ) ||
        "Service Provider",

      subcategory:
        cleanString(
          profile
            ?.subcategory,
        ),

      experience:
        cleanString(
          profile
            ?.experience,
        ),

      about:
        cleanString(
          profile?.about,
        ),

      hourlyRate:
        cleanNumber(
          profile
            ?.hourlyRate,
        ),

      photoUrl,

      /*
       * Remove legacy alternative field.
       */
      photoURL:
        deleteField(),

      /*
       * Remove any legacy public
       * phone fields.
       */
      phoneNumber:
        deleteField(),

      phone:
        deleteField(),

      workGallery,

      latitude:
        cleanNullableNumber(
          profile
            ?.latitude,
        ),

      longitude:
        cleanNullableNumber(
          profile
            ?.longitude,
        ),

      selectedServices,

      serviceDetails: {
        state:
          cleanString(
            profile
              ?.serviceDetails
              ?.state,
          ),

        subcategory:
          cleanString(
            profile
              ?.serviceDetails
              ?.subcategory,
          ),
      },
    },

    updatedAt:
      serverTimestamp(),
  };

  /* ==========================================================
     SAVE
  ========================================================== */

  await setDoc(
    doc(
      db,
      "workerPublicProfiles",
      normalizedUserId,
    ),
    publicProfile,
    {
      merge:
        true,
    },
  );

  /* ==========================================================
     DEVELOPMENT LOG
  ========================================================== */

  if (
    __DEV__
  ) {
    console.log(
      "WORKER_PUBLIC_PROFILE_SYNCED:",
      {
        uid:
          normalizedUserId,

        name:
          fullName ||
          "Worker",

        hasPhoto:
          Boolean(
            photoUrl,
          ),

        photoIsHttps:
          Boolean(
            photoUrl &&
            isHttpsUrl(
              photoUrl,
            ),
          ),

        available:
          user.available !==
          false,

        online:
          user.online ===
          true,
      },
    );
  }
}