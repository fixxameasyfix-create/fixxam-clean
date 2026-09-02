import {
  DiagnosisResult,
  EstimatedCost,
} from "../../shared/diagnosis/types";


const EMPTY_COST: EstimatedCost = {
  min: 0,
  max: 0,
  currency: "NGN",
};

function uniqueStrings(
  value: string[] = [],
): string[] {
  return [
    ...new Set(
      value
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}


  export function formatDiagnosisResponse(
  diagnosis: DiagnosisResult,
): DiagnosisResult {
  return {
    response:
      diagnosis.response.trim(),

    matchedServiceId:
      diagnosis.matchedServiceId.trim(),

    matchedService:
      diagnosis.matchedService.trim(),

    confidence: Math.max(
      0,
      Math.min(
        100,
        diagnosis.confidence,
      ),
    ),

    causes: uniqueStrings(
      diagnosis.causes,
    ),

    steps: uniqueStrings(
      diagnosis.steps,
    ),

    estimatedCost: {
      min:
        diagnosis.estimatedCost?.min ??
        EMPTY_COST.min,

      max:
        diagnosis.estimatedCost?.max ??
        EMPTY_COST.max,

      currency:
        diagnosis.estimatedCost
          ?.currency ??
        "NGN",
    },

    estimatedTime:
      diagnosis.estimatedTime.trim(),

    safety:
      diagnosis.safety.trim(),

    professionalRequired:
      diagnosis.professionalRequired,

    emergency:
      diagnosis.emergency,
  };
}