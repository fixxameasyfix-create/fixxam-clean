import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { auth, db, storage } from "@/firebase/config";

import {
  MAX_GALLERY_PHOTOS,
  WorkerProfile,
  WorkerServiceLocation,
} from "@/types/workerProfile";

/* ============================================================
   CONSTANTS
============================================================ */

const USERS_COLLECTION =
  "users";

const WORKER_PUBLIC_PROFILES_COLLECTION =
  "workerPublicProfiles";

/* ============================================================
   HELPERS
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizePhotoUrl(
  value: unknown,
): string {
  const url =
    normalizeString(value);

  if (!url) {
    return "";
  }

  return /^https:\/\//i.test(url)
    ? url
    : "";
}

function normalizeGallery(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(
          (item) =>
            item.length > 0 &&
            /^https:\/\//i.test(item),
        ),
    ),
  ).slice(0, MAX_GALLERY_PHOTOS);
}

function normalizeServiceLocation(
  value:
    | WorkerServiceLocation
    | undefined,
): WorkerServiceLocation {
  if (!value) {
    return {
      address: "",
      state: "",
      lga: "",
      latitude: null,
      longitude: null,
    };
  }

  return {
    address:
      normalizeString(
        value.address,
      ),

    state:
      normalizeString(
        value.state,
      ),

    lga:
      normalizeString(
        value.lga,
      ),

    latitude:
      typeof value.latitude === "number" &&
      Number.isFinite(
        value.latitude,
      )
        ? value.latitude
        : null,

    longitude:
      typeof value.longitude === "number" &&
      Number.isFinite(
        value.longitude,
      )
        ? value.longitude
        : null,
  };
}

function preferUsableString(
  ...values: unknown[]
): string {
  for (const value of values) {
    const normalized =
      normalizeString(value);

    if (normalized) {
      return normalized;
    }
  }

  return "";
}

/* ============================================================
   PROFILE NORMALIZATION
============================================================ */

function normalizeProfileData(
  userData: Record<string, unknown>,
  publicData: Record<string, unknown>,
): WorkerProfile {
  const userWorkerProfile =
    (
      userData.workerProfile ??
      {}
    ) as Record<string, unknown>;

  const publicWorkerProfile =
    (
      publicData.workerProfile ??
      {}
    ) as Record<string, unknown>;

  const rawPhotoUrl =
    preferUsableString(
      userWorkerProfile.photoUrl,
      publicWorkerProfile.photoUrl,

      userData.photoUrl,
      publicData.photoUrl,

      userWorkerProfile.photoURL,
      publicWorkerProfile.photoURL,

      userData.photoURL,
      publicData.photoURL,
    );

  const rawGallery =
    Array.isArray(
      userWorkerProfile.workGallery,
    )
      ? userWorkerProfile.workGallery
      : Array.isArray(
          publicWorkerProfile.workGallery,
        )
      ? publicWorkerProfile.workGallery
      : Array.isArray(
          userData.workGallery,
        )
      ? userData.workGallery
      : publicData.workGallery;

  const rawSelectedServices =
    Array.isArray(
      userWorkerProfile.selectedServices,
    )
      ? userWorkerProfile.selectedServices
      : Array.isArray(
          publicWorkerProfile.selectedServices,
        )
      ? publicWorkerProfile.selectedServices
      : [];

  const serviceLocation =
    normalizeServiceLocation(
      (
        userWorkerProfile.serviceLocation ??
        publicWorkerProfile.serviceLocation ??
        userData.serviceLocation ??
        publicData.serviceLocation
      ) as
        | WorkerServiceLocation
        | undefined,
    );

  return {
    fullName:
      preferUsableString(
        userWorkerProfile.fullName,
        publicWorkerProfile.fullName,
        userData.fullName,
        publicData.fullName,
      ),

    phoneNumber:
      preferUsableString(
        userWorkerProfile.phoneNumber,
        publicWorkerProfile.phoneNumber,
        userData.phoneNumber,
        publicData.phoneNumber,
      ),

    photoUrl:
      normalizePhotoUrl(
        rawPhotoUrl,
      ),

    category:
      preferUsableString(
        userWorkerProfile.category,
        publicWorkerProfile.category,
      ),

    subcategory:
      preferUsableString(
        userWorkerProfile.subcategory,
        publicWorkerProfile.subcategory,
      ),

    selectedServices:
      Array.from(
        new Set(
          rawSelectedServices
            .filter(
              (
                item,
              ): item is string =>
                typeof item ===
                "string",
            )
            .map((item) =>
              item.trim(),
            )
            .filter(Boolean),
        ),
      ),

    experience:
      preferUsableString(
        userWorkerProfile.experience,
        publicWorkerProfile.experience,
      ),

    hourlyRate:
      preferUsableString(
        userWorkerProfile.hourlyRate,
        publicWorkerProfile.hourlyRate,
      ),

    location:
      preferUsableString(
        userWorkerProfile.location,
        publicWorkerProfile.location,
      ),

    serviceLocation,

    workGallery:
      normalizeGallery(
        rawGallery,
      ),

    aboutMe:
      preferUsableString(
        userWorkerProfile.aboutMe,
        publicWorkerProfile.aboutMe,
      ),
  };
}

