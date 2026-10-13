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

import {
  auth,
  db,
} from "@/firebase/config";

import {
  bookingRequiresPhysicalLocation,
  isBookingFulfillmentMode,
  type BookingFulfillmentMode,
} from "@/types/bookingFulfillment";

import {
  type BookingPriority,
} from "@/types/bookingPriority";

/* ==============================================================
   TYPES
============================================================== */

export type CreateBookingPayload = {
  /* CUSTOMER */
  customerId: string;
  customerName: string;
  customerPhotoURL: string;

  /* WORKER */
  workerId: string;
  workerName: string;
  workerPhoto?: string | null;

  /* SERVICE */
  serviceId: string;
  serviceName: string;
  serviceIcon?: string | null;
  serviceColor?: string | null;
  serviceBackgroundColor?: string | null;

  /* CATEGORY */
  categoryId?: string | null;

  /* FULFILLMENT */
  fulfillmentMode: BookingFulfillmentMode;

  /* WORKER META */
  rating?: number;
  verified?: boolean;

  /* REQUEST */
  description: string;
  photos: string[];

  /* LOCATION */
  address: string;
  latitude?: number | null;
  longitude?: number | null;

  /* PRIORITY / TIMING */
  bookingPriority?: BookingPriority | null;
  timing?: "asap" | "schedule";

  /* SCHEDULE */
  bookingDate?: string | null;
  bookingTime?: string | null;

  /* PRICE */
  amount?: number | null;

  /* LEGACY */
  urgent?: boolean;
  urgentFee?: number | null;
};

type UploadedBookingPhoto = {
  url: string;
  storagePath: string | null;
};

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_PHOTOS = 3;

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024;

const MAX_DESCRIPTION_LENGTH = 300;

const MAX_BOOKING_AMOUNT = 100_000_000;

/*
 * IMPORTANT:
 *
 * This MUST match Firebase Storage Rules.
 *
 * bookings/{customerId}/{bookingId}/{fileName}
 */
const BOOKINGS_STORAGE_FOLDER =
  "bookings";

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
          : error instanceof Error
            ? error.message
            : "Unknown Firebase error.",
    };
  }

  if (
    error instanceof Error
  ) {
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
   STRING HELPERS
============================================================== */

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isHttpsUrl(
  value: string,
): boolean {
  return value.startsWith(
    "https://",
  );
}

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
): Promise<UploadedBookingPhoto> {
  const normalizedUri =
    cleanString(photoUri);

  if (!normalizedUri) {
    throw new Error(
      "Booking photo URI is empty.",
    );
  }

  /* ============================================================
     EXISTING REMOTE IMAGE
  ============================================================ */

  if (
    isHttpsUrl(normalizedUri)
  ) {
    return {
      url: normalizedUri,
      storagePath: null,
    };
  }

  /* ============================================================
     LOCAL IMAGE
  ============================================================ */

  if (
    !isLocalImageUri(
      normalizedUri,
    )
  ) {
    throw new Error(
      "Invalid booking photo source.",
    );
  }

  const response =
    await fetch(normalizedUri);

  if (!response.ok) {
    throw new Error(
      `Unable to read booking photo. HTTP ${response.status}`,
    );
  }

  const blob =
    await response.blob();

  if (blob.size <= 0) {
    throw new Error(
      "Booking photo is empty.",
    );
  }

  if (
    blob.size >
    MAX_PHOTO_SIZE
  ) {
    throw new Error(
      "Each booking photo must be 5 MB or smaller.",
    );
  }

  const contentType =
    typeof blob.type === "string" &&
    blob.type.startsWith("image/")
      ? blob.type.toLowerCase()
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

     IMPORTANT:
     This matches:

     bookings/{customerId}/{bookingId}/{fileName}
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
    !isHttpsUrl(
      downloadUrl,
    )
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

  return {
    url: downloadUrl,
    storagePath,
  };
}

/* ==============================================================
   DELETE UPLOADED PHOTOS
============================================================== */

