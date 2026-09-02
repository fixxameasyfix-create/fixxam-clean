import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
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

import { db } from "@/firebase/config";

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

  phoneNumber?: string;

  workerProfile?: {
    category?: string;
    subcategory?: string;

    experience?: string;
    about?: string;

    hourlyRate?: number;

    /**
     * IMPORTANT:
     *
     * This must always be:
     *
     * https://...
     *
     * or an empty string.
     *
     * Never save file:// here.
     */
    photoUrl?: string;

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
   COLLECTION
============================================================ */

const workerPublicProfilesCollection =
  collection(
    db,
    "workerPublicProfiles",
  );

/* ============================================================
   STRING HELPER
============================================================ */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

/* ============================================================
   NUMBER HELPER
============================================================ */

function cleanNumber(
  value: unknown,
  fallback = 0,
): number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
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
   GET PUBLIC WORKER
============================================================ */

export async function getPublicWorker(
  workerId: string,
) {
  const normalizedId =
    cleanString(workerId);

  if (!normalizedId) {
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
   GET ALL PUBLIC WORKERS
============================================================ */

export async function getPublicWorkers(): Promise<
  QuerySnapshot<DocumentData>
> {
  /*
   * IMPORTANT:
   *
   * Do not filter by available here.
   *
   * Home and See All should read
   * from the same public collection.
   *
   * The UI can decide whether to hide
   * available === false workers.
   */

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
    cleanString(serviceId);

  if (!normalizedServiceId) {
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

  phoneNumber?: string;

  workerProfile?: {
    category?: string;
    subcategory?: string;

    experience?: string;
    about?: string;

    hourlyRate?: number;

    /*
     * Can be:
     *
     * file://...
     * content://...
     * https://...
     * gs://...
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
};

/* ============================================================
   RESOLVE STORAGE URL
============================================================ */

async function resolveStorageUrl(
  source: string,
): Promise<string> {
  const normalizedSource =
    cleanString(source);

  if (!normalizedSource) {
    return "";
  }

  /*
   * Already a normal URL.
   */
  if (
    isHttpUrl(
      normalizedSource,
    )
  ) {
    return normalizedSource;
  }

  /*
   * Firebase Storage gs:// URL.
   */
  if (
    isGsUrl(
      normalizedSource,
    )
  ) {
    try {
      const storage =
        getStorage();

      return await getDownloadURL(
        ref(
          storage,
          normalizedSource,
        ),
      );
    } catch (error) {
      console.warn(
        "WORKER_STORAGE_URL_ERROR:",
        {
          source:
            normalizedSource,
          error,
        },
      );

      return "";
    }
  }

  /*
   * Local Expo image must NEVER
   * be returned as a public URL.
   */
  if (
    isLocalFileUri(
      normalizedSource,
    )
  ) {
    return "";
  }

  /*
   * Unknown value.
   */
  return "";
}

/* ============================================================
   UPLOAD PROFILE IMAGE
============================================================ */

async function uploadWorkerProfileImage(
  userId: string,
  source: string,
): Promise<string> {
  const normalizedSource =
    cleanString(source);

  if (!normalizedSource) {
    return "";
  }

  /* ==========================================================
     EXISTING HTTPS URL
  ========================================================== */

  if (
    isHttpUrl(
      normalizedSource,
    )
  ) {
    return normalizedSource;
  }

  /* ==========================================================
     FIREBASE STORAGE URL
  ========================================================== */

  if (
    isGsUrl(
      normalizedSource,
    )
  ) {
    const storage =
      getStorage();

    const storageRef =
      ref(
        storage,
        normalizedSource,
      );

    return getDownloadURL(
      storageRef,
    );
  }

  /* ==========================================================
     ONLY LOCAL FILES CAN BE UPLOADED
  ========================================================== */

  if (
    !isLocalFileUri(
      normalizedSource,
    )
  ) {
    console.warn(
      "INVALID_WORKER_IMAGE_SOURCE:",
      normalizedSource,
    );

    return "";
  }

  try {
    /*
     * Read Expo ImagePicker file.
     */

    const response =
      await fetch(
        normalizedSource,
      );

    if (!response.ok) {
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
       FIREBASE STORAGE
    ======================================================== */

    const storage =
      getStorage();

    /*
     * Stable path.
     *
     * Every worker has one profile image.
     *
     * A new image replaces the old one.
     */

    const storagePath =
      `workerProfiles/${userId}/profile.jpg`;

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

    /*
     * Safety check.
     *
     * Only HTTPS URL is allowed
     * to enter Firestore.
     */

    if (
      !isHttpUrl(
        downloadUrl,
      )
    ) {
      throw new Error(
        "Firebase did not return a valid image URL.",
      );
    }

    if (__DEV__) {
      console.log(
        "WORKER_IMAGE_UPLOADED:",
        {
          userId,
          storagePath,
          downloadUrl,
        },
      );
    }

    return downloadUrl;
  } catch (error) {
    console.error(
      "WORKER_PROFILE_IMAGE_UPLOAD_ERROR:",
      {
        userId,
        source:
          normalizedSource,
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
  if (!Array.isArray(value)) {
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
    .map((item) =>
      item.trim(),
    )
    /*
     * Never save local Expo ImagePicker
     * paths to public Firestore.
     */
    .filter(
      (item) =>
        isHttpUrl(item) ||
        isGsUrl(item),
    )
    .slice(0, 6);
}

/* ============================================================
   GET EXISTING PHOTO
============================================================ */

async function getExistingPhotoUrl(
  userId: string,
): Promise<string> {
  try {
    const snapshot =
      await getDoc(
        doc(
          db,
          "workerPublicProfiles",
          userId,
        ),
      );

    if (!snapshot.exists()) {
      return "";
    }

    const data =
      snapshot.data();

    const workerProfile =
      data.workerProfile;

    if (
      !workerProfile ||
      typeof workerProfile !==
        "object"
    ) {
      return "";
    }

    const existingPhoto =
      cleanString(
        (
          workerProfile as {
            photoUrl?: unknown;
          }
        ).photoUrl,
      );

    if (!existingPhoto) {
      return "";
    }

    /*
     * Existing permanent HTTPS URL.
     */

    if (
      isHttpUrl(
        existingPhoto,
      )
    ) {
      return existingPhoto;
    }

    /*
     * Existing gs:// URL.
     *
     * Convert it to HTTPS.
     */

    if (
      isGsUrl(
        existingPhoto,
      )
    ) {
      return resolveStorageUrl(
        existingPhoto,
      );
    }

    /*
     * IMPORTANT:
     *
     * If Firestore contains:
     *
     * file:///data/user/0/...
     *
     * it is an old temporary Expo path.
     *
     * We must NOT return it.
     */

    if (
      isLocalFileUri(
        existingPhoto,
      )
    ) {
      console.warn(
        "OLD_TEMPORARY_WORKER_IMAGE_FOUND:",
        {
          userId,
          existingPhoto,
        },
      );

      return "";
    }

    return "";
  } catch (error) {
    console.warn(
      "GET_EXISTING_WORKER_PHOTO_ERROR:",
      {
        userId,
        error,
      },
    );

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
    cleanString(userId);

  if (!normalizedUserId) {
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

  const generatedName = [
    firstName,
    otherName,
    surname,
  ]
    .filter(Boolean)
    .join(" ")
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

  let photoUrl = "";

  if (photoSource) {
    /*
     * New photo selected.
     *
     * file://...
     *     ↓
     * Firebase Storage
     *     ↓
     * https://...
     */

    photoUrl =
      await uploadWorkerProfileImage(
        normalizedUserId,
        photoSource,
      );
  } else {
    /*
     * No new photo selected.
     *
     * Keep existing valid photo.
     *
     * IMPORTANT:
     * getExistingPhotoUrl() will reject
     * old file:// paths.
     */

    photoUrl =
      await getExistingPhotoUrl(
        normalizedUserId,
      );
  }

  /* ==========================================================
     FINAL PHOTO SAFETY
  ========================================================== */

  /*
   * Never allow file:// or content://
   * into Firestore.
   */

  if (
    photoUrl &&
    !isHttpUrl(photoUrl)
  ) {
    console.warn(
      "INVALID_FINAL_WORKER_PHOTO_URL:",
      photoUrl,
    );

    photoUrl = "";
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

  const rating = Math.min(
    5,
    Math.max(
      0,
      cleanNumber(
        user.rating,
      ),
    ),
  );

  /* ==========================================================
     PUBLIC PROFILE
  ========================================================== */

  const publicProfile = {
    uid: normalizedUserId,

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
      user.online === true,

    available:
      user.available !== false,

    phoneNumber:
      cleanString(
        user.phoneNumber,
      ),

    workerProfile: {
      category:
        cleanString(
          profile?.category,
        ) ||
        "Service Provider",

      subcategory:
        cleanString(
          profile?.subcategory,
        ),

      experience:
        cleanString(
          profile?.experience,
        ),

      about:
        cleanString(
          profile?.about,
        ),

      hourlyRate:
        cleanNumber(
          profile?.hourlyRate,
        ),

      /*
       * IMPORTANT:
       *
       * This is now ONLY:
       *
       * https://...
       *
       * or ""
       */
      photoUrl,

      workGallery,

      latitude:
        typeof profile?.latitude ===
          "number" &&
        Number.isFinite(
          profile.latitude,
        )
          ? profile.latitude
          : null,

      longitude:
        typeof profile?.longitude ===
          "number" &&
        Number.isFinite(
          profile.longitude,
        )
          ? profile.longitude
          : null,

      selectedServices:
        Array.isArray(
          profile?.selectedServices,
        )
          ? profile.selectedServices
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
          : [],

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
      merge: true,
    },
  );

  /* ==========================================================
     DEVELOPMENT LOG
  ========================================================== */

  if (__DEV__) {
    console.log(
      "WORKER_PUBLIC_PROFILE_SYNCED:",
      {
        uid:
          normalizedUserId,

        name:
          fullName ||
          "Worker",

        photoUrl,

        photoIsHttp:
          photoUrl
            ? isHttpUrl(
                photoUrl,
              )
            : false,

        photoIsLocal:
          photoUrl
            ? isLocalFileUri(
                photoUrl,
              )
            : false,

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