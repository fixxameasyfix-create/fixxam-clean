import type {
  DiagnosisResult,
  EstimatedCost,
} from "./types";

/* ============================================================
   HELPERS
============================================================ */

function uniqueStrings(
  value: string[] = [],
): string[] {
  return Array.from(
    new Set(
      value
        .map((item) =>
          typeof item === "string"
            ? item.trim()
            : "",
        )
        .filter(Boolean),
    ),
  );
}

function normalizeConfidence(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, value),
  );
}

function normalizeCost(
  cost: EstimatedCost,
): EstimatedCost {
  const min = Number(
    cost?.min,
  );

  const max = Number(
    cost?.max,
  );

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min <= 0 ||
    max <= min
  ) {
    throw new Error(
      "Invalid estimated repair cost.",
    );
  }

  return {
    min,
    max,
    currency: "NGN",
  };
}

/* ============================================================
   FORMAT DIAGNOSIS
============================================================ */

export function formatDiagnosis(
  diagnosis: DiagnosisResult,
): DiagnosisResult {
  const response =
    typeof diagnosis.response ===
    "string"
      ? diagnosis.response.trim()
      : "";

  const matchedServiceId =
    typeof diagnosis.matchedServiceId ===
    "string"
      ? diagnosis.matchedServiceId.trim()
      : "";

  const matchedService =
    typeof diagnosis.matchedService ===
    "string"
      ? diagnosis.matchedService.trim()
      : "";

  const estimatedTime =
    typeof diagnosis.estimatedTime ===
    "string"
      ? diagnosis.estimatedTime.trim()
      : "";

  const safety =
    typeof diagnosis.safety ===
    "string"
      ? diagnosis.safety.trim()
      : "";

  if (!response) {
    throw new Error(
      "Diagnosis response is empty.",
    );
  }

  if (!estimatedTime) {
    throw new Error(
      "Diagnosis estimated time is missing.",
    );
  }

  if (!safety) {
    throw new Error(
      "Diagnosis safety information is missing.",
    );
  }

  return {
    response,

    matchedServiceId,

    matchedService,

    confidence:
      normalizeConfidence(
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
      normalizeCost(
        diagnosis.estimatedCost,
      ),

    estimatedTime,

    safety,

    professionalRequired:
      diagnosis.professionalRequired ===
      true,

    emergency:
      diagnosis.emergency ===
      true,
  };
}