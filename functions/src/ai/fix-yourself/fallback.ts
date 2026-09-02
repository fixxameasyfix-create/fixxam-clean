import {
  EstimatedCost,
  FixYourselfResult,
} from "./types";

const EMPTY_COST: EstimatedCost = {
  min: 0,
  max: 0,
  currency: "NGN",
};

export function buildFixYourselfFallback(): FixYourselfResult {
  return {
    response:
      "I couldn't confidently analyze this repair problem. Please provide more information and try again.",

    matchedServiceId: "",

    matchedService: "",

    confidence: 0,

    causes: [
      "There is not enough information to determine the likely cause.",
    ],

    steps: [
      "Describe exactly what is happening.",
      "Tell me when the problem started.",
      "Mention any sounds, smells, warning lights, leaks, or error messages.",
    ],

    estimatedCost: {
      ...EMPTY_COST,
    },

    estimatedTime:
      "Inspection required",

    safety:
      "If the equipment appears unsafe, stop using it until the problem is identified.",

    professionalRequired: false,

    emergency: false,
  };
}