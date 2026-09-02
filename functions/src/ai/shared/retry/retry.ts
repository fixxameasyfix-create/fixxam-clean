import {
  logFallback,
  logRetry,
  logValidationErrors,
} from "./logger";

import type {
  AIEngineOptions,
  AIRetryResult,
  AIValidationResult,
} from "./types";

/* ============================================================
   SPECIAL AI RESULT
============================================================ */

interface UnderstandingFailedResult {
  status: "understanding_failed";
}

/* ============================================================
   TYPE GUARD
============================================================ */

function isUnderstandingFailedResult(
  value: unknown,
): value is UnderstandingFailedResult {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const result =
    value as Record<string, unknown>;

  return (
    result.status ===
    "understanding_failed"
  );
}

/* ============================================================
   RETRY AI
============================================================ */

export async function retryAI<T>(
  options: AIEngineOptions<T>,
): Promise<AIRetryResult<T>> {
  const maxAttempts = Math.max(
    1,
    Math.floor(
      options.maxAttempts ?? 2,
    ),
  );

  let attempts = 0;

  let lastValidation: AIValidationResult = {
    valid: false,
    errors: [
      "No validation performed.",
    ],
  };

  /* ==========================================================
     AI EXECUTION
  ========================================================== */

  while (
    attempts < maxAttempts
  ) {
    attempts += 1;

    logRetry(attempts);

    try {
      /* ========================================================
         EXECUTE
      ======================================================== */

      const result =
        await options.execute();

      /* ========================================================
         IMPORTANT:
         
         understanding_failed is NOT an error.
         
         It means Gemini successfully understood that
         the customer's message could not be understood.
         
         Return it immediately.
      ======================================================== */

      if (
        isUnderstandingFailedResult(
          result,
        )
      ) {
        console.log(
          "========== AI UNDERSTANDING FAILED ==========",
        );

        console.log(
          "Customer problem could not be understood.",
        );

        console.log(
          "Returning understanding_failed state.",
        );

        console.log(
          "==============================================",
        );

        return {
          result,

          attempts,

          validation: {
            valid: true,
            errors: [],
          },
        };
      }

      /* ========================================================
         VALIDATE NORMAL AI RESULT
      ======================================================== */

      const validation =
        options.validate(
          result,
        );

      lastValidation =
        validation;

      /* ========================================================
         VALID
      ======================================================== */

      if (
        validation.valid
      ) {
        return {
          result,

          attempts,

          validation,
        };
      }

      /* ========================================================
         INVALID
      ======================================================== */

      logValidationErrors(
        validation.errors,
      );

      console.warn(
        `AI result failed validation on attempt ${attempts}/${maxAttempts}.`,
      );
    } catch (
      error: unknown
    ) {
      /* ========================================================
         EXECUTION ERROR
      ======================================================== */

      console.error(
        `AI execution failed on attempt ${attempts}/${maxAttempts}.`,
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

      /*
       * Do not throw immediately.
       *
       * Retry the AI request.
       */
    }
  }

  /* ==========================================================
     ALL ATTEMPTS FAILED
  ========================================================== */

  console.warn(
    `AI failed after ${attempts} attempt(s). Using fallback.`,
  );

  logFallback();

  let fallbackResult: T;

  /* ==========================================================
     BUILD FALLBACK
  ========================================================== */

  try {
    fallbackResult =
      options.fallback();
  } catch (
    error: unknown
  ) {
    console.error(
      "Failed to create AI fallback result.",
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
    }

    throw new Error(
      "AI fallback generation failed.",
      {
        cause: error,
      },
    );
  }

  /* ==========================================================
     VALIDATE FALLBACK
  ========================================================== */

  let fallbackValidation: AIValidationResult;

  try {
    fallbackValidation =
      options.validate(
        fallbackResult,
      );
  } catch (
    error: unknown
  ) {
    console.error(
      "Fallback validation failed.",
    );

    throw new Error(
      "AI fallback validation failed.",
      {
        cause: error,
      },
    );
  }

  /* ==========================================================
     FALLBACK INVALID
  ========================================================== */

  if (
    !fallbackValidation.valid
  ) {
    logValidationErrors(
      fallbackValidation.errors,
    );

    console.error(
      "Fallback result failed validation.",
    );

    const originalErrors =
      lastValidation.errors.length >
      0
        ? lastValidation.errors
        : [
            "AI generation failed.",
          ];

    const fallbackErrors =
      fallbackValidation.errors.length >
      0
        ? fallbackValidation.errors
        : [
            "Fallback result failed validation.",
          ];

    throw new Error(
      [
        "AI diagnosis failed after all retry attempts.",
        "",
        "Last AI validation errors:",
        ...originalErrors.map(
          (error) =>
            `- ${error}`,
        ),
        "",
        "Fallback validation errors:",
        ...fallbackErrors.map(
          (error) =>
            `- ${error}`,
        ),
      ].join("\n"),
    );
  }

  /* ==========================================================
     RETURN FALLBACK
  ========================================================== */

  return {
    result:
      fallbackResult,

    attempts,

    validation:
      fallbackValidation,
  };
}