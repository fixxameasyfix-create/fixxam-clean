import type {
  FirestoreWorkerProfile,
  WorkerProfile,
} from "@/types/workerProfile";

import {
  MAX_GALLERY_PHOTOS,
  MAX_IMAGE_BYTES,
} from "@/types/workerProfile";

/* ============================================================
   STRING HELPERS
============================================================ */

export function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   STRING ARRAY HELPERS
============================================================ */

export function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item === "string",
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  );
}

/* ============================================================
   IMAGE URI HELPERS
============================================================ */

export function isHttpsUrl(
  value: string,
): boolean {
  const normalized =
    cleanString(value);

  if (!normalized) {
    return false;
  }

  try {
    const url =
      new URL(normalized);

    return (
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export function isLocalUri(
  value: string,
): boolean {
  const normalized =
    cleanString(value);

  return (
    normalized.startsWith(
      "file://",
    ) ||
    normalized.startsWith(
      "content://",
    )
  );
}

export function getSafeImageUrl(
  value: unknown,
): string {
  const url =
    cleanString(value);

  if (
    !url ||
    isLocalUri(url) ||
    !isHttpsUrl(url)
  ) {
    return "";
  }

  return url;
}

/* ============================================================
   FIRESTORE OBJECT HELPERS
============================================================ */

function getWorkerProfileObject(
  value: unknown,
): FirestoreWorkerProfile {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value as FirestoreWorkerProfile;
}

function getRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value as Record<
    string,
    unknown
  >;
}

/* ============================================================
   COORDINATE HELPERS
============================================================ */

function getCoordinate(
  value: unknown,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

export function isValidLatitude(
  value:
    | number
    | null
    | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

export function isValidLongitude(
  value:
    | number
    | null
    | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

/* ============================================================
   GALLERY
============================================================ */

export function getSafeGallery(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) =>
          getSafeImageUrl(item),
        )
        .filter(Boolean),
    ),
  ).slice(
    0,
    MAX_GALLERY_PHOTOS,
  );
}

/* ============================================================
   DECIMAL INPUT
============================================================ */

export function sanitizeDecimalInput(
  value: string,
): string {
  const cleaned =
    value.replace(
      /[^0-9.]/g,
      "",
    );

  const [
    whole = "",
    ...decimalParts
  ] = cleaned.split(".");

  if (
    decimalParts.length === 0
  ) {
    return whole;
  }

  const decimal =
    decimalParts
      .join("")
      .slice(0, 2);

  return `${whole}.${decimal}`;
}

/* ============================================================
   IMAGE SIZE
============================================================ */

export function validateImageSize(
  fileSize?:
    | number
    | null,
): boolean {
  if (
    typeof fileSize !== "number" ||
    !Number.isFinite(fileSize)
  ) {
    return true;
  }

  return (
    fileSize <=
    MAX_IMAGE_BYTES
  );
}

/* ============================================================
   NORMALIZE FIRESTORE PROFILE
============================================================ */

export function normalizeProfileData(
  data: Record<string, unknown>,
): WorkerProfile {
  const workerProfile =
    getWorkerProfileObject(
      data.workerProfile,
    );

  const workerRecord =
    getRecord(
      data.workerProfile,
    );

  /* ==========================================================
     PHOTO
  ========================================================== */

  const photoUrl =
    getSafeImageUrl(
      workerProfile.photoUrl,
    ) ||
    getSafeImageUrl(
      workerProfile.photoURL,
    ) ||
    getSafeImageUrl(
      data.photoURL,
    ) ||
    getSafeImageUrl(
      data.photoUrl,
    );

  /* ==========================================================
     PHONE
  ========================================================== */

  const phoneNumber =
    cleanString(
      workerProfile.phoneNumber,
    ) ||
    cleanString(
      workerProfile.phone,
    ) ||
    cleanString(
      data.phoneNumber,
    ) ||
    cleanString(
      data.phone,
    );

  /* ==========================================================
     NAME
  ========================================================== */

  const fullName =
    cleanString(
      workerProfile.fullName,
    ) ||
    cleanString(
      workerProfile.name,
    ) ||
    cleanString(
      workerProfile.displayName,
    ) ||
    cleanString(
      data.fullName,
    ) ||
    cleanString(
      data.name,
    ) ||
    cleanString(
      data.displayName,
    );

  /* ==========================================================
     PROFESSIONAL INFORMATION
  ========================================================== */

  const category =
    cleanString(
      workerRecord.category,
    ) ||
    cleanString(
      data.category,
    );

  const subcategory =
    cleanString(
      workerRecord.subcategory,
    ) ||
    cleanString(
      data.subcategory,
    );

  const nestedServices =
    normalizeStringArray(
      workerRecord.selectedServices,
    );

  const rootServices =
    normalizeStringArray(
      data.selectedServices,
    );

  const selectedServices =
    nestedServices.length > 0
      ? nestedServices
      : rootServices;

  /* ==========================================================
     EXPERIENCE
  ========================================================== */

  const experienceValue =
    workerRecord.experience ??
    data.experience;

  const experience =
    typeof experienceValue ===
    "number"
      ? String(
          experienceValue,
        )
      : cleanString(
          experienceValue,
        );

  /* ==========================================================
     HOURLY RATE
  ========================================================== */

  const rateValue =
    workerRecord.hourlyRate ??
    workerRecord.rate ??
    data.hourlyRate ??
    data.rate;

  const hourlyRate =
    typeof rateValue ===
    "number"
      ? String(
          rateValue,
        )
      : cleanString(
          rateValue,
        );

  /* ==========================================================
     LEGACY LOCATION

     Keep this for backward compatibility.

     This must NOT be treated as an exact physical
     service destination.
  ========================================================== */

  const location =
    cleanString(
      workerRecord.location,
    ) ||
    cleanString(
      workerRecord.address,
    ) ||
    cleanString(
      data.location,
    ) ||
    cleanString(
      data.address,
    );

  /* ==========================================================
     SERVICE LOCATION
  ========================================================== */

  const nestedServiceLocation =
    getRecord(
      workerRecord.serviceLocation,
    );

  const rootServiceLocation =
    getRecord(
      data.serviceLocation,
    );

  const serviceAddress =
    cleanString(
      nestedServiceLocation.address,
    ) ||
    cleanString(
      rootServiceLocation.address,
    ) ||
    cleanString(
      workerRecord.serviceAddress,
    ) ||
    cleanString(
      data.address,
    );

  const serviceState =
    cleanString(
      nestedServiceLocation.state,
    ) ||
    cleanString(
      rootServiceLocation.state,
    ) ||
    cleanString(
      workerRecord.state,
    ) ||
    cleanString(
      data.state,
    );

  const serviceLga =
    cleanString(
      nestedServiceLocation.lga,
    ) ||
    cleanString(
      rootServiceLocation.lga,
    ) ||
    cleanString(
      workerRecord.lga,
    ) ||
    cleanString(
      data.lga,
    );

  const nestedLatitude =
    getCoordinate(
      nestedServiceLocation.latitude,
    );

  const rootLatitude =
    getCoordinate(
      rootServiceLocation.latitude,
    );

  const nestedLongitude =
    getCoordinate(
      nestedServiceLocation.longitude,
    );

  const rootLongitude =
    getCoordinate(
      rootServiceLocation.longitude,
    );

  const currentLocation =
    getRecord(
      workerRecord.currentLocation,
    );

  const currentLatitude =
    getCoordinate(
      currentLocation.latitude,
    );

  const currentLongitude =
    getCoordinate(
      currentLocation.longitude,
    );

  const latitude =
    isValidLatitude(
      nestedLatitude,
    )
      ? nestedLatitude
      : isValidLatitude(
            rootLatitude,
          )
        ? rootLatitude
        : isValidLatitude(
              currentLatitude,
            )
          ? currentLatitude
          : null;

  const longitude =
    isValidLongitude(
      nestedLongitude,
    )
      ? nestedLongitude
      : isValidLongitude(
            rootLongitude,
          )
        ? rootLongitude
        : isValidLongitude(
              currentLongitude,
            )
          ? currentLongitude
          : null;

  const serviceLocation = {
    address:
      serviceAddress,

    state:
      serviceState,

    lga:
      serviceLga,

    latitude,

    longitude,
  };

  /* ==========================================================
     GALLERY
  ========================================================== */

  const nestedGallery =
    getSafeGallery(
      workerRecord.workGallery,
    );

  const rootGallery =
    getSafeGallery(
      data.workGallery,
    );

  const workGallery =
    nestedGallery.length > 0
      ? nestedGallery
      : rootGallery;

  /* ==========================================================
     ABOUT
  ========================================================== */

  const aboutMe =
    cleanString(
      workerRecord.aboutMe,
    ) ||
    cleanString(
      workerRecord.about,
    ) ||
    cleanString(
      data.aboutMe,
    ) ||
    cleanString(
      data.about,
    );

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    /* Personal */

    fullName,

    phoneNumber,

    photoUrl,

    /* Professional */

    category,

    subcategory,

    selectedServices,

    experience,

    hourlyRate,

    /* Location */

    location,

    serviceLocation,

    /* Profile */

    workGallery,

    aboutMe,
  };
}

