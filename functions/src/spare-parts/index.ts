import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  defineSecret,
} from "firebase-functions/params";

import {
  SparePartAiTimeoutError,
} from "./gemini";

import {
  resolveSparePart,
} from "./resolver";

import type {
  SparePartIdentifyRequest,
  SparePartIdentifyResponse,
} from "./types";

/* ==============================================================
   SECRET
============================================================== */

const GEMINI_API_KEY =
  defineSecret(
    "GEMINI_API_KEY",
  );

/* ==============================================================
   CONFIG
============================================================== */

const MAX_IMAGE_BASE64_LENGTH =
  6_000_000;

const MAX_DESCRIPTION_LENGTH =
  1500;

const MAX_HINT_LENGTH =
  250;

const MAX_ID_LENGTH =
  200;

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
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      maxLength,
    );
}

/* ==============================================================
   ERROR MESSAGE
============================================================== */

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  if (
    typeof error ===
      "string" &&
    error.trim()
  ) {
    return error.trim();
  }

  if (
    error &&
    typeof error ===
      "object"
  ) {
    const message =
      (
        error as {
          message?: unknown;
        }
      ).message;

    if (
      typeof message ===
        "string" &&
      message.trim()
    ) {
      return message.trim();
    }
  }

  return "Unknown server error.";
}

/* ==============================================================
   ERROR STATUS
============================================================== */

function getErrorStatus(
  error: unknown,
): number | null {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return null;
  }

  const value =
    error as {
      status?: unknown;
      code?: unknown;
    };

  if (
    typeof value.status ===
      "number" &&
    Number.isFinite(
      value.status,
    )
  ) {
    return value.status;
  }

  if (
    typeof value.code ===
      "number" &&
    Number.isFinite(
      value.code,
    )
  ) {
    return value.code;
  }

  return null;
}

/* ==============================================================
   FUNCTION
============================================================== */

