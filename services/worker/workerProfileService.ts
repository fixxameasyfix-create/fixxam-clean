import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
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

import {
  EMPTY_WORKER_PROFILE,
  MAX_GALLERY_PHOTOS,
  type WorkerProfile,
} from "@/types/workerProfile";

import {
  cleanString,
  getSafeImageUrl,
  isHttpsUrl,
  isLocalUri,
  normalizePhoneNumber,
  normalizeProfileData,
} from "@/utils/workerProfile";

/* ============================================================
   TYPES
============================================================ */

type ProfileListener = (
  profile: WorkerProfile,
) => void;

type ProfileErrorListener = (
  error: Error,
) => void;

/* ============================================================
   PROFILE DOCUMENT
============================================================ */

function getWorkerProfileRef(
  uid: string,
) {
  const safeUid =
    cleanString(uid);

  if (!safeUid) {
    throw new Error(
      "Worker UID is required.",
    );
  }

  return doc(
    db,
    "workerPublicProfiles",
    safeUid,
  );
}

/* ============================================================
   PROFILE LISTENER
============================================================ */

export function subscribeToWorkerProfile(
  uid: string,
  onProfile: ProfileListener,
  onError: ProfileErrorListener,
): Unsubscribe {
  const profileRef =
    getWorkerProfileRef(uid);

  return onSnapshot(
    profileRef,

    snapshot => {
      if (!snapshot.exists()) {
        onProfile({
          ...EMPTY_WORKER_PROFILE,
          workGallery: [],
        });

        return;
      }

      const profile =
        normalizeProfileData(
          snapshot.data() as Record<
            string,
            unknown
          >,
        );

      onProfile(profile);
    },

    error => {
      onError(error);
    },
  );
}

/* ============================================================
   UPLOAD IMAGE
============================================================ */

export async function uploadWorkerImage(
  localUri: string,
  storagePath: string,
  mimeType = "image/jpeg",
): Promise<string> {
  const uri =
    cleanString(localUri);

  const path =
    cleanString(storagePath);

  if (!uri) {
    throw new Error(
      "Image URI is empty.",
    );
  }

  if (!path) {
    throw new Error(
      "Storage path is empty.",
    );
  }

  /*
   * Already uploaded images do not
   * need to be uploaded again.
   */
  if (isHttpsUrl(uri)) {
    return uri;
  }

  if (!isLocalUri(uri)) {
    throw new Error(
      "Invalid local image URI.",
    );
  }

  const response =
    await fetch(uri);

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

  const imageRef =
    ref(
      storage,
      path,
    );

  await uploadBytes(
    imageRef,
    blob,
    {
      contentType:
        cleanString(mimeType) ||
        blob.type ||
        "image/jpeg",

      cacheControl:
        "public,max-age=3600",
    },
  );

  const downloadURL =
    await getDownloadURL(
      imageRef,
    );

  if (
    !isHttpsUrl(downloadURL)
  ) {
    throw new Error(
      "Firebase Storage returned an invalid image URL.",
    );
  }

  return downloadURL;
}

/* ============================================================
   SAVE PROFILE PHOTO
============================================================ */

export async function saveWorkerProfilePhoto(
  uid: string,
  photoUrl: string,
): Promise<void> {
  const safePhotoUrl =
    getSafeImageUrl(
      photoUrl,
    );

  if (!safePhotoUrl) {
    throw new Error(
      "A valid profile photo URL is required.",
    );
  }

  const profileRef =
    getWorkerProfileRef(uid);

  await setDoc(
    profileRef,
    {
      photoURL:
        safePhotoUrl,

      photoUrl:
        safePhotoUrl,

      workerProfile: {
        photoUrl:
          safePhotoUrl,

        photoURL:
          safePhotoUrl,
      },

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

/* ============================================================
   SAVE WORK GALLERY
============================================================ */

export async function saveWorkerGallery(
  uid: string,
  gallery: string[],
): Promise<void> {
  const safeGallery =
    Array.from(
      new Set(
        gallery.filter(
          isHttpsUrl,
        ),
      ),
    ).slice(
      0,
      MAX_GALLERY_PHOTOS,
    );

  const profileRef =
    getWorkerProfileRef(uid);

  await setDoc(
    profileRef,
    {
      workGallery:
        safeGallery,

      workerProfile: {
        workGallery:
          safeGallery,
      },

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

/* ============================================================
   SAVE COMPLETE PROFILE
============================================================ */

export async function saveWorkerProfile(
  uid: string,
  profile: WorkerProfile,
): Promise<void> {
  const safeUid =
    cleanString(uid);

  if (!safeUid) {
    throw new Error(
      "Worker UID is required.",
    );
  }

  const fullName =
    profile.fullName.trim();

  const phoneNumber =
    normalizePhoneNumber(
      profile.phoneNumber,
    );

  const experience =
    Number(
      profile.experience,
    );

  const hourlyRate =
    Number(
      profile.hourlyRate,
    );

  const location =
    profile.location.trim();

  const aboutMe =
    profile.aboutMe.trim();

  const photoUrl =
    getSafeImageUrl(
      profile.photoUrl,
    );

  const workGallery =
    Array.from(
      new Set(
        profile.workGallery.filter(
          isHttpsUrl,
        ),
      ),
    ).slice(
      0,
      MAX_GALLERY_PHOTOS,
    );

  /* ==========================================================
     CANONICAL WORKER PROFILE
  ========================================================== */

  const workerProfile = {
    fullName,

    phoneNumber,

    photoUrl,

    photoURL:
      photoUrl,

    workGallery,

    /*
     * Preserve the existing nested
     * Firestore format for compatibility.
     */
    experience:
      String(experience),

    hourlyRate,

    location,

    address:
      location,

    aboutMe,

    about:
      aboutMe,
  };

  const profileRef =
    getWorkerProfileRef(
      safeUid,
    );

  await setDoc(
    profileRef,
    {
      uid:
        safeUid,

      userId:
        safeUid,

      fullName,

      name:
        fullName,

      phoneNumber,

      /* ======================================================
         ROOT COMPATIBILITY
      ====================================================== */

      photoURL:
        photoUrl,

      photoUrl,

      experience,

      rate:
        hourlyRate,

      hourlyRate,

      location,

      workGallery,

      aboutMe,

      /* ======================================================
         CANONICAL PROFILE
      ====================================================== */

      workerProfile,

      /* ======================================================
         PROFILE STATE
      ====================================================== */

      published:
        true,

      /*
       * Do not set available=true here.
       * Profile editing must not change
       * worker online availability.
       */

      updatedAt:
        serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}