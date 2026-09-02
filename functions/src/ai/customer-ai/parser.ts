import type {
  CustomerAiDiagnosis,
  CustomerAiFollowUp,
  CustomerAiResult,
} from "./types";

const EMPTY_RESULT: CustomerAiResult = {
  completed: false,

  message:
    "Unable to understand the AI response.",

  followUp: null,

  diagnosis: null,
};

function cleanString(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  const result = value.trim();

  if (!result) {
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
      result.toLowerCase(),
    )
  ) {
    return "";
  }

  return result;
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
        .map(cleanString)
        .filter(Boolean),
    ),
  ];
}

function cleanConfidence(
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
): CustomerAiDiagnosis["estimatedCost"] {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {
      min: 0,
      max: 0,
      currency: "NGN",
    };
  }

  const cost =
    value as Record<
      string,
      unknown
    >;

  const min =
    typeof cost.min === "number" &&
    Number.isFinite(cost.min)
      ? Math.max(
          0,
          Math.round(cost.min),
        )
      : 0;

  const max =
    typeof cost.max === "number" &&
    Number.isFinite(cost.max)
      ? Math.max(
          min,
          Math.round(cost.max),
        )
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
  const cleaned =
    text
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

  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {
    return cleaned;
  }

  return cleaned.slice(
    start,
    end + 1,
  );
}

function parseObject(
  text: string,
): Record<string, unknown> | null {
  try {
    const parsed =
      JSON.parse(
        extractJson(text),
      );

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    return parsed as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

function parseFollowUp(
  value: unknown,
): CustomerAiFollowUp | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const followUp =
    value as Record<
      string,
      unknown
    >;

  const question =
    cleanString(
      followUp.question,
    );

  if (!question) {
    return null;
  }

  return {
    question,

    reason:
      cleanString(
        followUp.reason,
      ) ||
      "More information is required.",
  };
}

function parseDiagnosis(
  value: unknown,
): CustomerAiDiagnosis | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const diagnosis =
    value as Record<
      string,
      unknown
    >;

  return {
    response:
      cleanString(
        diagnosis.response,
      ) ||
      "Unable to understand the diagnosis.",

    /*
     * Gemini NEVER controls this ID.
     * The backend adds the real Firestore
     * service ID after service matching.
     */
    matchedServiceId: "",

    matchedService:
      cleanString(
        diagnosis.matchedService,
      ),

    confidence:
      cleanConfidence(
        diagnosis.confidence,
      ),

    causes:
      cleanStringArray(
        diagnosis.causes,
      ),

    steps:
      cleanStringArray(
        diagnosis.steps,
      ),

    estimatedCost:
      cleanCost(
        diagnosis.estimatedCost,
      ),

    estimatedTime:
      cleanString(
        diagnosis.estimatedTime,
      ),

    safety:
      cleanString(
        diagnosis.safety,
      ) || "Unknown.",

    professionalRequired:
      diagnosis.professionalRequired ===
      true,

    emergency:
      diagnosis.emergency ===
      true,
  };
}

export function parseCustomerAIResponse(
  text: string,
): CustomerAiResult {
  if (
    typeof text !== "string" ||
    !text.trim()
  ) {
    return EMPTY_RESULT;
  }

  const parsed =
    parseObject(text);

  if (!parsed) {
    console.error(
      "========== CUSTOMER AI PARSER ERROR ==========",
    );

    console.error(
      "Invalid Gemini JSON response.",
    );

    console.error(
      "RAW RESPONSE:",
      text,
    );

    console.error(
      "===============================================",
    );

    return EMPTY_RESULT;
  }

  const completed =
    parsed.completed === true;

  const message =
    cleanString(
      parsed.message,
    );

  const followUp =
    parseFollowUp(
      parsed.followUp,
    );

  const diagnosis =
    parseDiagnosis(
      parsed.diagnosis,
    );

  /*
   * Completed response must have
   * a valid diagnosis.
   */
  if (
    completed &&
    !diagnosis
  ) {
    return {
      completed: false,

      message:
        "I need a little more information before I can diagnose the problem.",

      followUp: {
        question:
          "Can you provide a little more detail about the problem?",

        reason:
          "The AI response did not contain a valid diagnosis.",
      },

      diagnosis: null,
    };
  }

  /*
   * Follow-up response must have
   * exactly one usable question.
   */
  if (!completed) {
    if (!followUp) {
      return {
        completed: false,

        message:
          "Please provide more information about the problem.",

        followUp: {
          question:
            "Can you provide more information about the problem?",

          reason:
            "More information is required before diagnosis.",
        },

        diagnosis: null,
      };
    }

    return {
      completed: false,

      message:
        followUp.question,

      followUp,

      diagnosis: null,
    };
  }

  return {
    completed: true,

    message:
      message ||
      diagnosis!.response,

    followUp: null,

    diagnosis,
  };
}