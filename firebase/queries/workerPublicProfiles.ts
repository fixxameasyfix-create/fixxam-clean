import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
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
   PUBLIC WORKER SERVICE LOCATION
============================================================ */

export type WorkerPublicLocation = {
  address: string;

  state: string;

  lga: string;

  latitude: number;

  longitude: number;
};

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
     */
    photoUrl?: string;

    photoURL?: string;

    /*
     * Public work gallery.
     */
    workGallery?: string[];

    /*
     * Legacy/general service-area fields.
     */
    state?: string;

    lga?: string;

    latitude?: number | null;

    longitude?: number | null;

    /*
     * Canonical customer-facing service
     * destination.
     */
    serviceLocation?: {
      address?: string;

      state?: string;

      lga?: string;

      latitude?: number | null;

      longitude?: number | null;
    };

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

const MAX_WORK_GALLERY_IMAGES = 6;

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
   LATITUDE
============================================================ */

function cleanLatitude(
  value: unknown,
): number | null {
  const latitude =
    cleanNullableNumber(
      value,
    );

  if (
    latitude === null ||
    latitude < -90 ||
    latitude > 90
  ) {
    return null;
  }

  return latitude;
}

/* ============================================================
   LONGITUDE
============================================================ */

function cleanLongitude(
  value: unknown,
): number | null {
  const longitude =
    cleanNullableNumber(
      value,
    );

  if (
    longitude === null ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return longitude;
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

  if (!normalized) {
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
   GET PUBLIC WORKER SERVICE LOCATION
============================================================ */

export async function getPublicWorkerLocation(
  workerId: string,
): Promise<
  WorkerPublicLocation | null
> {
  const normalizedId =
    cleanString(
      workerId,
    );

  if (!normalizedId) {
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

    if (!snapshot.exists()) {
      return null;
    }

    const data =
      snapshot.data() as WorkerPublicProfile;

    const serviceLocation =
      data.workerProfile
        ?.serviceLocation;

    if (!serviceLocation) {
      if (__DEV__) {
        console.log(
          "WORKER_SERVICE_LOCATION_MISSING:",
          {
            workerId:
              normalizedId,
          },
        );
      }

      return null;
    }

    const address =
      cleanString(
        serviceLocation.address,
      );

    const state =
      cleanString(
        serviceLocation.state,
      );

    const lga =
      cleanString(
        serviceLocation.lga,
      );

    const latitude =
      cleanLatitude(
        serviceLocation.latitude,
      );

    const longitude =
      cleanLongitude(
        serviceLocation.longitude,
      );

    if (
      !address ||
      !state ||
      !lga ||
      latitude === null ||
      longitude === null
    ) {
      if (__DEV__) {
        console.warn(
          "WORKER_SERVICE_LOCATION_INCOMPLETE:",
          {
            workerId:
              normalizedId,

            hasAddress:
              Boolean(
                address,
              ),

            state,

            lga,

            hasLatitude:
              latitude !== null,

            hasLongitude:
              longitude !== null,
          },
        );
      }

      return null;
    }

    if (__DEV__) {
      console.log(
        "WORKER_PUBLIC_SERVICE_LOCATION:",
        {
          workerId:
            normalizedId,

          address,

          state,

          lga,

          hasCoordinates:
            true,
        },
      );
    }

    return {
      address,

      state,

      lga,

      latitude,

      longitude,
    };
  } catch (
    error
  ) {
    console.error(
      "GET_PUBLIC_WORKER_LOCATION_ERROR:",
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
   GET FRESH WORKER PROFILE PHOTO URL
============================================================ */

export async function getFreshWorkerProfilePhotoUrl(
  workerId: string,
): Promise<string> {
  const normalizedId =
    cleanString(
      workerId,
    );

  if (!normalizedId) {
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
      if (__DEV__) {
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
    if (__DEV__) {
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

export async function getPublicWorkerCallProfile(
  workerId: string,
): Promise<
  WorkerCallPublicProfile | null
> {
  const normalizedId =
    cleanString(
      workerId,
    );

  if (!normalizedId) {
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

    if (!snapshot.exists()) {
      return null;
    }

    const data =
      snapshot.data() as WorkerPublicProfile;

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

    const rating =
      normalizeRating(
        data.rating,
      );

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

    if (
      photoUrl &&
      !isHttpsUrl(
        photoUrl,
      )
    ) {
      photoUrl =
        "";
    }

    if (!photoUrl) {
      photoUrl =
        await getFreshWorkerProfilePhotoUrl(
          normalizedId,
        );
    }

    if (__DEV__) {
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
   SUBSCRIBE PUBLIC WORKERS BY SERVICE
============================================================ */

export function subscribeToPublicWorkersByService(
  serviceId: string,
  onData: (
    snapshot: QuerySnapshot<DocumentData>,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): Unsubscribe {
  const normalizedServiceId =
    cleanString(
      serviceId,
    );

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

  return onSnapshot(
    workersQuery,

    snapshot => {
      onData(
        snapshot,
      );
    },

    error => {
      console.error(
        "SUBSCRIBE_PUBLIC_WORKERS_BY_SERVICE_ERROR:",
        error,
      );

      onError?.(
        error,
      );
    },
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

    photoUrl?: string;

    photoURL?: string;

    workGallery?: string[];

    state?: string;

    lga?: string;

    latitude?: number | null;

    longitude?: number | null;

    serviceLocation?: {
      address?: string;

      state?: string;

      lga?: string;

      latitude?: number | null;

      longitude?: number | null;
    };

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

  if (!normalizedSource) {
    return "";
  }

  if (
    isHttpsUrl(
      normalizedSource,
    )
  ) {
    return normalizedSource;
  }

  if (
    normalizedSource.startsWith(
      "http://",
    )
  ) {
    if (__DEV__) {
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

  if (
    isLocalFileUri(
      normalizedSource,
    )
  ) {
    return "";
  }

  try {
    const storage =
      getStorage();

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
    if (__DEV__) {
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

  if (!normalizedUserId) {
    throw new Error(
      "Worker user ID is required.",
    );
  }

  if (!normalizedSource) {
    return "";
  }

  if (
    isHttpsUrl(
      normalizedSource,
    )
  ) {
    if (
      isFirebaseStorageUrl(
        normalizedSource,
      )
    ) {
      const freshUrl =
        await getFreshWorkerProfilePhotoUrl(
          normalizedUserId,
        );

      return (
        freshUrl ||
        normalizedSource
      );
    }

    return normalizedSource;
  }

  if (
    isHttpUrl(
      normalizedSource,
    )
  ) {
    if (__DEV__) {
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

  if (
    isGsUrl(
      normalizedSource,
    )
  ) {
    return resolveStorageUrl(
      normalizedSource,
    );
  }

  if (
    !isLocalFileUri(
      normalizedSource,
    )
  ) {
    return resolveStorageUrl(
      normalizedSource,
    );
  }

  try {
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

    const storage =
      getStorage();

    const storagePath =
      `${WORKER_PROFILE_STORAGE_FOLDER}/${normalizedUserId}/profile.jpg`;

    const storageRef =
      ref(
        storage,
        storagePath,
      );

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

    if (__DEV__) {
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
      item =>
        item.trim(),
    )
    .filter(
      item =>
        isHttpsUrl(
          item,
        ) ||
        isGsUrl(
          item,
        ),
    )
    .slice(
      0,
      MAX_WORK_GALLERY_IMAGES,
    );
}

/* ============================================================
   UPLOAD WORK GALLERY IMAGE
============================================================ */

async function uploadWorkerGalleryImage(
  userId: string,
  source: string,
  index: number,
): Promise<string> {
  const normalizedUserId =
    cleanString(
      userId,
    );

  const normalizedSource =
    cleanString(
      source,
    );

  if (!normalizedUserId) {
    throw new Error(
      "Worker user ID is required.",
    );
  }

  if (!normalizedSource) {
    return "";
  }

  /*
   * Already a secure HTTPS URL.
   */
  if (
    isHttpsUrl(
      normalizedSource,
    )
  ) {
    return normalizedSource;
  }

  /*
   * Firebase Storage path.
   */
  if (
    isGsUrl(
      normalizedSource,
    )
  ) {
    return resolveStorageUrl(
      normalizedSource,
    );
  }

  /*
   * Reject insecure remote URLs.
   */
  if (
    normalizedSource.startsWith(
      "http://",
    )
  ) {
    if (__DEV__) {
      console.warn(
        "INSECURE_WORKER_GALLERY_URL_REJECTED:",
        {
          userId:
            normalizedUserId,

          index,
        },
      );
    }

    return "";
  }

  /*
   * Only local device images
   * should reach this upload path.
   */
  if (
    !isLocalFileUri(
      normalizedSource,
    )
  ) {
    return "";
  }

  try {
    const response =
      await fetch(
        normalizedSource,
      );

    if (!response.ok) {
      throw new Error(
        `Unable to read gallery image. HTTP ${response.status}`,
      );
    }

    const blob =
      await response.blob();

    if (
      !blob ||
      blob.size <= 0
    ) {
      throw new Error(
        "Selected gallery image is empty.",
      );
    }

    const storage =
      getStorage();

    /*
     * Stable gallery slot.
     *
     * Example:
     *
     * workerProfiles/{uid}/gallery/1.jpg
     * workerProfiles/{uid}/gallery/2.jpg
     */
    const storagePath =
      `${WORKER_PROFILE_STORAGE_FOLDER}/${normalizedUserId}/gallery/${index + 1}.jpg`;

    const storageRef =
      ref(
        storage,
        storagePath,
      );

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
        "Firebase did not return a valid HTTPS gallery image URL.",
      );
    }

    if (__DEV__) {
      console.log(
        "WORKER_GALLERY_IMAGE_UPLOADED:",
        {
          userId:
            normalizedUserId,

          index,

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
      "WORKER_GALLERY_IMAGE_UPLOAD_ERROR:",
      {
        userId:
          normalizedUserId,

        index,

        error,
      },
    );

    throw new Error(
      "Unable to upload worker work gallery image.",
    );
  }
}

/* ============================================================
   UPLOAD / RESOLVE WORK GALLERY
============================================================ */

async function uploadWorkerWorkGallery(
  userId: string,
  gallery: unknown,
): Promise<string[]> {
  if (
    !Array.isArray(
      gallery,
    )
  ) {
    return [];
  }

  const sources =
    gallery
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
        item =>
          item.trim(),
      )
      .slice(
        0,
        MAX_WORK_GALLERY_IMAGES,
      );

  if (
    sources.length ===
    0
  ) {
    return [];
  }

  const uploaded =
    await Promise.all(
      sources.map(
        (
          source,
          index,
        ) =>
          uploadWorkerGalleryImage(
            userId,
            source,
            index,
          ),
      ),
    );

  return uploaded.filter(
    (
      url,
    ): url is string =>
      Boolean(
        url &&
        isHttpsUrl(
          url,
        ),
      ),
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

  if (!normalizedUserId) {
    return "";
  }

  const freshStorageUrl =
    await getFreshWorkerProfilePhotoUrl(
      normalizedUserId,
    );

  if (freshStorageUrl) {
    return freshStorageUrl;
  }

  try {
    const snapshot =
      await getDoc(
        doc(
          db,
          "workerPublicProfiles",
          normalizedUserId,
        ),
      );

    if (!snapshot.exists()) {
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

    if (!existingPhoto) {
      return "";
    }

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
      if (__DEV__) {
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
    if (__DEV__) {
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

  if (photoSource) {
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

  if (
    photoUrl &&
    !isHttpsUrl(
      photoUrl,
    )
  ) {
    if (__DEV__) {
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
     WORK GALLERY
  ========================================================== */

  /*
   * Registration may provide local:
   *
   * file://
   * content://
   *
   * URIs.
   *
   * These are uploaded to Firebase Storage
   * before publishing the public profile.
   */
  const workGallery =
    await uploadWorkerWorkGallery(
      normalizedUserId,
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
            service =>
              service.trim(),
          )
      : [];

  /* ==========================================================
     LEGACY PUBLIC SERVICE AREA
  ========================================================== */

  const state =
    cleanString(
      profile?.state,
    ) ||
    cleanString(
      profile
        ?.serviceDetails
        ?.state,
    );

  const lga =
    cleanString(
      profile?.lga,
    );

  const latitude =
    cleanLatitude(
      profile?.latitude,
    );

  const longitude =
    cleanLongitude(
      profile?.longitude,
    );

  /* ==========================================================
     CUSTOMER-FACING SERVICE LOCATION
  ========================================================== */

  const serviceAddress =
    cleanString(
      profile
        ?.serviceLocation
        ?.address,
    );

  const serviceState =
    cleanString(
      profile
        ?.serviceLocation
        ?.state,
    );

  const serviceLga =
    cleanString(
      profile
        ?.serviceLocation
        ?.lga,
    );

  const serviceLatitude =
    cleanLatitude(
      profile
        ?.serviceLocation
        ?.latitude,
    );

  const serviceLongitude =
    cleanLongitude(
      profile
        ?.serviceLocation
        ?.longitude,
    );

  const hasCompleteServiceLocation =
    Boolean(
      serviceAddress &&
      serviceState &&
      serviceLga &&
      serviceLatitude !== null &&
      serviceLongitude !== null,
    );

  const serviceLocation:
    WorkerPublicLocation | null =
      hasCompleteServiceLocation &&
      serviceLatitude !== null &&
      serviceLongitude !== null
        ? {
            address:
              serviceAddress,

            state:
              serviceState,

            lga:
              serviceLga,

            latitude:
              serviceLatitude,

            longitude:
              serviceLongitude,
          }
        : null;

  /* ==========================================================
     PUBLIC WORKER PROFILE
  ========================================================== */

  const publicWorkerProfile = {
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

    photoUrl,

    photoURL:
      deleteField(),

    phoneNumber:
      deleteField(),

    phone:
      deleteField(),

    /*
     * Public work gallery.
     *
     * Only secure Firebase Storage
     * HTTPS URLs are published.
     */
    workGallery,

    state,

    lga,

    latitude,

    longitude,

    selectedServices,

    serviceDetails: {
      state,

      subcategory:
        cleanString(
          profile
            ?.serviceDetails
            ?.subcategory,
        ),
    },

    ...(serviceLocation
      ? {
          serviceLocation,
        }
      : {}),
  };

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

    /*
     * Public realtime status.
     */
    online:
      user.online ===
      true,

    available:
      user.available !==
      false,

    phoneNumber:
      deleteField(),

    phone:
      deleteField(),

    workerProfile:
      publicWorkerProfile,

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

  if (__DEV__) {
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

        workGalleryCount:
          workGallery.length,

        workGallery:
          workGallery.map(
            url => ({
              isHttps:
                isHttpsUrl(
                  url,
                ),

              hasUrl:
                Boolean(
                  url,
                ),
            }),
          ),

        available:
          user.available !==
          false,

        online:
          user.online ===
          true,

        legacyServiceArea: {
          state,

          lga,

          hasCoordinates:
            latitude !== null &&
            longitude !== null,
        },

        hasServiceLocation:
          serviceLocation !==
          null,

        serviceLocation:
          serviceLocation
            ? {
                state:
                  serviceLocation.state,

                lga:
                  serviceLocation.lga,

                hasAddress:
                  Boolean(
                    serviceLocation.address,
                  ),

                hasCoordinates:
                  true,
              }
            : null,
      },
    );
  }
}