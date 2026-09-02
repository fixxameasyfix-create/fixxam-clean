import type {
  GeminiResponse,
} from "../shared/types";

import type {
  DiagnosisResponse,
  EstimatedCost,
  FixYourselfResult,
  FollowUpQuestion,
  UnderstandingFailed,
} from "./types";

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_CURRENCY = "NGN";

const DEFAULT_FOLLOW_UP_REASON =
  "This information is needed to improve the diagnosis.";

const DEFAULT_UNDERSTANDING_REASON =
  "The customer's problem could not be understood clearly.";

const DEFAULT_FOLLOW_UP_MESSAGE =
  "I need one more detail before I can diagnose the problem.";

const DEFAULT_UNDERSTANDING_MESSAGE =
  "Yi haƙuri, Fixxam bai gane matsalar ba. Ka sake bayyana abin da ba ya aiki da abin da ya faru.";

/* ============================================================
   TYPE GUARD
============================================================ */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/* ============================================================
   STRING
============================================================ */

function normalizeString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   NUMBER
============================================================ */

function normalizeNumber(
  value: unknown,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    const parsed = Number(
      value.trim(),
    );

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

/* ============================================================
   BOOLEAN
============================================================ */

function normalizeBoolean(
  value: unknown,
): boolean {
  return value === true;
}

/* ============================================================
   STRING ARRAY
============================================================ */

function normalizeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean),
    ),
  );
}

/* ============================================================
   COST
============================================================ */

function normalizeCost(
  value: unknown,
): EstimatedCost | null {
  if (!isRecord(value)) {
    return null;
  }

  const min =
    normalizeNumber(
      value.min,
    );

  const max =
    normalizeNumber(
      value.max,
    );

  if (
    min <= 0 ||
    max <= min
  ) {
    return null;
  }

  return {
    min,
    max,
    currency:
      DEFAULT_CURRENCY,
  };
}

/* ============================================================
   FOLLOW-UP
============================================================ */

function normalizeFollowUp(
  value: unknown,
): FollowUpQuestion | null {
  if (!isRecord(value)) {
    return null;
  }

  const question =
    normalizeString(
      value.question,
    );

  if (!question) {
    return null;
  }

  const reason =
    normalizeString(
      value.reason,
    );

  return {
    question,

    reason:
      reason ||
      DEFAULT_FOLLOW_UP_REASON,
  };
}

/* ============================================================
   UNDERSTANDING FAILED
============================================================ */

function normalizeUnderstandingFailed(
  value: unknown,
): UnderstandingFailed | null {
  if (!isRecord(value)) {
    return null;
  }

  const message =
    normalizeString(
      value.message,
    );

  if (!message) {
    return null;
  }

  const reason =
    normalizeString(
      value.reason,
    );

  return {
    message,

    reason:
      reason ||
      DEFAULT_UNDERSTANDING_REASON,
  };
}

/* ============================================================
   DIAGNOSIS
============================================================ */

function normalizeDiagnosis(
  value: unknown,
): FixYourselfResult | null {
  if (!isRecord(value)) {
    return null;
  }

  /* ----------------------------------------------------------
     RESPONSE
  ---------------------------------------------------------- */

  const response =
    normalizeString(
      value.response,
    );

  if (!response) {
    return null;
  }

  /* ----------------------------------------------------------
     SERVICE
  ---------------------------------------------------------- */

  const matchedServiceId =
    normalizeString(
      value.matchedServiceId,
    );

  const matchedService =
    normalizeString(
      value.matchedService,
    );

  /* ----------------------------------------------------------
     CONFIDENCE
  ---------------------------------------------------------- */

  const rawConfidence =
    normalizeNumber(
      value.confidence,
    );

  const confidence =
    Math.min(
      100,
      Math.max(
        0,
        rawConfidence,
      ),
    );

  /* ----------------------------------------------------------
     CAUSES
  ---------------------------------------------------------- */

  const causes =
    normalizeStringArray(
      value.causes,
    );

  /* ----------------------------------------------------------
     STEPS
  ---------------------------------------------------------- */

  const steps =
    normalizeStringArray(
      value.steps,
    );

  /* ----------------------------------------------------------
     COST
  ---------------------------------------------------------- */

  const estimatedCost =
    normalizeCost(
      value.estimatedCost,
    );

  if (!estimatedCost) {
    return null;
  }

  /* ----------------------------------------------------------
     TIME
  ---------------------------------------------------------- */

  const estimatedTime =
    normalizeString(
      value.estimatedTime,
    );

  if (!estimatedTime) {
    return null;
  }

  /* ----------------------------------------------------------
     SAFETY
  ---------------------------------------------------------- */

  const safety =
    normalizeString(
      value.safety,
    );

  if (!safety) {
    return null;
  }

  /* ----------------------------------------------------------
     FLAGS
  ---------------------------------------------------------- */

  const professionalRequired =
    normalizeBoolean(
      value.professionalRequired,
    );

  const emergency =
    normalizeBoolean(
      value.emergency,
    );

  /* ----------------------------------------------------------
     RESULT
  ---------------------------------------------------------- */

  return {
    response,

    matchedServiceId,

    matchedService,

    confidence,

    causes,

    steps,

    estimatedCost,

    estimatedTime,

    safety,

    professionalRequired,

    emergency,
  };
}

/* ============================================================
   CLEAN GEMINI RESPONSE
============================================================ */

