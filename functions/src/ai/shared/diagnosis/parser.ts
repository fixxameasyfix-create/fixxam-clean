import type {
  DiagnosisResult,
} from "./types";

const EMPTY_RESULT: DiagnosisResult = {
  response:
    "Unable to understand the AI response.",

  matchedServiceId: "",

  matchedService: "",

  confidence: 0,

  causes: [],

  steps: [],

  estimatedCost: {
    min: 0,
    max: 0,
    currency: "NGN",
  },

  estimatedTime: "",

  safety: "Unknown.",

  professionalRequired: true,

  emergency: false,
};

function cleanString(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function cleanServiceName(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  const cleaned = value.trim();

  if (!cleaned) {
    return "";
  }

  const invalidValues = new Set([
    "[object object]",
    "object-object",
    "undefined",
    "null",
  ]);

  if (
    invalidValues.has(
      cleaned.toLowerCase(),
    )
  ) {
    return "";
  }

  return cleaned;
}

function cleanStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function clampConfidence(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}

function cleanCost(
  value: unknown,
): DiagnosisResult["estimatedCost"] {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      min: 0,
      max: 0,
      currency: "NGN",
    };
  }

  const cost =
    value as Record<string, unknown>;

  const min =
    typeof cost.min === "number" &&
    Number.isFinite(cost.min)
      ? Math.max(0, cost.min)
      : 0;

  const max =
    typeof cost.max === "number" &&
    Number.isFinite(cost.max)
      ? Math.max(min, cost.max)
      : min;

  return {
    min,
    max,
    currency: "NGN",
  };
}

function extractJson(
  text: string,
): string {
  let cleaned = text.trim();

  cleaned = cleaned.replace(
    /^```json\s*/i,
    "",
  );

  cleaned = cleaned.replace(
    /^```\s*/i,
    "",
  );

  cleaned = cleaned.replace(
    /\s*```$/i,
    "",
  );

  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  if (
    start >= 0 &&
    end > start
  ) {
    return cleaned.slice(
      start,
      end + 1,
    );
  }

  return cleaned;
}

export function parseDiagnosisResponse(
  text: string,
): DiagnosisResult {
  try {
    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return EMPTY_RESULT;
    }

    const parsed =
      JSON.parse(
        extractJson(text),
      ) as Record<string, unknown>;

    /*
     * SECURITY:
     *
     * Gemini is never trusted with
     * the real Fixxam service ID.
     *
     * The backend resolves the real
     * service ID later using matcher.ts.
     */
    const matchedService =
      cleanServiceName(
        parsed.matchedService,
      );

    return {
      response:
        cleanString(
          parsed.response,
        ) ||
        EMPTY_RESULT.response,

      /*
       * ALWAYS EMPTY HERE.
       *
       * matcher.ts will resolve the
       * real Firebase service ID.
       */
      matchedServiceId: "",

      matchedService,

      confidence:
        clampConfidence(
          parsed.confidence,
        ),

      causes:
        cleanStringArray(
          parsed.causes,
        ),

      steps:
        cleanStringArray(
          parsed.steps,
        ),

      estimatedCost:
        cleanCost(
          parsed.estimatedCost,
        ),

      estimatedTime:
        cleanString(
          parsed.estimatedTime,
        ),

      safety:
        cleanString(
          parsed.safety,
        ) ||
        EMPTY_RESULT.safety,

      professionalRequired:
        parsed.professionalRequired ===
        true,

      emergency:
        parsed.emergency === true,
    };
  } catch (error) {
    console.error(
      "========== DIAGNOSIS PARSER ERROR ==========",
    );

    console.error(error);

    console.error(
      "RAW DIAGNOSIS RESPONSE:",
    );

    console.error(text);

    console.error(
      "=============================================",
    );

    return EMPTY_RESULT;
  }
}