/* ============================================================
   PHONE NORMALIZATION
============================================================ */

export function normalizePhoneNumber(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /[\s()-]/g,
      "",
    );
}

/* ============================================================
   PROFILE VALIDATION
============================================================ */

export function validateWorkerProfile(
  profile: WorkerProfile,
): string | null {
  const name =
    profile.fullName.trim();

  const phoneNumber =
    normalizePhoneNumber(
      profile.phoneNumber,
    );

  const experience =
    Number(
      profile.experience,
    );

  const rate =
    Number(
      profile.hourlyRate,
    );

  const aboutMe =
    profile.aboutMe.trim();

  /* ==========================================================
     PROFESSIONAL INFORMATION
  ========================================================== */

  const category =
    profile.category.trim();

  const subcategory =
    profile.subcategory.trim();

  const selectedServices =
    Array.isArray(
      profile.selectedServices,
    )
      ? profile.selectedServices
          .map(
            (service) =>
              service.trim(),
          )
          .filter(Boolean)
      : [];

  /* ==========================================================
     SERVICE LOCATION
  ========================================================== */

  const serviceAddress =
    profile.serviceLocation.address.trim();

  const serviceState =
    profile.serviceLocation.state.trim();

  const serviceLga =
    profile.serviceLocation.lga.trim();

  const serviceLatitude =
    profile.serviceLocation.latitude;

  const serviceLongitude =
    profile.serviceLocation.longitude;

  /* ==========================================================
     NAME
  ========================================================== */

  if (!name) {
    return "Please enter your name.";
  }

  if (
    name.length < 2 ||
    name.length > 100
  ) {
    return "Name must be between 2 and 100 characters.";
  }

  /* ==========================================================
     PHONE
  ========================================================== */

  if (!phoneNumber) {
    return "Please enter your phone number.";
  }

  if (
    !/^\+?\d{10,15}$/.test(
      phoneNumber,
    )
  ) {
    return "Please enter a valid phone number.";
  }

  /* ==========================================================
     PROFESSIONAL CATEGORY
  ========================================================== */

  if (!category) {
    return "Please select your service category.";
  }

  if (
    category.length > 100
  ) {
    return "Service category is invalid.";
  }

  /* ==========================================================
     PROFESSIONAL SUBCATEGORY
  ========================================================== */

  if (!subcategory) {
    return "Please select your service subcategory.";
  }

  if (
    subcategory.length > 100
  ) {
    return "Service subcategory is invalid.";
  }

  /* ==========================================================
     SELECTED SERVICES
  ========================================================== */

  if (
    selectedServices.length ===
    0
  ) {
    return "Please select at least one service.";
  }

  if (
    selectedServices.some(
      (service) =>
        service.length >
        150,
    )
  ) {
    return "One of your selected services is invalid.";
  }

  /* ==========================================================
     EXPERIENCE
  ========================================================== */

  if (
    !Number.isInteger(
      experience,
    ) ||
    experience < 0 ||
    experience > 60
  ) {
    return "Enter a valid experience in years.";
  }

  /* ==========================================================
     HOURLY RATE
  ========================================================== */

  if (
    !Number.isFinite(rate) ||
    rate <= 0 ||
    rate > 100000000
  ) {
    return "Enter a valid hourly rate.";
  }

  /* ==========================================================
     SERVICE STATE
  ========================================================== */

  if (!serviceState) {
    return "Please select your service state.";
  }

  if (
    serviceState.length >
    100
  ) {
    return "Service state is invalid.";
  }

  /* ==========================================================
     SERVICE LGA
  ========================================================== */

  if (!serviceLga) {
    return "Please select your service local government.";
  }

  if (
    serviceLga.length >
    100
  ) {
    return "Service local government is invalid.";
  }

  /* ==========================================================
     SERVICE ADDRESS
  ========================================================== */

  if (!serviceAddress) {
    return "Please add the service location where customers can reach you.";
  }

  if (
    serviceAddress.length < 3 ||
    serviceAddress.length > 250
  ) {
    return "Service address must be between 3 and 250 characters.";
  }

  /* ==========================================================
     COORDINATES
  ========================================================== */

  if (
    !isValidLatitude(
      serviceLatitude,
    ) ||
    !isValidLongitude(
      serviceLongitude,
    )
  ) {
    return "Please select a valid service location.";
  }

  /* ==========================================================
     ABOUT
  ========================================================== */

  if (
    aboutMe.length > 1000
  ) {
    return "About Me must not exceed 1000 characters.";
  }

  /* ==========================================================
     PROFILE PHOTO
  ========================================================== */

  if (
    profile.photoUrl &&
    !isHttpsUrl(
      profile.photoUrl,
    )
  ) {
    return "Your profile photo is not uploaded correctly. Please choose the photo again.";
  }

  /* ==========================================================
     GALLERY
  ========================================================== */

  if (
    profile.workGallery.some(
      (photo) =>
        !isHttpsUrl(photo),
    )
  ) {
    return "One of your gallery photos is invalid. Please remove it and upload it again.";
  }

  if (
    profile.workGallery.length >
    MAX_GALLERY_PHOTOS
  ) {
    return `You can add up to ${MAX_GALLERY_PHOTOS} work photos.`;
  }

  return null;
}