export const identifySparePart =
  onCall(
    {
      region:
        "us-central1",

      timeoutSeconds:
        60,

      memory:
        "512MiB",

      secrets: [
        GEMINI_API_KEY,
      ],

      /*
       * Keep false while developing with
       * Expo Go.
       *
       * Enable App Check before production
       * release when native builds are ready.
       */
      enforceAppCheck:
        false,
    },

    async (
      request,
    ): Promise<
      SparePartIdentifyResponse
    > => {
      const startedAt =
        Date.now();

      try {
        /* ======================================================
           AUTHENTICATION
        ====================================================== */

        if (
          !request.auth?.uid
        ) {
          throw new HttpsError(
            "unauthenticated",
            "Please sign in before using AI spare-part search.",
          );
        }

        /* ======================================================
           REQUEST DATA
        ====================================================== */

        const data =
          request.data as
            | Record<
                string,
                unknown
              >
            | undefined;

        /* ======================================================
           PHOTO
        ====================================================== */

        const imageBase64 =
          typeof data
            ?.imageBase64 ===
          "string"
            ? data.imageBase64
                .trim()
            : "";

        const mimeType =
          cleanString(
            data?.mimeType,
            100,
          ).toLowerCase();

        /* ======================================================
           DESCRIPTION
        ====================================================== */

        const description =
          cleanString(
            data?.description,
            MAX_DESCRIPTION_LENGTH,
          );

        /* ======================================================
           EQUIPMENT
        ====================================================== */

        const equipmentId =
          cleanString(
            data?.equipmentId,
            MAX_ID_LENGTH,
          );

        const equipmentName =
          cleanString(
            data?.equipmentName,
            MAX_HINT_LENGTH,
          );

        /* ======================================================
           BRAND
        ====================================================== */

        const brandId =
          cleanString(
            data?.brandId,
            MAX_ID_LENGTH,
          );

        const brandName =
          cleanString(
            data?.brandName,
            MAX_HINT_LENGTH,
          );

        /* ======================================================
           SEARCH INPUT STATE
        ====================================================== */

        const hasImage =
          Boolean(
            imageBase64,
          );

        const hasDescription =
          Boolean(
            description,
          );

        const hasEquipmentContext =
          Boolean(
            equipmentId ||
            equipmentName ||
            brandId ||
            brandName,
          );

        /* ======================================================
           REQUIRE AT LEAST ONE SEARCH METHOD
        ====================================================== */

        if (
          !hasImage &&
          !hasDescription &&
          !hasEquipmentContext
        ) {
          throw new HttpsError(
            "invalid-argument",
            "A photo, description, or equipment selection is required.",
          );
        }

        /* ======================================================
           IMAGE SIZE
        ====================================================== */

        if (
          imageBase64.length >
          MAX_IMAGE_BASE64_LENGTH
        ) {
          throw new HttpsError(
            "invalid-argument",
            "The selected image is too large.",
          );
        }

        /* ======================================================
           IMAGE MIME TYPE
        ====================================================== */

        if (
          hasImage &&
          !mimeType
        ) {
          throw new HttpsError(
            "invalid-argument",
            "Image type is required.",
          );
        }

        if (
          hasImage &&
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

        /* ======================================================
           PAYLOAD
        ====================================================== */

        const payload:
          SparePartIdentifyRequest =
          {
            imageBase64:
              imageBase64 ||
              undefined,

            mimeType:
              mimeType ||
              undefined,

            description:
              description ||
              undefined,

            equipmentId:
              equipmentId ||
              undefined,

            equipmentName:
              equipmentName ||
              undefined,

            brandId:
              brandId ||
              undefined,

            brandName:
              brandName ||
              undefined,
          };

        /* ======================================================
           LOG START

           Never log:
           - imageBase64
           - full description
           - sensitive customer data
        ====================================================== */

        console.log(
          "[SPARE_PART_AI] START",
          {
            uid:
              request.auth.uid,

            hasImage,

            hasDescription,

            hasEquipmentContext,

            equipmentId:
              equipmentId ||
              null,

            equipmentName:
              equipmentName ||
              null,

            brandId:
              brandId ||
              null,

            brandName:
              brandName ||
              null,
          },
        );

        /* ======================================================
           RESOLVE SEARCH
        ====================================================== */

        const result =
          await resolveSparePart(
            payload,
          );

        /* ======================================================
           LOG COMPLETE
        ====================================================== */

        console.log(
          "[SPARE_PART_AI] COMPLETE",
          {
            elapsedMs:
              Date.now() -
              startedAt,

            mode:
              result.mode,

            completed:
              result.completed,

            identified:
              result.identified,

            rejected:
              result.rejected,

            reason:
              result.reason,

            partName:
              result.partName ||
              null,

            equipmentId:
              result.equipmentId ||
              null,

            brandId:
              result.brandId ||
              null,

            confidence:
              result.confidence,

            keywordCount:
              result.keywords
                .length,
          },
        );

        return result;
      } catch (
        error: unknown
      ) {
        /* ======================================================
           PRESERVE HTTPS ERROR
        ====================================================== */

        if (
          error instanceof
          HttpsError
        ) {
          throw error;
        }

        /* ======================================================
           TIMEOUT
        ====================================================== */

        if (
          error instanceof
          SparePartAiTimeoutError
        ) {
          throw new HttpsError(
            "deadline-exceeded",
            "Spare-part identification took too long. Please try again.",
          );
        }

        const message =
          getErrorMessage(
            error,
          );

        const normalized =
          message.toLowerCase();

        const status =
          getErrorStatus(
            error,
          );

        console.error(
          "[SPARE_PART_AI] ERROR",
          {
            message,

            status,

            elapsedMs:
              Date.now() -
              startedAt,
          },
        );

        /* ======================================================
           GEMINI QUOTA / CREDIT / RATE LIMIT
        ====================================================== */

        if (
          status === 429 ||
          normalized.includes(
            "429",
          ) ||
          normalized.includes(
            "quota",
          ) ||
          normalized.includes(
            "resource exhausted",
          ) ||
          normalized.includes(
            "resource_exhausted",
          ) ||
          normalized.includes(
            "prepay credits",
          ) ||
          normalized.includes(
            "credit",
          ) ||
          normalized.includes(
            "rate limit",
          )
        ) {
          throw new HttpsError(
            "resource-exhausted",
            "AI spare-part search is temporarily unavailable. Please try again shortly.",
          );
        }

        /* ======================================================
           EXTERNAL SERVICE UNAVAILABLE
        ====================================================== */

        if (
          status === 502 ||
          status === 503 ||
          status === 504 ||
          normalized.includes(
            "service unavailable",
          ) ||
          normalized.includes(
            "temporarily unavailable",
          )
        ) {
          throw new HttpsError(
            "unavailable",
            "AI spare-part search is temporarily unavailable. Please try again.",
          );
        }

        /* ======================================================
           GEMINI CONFIGURATION
        ====================================================== */

        if (
          normalized.includes(
            "gemini_api_key",
          ) ||
          normalized.includes(
            "api key",
          )
        ) {
          throw new HttpsError(
            "internal",
            "AI spare-part search is temporarily unavailable.",
          );
        }

        /* ======================================================
           INTERNAL
        ====================================================== */

        throw new HttpsError(
          "internal",
          "Unable to process this spare-part search.",
        );
      }
    },
  );