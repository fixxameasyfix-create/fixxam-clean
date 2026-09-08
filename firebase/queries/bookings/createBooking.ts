import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

import { getAuth } from "firebase/auth";

import { db } from "@/firebase/config";

/* ==============================================================
   TYPES
============================================================== */

export type CreateBookingPayload = {
  /* ============================================================
     CUSTOMER
  ============================================================ */

  customerId: string;

  customerName: string;

  customerPhotoURL: string;

  /* ============================================================
     WORKER
  ============================================================ */

  workerId: string;

  workerName: string;

  workerPhoto?: string | null;

  /* ============================================================
     SERVICE
  ============================================================ */

  serviceId: string;

  serviceName: string;

  serviceIcon?: string | null;

  serviceColor?: string | null;

  serviceBackgroundColor?: string | null;

  /* ============================================================
     CATEGORY
  ============================================================ */

  categoryId?: string | null;

  /* ============================================================
     WORKER META
  ============================================================ */

  rating?: number;

  verified?: boolean;

  /* ============================================================
     REQUEST
  ============================================================ */

  description: string;

  photos: string[];

  /* ============================================================
     LOCATION
  ============================================================ */

  address: string;

  latitude?: number | null;

  longitude?: number | null;

  /* ============================================================
     SCHEDULE
  ============================================================ */

  bookingDate?: string | null;

  bookingTime?: string | null;

  /* ============================================================
     PRICE
  ============================================================ */

  amount?: number | null;

  /* ============================================================
     URGENT
  ============================================================ */

  urgent?: boolean;

  urgentFee?: number | null;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_PHOTOS = 5;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const MAX_DESCRIPTION_LENGTH = 300;

const BOOKINGS_STORAGE_FOLDER = "bookings";

/* ==============================================================
   FIREBASE ERROR
============================================================== */

function getFirebaseErrorDetails(
  error: unknown,
): {
  code: string;
  message: string;
} {
  if (
    error &&
    typeof error === "object"
  ) {
    const firebaseError =
      error as {
        code?: unknown;
        message?: unknown;
      };

    return {
      code:
        typeof firebaseError.code ===
        "string"
          ? firebaseError.code
          : "unknown",

      message:
        typeof firebaseError.message ===
        "string"
          ? firebaseError.message
          : "Unknown Firebase error.",
    };
  }

  if (error instanceof Error) {
    return {
      code: "unknown",
      message: error.message,
    };
  }

  return {
    code: "unknown",
    message: "Unknown Firebase error.",
  };
}

/* ==============================================================
   STRING HELPER
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ==============================================================
   HTTPS URL
============================================================== */

function isHttpsUrl(
  value: string,
): boolean {
  return value.startsWith(
    "https://",
  );
}

/* ==============================================================
   LOCAL IMAGE URI
============================================================== */

function isLocalImageUri(
  value: string,
): boolean {
  return (
    value.startsWith("file://") ||
    value.startsWith("content://")
  );
}

/* ==============================================================
   UPLOAD BOOKING PHOTO
============================================================== */

async function uploadBookingPhoto(
  customerId: string,
  bookingId: string,
  photoUri: string,
  index: number,
): Promise<string> {
  const normalizedUri =
    cleanString(photoUri);

  if (!normalizedUri) {
    return "";
  }

  /*
   * Existing HTTPS image.
   *
   * Do not upload it again.
   */
  if (isHttpsUrl(normalizedUri)) {
    return normalizedUri;
  }

  /*
   * Booking attachments coming from
   * the device must be local image URIs.
   */
  if (
    !isLocalImageUri(
      normalizedUri,
    )
  ) {
    throw new Error(
      "Invalid booking photo source.",
    );
  }

  /* ============================================================
     READ LOCAL IMAGE
  ============================================================ */

  const response =
    await fetch(normalizedUri);

  if (!response.ok) {
    throw new Error(
      `Unable to read booking photo. HTTP ${response.status}`,
    );
  }

  const blob =
    await response.blob();

  if (
    !blob ||
    blob.size <= 0
  ) {
    throw new Error(
      "Booking photo is empty.",
    );
  }

  /* ============================================================
     SIZE VALIDATION
  ============================================================ */

  if (
    blob.size >
    MAX_PHOTO_SIZE
  ) {
    throw new Error(
      "Each booking photo must be 5 MB or smaller.",
    );
  }

  /* ============================================================
     CONTENT TYPE
  ============================================================ */

  const contentType =
    typeof blob.type === "string" &&
    blob.type.startsWith("image/")
      ? blob.type
      : "image/jpeg";

  if (
    !contentType.startsWith(
      "image/",
    )
  ) {
    throw new Error(
      "Booking attachment must be an image.",
    );
  }

  /* ============================================================
     STORAGE PATH
  ============================================================ */

  const fileName =
    `request-${index + 1}.jpg`;

  const storagePath =
    `${BOOKINGS_STORAGE_FOLDER}/${customerId}/${bookingId}/${fileName}`;

  const storage =
    getStorage();

  const storageRef =
    ref(
      storage,
      storagePath,
    );

  /* ============================================================
     UPLOAD
  ============================================================ */

  await uploadBytes(
    storageRef,
    blob,
    {
      contentType,

      cacheControl:
        "private,max-age=3600",
    },
  );

  /* ============================================================
     DOWNLOAD URL
  ============================================================ */

  const downloadUrl =
    await getDownloadURL(
      storageRef,
    );

  if (
    !isHttpsUrl(downloadUrl)
  ) {
    throw new Error(
      "Firebase did not return a valid booking photo URL.",
    );
  }

  if (__DEV__) {
    console.log(
      "BOOKING_PHOTO_UPLOADED",
      {
        bookingId,
        customerId,
        storagePath,
        contentType,
        size: blob.size,
      },
    );
  }

  return downloadUrl;
}

/* ==============================================================
   DELETE UPLOADED PHOTOS
============================================================== */

async function deleteUploadedBookingPhotos(
  storagePaths: string[],
): Promise<void> {
  if (
    storagePaths.length === 0
  ) {
    return;
  }

  const storage =
    getStorage();

  await Promise.allSettled(
    storagePaths.map(
      async (storagePath) => {
        try {
          await deleteObject(
            ref(
              storage,
              storagePath,
            ),
          );
        } catch (error) {
          console.warn(
            "BOOKING_PHOTO_CLEANUP_FAILED",
            {
              storagePath,
              error,
            },
          );
        }
      },
    ),
  );
}

/* ==============================================================
   CREATE BOOKING
============================================================== */

export async function createBooking(
  data: CreateBookingPayload,
): Promise<string> {
  /* ============================================================
     BASIC VALIDATION
  ============================================================ */

  if (!data) {
    throw new Error(
      "Booking data is required.",
    );
  }

  /* ============================================================
     AUTHENTICATION
  ============================================================ */

  const auth =
    getAuth();

  const currentUser =
    auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "You must be signed in to create a booking.",
    );
  }

  /* ============================================================
     CUSTOMER VALIDATION
  ============================================================ */

  const customerId =
    cleanString(
      data.customerId,
    );

  if (!customerId) {
    throw new Error(
      "Customer ID is required.",
    );
  }

  /*
   * Important security check.
   *
   * The client must not be able to create
   * a booking on behalf of another user.
   */
  if (
    currentUser.uid !==
    customerId
  ) {
    throw new Error(
      "Authenticated customer does not match booking customer.",
    );
  }

  /* ============================================================
     WORKER VALIDATION
  ============================================================ */

  const workerId =
    cleanString(
      data.workerId,
    );

  if (!workerId) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  const workerName =
    cleanString(
      data.workerName,
    );

  if (!workerName) {
    throw new Error(
      "Worker name is required.",
    );
  }

  /* ============================================================
     SERVICE VALIDATION
  ============================================================ */

  const serviceId =
    cleanString(
      data.serviceId,
    );

  if (!serviceId) {
    throw new Error(
      "Service ID is required.",
    );
  }

  const serviceName =
    cleanString(
      data.serviceName,
    );

  if (!serviceName) {
    throw new Error(
      "Service name is required.",
    );
  }

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const cleanDescription =
    cleanString(
      data.description,
    );

  if (!cleanDescription) {
    throw new Error(
      "Service description is required.",
    );
  }

  if (
    cleanDescription.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `Service description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`,
    );
  }

  /* ============================================================
     LOCATION
  ============================================================ */

  const address =
    cleanString(
      data.address,
    );

  if (!address) {
    throw new Error(
      "Service location is required.",
    );
  }

  const latitude =
    data.latitude ?? null;

  const longitude =
    data.longitude ?? null;

  if (
    latitude !== null &&
    (
      typeof latitude !==
        "number" ||
      !Number.isFinite(
        latitude,
      ) ||
      latitude < -90 ||
      latitude > 90
    )
  ) {
    throw new Error(
      "Invalid latitude.",
    );
  }

  if (
    longitude !== null &&
    (
      typeof longitude !==
        "number" ||
      !Number.isFinite(
        longitude,
      ) ||
      longitude < -180 ||
      longitude > 180
    )
  ) {
    throw new Error(
      "Invalid longitude.",
    );
  }

  /* ============================================================
     PHOTOS
  ============================================================ */

  if (!Array.isArray(data.photos)) {
    throw new Error(
      "Invalid booking photos.",
    );
  }

  if (
    data.photos.length >
    MAX_PHOTOS
  ) {
    throw new Error(
      `A maximum of ${MAX_PHOTOS} photos is allowed.`,
    );
  }

  const cleanPhotos =
    data.photos
      .filter(
        (
          photo,
        ): photo is string =>
          typeof photo ===
            "string" &&
          photo.trim().length > 0,
      )
      .map(
        (photo) =>
          photo.trim(),
      );

  /* ============================================================
     AMOUNT
  ============================================================ */

  const amount =
    data.amount ?? null;

  if (
    amount !== null &&
    (
      typeof amount !==
        "number" ||
      !Number.isFinite(amount) ||
      amount < 0
    )
  ) {
    throw new Error(
      "Invalid booking amount.",
    );
  }

  /* ============================================================
     URGENT FEE
  ============================================================ */

  const urgentFee =
    data.urgentFee ?? 0;

  if (
    typeof urgentFee !==
      "number" ||
    !Number.isFinite(
      urgentFee,
    ) ||
    urgentFee < 0
  ) {
    throw new Error(
      "Invalid urgent fee.",
    );
  }

  /* ============================================================
     SERVICE META
  ============================================================ */

  const serviceIcon =
    cleanString(
      data.serviceIcon,
    ) || null;

  const serviceColor =
    cleanString(
      data.serviceColor,
    ) || null;

  const serviceBackgroundColor =
    cleanString(
      data.serviceBackgroundColor,
    ) || null;

  /* ============================================================
     CUSTOMER META
  ============================================================ */

  const customerName =
    cleanString(
      data.customerName,
    );

  const customerPhotoURL =
    cleanString(
      data.customerPhotoURL,
    );

  /* ============================================================
     WORKER PHOTO
  ============================================================ */

  const workerPhoto =
    cleanString(
      data.workerPhoto,
    ) || null;

  /* ============================================================
     CATEGORY
  ============================================================ */

  const categoryId =
    cleanString(
      data.categoryId,
    ) || null;

  /* ============================================================
     SCHEDULE
  ============================================================ */

  const bookingDate =
    cleanString(
      data.bookingDate,
    ) || null;

  const bookingTime =
    cleanString(
      data.bookingTime,
    ) || null;

  /* ============================================================
     URGENT
  ============================================================ */

  const urgent =
    data.urgent === true;

  /* ============================================================
     BOOKING STATE
  ============================================================ */

  const status =
    "pending";

  const offerStatus =
    "none";

  const offerAmount =
    null;

  const offerMessage =
    null;

  const offerSentAt =
    null;

  const offerRespondedAt =
    null;

  const agreedPrice =
    null;

  const counterOfferAmount =
    null;

  const counterOfferStatus =
    "none";

  const counterOfferBy =
    null;

  const counterOfferMessage =
    null;

  const negotiationStatus =
    "none";

  const offerRound =
    0;

  /* ============================================================
     GENERATE BOOKING ID
  ============================================================ */

  /*
   * We generate the Firestore document reference first.
   *
   * This lets us upload photos to:
   *
   * bookings/{customerId}/{bookingId}/request-X.jpg
   *
   * BEFORE creating the Firestore document.
   */

  const bookingRef =
    doc(
      collection(
        db,
        "bookings",
      ),
    );

  const bookingId =
    bookingRef.id;

  /* ============================================================
     UPLOADED STORAGE PATHS
  ============================================================ */

  const uploadedStoragePaths: string[] =
    [];

  /* ============================================================
     FINAL PHOTO URLS
  ============================================================ */

  const uploadedPhotoUrls: string[] =
    [];

  /* ============================================================
     UPLOAD BOOKING PHOTOS
  ============================================================ */

  try {
    for (
      let index = 0;
      index < cleanPhotos.length;
      index += 1
    ) {
      const source =
        cleanPhotos[index];

      /*
       * Existing HTTPS URL.
       */
      if (
        isHttpsUrl(source)
      ) {
        uploadedPhotoUrls.push(
          source,
        );

        continue;
      }

      const downloadUrl =
        await uploadBookingPhoto(
          customerId,
          bookingId,
          source,
          index,
        );

      if (!downloadUrl) {
        throw new Error(
          `Unable to upload booking photo ${index + 1}.`,
        );
      }

      uploadedPhotoUrls.push(
        downloadUrl,
      );

      uploadedStoragePaths.push(
        `${BOOKINGS_STORAGE_FOLDER}/${customerId}/${bookingId}/request-${index + 1}.jpg`,
      );
    }

    /* ==========================================================
       FIRESTORE PAYLOAD
    ========================================================== */

    const bookingPayload = {
      /* ========================================================
         CUSTOMER
      ======================================================== */

      customerId,

      customerName,

      customerPhotoURL,

      /* ========================================================
         WORKER
      ======================================================== */

      workerId,

      workerName,

      workerPhoto,

      /* ========================================================
         SERVICE
      ======================================================== */

      serviceId,

      serviceName,

      serviceIcon,

      serviceColor,

      serviceBackgroundColor,

      /* ========================================================
         CATEGORY
      ======================================================== */

      categoryId,

      /* ========================================================
         WORKER META
      ======================================================== */

      rating:
        typeof data.rating ===
          "number" &&
        Number.isFinite(
          data.rating,
        )
          ? Math.min(
              5,
              Math.max(
                0,
                data.rating,
              ),
            )
          : null,

      verified:
        typeof data.verified ===
          "boolean"
          ? data.verified
          : false,

      /* ========================================================
         CUSTOMER REQUEST
      ======================================================== */

      description:
        cleanDescription,

      photos:
        uploadedPhotoUrls,

      /* ========================================================
         LOCATION
      ======================================================== */

      location: {
        address,

        latitude,

        longitude,
      },

      address,

      latitude,

      longitude,

      /* ========================================================
         SCHEDULE
      ======================================================== */

      date:
        bookingDate,

      time:
        bookingTime,

      bookingDate,

      bookingTime,

      /* ========================================================
         PRICE
      ======================================================== */

      price:
        amount,

      amount,

      /* ========================================================
         OFFER
      ======================================================== */

      offerStatus,

      offerAmount,

      offerMessage,

      offerSentAt,

      offerRespondedAt,

      /* ========================================================
         NEGOTIATION
      ======================================================== */

      agreedPrice,

      counterOfferAmount,

      counterOfferStatus,

      counterOfferBy,

      counterOfferMessage,

      negotiationStatus,

      offerRound,

      /* ========================================================
         URGENT
      ======================================================== */

      urgent,

      urgentFee,

      /* ========================================================
         BOOKING STATUS
      ======================================================== */

      status,

      paymentStatus:
        "unpaid",

      /* ========================================================
         TIMESTAMPS
      ======================================================== */

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    };

    /* ==========================================================
       CREATE FIRESTORE BOOKING
    ========================================================== */

    await setDoc(
      bookingRef,
      bookingPayload,
    );

    /* ==========================================================
       SUCCESS
    ========================================================== */

    if (__DEV__) {
      console.log(
        "BOOKING_CREATED_SUCCESSFULLY",
        {
          bookingId,

          customerId,

          workerId,

          serviceId,

          photos:
            uploadedPhotoUrls.length,

          status,

          offerStatus,

          counterOfferStatus,

          negotiationStatus,

          offerRound,
        },
      );
    }

    return bookingId;
  } catch (error) {
    /* ==========================================================
       CLEANUP
    ========================================================== */

    await deleteUploadedBookingPhotos(
      uploadedStoragePaths,
    );

    /* ==========================================================
       FIREBASE ERROR
    ========================================================== */

    const {
      code,
      message,
    } =
      getFirebaseErrorDetails(
        error,
      );

    console.error(
      "CREATE_BOOKING_ERROR",
      {
        code,

        message,

        error,

        bookingId,

        customerId,

        workerId,

        serviceId,

        uploadedPhotos:
          uploadedPhotoUrls.length,
      },
    );

    /* ==========================================================
       USER-FACING ERROR
    ========================================================== */

    if (
      code ===
      "storage/unauthorized"
    ) {
      throw new Error(
        "You do not have permission to upload booking photos.",
      );
    }

    if (
      code ===
      "storage/unauthenticated"
    ) {
      throw new Error(
        "Your session has expired. Please sign in again.",
      );
    }

    if (__DEV__) {
      throw new Error(
        `Booking failed [${code}]: ${message}`,
      );
    }

    throw new Error(
      "Unable to create booking. Please try again.",
    );
  }
}