async function deleteUploadedBookingPhotos(
  storagePaths: string[],
): Promise<void> {
  const uniquePaths =
    Array.from(
      new Set(
        storagePaths.filter(
          Boolean,
        ),
      ),
    );

  if (
    uniquePaths.length === 0
  ) {
    return;
  }

  const storage =
    getStorage();

  await Promise.allSettled(
    uniquePaths.map(
      async storagePath => {
        try {
          await deleteObject(
            ref(
              storage,
              storagePath,
            ),
          );
        } catch (
          error
        ) {
          if (__DEV__) {
            console.warn(
              "BOOKING_PHOTO_CLEANUP_FAILED",
              {
                storagePath,
                error,
              },
            );
          }
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
     AUTH
  ============================================================ */

  const currentUser =
    auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "You must be signed in to create a booking.",
    );
  }

  /* ============================================================
     CUSTOMER
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

  if (
    currentUser.uid !==
    customerId
  ) {
    throw new Error(
      "Authenticated customer does not match booking customer.",
    );
  }

  const customerName =
    cleanString(
      data.customerName,
    );

  if (!customerName) {
    throw new Error(
      "Customer name is required.",
    );
  }

  const rawCustomerPhotoURL =
    cleanString(
      data.customerPhotoURL,
    );

  const customerPhotoURL =
    isHttpsUrl(
      rawCustomerPhotoURL,
    )
      ? rawCustomerPhotoURL
      : "";

  /* ============================================================
     WORKER
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

  if (
    workerId ===
    customerId
  ) {
    throw new Error(
      "You cannot book yourself.",
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

  const rawWorkerPhoto =
    cleanString(
      data.workerPhoto,
    );

  const workerPhoto =
    isHttpsUrl(
      rawWorkerPhoto,
    )
      ? rawWorkerPhoto
      : null;

  /* ============================================================
     SERVICE
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

  const categoryId =
    cleanString(
      data.categoryId,
    ) || null;

  /* ============================================================
     FULFILLMENT
  ============================================================ */

  const fulfillmentMode =
    data.fulfillmentMode;

  if (
    !isBookingFulfillmentMode(
      fulfillmentMode,
    )
  ) {
    throw new Error(
      "A valid service fulfillment mode is required.",
    );
  }

  const requiresPhysicalLocation =
    bookingRequiresPhysicalLocation(
      fulfillmentMode,
    );

  /* ============================================================
     DESCRIPTION
  ============================================================ */

  const description =
    cleanString(
      data.description,
    );

  if (!description) {
    throw new Error(
      "Service description is required.",
    );
  }

  if (
    description.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `Service description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`,
    );
  }

  /* ============================================================
     LOCATION
  ============================================================ */

  const rawAddress =
    cleanString(
      data.address,
    );

  const rawLatitude =
    data.latitude ?? null;

  const rawLongitude =
    data.longitude ?? null;

  if (
    requiresPhysicalLocation &&
    !rawAddress
  ) {
    throw new Error(
      fulfillmentMode ===
        "customer_visits_worker"
        ? "Provider location is required."
        : "Service location is required.",
    );
  }

  if (
    rawLatitude !== null &&
    (
      typeof rawLatitude !==
        "number" ||
      !Number.isFinite(
        rawLatitude,
      ) ||
      rawLatitude < -90 ||
      rawLatitude > 90
    )
  ) {
    throw new Error(
      "Invalid latitude.",
    );
  }

  if (
    rawLongitude !== null &&
    (
      typeof rawLongitude !==
        "number" ||
      !Number.isFinite(
        rawLongitude,
      ) ||
      rawLongitude < -180 ||
      rawLongitude > 180
    )
  ) {
    throw new Error(
      "Invalid longitude.",
    );
  }

  if (
    requiresPhysicalLocation &&
    (
      rawLatitude === null ||
      rawLongitude === null
    )
  ) {
    throw new Error(
      fulfillmentMode ===
        "customer_visits_worker"
        ? "Provider coordinates are required."
        : "Service location coordinates are required.",
    );
  }

  const address =
    requiresPhysicalLocation
      ? rawAddress
      : "";

  const latitude =
    requiresPhysicalLocation
      ? rawLatitude
      : null;

  const longitude =
    requiresPhysicalLocation
      ? rawLongitude
      : null;

  /* ============================================================
     PHOTOS
  ============================================================ */

  if (
    !Array.isArray(
      data.photos,
    )
  ) {
    throw new Error(
      "Invalid booking photos.",
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
          photo.trim().length >
            0,
      )
      .map(
        photo =>
          photo.trim(),
      );

  if (
    cleanPhotos.length >
    MAX_PHOTOS
  ) {
    throw new Error(
      `A maximum of ${MAX_PHOTOS} photos is allowed.`,
    );
  }

  /* ============================================================
     AMOUNT
  ============================================================ */

  const rawAmount =
    data.amount ?? null;

  if (
    rawAmount !== null &&
    (
      typeof rawAmount !==
        "number" ||
      !Number.isFinite(
        rawAmount,
      ) ||
      rawAmount < 0 ||
      rawAmount >
        MAX_BOOKING_AMOUNT
    )
  ) {
    throw new Error(
      "Invalid booking amount.",
    );
  }

  const amount =
    typeof rawAmount ===
      "number" &&
    rawAmount > 0
      ? Math.round(
          rawAmount,
        )
      : null;

  /* ============================================================
     PRIORITY
  ============================================================ */

  const rawBookingPriority =
    data.bookingPriority ??
    null;

  const bookingPriority:
    BookingPriority | null =
    rawBookingPriority ===
        "immediate" ||
    rawBookingPriority ===
        "normal" ||
    rawBookingPriority ===
        "urgent"
      ? rawBookingPriority
      : null;

  /* ============================================================
     TIMING
  ============================================================ */

  const timing:
    "asap" | "schedule" =
    data.timing ===
      "schedule"
      ? "schedule"
      : "asap";

  const isScheduled =
    timing === "schedule";

  /* ============================================================
     SCHEDULE
  ============================================================ */

  const rawBookingDate =
    cleanString(
      data.bookingDate,
    );

  const rawBookingTime =
    cleanString(
      data.bookingTime,
    );

  let bookingDate:
    string | null = null;

  let bookingTime:
    string | null = null;

  if (isScheduled) {
    if (
      bookingPriority !==
      null
    ) {
      throw new Error(
        "A scheduled booking cannot also have a service priority.",
      );
    }

    if (
      !rawBookingDate ||
      !rawBookingTime
    ) {
      throw new Error(
        "Scheduled bookings require a date and time.",
      );
    }

    const parsedBookingDate =
      new Date(
        rawBookingDate,
      );

    if (
      !Number.isFinite(
        parsedBookingDate.getTime(),
      )
    ) {
      throw new Error(
        "Invalid booking date.",
      );
    }

    if (
      parsedBookingDate.getTime() <=
      Date.now()
    ) {
      throw new Error(
        "Scheduled service time must be in the future.",
      );
    }

    bookingDate =
      parsedBookingDate.toISOString();

    bookingTime =
      rawBookingTime;
  } else {
    if (!bookingPriority) {
      throw new Error(
        "Please choose a service priority.",
      );
    }

    bookingDate = null;
    bookingTime = null;
  }

  /* ============================================================
     URGENT
  ============================================================ */

  const urgent =
    bookingPriority ===
    "urgent";

  const rawUrgentFee =
    data.urgentFee ?? 0;

  if (
    typeof rawUrgentFee !==
      "number" ||
    !Number.isFinite(
      rawUrgentFee,
    ) ||
    rawUrgentFee < 0
  ) {
    throw new Error(
      "Invalid urgent fee.",
    );
  }

  const urgentFee =
    urgent
      ? rawUrgentFee
      : 0;

  /* ============================================================
     WORKER META
  ============================================================ */

  const rating =
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
      : null;

  const verified =
    data.verified === true;

  /* ============================================================
     GENERATE FIRESTORE ID
  ============================================================ */

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
     UPLOAD TRACKING
  ============================================================ */

  const uploadedStoragePaths:
    string[] = [];

  const uploadedPhotoUrls:
    string[] = [];

  try {
    /* ==========================================================
       UPLOAD PHOTOS
    ========================================================== */

    const uploadResults =
      await Promise.allSettled(
        cleanPhotos.map(
          (
            photo,
            index,
          ) =>
            uploadBookingPhoto(
              customerId,
              bookingId,
              photo,
              index,
            ),
        ),
      );

    let firstUploadError:
      unknown = null;

    uploadResults.forEach(
      result => {
        if (
          result.status ===
          "fulfilled"
        ) {
          uploadedPhotoUrls.push(
            result.value.url,
          );

          if (
            result.value
              .storagePath
          ) {
            uploadedStoragePaths.push(
              result.value
                .storagePath,
            );
          }

          return;
        }

        if (
          firstUploadError ===
          null
        ) {
          firstUploadError =
            result.reason;
        }
      },
    );

    if (
      firstUploadError !==
      null
    ) {
      throw firstUploadError;
    }

    /* ==========================================================
       FIRESTORE PAYLOAD
    ========================================================== */

    const bookingPayload = {
      /* CUSTOMER */
      customerId,
      customerName,
      customerPhotoURL,

      /* WORKER */
      workerId,
      workerName,
      workerPhoto,

      /* SERVICE */
      serviceId,
      serviceName,
      serviceIcon,
      serviceColor,
      serviceBackgroundColor,

      serviceIconColor:
        serviceColor,

      serviceIconBackground:
        serviceBackgroundColor,

      /* CATEGORY */
      categoryId,

      /* FULFILLMENT */
      fulfillmentMode,

      /* WORKER META */
      rating,
      verified,

      /* REQUEST */
      description,

      photos:
        uploadedPhotoUrls,

      /* LOCATION */
      location: {
        address,
        latitude,
        longitude,
      },

      address,
      latitude,
      longitude,

      /* TIMING */
      timing,
      bookingPriority,

      /* SCHEDULE */
      date:
        bookingDate,

      time:
        bookingTime,

      bookingDate,
      bookingTime,

      /* PRICE */
      price:
        amount,

      amount,

      agreedPrice:
        null,

      /* INITIAL OFFER */
      offerAmount:
        null,

      offerMessage:
        null,

      offerRound:
        0,

      offerStatus:
        "none",

      offerExpiresAt:
        null,

      offerSentAt:
        null,

      offerRespondedAt:
        null,

      offerWorkerId:
        null,

      /* COUNTER OFFER */
      counterOfferAmount:
        null,

      counterOfferMessage:
        null,

      counterOfferBy:
        null,

      counterOfferStatus:
        "none",

      counterOfferSentAt:
        null,

      counterOfferRespondedAt:
        null,

      /* NEGOTIATION */
      negotiationStatus:
        "none",

      /* URGENT */
      urgent,
      urgentFee,

      /* STATUS */
      status:
        "pending",

      paymentStatus:
        "pending",

      /* TIMESTAMPS */
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
          fulfillmentMode,
          requiresPhysicalLocation,
          timing,
          bookingPriority,
          bookingDate,
          bookingTime,
          urgent,
          photos:
            uploadedPhotoUrls.length,
          status:
            "pending",
          paymentStatus:
            "pending",
          offerStatus:
            "none",
          counterOfferStatus:
            "none",
          negotiationStatus:
            "none",
          offerRound:
            0,
        },
      );
    }

    return bookingId;
  } catch (
    error
  ) {
    /* ==========================================================
       CLEANUP
    ========================================================== */

    await deleteUploadedBookingPhotos(
      uploadedStoragePaths,
    );

    const {
      code,
      message,
    } =
      getFirebaseErrorDetails(
        error,
      );

    if (__DEV__) {
      console.warn(
        "CREATE_BOOKING_FAILED",
        {
          code,
          message,
          bookingId,
          customerId,
          workerId,
          serviceId,
          fulfillmentMode,
          timing,
          bookingPriority,
          uploadedPhotos:
            uploadedPhotoUrls.length,
        },
      );
    }

    /* STORAGE */

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

    if (
      code ===
      "storage/retry-limit-exceeded"
    ) {
      throw new Error(
        "Photo upload took too long. Please check your connection and try again.",
      );
    }

    /* FIRESTORE */

    if (
      code ===
        "permission-denied" ||
      code ===
        "firestore/permission-denied"
    ) {
      throw new Error(
        "You do not have permission to create this booking.",
      );
    }

    if (
      code ===
        "unauthenticated" ||
      code ===
        "firestore/unauthenticated"
    ) {
      throw new Error(
        "Your session has expired. Please sign in again.",
      );
    }

    if (
      code ===
        "unavailable" ||
      code ===
        "firestore/unavailable"
    ) {
      throw new Error(
        "Booking service is temporarily unavailable. Please try again.",
      );
    }

    throw new Error(
      message ||
      "Unable to create booking. Please try again.",
    );
  }
}