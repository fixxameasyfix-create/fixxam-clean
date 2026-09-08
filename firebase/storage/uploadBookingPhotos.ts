import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { auth } from "@/firebase/config";

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_PHOTOS = 3;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/* ==============================================================
   HELPERS
============================================================== */

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

/* ==============================================================
   FILE EXTENSION
============================================================== */

function getExtension(
  contentType: string,
): string {
  switch (
    contentType.toLowerCase()
  ) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/heic":
      return "heic";

    case "image/heif":
      return "heif";

    case "image/jpeg":
    case "image/jpg":
    default:
      return "jpg";
  }
}

/* ==============================================================
   UPLOAD BOOKING PHOTOS
============================================================== */

export async function uploadBookingPhotos(
  photos: string[],
  customerId: string,
): Promise<string[]> {
  /* ============================================================
     VALIDATE CUSTOMER
  ============================================================ */

  const normalizedCustomerId =
    cleanString(customerId);

  if (!normalizedCustomerId) {
    throw new Error(
      "Customer ID is required to upload booking photos.",
    );
  }

  /* ============================================================
     AUTH CHECK
  ============================================================ */

  const currentUser =
    auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "You must be signed in to upload booking photos.",
    );
  }

  if (
    currentUser.uid !==
    normalizedCustomerId
  ) {
    throw new Error(
      "You are not authorized to upload these booking photos.",
    );
  }

  /* ============================================================
     PHOTOS VALIDATION
  ============================================================ */

  if (!Array.isArray(photos)) {
    throw new Error(
      "Invalid booking photos.",
    );
  }

  if (
    photos.length >
    MAX_PHOTOS
  ) {
    throw new Error(
      `A maximum of ${MAX_PHOTOS} photos is allowed.`,
    );
  }

  if (
    photos.length === 0
  ) {
    return [];
  }

  /* ============================================================
     FIREBASE STORAGE
  ============================================================ */

  const storage =
    getStorage();

  const uploadedUrls: string[] =
    [];

  /* ============================================================
     UPLOAD ONE BY ONE
  ============================================================ */

  for (
    let index = 0;
    index < photos.length;
    index += 1
  ) {
    const photoUri =
      cleanString(
        photos[index],
      );

    if (!photoUri) {
      continue;
    }

    /* ==========================================================
       LOCAL URI VALIDATION
    ========================================================== */

    if (
      !photoUri.startsWith(
        "file://",
      ) &&
      !photoUri.startsWith(
        "content://",
      )
    ) {
      throw new Error(
        "Invalid booking photo source.",
      );
    }

    try {
      /* ========================================================
         READ LOCAL FILE
      ======================================================== */

      const response =
        await fetch(
          photoUri,
        );

      if (!response.ok) {
        throw new Error(
          `Unable to read booking photo. HTTP ${response.status}`,
        );
      }

      const blob =
        await response.blob();

      /* ========================================================
         FILE SIZE
      ======================================================== */

      if (
        !blob ||
        blob.size <= 0
      ) {
        throw new Error(
          "Booking photo is empty.",
        );
      }

      if (
        blob.size >
        MAX_FILE_SIZE
      ) {
        throw new Error(
          "Each booking photo must be 5MB or smaller.",
        );
      }

      /* ========================================================
         CONTENT TYPE
      ======================================================== */

      const contentType =
        blob.type?.startsWith(
          "image/",
        )
          ? blob.type
          : "image/jpeg";

      const extension =
        getExtension(
          contentType,
        );

      /* ========================================================
         UNIQUE FILE NAME
      ======================================================== */

      const timestamp =
        Date.now();

      const fileName =
        `${timestamp}-${index}.${extension}`;

      /* ========================================================
         IMPORTANT STORAGE PATH
         
         bookings/{customerId}/{fileName}
      ======================================================== */

      const storagePath =
        `bookings/${normalizedCustomerId}/${fileName}`;

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
          contentType,

          cacheControl:
            "private,max-age=3600",
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
        !downloadUrl.startsWith(
          "https://",
        )
      ) {
        throw new Error(
          "Firebase returned an invalid booking photo URL.",
        );
      }

      uploadedUrls.push(
        downloadUrl,
      );

      /* ========================================================
         DEVELOPMENT LOG
      ======================================================== */

      if (__DEV__) {
        console.log(
          "BOOKING_PHOTO_UPLOADED",
          {
            customerId:
              normalizedCustomerId,

            storagePath,

            contentType,

            size:
              blob.size,

            downloadUrl,
          },
        );
      }
    } catch (error) {
      console.error(
        "BOOKING_PHOTO_UPLOAD_ERROR",
        {
          customerId:
            normalizedCustomerId,

          photoIndex:
            index,

          photoUri,

          error,
        },
      );

      throw new Error(
        `Unable to upload booking photo ${index + 1}. Please try again.`,
      );
    }
  }

  /* ============================================================
     FINAL RESULT
  ============================================================ */

  return uploadedUrls;
}