/* ============================================================
   GET EXISTING PROFILE DOCUMENTS
============================================================ */

async function getWorkerProfileDocuments(
  uid: string,
) {
  const userRef = doc(
    db,
    USERS_COLLECTION,
    uid,
  );

  const publicRef = doc(
    db,
    WORKER_PUBLIC_PROFILES_COLLECTION,
    uid,
  );

  const [
    userSnapshot,
    publicSnapshot,
  ] = await Promise.all([
    getDoc(userRef),
    getDoc(publicRef),
  ]);

  return {
    userRef,
    publicRef,
    userData:
      userSnapshot.exists()
        ? (userSnapshot.data() as Record<
            string,
            unknown
          >)
        : {},
    publicData:
      publicSnapshot.exists()
        ? (publicSnapshot.data() as Record<
            string,
            unknown
          >)
        : {},
  };
}

/* ============================================================
   GET PERSISTED PHOTO
============================================================ */

async function getPersistedPhotoUrl(
  uid: string,
): Promise<string> {
  const {
    userData,
    publicData,
  } =
    await getWorkerProfileDocuments(
      uid,
    );

  const userWorkerProfile =
    (
      userData.workerProfile ??
      {}
    ) as Record<string, unknown>;

  const publicWorkerProfile =
    (
      publicData.workerProfile ??
      {}
    ) as Record<string, unknown>;

  return normalizePhotoUrl(
    preferUsableString(
      userWorkerProfile.photoUrl,
      publicWorkerProfile.photoUrl,

      userData.photoUrl,
      publicData.photoUrl,

      userWorkerProfile.photoURL,
      publicWorkerProfile.photoURL,

      userData.photoURL,
      publicData.photoURL,
    ),
  );
}

/* ============================================================
   REALTIME SUBSCRIPTION
============================================================ */

export function subscribeToWorkerProfile(
  uid: string,
  onProfile: (
    profile: WorkerProfile,
  ) => void,
  onError?: (
    error: Error,
  ) => void,
): () => void {
  const userRef = doc(
    db,
    USERS_COLLECTION,
    uid,
  );

  const publicRef = doc(
    db,
    WORKER_PUBLIC_PROFILES_COLLECTION,
    uid,
  );

  let userData:
    | Record<string, unknown>
    = {};

  let publicData:
    | Record<string, unknown>
    = {};

  let hasUserSnapshot = false;
  let hasPublicSnapshot = false;

  const emitProfile = () => {
    if (
      !hasUserSnapshot &&
      !hasPublicSnapshot
    ) {
      return;
    }

    onProfile(
      normalizeProfileData(
        userData,
        publicData,
      ),
    );
  };

  const unsubscribeUser =
    onSnapshot(
      userRef,
      (snapshot) => {
        userData =
          snapshot.exists()
            ? (snapshot.data() as Record<
                string,
                unknown
              >)
            : {};

        hasUserSnapshot = true;

        emitProfile();
      },
      (error) => {
        console.error(
          "[workerProfileService] User profile subscription error:",
          error,
        );

        onError?.(error);
      },
    );

  const unsubscribePublic =
    onSnapshot(
      publicRef,
      (snapshot) => {
        publicData =
          snapshot.exists()
            ? (snapshot.data() as Record<
                string,
                unknown
              >)
            : {};

        hasPublicSnapshot = true;

        emitProfile();
      },
      (error) => {
        console.error(
          "[workerProfileService] Public profile subscription error:",
          error,
        );

        onError?.(error);
      },
    );

  return () => {
    unsubscribeUser();
    unsubscribePublic();
  };
}

/* ============================================================
   SAVE PROFILE PHOTO
============================================================ */

