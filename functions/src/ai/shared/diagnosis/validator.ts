import type {
  FixYourselfEngineResponse,
} from "../../customer/fix-yourself.types";

export function isValidDiagnosisResponse(
  value: unknown,
): value is FixYourselfEngineResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const response =
    value as FixYourselfEngineResponse;

  if (
    typeof response.completed !==
    "boolean"
  ) {
    return false;
  }

  if (
    typeof response.message !==
    "string"
  ) {
    return false;
  }

  return true;
}