import type {
  DiagnosisResult,
  EstimatedCost,
} from "./types";

const EMPTY_COST: EstimatedCost = {
  min: 0,
  max: 0,
  currency: "NGN",
};

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  const result =
    value.trim();

  if (
    result === "[object Object]" ||
    result.toLowerCase() ===
      "object-object" ||
    result.toLowerCase() ===
      "undefined" ||
    result.toLowerCase() ===
      "null"
  ) {
    return "";
  }

  return result;
}

function uniqueStrings(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(
      value
        .filter(
          (
            item,
          ): item is string =>
            typeof item === "string",
        )
        .map(
          (item) => item.trim(),
        )
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
): EstimatedCost {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return EMPTY_COST;
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

export function formatDiagnosisResponse(
  diagnosis: DiagnosisResult,
): DiagnosisResult {
  const matchedServiceId =
    cleanString(
      diagnosis.matchedServiceId,
    );

  const matchedService =
    cleanString(
      diagnosis.matchedService,
    );

  return {
    response:
      cleanString(
        diagnosis.response,
      ) ||
      "Unable to understand the AI response.",

    /*
     * AI-generated IDs are never trusted.
     *
     * The service matcher will replace this
     * with the real Firestore document ID.
     */
    matchedServiceId,

    matchedService,

    confidence:
      cleanConfidence(
        diagnosis.confidence,
      ),

    causes:
      uniqueStrings(
        diagnosis.causes,
      ),

    steps:
      uniqueStrings(
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