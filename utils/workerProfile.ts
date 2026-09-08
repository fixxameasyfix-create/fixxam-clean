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
   IMAGE URI HELPERS
============================================================ */

export function isHttpsUrl(
  value: string,
): boolean {
  return value.startsWith("https://");
}

export function isLocalUri(
  value: string,
): boolean {
  return (
    value.startsWith("file://") ||
    value.startsWith("content://")
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
   FIRESTORE OBJECT
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
        .map(item =>
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
      .slice(
        0,
        2,
      );

  return `${whole}.${decimal}`;
}

/* ============================================================
   IMAGE SIZE
============================================================ */

export function validateImageSize(
  fileSize?: number | null,
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
  data: Record<
    string,
    unknown
  >,
): WorkerProfile {
  const workerProfile =
    getWorkerProfileObject(
      data.workerProfile,
    );

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

  const nestedGallery =
    getSafeGallery(
      workerProfile.workGallery,
    );

  const rootGallery =
    getSafeGallery(
      data.workGallery,
    );

  const workGallery =
    nestedGallery.length > 0
      ? nestedGallery
      : rootGallery;

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

  const experienceValue =
    workerProfile.experience ??
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

  const rateValue =
    workerProfile.hourlyRate ??
    workerProfile.rate ??
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

  const location =
    cleanString(
      workerProfile.location,
    ) ||
    cleanString(
      workerProfile.address,
    ) ||
    cleanString(
      data.location,
    ) ||
    cleanString(
      data.address,
    );

  const aboutMe =
    cleanString(
      workerProfile.aboutMe,
    ) ||
    cleanString(
      workerProfile.about,
    ) ||
    cleanString(
      data.aboutMe,
    ) ||
    cleanString(
      data.about,
    );

  return {
    fullName,
    phoneNumber,
    photoUrl,
    experience,
    hourlyRate,
    location,
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

  const location =
    profile.location.trim();

  const aboutMe =
    profile.aboutMe.trim();

  if (!name) {
    return "Please enter your name.";
  }

  if (
    name.length < 2 ||
    name.length > 100
  ) {
    return "Name must be between 2 and 100 characters.";
  }

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

  if (
    !Number.isInteger(
      experience,
    ) ||
    experience < 0 ||
    experience > 60
  ) {
    return "Enter a valid experience in years.";
  }

  if (
    !Number.isFinite(rate) ||
    rate <= 0 ||
    rate > 100000000
  ) {
    return "Enter a valid hourly rate.";
  }

  if (!location) {
    return "Please enter your location.";
  }

  if (
    location.length > 200
  ) {
    return "Location is too long.";
  }

  if (
    aboutMe.length > 1000
  ) {
    return "About Me must not exceed 1000 characters.";
  }

  if (
    profile.photoUrl &&
    !isHttpsUrl(
      profile.photoUrl,
    )
  ) {
    return "Your profile photo is not uploaded correctly. Please choose the photo again.";
  }

  if (
    profile.workGallery.some(
      photo =>
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