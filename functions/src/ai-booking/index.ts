import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  resolveAiBooking,
} from "./resolver";

import type {
  AiBookingRequest,
} from "./types";

/* ==============================================================
   CONSTANTS
============================================================== */

const MAX_DESCRIPTION_LENGTH = 4000;

const MAX_IMAGE_BASE64_LENGTH =
  6_000_000;

const MAX_ADDRESS_LENGTH = 500;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/* ==============================================================
   HELPERS
============================================================== */

function cleanString(
  value: unknown,
  maxLength: number,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}

function getFiniteNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return undefined;
  }

  return value;
}

function isValidLatitude(
  value: number | undefined,
): boolean {
  return (
    value !== undefined &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: number | undefined,
): boolean {
  return (
    value !== undefined &&
    value >= -180 &&
    value <= 180
  );
}

/* ==============================================================
   AI BOOKING RESOLVE
============================================================== */

export const aiBookingResolve =
  onCall(
    {
      region:
        "us-central1",

      timeoutSeconds:
        120,

      memory:
        "512MiB",
    },

    async (
      request,
    ) => {
      /* ========================================================
         AUTHENTICATION
      ======================================================== */

      if (!request.auth?.uid) {
        throw new HttpsError(
          "unauthenticated",
          "You must be signed in.",
        );
      }

      /* ========================================================
         REQUEST
      ======================================================== */

      const data =
        request.data as
          | AiBookingRequest
          | undefined;

      if (
        !data ||
        typeof data !== "object"
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid AI booking request.",
        );
      }

      /* ========================================================
         DESCRIPTION
      ======================================================== */

      const description =
        cleanString(
          data.description,
          MAX_DESCRIPTION_LENGTH,
        );

      /* ========================================================
         IMAGE
      ======================================================== */

      const imageBase64 =
        cleanString(
          data.imageBase64,
          MAX_IMAGE_BASE64_LENGTH,
        );

      const mimeType =
        cleanString(
          data.mimeType,
          100,
        ).toLowerCase();

      /* ========================================================
         LOCATION
      ======================================================== */

      const latitude =
        getFiniteNumber(
          data.latitude,
        );

      const longitude =
        getFiniteNumber(
          data.longitude,
        );

      const address =
        cleanString(
          data.address,
          MAX_ADDRESS_LENGTH,
        );

      /* ========================================================
         BASIC VALIDATION
      ======================================================== */

      if (
        !description &&
        !imageBase64
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Description or image is required.",
        );
      }

      /* ========================================================
         IMAGE VALIDATION
      ======================================================== */

      if (
        imageBase64.length >
        MAX_IMAGE_BASE64_LENGTH
      ) {
        throw new HttpsError(
          "invalid-argument",
          "The image is too large.",
        );
      }

      if (
        imageBase64 &&
        !ALLOWED_IMAGE_TYPES.includes(
          mimeType as
            (typeof ALLOWED_IMAGE_TYPES)[number],
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Unsupported image format.",
        );
      }

      /* ========================================================
         LOCATION VALIDATION
      ======================================================== */

      if (
        latitude !== undefined &&
        !isValidLatitude(
          latitude,
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid latitude.",
        );
      }

      if (
        longitude !== undefined &&
        !isValidLongitude(
          longitude,
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid longitude.",
        );
      }

      /*
       * Coordinates must either both exist
       * or both be absent.
       */
      if (
        (latitude === undefined) !==
        (longitude === undefined)
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Latitude and longitude must be provided together.",
        );
      }

      /* ========================================================
         RESOLVE
      ======================================================== */

      try {
        const result =
          await resolveAiBooking({
            description:
              description ||
              undefined,

            imageBase64:
              imageBase64 ||
              undefined,

            mimeType:
              mimeType ||
              undefined,

            /*
             * IMPORTANT:
             *
             * Location is now forwarded
             * to resolver.
             */
            latitude,

            longitude,

            address:
              address ||
              undefined,
          });

        return result;
      } catch (error) {
        console.error(
          "AI BOOKING RESOLVE ERROR",
          error,
        );

        if (
          error instanceof
          HttpsError
        ) {
          throw error;
        }

        throw new HttpsError(
          "internal",
          "Unable to process the booking request.",
        );
      }
    },
  );