import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  defineSecret,
} from "firebase-functions/params";

import {
  processCustomerAI,
} from "./engine";

import type {
  CustomerAiRequest,
} from "./types";

/* ============================================================
   SECRET
============================================================ */

const GEMINI_API_KEY =
  defineSecret("GEMINI_API_KEY");

/* ============================================================
   EXPORTS
============================================================ */

export {
  processCustomerAI,
} from "./engine";

export * from "./types";

/* ============================================================
   REQUEST VALIDATION
============================================================ */

function isValidRequest(
  data: unknown,
): data is CustomerAiRequest {
  if (
    !data ||
    typeof data !== "object"
  ) {
    return false;
  }

  const request =
    data as Record<
      string,
      unknown
    >;

  if (
    !Array.isArray(
      request.messages,
    )
  ) {
    return false;
  }

  if (
    request.messages.length === 0
  ) {
    return false;
  }

  return true;
}

/* ============================================================
   CUSTOMER AI V2
============================================================ */

export const customerAiV2 =
  onCall(
    {
      timeoutSeconds: 60,

      memory: "512MiB",

      cors: true,

      /*
       * Make GEMINI_API_KEY available
       * to process.env.GEMINI_API_KEY
       * inside the Cloud Run instance.
       */
      secrets: [
        GEMINI_API_KEY,
      ],
    },

    async (request) => {
      /* ======================================================
         AUTHENTICATION
      ====================================================== */

      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Authentication is required.",
        );
      }

      /* ======================================================
         REQUEST VALIDATION
      ====================================================== */

      if (
        !isValidRequest(
          request.data,
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "A valid customer AI request is required.",
        );
      }

      /* ======================================================
         PROCESS CUSTOMER AI
      ====================================================== */

      try {
        return await processCustomerAI(
          request.data,
        );
      } catch (
        error: unknown
      ) {
        console.error(
          "========== CUSTOMER AI V2 ERROR ==========",
        );

        if (
          error instanceof Error
        ) {
          console.error(
            "Message:",
            error.message,
          );

          console.error(
            "Stack:",
            error.stack,
          );
        } else {
          console.error(
            error,
          );
        }

        console.error(
          "===========================================",
        );

        throw new HttpsError(
          "internal",
          "Failed to process customer AI request.",
        );
      }
    },
  );