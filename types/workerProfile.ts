// types/workerProfile.ts

/* ============================================================
   WORKER SERVICE LOCATION
============================================================ */

export type WorkerServiceLocation = {
  address: string;
  state: string;
  lga: string;
  latitude: number | null;
  longitude: number | null;
};

/* ============================================================
   WORKER PROFILE
============================================================ */

export type WorkerProfile = {
  /* ---------------- Personal ---------------- */

  fullName: string;
  phoneNumber: string;
  photoUrl: string;

  /* ---------------- Professional ---------------- */

  category: string;
  subcategory: string;
  selectedServices: string[];

  experience: string;
  hourlyRate: string;

  /* ---------------- Location ---------------- */

  /**
   * Legacy location field.
   *
   * Kept for backward compatibility.
   * New location data should use serviceLocation.
   */
  location: string;

  serviceLocation: WorkerServiceLocation;

  /* ---------------- Profile ---------------- */

  workGallery: string[];
  aboutMe: string;
};

/* ============================================================
   FIRESTORE WORKER PROFILE
============================================================ */

export type FirestoreWorkerProfile = {
  /* ---------------- Identity ---------------- */

  uid?: unknown;
  userId?: unknown;

  /* ---------------- Personal ---------------- */

  fullName?: unknown;
  name?: unknown;
  displayName?: unknown;

  phoneNumber?: unknown;
  phone?: unknown;

  photoUrl?: unknown;
  photoURL?: unknown;

  /* ---------------- Professional ---------------- */

  category?: unknown;
  subcategory?: unknown;
  selectedServices?: unknown;

  experience?: unknown;

  hourlyRate?: unknown;
  rate?: unknown;

  /* ---------------- Location ---------------- */

  location?: unknown;
  address?: unknown;

  state?: unknown;
  lga?: unknown;

  serviceLocation?: {
    address?: unknown;
    state?: unknown;
    lga?: unknown;
    latitude?: unknown;
    longitude?: unknown;
  };

  /* ---------------- Profile ---------------- */

  workGallery?: unknown;

  aboutMe?: unknown;
  about?: unknown;

  /* ---------------- Registration compatibility ---------------- */

  serviceDetails?: unknown;

  workerProfile?: {
    category?: unknown;
    subcategory?: unknown;
    selectedServices?: unknown;

    state?: unknown;
    lga?: unknown;

    serviceDetails?: unknown;

    [key: string]: unknown;
  };

  /* ---------------- Publication metadata ---------------- */

  published?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;

  [key: string]: unknown;
};

/* ============================================================
   FIELD TYPE
============================================================ */

export type WorkerProfileField =
  keyof WorkerProfile;

/* ============================================================
   LIMITS
============================================================ */

export const MAX_GALLERY_PHOTOS = 6;

export const MAX_IMAGE_BYTES =
  10 * 1024 * 1024;

/* ============================================================
   EMPTY SERVICE LOCATION
============================================================ */

export const EMPTY_WORKER_SERVICE_LOCATION: WorkerServiceLocation = {
  address: "",
  state: "",
  lga: "",
  latitude: null,
  longitude: null,
};

/* ============================================================
   EMPTY WORKER PROFILE
============================================================ */

export const EMPTY_WORKER_PROFILE: WorkerProfile = {
  /* ---------------- Personal ---------------- */

  fullName: "",
  phoneNumber: "",
  photoUrl: "",

  /* ---------------- Professional ---------------- */

  category: "",
  subcategory: "",
  selectedServices: [],

  experience: "",
  hourlyRate: "",

  /* ---------------- Location ---------------- */

  location: "",

  serviceLocation: {
    ...EMPTY_WORKER_SERVICE_LOCATION,
  },

  /* ---------------- Profile ---------------- */

  workGallery: [],
  aboutMe: "",
};