function cleanResponseText(
  text: string,
): string {
  return text
    .replace(
      /^\uFEFF/,
      "",
    )
    .trim()
    .replace(
      /^```json\s*/i,
      "",
    )
    .replace(
      /^```\s*/i,
      "",
    )
    .replace(
      /\s*```$/i,
      "",
    )
    .trim();
}

/* ============================================================
   EXTRACT JSON OBJECT
============================================================ */

function extractJsonObject(
  text: string,
): string {
  const cleaned =
    cleanResponseText(
      text,
    );

  /* ----------------------------------------------------------
     PURE JSON
  ---------------------------------------------------------- */

  try {
    JSON.parse(
      cleaned,
    );

    return cleaned;
  } catch {
    // Continue.
  }

  /* ----------------------------------------------------------
     JSON EMBEDDED IN TEXT
  ---------------------------------------------------------- */

  const firstBrace =
    cleaned.indexOf("{");

  if (firstBrace === -1) {
    throw new Error(
      "Gemini did not return a JSON object.",
    );
  }

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    lastBrace === -1 ||
    lastBrace <= firstBrace
  ) {
    throw new Error(
      "Gemini returned incomplete JSON.",
    );
  }

  const extracted =
    cleaned.slice(
      firstBrace,
      lastBrace + 1,
    );

  try {
    JSON.parse(
      extracted,
    );

    return extracted;
  } catch {
    throw new Error(
      "Gemini returned malformed JSON.",
    );
  }
}

/* ============================================================
   PARSE JSON
============================================================ */

function parseJson(
  text: string,
): Record<string, unknown> {
  const jsonText =
    extractJsonObject(
      text,
    );

  try {
    const parsed =
      JSON.parse(
        jsonText,
      );

    if (!isRecord(parsed)) {
      throw new Error(
        "Gemini JSON response must be an object.",
      );
    }

    return parsed;
  } catch (error) {
    console.error(
      "========== FIX YOURSELF JSON ERROR ==========",
    );

    console.error(
      "RAW GEMINI RESPONSE:",
      text,
    );

    console.error(
      "==============================================",
    );

    throw new Error(
      `Invalid JSON returned by Gemini: ${
        error instanceof Error
          ? error.message
          : "Unknown JSON error"
      }`,
    );
  }
}

/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(
  value: unknown,
):
  | "follow_up"
  | "completed"
  | "understanding_failed"
  | null {
  const status =
    normalizeString(
      value,
    );

  switch (status) {
    case "follow_up":
      return "follow_up";

    case "completed":
      return "completed";

    case "understanding_failed":
      return "understanding_failed";

    default:
      return null;
  }
}

/* ============================================================
   MAIN PARSER
============================================================ */

export function parseFixYourselfResponse(
  response: GeminiResponse,
): DiagnosisResponse {
  /* ==========================================================
     VALIDATE GEMINI RESPONSE
  ========================================================== */

  if (
    !response ||
    typeof response.text !==
      "string"
  ) {
    throw new Error(
      "Gemini returned an empty response.",
    );
  }

  const rawText =
    response.text.trim();

  if (!rawText) {
    throw new Error(
      "Gemini returned an empty response.",
    );
  }

  console.log(
    "========== FIX YOURSELF PARSER ==========",
  );

  console.log(
    "Raw response:",
    rawText,
  );

  /* ==========================================================
     PARSE JSON
  ========================================================== */

  const json =
    parseJson(
      rawText,
    );

  /* ==========================================================
     STATUS
  ========================================================== */

  const status =
    normalizeStatus(
      json.status,
    );

  if (!status) {
    throw new Error(
      "Gemini returned an invalid or missing diagnosis status.",
    );
  }

  /* ==========================================================
     STATE 1
     UNDERSTANDING FAILED
  ========================================================== */

  if (
    status ===
    "understanding_failed"
  ) {
    const understandingFailed =
      normalizeUnderstandingFailed(
        json.understandingFailed,
      );

    if (
      !understandingFailed
    ) {
      throw new Error(
        "Gemini returned understanding_failed without a valid message.",
      );
    }

    /*
     * IMPORTANT:
     *
     * message is required by DiagnosisResponse.
     *
     * We use the customer-facing
     * understandingFailed.message.
     */

    return {
      status:
        "understanding_failed",

      completed: false,

      message:
        understandingFailed.message ||
        DEFAULT_UNDERSTANDING_MESSAGE,

      followUp: null,

      diagnosis: null,

      understandingFailed,
    };
  }

  /* ==========================================================
     STATE 2
     FOLLOW-UP
  ========================================================== */

  if (
    status ===
    "follow_up"
  ) {
    const followUp =
      normalizeFollowUp(
        json.followUp,
      );

    if (!followUp) {
      throw new Error(
        "Gemini returned follow_up without a valid question.",
      );
    }

    /*
     * message is required by DiagnosisResponse.
     *
     * Gemini may optionally provide its own
     * message. Otherwise use our safe default.
     */

    const message =
      normalizeString(
        json.message,
      ) ||
      DEFAULT_FOLLOW_UP_MESSAGE;

    return {
      status:
        "follow_up",

      completed: false,

      message,

      followUp,

      diagnosis: null,

      understandingFailed:
        null,
    };
  }

  /* ==========================================================
     STATE 3
     COMPLETED
  ========================================================== */

  const diagnosis =
    normalizeDiagnosis(
      json.diagnosis,
    );

  if (!diagnosis) {
    throw new Error(
      "Gemini returned completed without a valid diagnosis.",
    );
  }

  /*
   * For completed diagnosis,
   * diagnosis.response is the best
   * customer-facing message.
   *
   * If Gemini supplied message, use it.
   */

  const message =
    normalizeString(
      json.message,
    ) ||
    diagnosis.response;

  return {
    status:
      "completed",

    completed: true,

    message,

    followUp: null,

    diagnosis,

    understandingFailed:
      null,
  };
}