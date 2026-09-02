import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

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

  /**
   * MaterialCommunityIcons icon name.
   *
   * Same icon system used by CategoryCard.
   */
  serviceIcon?: string | null;

  /**
   * Same icon color used by CategoryCard.
   */
  serviceColor?: string | null;

  /**
   * Same icon background color used by CategoryCard.
   */
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

const MAX_DESCRIPTION_LENGTH = 300;

/* ==============================================================
   CREATE BOOKING
============================================================== */

export async function createBooking(
  data: CreateBookingPayload,
): Promise<string> {
  /* ============================================================
     BASIC PAYLOAD VALIDATION
  ============================================================ */

  if (!data) {
    throw new Error(
      "Booking data is required.",
    );
  }

  /* ============================================================
     CUSTOMER VALIDATION
  ============================================================ */

  if (
    typeof data.customerId !==
      "string" ||
    !data.customerId.trim()
  ) {
    throw new Error(
      "Customer ID is required.",
    );
  }

  /* ============================================================
     WORKER VALIDATION
  ============================================================ */

  if (
    typeof data.workerId !==
      "string" ||
    !data.workerId.trim()
  ) {
    throw new Error(
      "Worker ID is required.",
    );
  }

  if (
    typeof data.workerName !==
      "string" ||
    !data.workerName.trim()
  ) {
    throw new Error(
      "Worker name is required.",
    );
  }

  /* ============================================================
     SERVICE VALIDATION
  ============================================================ */

  if (
    typeof data.serviceId !==
      "string" ||
    !data.serviceId.trim()
  ) {
    throw new Error(
      "Service ID is required.",
    );
  }

  if (
    typeof data.serviceName !==
      "string" ||
    !data.serviceName.trim()
  ) {
    throw new Error(
      "Service name is required.",
    );
  }

  /* ============================================================
     DESCRIPTION VALIDATION
  ============================================================ */

  if (
    typeof data.description !==
      "string" ||
    !data.description.trim()
  ) {
    throw new Error(
      "Service description is required.",
    );
  }

  const cleanDescription =
    data.description.trim();

  if (
    cleanDescription.length >
    MAX_DESCRIPTION_LENGTH
  ) {
    throw new Error(
      `Service description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`,
    );
  }

  /* ============================================================
     LOCATION VALIDATION
  ============================================================ */

  if (
    typeof data.address !==
      "string" ||
    !data.address.trim()
  ) {
    throw new Error(
      "Service location is required.",
    );
  }

  /* ============================================================
     PHOTOS VALIDATION
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
      .map((photo) =>
        photo.trim(),
      );

  /* ============================================================
     AMOUNT VALIDATION
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
     URGENT FEE VALIDATION
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
     LOCATION COORDINATES
  ============================================================ */

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
     SERVICE ICON
  ============================================================ */

  const serviceIcon =
    typeof data.serviceIcon ===
      "string" &&
    data.serviceIcon.trim()
      ? data.serviceIcon.trim()
      : null;

  /* ============================================================
     SERVICE COLOR
  ============================================================ */

  const serviceColor =
    typeof data.serviceColor ===
      "string" &&
    data.serviceColor.trim()
      ? data.serviceColor.trim()
      : null;

  /* ============================================================
     SERVICE BACKGROUND COLOR
  ============================================================ */

  const serviceBackgroundColor =
    typeof data.serviceBackgroundColor ===
      "string" &&
    data.serviceBackgroundColor.trim()
      ? data.serviceBackgroundColor.trim()
      : null;

  /* ============================================================
     CUSTOMER NORMALIZATION
  ============================================================ */

  const customerId =
    data.customerId.trim();

  const customerName =
    typeof data.customerName ===
      "string"
      ? data.customerName.trim()
      : "";

  const customerPhotoURL =
    typeof data.customerPhotoURL ===
      "string"
      ? data.customerPhotoURL.trim()
      : "";

  /* ============================================================
     WORKER NORMALIZATION
  ============================================================ */

  const workerId =
    data.workerId.trim();

  const workerName =
    data.workerName.trim();

  const workerPhoto =
    typeof data.workerPhoto ===
      "string" &&
    data.workerPhoto.trim()
      ? data.workerPhoto.trim()
      : null;

  /* ============================================================
     SERVICE NORMALIZATION
  ============================================================ */

  const serviceId =
    data.serviceId.trim();

  const serviceName =
    data.serviceName.trim();

  const categoryId =
    typeof data.categoryId ===
      "string" &&
    data.categoryId.trim()
      ? data.categoryId.trim()
      : null;

  /* ============================================================
     LOCATION NORMALIZATION
  ============================================================ */

  const address =
    data.address.trim();

  /* ============================================================
     BOOKING DATE
  ============================================================ */

  const bookingDate =
    typeof data.bookingDate ===
      "string" &&
    data.bookingDate.trim()
      ? data.bookingDate.trim()
      : null;

  /* ============================================================
     BOOKING TIME
  ============================================================ */

  const bookingTime =
    typeof data.bookingTime ===
      "string" &&
    data.bookingTime.trim()
      ? data.bookingTime.trim()
      : null;

  /* ============================================================
     BOOKING STATUS
  ============================================================ */

  /*
   * Initial state:
   *
   * pending
   *
   * The worker has received the request
   * but has not sent an offer yet.
   */

  const status =
    "pending";

  /* ============================================================
     OFFER STATE
  ============================================================ */

  /*
   * Initial offer state:
   *
   * none
   *
   * Worker has not submitted an offer.
   */

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

  /* ============================================================
     URGENT
  ============================================================ */

  const urgent =
    data.urgent ?? false;

  /* ============================================================
     CREATE FIRESTORE DOCUMENT
  ============================================================ */

  try {
    const bookingRef =
      await addDoc(
        collection(
          db,
          "bookings",
        ),
        {
          /* ======================================================
             CUSTOMER
          ====================================================== */

          customerId,

          customerName,

          customerPhotoURL,

          /* ======================================================
             WORKER
          ====================================================== */

          workerId,

          workerName,

          workerPhoto,

          /* ======================================================
             SERVICE
          ====================================================== */

          serviceId,

          serviceName,

          /*
           * These three values come from
           * the same service/category data
           * used by CategoryCard.
           */

          serviceIcon,

          serviceColor,

          serviceBackgroundColor,

          /* ======================================================
             CATEGORY
          ====================================================== */

          categoryId,

          /* ======================================================
             WORKER META
          ====================================================== */

          rating:
            typeof data.rating ===
              "number" &&
            Number.isFinite(
              data.rating,
            )
              ? data.rating
              : null,

          verified:
            typeof data.verified ===
              "boolean"
              ? data.verified
              : false,

          /* ======================================================
             CUSTOMER REQUEST
          ====================================================== */

          description:
            cleanDescription,

          photos:
            cleanPhotos,

          /* ======================================================
             LOCATION
          ====================================================== */

          location: {
            address,

            latitude,

            longitude,
          },

          /*
           * Keep root-level location
           * fields for compatibility with
           * existing screens.
           */

          address,

          latitude,

          longitude,

          /* ======================================================
             SCHEDULE
          ====================================================== */

          date:
            bookingDate,

          time:
            bookingTime,

          bookingDate,

          bookingTime,

          /* ======================================================
             PRICE
          ====================================================== */

          /*
           * Initial amount is normally
           * null/zero because the worker
           * will determine the offer.
           */

          price:
            amount,

          amount,

          /* ======================================================
             OFFER
          ====================================================== */

          offerStatus,

          offerAmount,

          offerMessage,

          offerSentAt,

          offerRespondedAt,

          /* ======================================================
             URGENT
          ====================================================== */

          urgent,

          urgentFee,

          /* ======================================================
             BOOKING STATUS
          ====================================================== */

          status,

          paymentStatus:
            "unpaid",

          /* ======================================================
             TIMESTAMPS
          ====================================================== */

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );

    /* ============================================================
       RETURN BOOKING ID
    ============================================================ */

    return bookingRef.id;
  } catch (error) {
    console.error(
      "CREATE_BOOKING_FIRESTORE_ERROR",
      error,
    );

    throw new Error(
      "Unable to create booking. Please try again.",
    );
  }
}