export async function saveWorkerProfilePhoto(
  uid: string,
  photoUrl: string,
): Promise<void> {
  const normalizedPhotoUrl =
    normalizePhotoUrl(
      photoUrl,
    );

  if (!normalizedPhotoUrl) {
    throw new Error(
      "A valid HTTPS profile photo URL is required.",
    );
  }

  const userRef = doc(
    db,
    USERS_COLLECTION,
    uid,
  );

  const publicRef = doc(
    db,
    WORKER_PUBLIC_PROFILES_COLLECTION,
    uid,
  );

  const batch =
    writeBatch(db);

  batch.set(
    userRef,
    {
      photoUrl:
        normalizedPhotoUrl,

      "workerProfile.photoUrl":
        normalizedPhotoUrl,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  batch.set(
    publicRef,
    {
      photoUrl:
        normalizedPhotoUrl,

      "workerProfile.photoUrl":
        normalizedPhotoUrl,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  await batch.commit();
}

/* ============================================================
   SAVE GALLERY
============================================================ */

export async function saveWorkerGallery(
  uid: string,
  gallery: string[],
): Promise<void> {
  const normalizedGallery =
    normalizeGallery(
      gallery,
    );

  const userRef = doc(
    db,
    USERS_COLLECTION,
    uid,
  );

  const publicRef = doc(
    db,
    WORKER_PUBLIC_PROFILES_COLLECTION,
    uid,
  );

  const batch =
    writeBatch(db);

  batch.set(
    userRef,
    {
      workGallery:
        normalizedGallery,

      "workerProfile.workGallery":
        normalizedGallery,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  batch.set(
    publicRef,
    {
      workGallery:
        normalizedGallery,

      "workerProfile.workGallery":
        normalizedGallery,

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  await batch.commit();
}

/* ============================================================
   SAVE COMPLETE PROFILE
============================================================ */

export async function saveWorkerProfile(
  uid: string,
  profile: WorkerProfile,
): Promise<void> {
  if (!uid) {
    throw new Error(
      "A valid user ID is required.",
    );
  }

  const {
    userRef,
    publicRef,
    userData,
    publicData,
  } =
    await getWorkerProfileDocuments(
      uid,
    );

  /* ----------------------------------------------------------
     PHOTO PROTECTION
  ---------------------------------------------------------- */

  const requestedPhotoUrl =
    normalizePhotoUrl(
      profile.photoUrl,
    );

  const persistedPhotoUrl =
    normalizePhotoUrl(
      preferUsableString(
        (
          (
            userData.workerProfile ??
            {}
          ) as Record<
            string,
            unknown
          >
        ).photoUrl,

        (
          (
            publicData.workerProfile ??
            {}
          ) as Record<
            string,
            unknown
          >
        ).photoUrl,

        userData.photoUrl,
        publicData.photoUrl,

        (
          (
            userData.workerProfile ??
            {}
          ) as Record<
            string,
            unknown
          >
        ).photoURL,

        (
          (
            publicData.workerProfile ??
            {}
          ) as Record<
            string,
            unknown
          >
        ).photoURL,

        userData.photoURL,
        publicData.photoURL,
      ),
    );

  /**
   * IMPORTANT:
   *
   * A complete profile save must never erase
   * an already persisted photo.
   */
  const finalPhotoUrl =
    requestedPhotoUrl ||
    persistedPhotoUrl;

  /* ----------------------------------------------------------
     NORMALIZE PROFILE
  ---------------------------------------------------------- */

  const fullName =
    normalizeString(
      profile.fullName,
    );

  if (!fullName) {
    throw new Error(
      "Your full name is required.",
    );
  }

  if (
    fullName.length > 100
  ) {
    throw new Error(
      "Your name is too long.",
    );
  }

  const phoneNumber =
    normalizeString(
      profile.phoneNumber,
    );

  const category =
    normalizeString(
      profile.category,
    );

  const subcategory =
    normalizeString(
      profile.subcategory,
    );

  const experience =
    normalizeString(
      profile.experience,
    );

  const hourlyRate =
    normalizeString(
      profile.hourlyRate,
    );

  const location =
    normalizeString(
      profile.location,
    );

  const aboutMe =
    normalizeString(
      profile.aboutMe,
    );

  const selectedServices =
    Array.from(
      new Set(
        (
          profile.selectedServices ??
          []
        )
          .filter(
            (
              item,
            ): item is string =>
              typeof item ===
              "string",
          )
          .map((item) =>
            item.trim(),
          )
          .filter(Boolean),
      ),
    );

  const workGallery =
    normalizeGallery(
      profile.workGallery,
    );

  const serviceLocation =
    normalizeServiceLocation(
      profile.serviceLocation,
    );

  /* ----------------------------------------------------------
     PROFILE DATA
  ---------------------------------------------------------- */

  const workerProfileData: Record<
    string,
    unknown
  > = {
    fullName,
    phoneNumber,
    category,
    subcategory,
    selectedServices,
    experience,
    hourlyRate,
    location,
    serviceLocation,
    workGallery,
    aboutMe,
  };

  if (finalPhotoUrl) {
    workerProfileData.photoUrl =
      finalPhotoUrl;
  }

  /* ----------------------------------------------------------
     USER DATA
  ---------------------------------------------------------- */

  const userPayload: Record<
    string,
    unknown
  > = {
    fullName,
    phoneNumber,
    category,
    subcategory,
    selectedServices,
    experience,
    hourlyRate,
    location,
    serviceLocation,
    workGallery,
    aboutMe,

    workerProfile:
      workerProfileData,

    updatedAt:
      serverTimestamp(),
  };

  /* ----------------------------------------------------------
     PUBLIC DATA
  ---------------------------------------------------------- */

  const publicPayload: Record<
    string,
    unknown
  > = {
    fullName,
    phoneNumber,
    category,
    subcategory,
    selectedServices,
    experience,
    hourlyRate,
    location,
    serviceLocation,
    workGallery,
    aboutMe,

    workerProfile:
      workerProfileData,

    updatedAt:
      serverTimestamp(),
  };

  /* ----------------------------------------------------------
     PHOTO DUPLICATION
  ---------------------------------------------------------- */

  if (finalPhotoUrl) {
    userPayload.photoUrl =
      finalPhotoUrl;

    userPayload[
      "workerProfile.photoUrl"
    ] = finalPhotoUrl;

    publicPayload.photoUrl =
      finalPhotoUrl;

    publicPayload[
      "workerProfile.photoUrl"
    ] = finalPhotoUrl;
  }

  /* ----------------------------------------------------------
     ATOMIC FIRESTORE WRITE
  ---------------------------------------------------------- */

  const batch =
    writeBatch(db);

  batch.set(
    userRef,
    userPayload,
    {
      merge: true,
    },
  );

  batch.set(
    publicRef,
    publicPayload,
    {
      merge: true,
    },
  );

  await batch.commit();
}

/* ============================================================
   UPLOAD WORKER IMAGE
============================================================ */

export async function uploadWorkerImage(
  uid: string,
  uri: string,
  fileName: string,
  folder:
    | "profile"
    | "gallery",
): Promise<string> {
  if (!uid) {
    throw new Error(
      "A valid user ID is required.",
    );
  }

  if (!uri) {
    throw new Error(
      "Image URI is required.",
    );
  }

  const response =
    await fetch(uri);

  if (!response.ok) {
    throw new Error(
      "Unable to read the selected image.",
    );
  }

  const blob =
    await response.blob();

  const safeFileName =
    fileName
      .trim()
      .replace(
        /[^a-zA-Z0-9._-]/g,
        "_",
      );

  const storagePath =
    `workers/${uid}/${folder}/${Date.now()}-${safeFileName}`;

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
    },
  );

  return getDownloadURL(
    storageRef,
  );
}

/* ============================================================
   DELETE PROFILE PHOTO
============================================================ */

export async function deleteWorkerProfilePhoto(
  uid: string,
): Promise<void> {
  if (!uid) {
    throw new Error(
      "A valid user ID is required.",
    );
  }

  const userRef = doc(
    db,
    USERS_COLLECTION,
    uid,
  );

  const publicRef = doc(
    db,
    WORKER_PUBLIC_PROFILES_COLLECTION,
    uid,
  );

  const batch =
    writeBatch(db);

  /**
   * Explicit deletion is different from
   * a normal profile save.
   *
   * We intentionally delete the fields
   * here only.
   */
  batch.set(
    userRef,
    {
      photoUrl: "",
      "workerProfile.photoUrl": "",
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  batch.set(
    publicRef,
    {
      photoUrl: "",
      "workerProfile.photoUrl": "",
      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );

  await batch.commit();
}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default {
  subscribeToWorkerProfile,
  saveWorkerProfile,
  saveWorkerProfilePhoto,
  saveWorkerGallery,
  uploadWorkerImage,
  deleteWorkerProfilePhoto,
};