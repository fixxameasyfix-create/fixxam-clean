import { buildFixYourselfPrompt } from "../prompt";
import { generateFixYourselfContent } from "../gemini";

import type {
  ReasoningRequest,
} from "./types";

import type {
  DiagnosisResponse,
  FixYourselfResult,
  UnderstandingFailed,
} from "../types";

/* ============================================================
   CONSTANTS
============================================================ */

const DEFAULT_COST_CURRENCY = "NGN";

const DEFAULT_FOLLOW_UP_REASON =
  "This information is needed to improve the diagnosis.";

const DEFAULT_UNDERSTANDING_REASON =
  "The customer's problem could not be understood clearly.";

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

function cleanString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/* ============================================================
   STRING ARRAY
============================================================ */

function cleanStringArray(
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
   STATUS
============================================================ */

type ParsedStatus =
  | "follow_up"
  | "completed"
  | "understanding_failed";

function getStatus(
  parsed: Record<string, unknown>,
): ParsedStatus | null {
  const status =
    cleanString(
      parsed.status,
    );

  if (
    status === "follow_up" ||
    status === "completed" ||
    status === "understanding_failed"
  ) {
    return status;
  }

  /*
   * Backward compatibility for older
   * Gemini responses.
   */

  if (
    parsed.completed === true
  ) {
    return "completed";
  }

  if (
    parsed.completed === false &&
    isRecord(
      parsed.followUp,
    )
  ) {
    return "follow_up";
  }

  return null;
}

/* ============================================================
   FOLLOW-UP
============================================================ */

function parseFollowUp(
  value: unknown,
): {
  question: string;
  reason: string;
} | null {
  if (!isRecord(value)) {
    return null;
  }

  const question =
    cleanString(
      value.question,
    );

  if (!question) {
    return null;
  }

  const reason =
    cleanString(
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

function parseUnderstandingFailed(
  value: unknown,
): UnderstandingFailed | null {
  if (!isRecord(value)) {
    return null;
  }

  const message =
    cleanString(
      value.message,
    );

  if (!message) {
    return null;
  }

  return {
    message,

    reason:
      cleanString(
        value.reason,
      ) ||
      DEFAULT_UNDERSTANDING_REASON,
  };
}

/* ============================================================
   DIAGNOSIS
============================================================ */

function parseDiagnosis(
  value: unknown,
): FixYourselfResult | null {
  if (!isRecord(value)) {
    return null;
  }

  /* ==========================================================
     RESPONSE
  ========================================================== */

  const response =
    cleanString(
      value.response,
    );

  if (!response) {
    return null;
  }

  /* ==========================================================
     SERVICE
  ========================================================== */

  const matchedServiceId =
    cleanString(
      value.matchedServiceId,
    );

  const matchedService =
    cleanString(
      value.matchedService,
    );

  /* ==========================================================
     CONFIDENCE
  ========================================================== */

  const rawConfidence =
    value.confidence;

  const confidence =
    typeof rawConfidence === "number" &&
    Number.isFinite(
      rawConfidence,
    )
      ? Math.max(
          0,
          Math.min(
            100,
            rawConfidence,
          ),
        )
      : 0;

  /* ==========================================================
     CAUSES
  ========================================================== */

  const causes =
    cleanStringArray(
      value.causes,
    );

  /* ==========================================================
     STEPS
  ========================================================== */

  const steps =
    cleanStringArray(
      value.steps,
    );

  /* ==========================================================
     ESTIMATED COST
  ========================================================== */

  if (
    !isRecord(
      value.estimatedCost,
    )
  ) {
    return null;
  }

  const rawMin =
    value.estimatedCost.min;

  const rawMax =
    value.estimatedCost.max;

  const min =
    typeof rawMin === "number" &&
    Number.isFinite(
      rawMin,
    )
      ? rawMin
      : 0;

  const max =
    typeof rawMax === "number" &&
    Number.isFinite(
      rawMax,
    )
      ? rawMax
      : 0;

  if (
    min <= 0 ||
    max <= min
  ) {
    return null;
  }

  /* ==========================================================
     ESTIMATED TIME
  ========================================================== */

  const estimatedTime =
    cleanString(
      value.estimatedTime,
    );

  if (!estimatedTime) {
    return null;
  }

  /* ==========================================================
     SAFETY
  ========================================================== */

  const safety =
    cleanString(
      value.safety,
    );

  if (!safety) {
    return null;
  }

  /* ==========================================================
     FLAGS
  ========================================================== */

  const professionalRequired =
    value.professionalRequired === true;

  const emergency =
    value.emergency === true;

  /* ==========================================================
     RESULT
  ========================================================== */

  return {
    response,

    matchedServiceId,

    matchedService,

    confidence,

    causes,

    steps,

    estimatedCost: {
      min,
      max,
      currency:
        DEFAULT_COST_CURRENCY,
    },

    estimatedTime,

    safety,

    professionalRequired,

    emergency,
  };
}

/* ============================================================
   PARSE GEMINI RESPONSE
============================================================ */

function parseResponse(
  text: string,
): DiagnosisResponse {
  /*
   * Remove BOM and optional markdown
   * code fences from Gemini output.
   */

  const cleaned =
    text
      .replace(
        /^\uFEFF/,
        "",
      )
      .replace(
        /^```json\s*/i,
        "",
      )
      .replace(
        /^```\s*/i,
        "",
      )
      .replace(
        /\s*```$/,
        "",
      )
      .trim();

  if (!cleaned) {
    throw new Error(
      "Fix Yourself returned an empty response.",
    );
  }

  /* ==========================================================
     JSON PARSE
  ========================================================== */

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(
        cleaned,
      );
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
      `Fix Yourself returned invalid JSON: ${
        error instanceof Error
          ? error.message
          : "Unknown JSON error"
      }`,
    );
  }

  /* ==========================================================
     OBJECT VALIDATION
  ========================================================== */

  if (!isRecord(parsed)) {
    throw new Error(
      "Fix Yourself response must be a JSON object.",
    );
  }

  /* ==========================================================
     STATUS
  ========================================================== */

  const status =
    getStatus(
      parsed,
    );

  if (!status) {
    throw new Error(
      "Fix Yourself response has an invalid or missing status.",
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
      parseUnderstandingFailed(
        parsed.understandingFailed,
      );

    if (!understandingFailed) {
      throw new Error(
        "Fix Yourself understanding_failed response is invalid.",
      );
    }

    console.log(
      "========== UNDERSTANDING FAILED ==========",
    );

    console.log(
      "Message:",
      understandingFailed.message,
    );

    console.log(
      "Reason:",
      understandingFailed.reason,
    );

    console.log(
      "==========================================",
    );

    /*
     * IMPORTANT:
     *
     * This is a valid customer-facing result.
     *
     * It must NOT throw.
     * It must NOT become fallback.
     * It must NOT trigger retry.
     */

    return {
      status:
        "understanding_failed",

      completed: false,

      message:
        understandingFailed.message,

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
      parseFollowUp(
        parsed.followUp,
      );

    if (!followUp) {
      throw new Error(
        "Fix Yourself follow-up response has no valid question.",
      );
    }

    console.log(
      "========== FOLLOW-UP ==========",
    );

    console.log(
      "Question:",
      followUp.question,
    );

    console.log(
      "Reason:",
      followUp.reason,
    );

    console.log(
      "================================",
    );

    return {
      status:
        "follow_up",

      completed: false,

      message:
        followUp.question,

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
    parseDiagnosis(
      parsed.diagnosis,
    );

  if (!diagnosis) {
    throw new Error(
      "Fix Yourself completed response has no valid diagnosis.",
    );
  }

  console.log(
    "========== COMPLETED DIAGNOSIS ==========",
  );

  console.log(
    "Service:",
    diagnosis.matchedService,
  );

  console.log(
    "Service ID:",
    diagnosis.matchedServiceId,
  );

  console.log(
    "Confidence:",
    diagnosis.confidence,
  );

  console.log(
    "==========================================",
  );

  return {
    status:
      "completed",

    completed: true,

    message:
      diagnosis.response,

    followUp: null,

    diagnosis,

    understandingFailed:
      null,
  };
}

/* ============================================================
   RUN DIAGNOSIS
============================================================ */

export async function runDiagnosis(
  request: ReasoningRequest,
): Promise<DiagnosisResponse> {
  const followUpCount =
    Number.isInteger(
      request.followUpCount,
    ) &&
    (request.followUpCount ?? 0) >= 0
      ? request.followUpCount ?? 0
      : 0;

  const forceDiagnosis =
    request.forceDiagnosis === true;

  console.log(
    "========== FIX YOURSELF RUN ==========",
  );

  console.log(
    "Problem:",
    request.problem,
  );

  console.log(
    "FollowUpCount:",
    followUpCount,
  );

  console.log(
    "ForceDiagnosis:",
    forceDiagnosis,
  );

  /* ==========================================================
     BUILD PROMPT
  ========================================================== */

  const systemPrompt =
    buildFixYourselfPrompt(
      request.problem,
      request.services,
      request.messages ?? [],
      followUpCount,
      forceDiagnosis,
    );

  /* ==========================================================
     CONVERSATION
  ========================================================== */

  const conversation =
    request.messages ?? [];

  /* ==========================================================
     GEMINI
  ========================================================== */

  const text =
    await generateFixYourselfContent(
      systemPrompt,
      conversation,
    );

  /* ==========================================================
     PARSE
  ========================================================== */

  const result =
    parseResponse(
      text,
    );

  /* ==========================================================
     LOG RESULT
  ========================================================== */

  console.log(
    "========== FIX YOURSELF RESULT ==========",
  );

  console.log(
    "Status:",
    result.status,
  );

  console.log(
    "Completed:",
    result.completed,
  );

  console.log(
    "Message:",
    result.message,
  );

  console.log(
    "Follow-up:",
    Boolean(
      result.followUp,
    ),
  );

  console.log(
    "Diagnosis:",
    Boolean(
      result.diagnosis,
    ),
  );

  console.log(
    "Understanding failed:",
    Boolean(
      result.understandingFailed,
    ),
  );

  console.log(
    "==========================================",
  );

  return result;
}