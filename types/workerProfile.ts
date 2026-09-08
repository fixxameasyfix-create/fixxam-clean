/* ============================================================
   WORKER PROFILE TYPES
============================================================ */

export type WorkerProfile = {
  fullName: string;
  phoneNumber: string;
  photoUrl: string;
  experience: string;
  hourlyRate: string;
  location: string;
  workGallery: string[];
  aboutMe: string;
};

export type FirestoreWorkerProfile = {
  fullName?: unknown;
  name?: unknown;
  displayName?: unknown;

  phoneNumber?: unknown;
  phone?: unknown;

  photoUrl?: unknown;
  photoURL?: unknown;

  experience?: unknown;

  hourlyRate?: unknown;
  rate?: unknown;

  location?: unknown;
  address?: unknown;

  workGallery?: unknown;

  aboutMe?: unknown;
  about?: unknown;
};

/* ============================================================
   UI TYPES
============================================================ */

export type WorkerProfileField =
  keyof WorkerProfile;

/* ============================================================
   CONSTANTS
============================================================ */

export const MAX_GALLERY_PHOTOS = 6;

export const MAX_IMAGE_BYTES =
  10 * 1024 * 1024;

/* ============================================================
   DEFAULT PROFILE
============================================================ */

export const EMPTY_WORKER_PROFILE: WorkerProfile =
  {
    fullName: "",
    phoneNumber: "",
    photoUrl: "",
    experience: "",
    hourlyRate: "",
    location: "",
    workGallery: [],
    aboutMe: "",
  };