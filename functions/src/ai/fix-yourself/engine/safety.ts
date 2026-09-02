import { DiagnosisResult } from "./types";

const EMERGENCY_KEYWORDS = [
  "gas leak",
  "gas smell",
  "smell of gas",

  "fire",
  "smoke",
  "burning smell",

  "electric shock",
  "electrocuted",
  "live wire",
  "exposed wire",
  "short circuit",
  "spark",
  "sparks",

  "carbon monoxide",

  "explosion",

  "flood",
  "flooding",

  "roof collapse",
  "ceiling collapse",
];

function containsEmergency(
  text: string,
): boolean {
  const value =
    text.toLowerCase();

  return EMERGENCY_KEYWORDS.some(
    (keyword) =>
      value.includes(keyword),
  );
}

export function applySafetyRules(
  problem: string,
  diagnosis: DiagnosisResult,
): DiagnosisResult {
  const emergencyDetected =
    diagnosis.emergency ||
    containsEmergency(problem) ||
    containsEmergency(
      diagnosis.response,
    ) ||
    diagnosis.causes.some(
      containsEmergency,
    );

  if (!emergencyDetected) {
    return diagnosis;
  }

  return {
    ...diagnosis,

    emergency: true,

    professionalRequired: true,

    steps: [
      "Stop using the equipment immediately.",
      "Move everyone to a safe location if necessary.",
      "Do not attempt any repair.",
      "Contact the appropriate emergency service or a qualified technician.",
    ],

    safety:
      "An emergency hazard has been detected. Do not continue troubleshooting until the situation is safe.",

    estimatedTime:
      "Emergency inspection required",
  };
}