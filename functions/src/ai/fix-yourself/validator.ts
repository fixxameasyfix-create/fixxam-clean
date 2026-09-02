import {
  createValidationResult,
  requireArray,
  requireBoolean,
  requireNumber,
  requireObject,
  requireString,
} from "../shared/retry";

import type {
  FixYourselfResult,
} from "./types";

/* ============================================================
   VALIDATE FIX YOURSELF DIAGNOSIS
============================================================ */

export function validateFixYourselfResult(
  result: FixYourselfResult,
) {
  const errors: string[] = [];

  /* ==========================================================
     BASIC RESPONSE
  ========================================================== */

  requireString(
    result.response,
    "response",
    errors,
  );

  /* ==========================================================
     SERVICE MATCHING
  ========================================================== */

  /*
   * A completed diagnosis normally needs
   * a matched service.
   *
   * If no suitable service exists, the AI
   * may intentionally return empty values.
   *
   * We therefore validate the fields only
   * when one of them is provided.
   */

  const hasServiceId =
    typeof result.matchedServiceId ===
      "string" &&
    result.matchedServiceId.trim()
      .length > 0;

  const hasServiceName =
    typeof result.matchedService ===
      "string" &&
    result.matchedService.trim()
      .length > 0;

  if (
    hasServiceId !==
    hasServiceName
  ) {
    errors.push(
      "matchedServiceId and matchedService must both be provided when a service is matched.",
    );
  }

  /* ==========================================================
     CONFIDENCE
  ========================================================== */

  requireNumber(
    result.confidence,
    "confidence",
    errors,
  );

  if (
    typeof result.confidence ===
      "number" &&
    Number.isFinite(
      result.confidence,
    ) &&
    (
      result.confidence < 0 ||
      result.confidence > 100
    )
  ) {
    errors.push(
      "confidence must be between 0 and 100.",
    );
  }

  /* ==========================================================
     CAUSES
  ========================================================== */

  requireArray(
    result.causes,
    "causes",
    errors,
    0,
  );

  /* ==========================================================
     TROUBLESHOOTING STEPS
  ========================================================== */

  requireArray(
    result.steps,
    "steps",
    errors,
    0,
  );

  /* ==========================================================
     ESTIMATED COST
  ========================================================== */

  requireObject(
    result.estimatedCost,
    "estimatedCost",
    errors,
  );

  if (
    result.estimatedCost &&
    typeof result.estimatedCost ===
      "object" &&
    !Array.isArray(
      result.estimatedCost,
    )
  ) {
    const min =
      result.estimatedCost.min;

    const max =
      result.estimatedCost.max;

    /* --------------------------------------------------------
       MIN
    -------------------------------------------------------- */

    if (
      typeof min !== "number" ||
      !Number.isFinite(min) ||
      min <= 0
    ) {
      errors.push(
        "estimatedCost.min must be greater than 0.",
      );
    }

    /* --------------------------------------------------------
       MAX
    -------------------------------------------------------- */

    if (
      typeof max !== "number" ||
      !Number.isFinite(max) ||
      (
        typeof min === "number" &&
        Number.isFinite(min) &&
        max <= min
      )
    ) {
      errors.push(
        "estimatedCost.max must be greater than estimatedCost.min.",
      );
    }

    /* --------------------------------------------------------
       CURRENCY
    -------------------------------------------------------- */

    if (
      result.estimatedCost.currency !==
      "NGN"
    ) {
      errors.push(
        "estimatedCost.currency must be NGN.",
      );
    }
  }

  /* ==========================================================
     ESTIMATED TIME
  ========================================================== */

  requireString(
    result.estimatedTime,
    "estimatedTime",
    errors,
  );

  /* ==========================================================
     SAFETY
  ========================================================== */

  requireString(
    result.safety,
    "safety",
    errors,
  );

  /* ==========================================================
     PROFESSIONAL REQUIRED
  ========================================================== */

  requireBoolean(
    result.professionalRequired,
    "professionalRequired",
    errors,
  );

  /* ==========================================================
     EMERGENCY
  ========================================================== */

  requireBoolean(
    result.emergency,
    "emergency",
    errors,
  );

  /* ==========================================================
     FINAL VALIDATION RESULT
  ========================================================== */

  return createValidationResult(
    errors,
  );
}