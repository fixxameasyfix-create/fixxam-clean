import { AIValidationResult } from "./types";

export function createValidationResult(
  errors: string[],
): AIValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function requireString(
  value: unknown,
  field: string,
  errors: string[],
): void {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    errors.push(
      `${field} is required.`,
    );
  }
}

export function requireNumber(
  value: unknown,
  field: string,
  errors: string[],
): void {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    errors.push(
      `${field} is required.`,
    );
  }
}

export function requireBoolean(
  value: unknown,
  field: string,
  errors: string[],
): void {
  if (
    typeof value !== "boolean"
  ) {
    errors.push(
      `${field} is required.`,
    );
  }
}

export function requireArray(
  value: unknown,
  field: string,
  errors: string[],
  minimum = 1,
): void {
  if (
    !Array.isArray(value) ||
    value.length < minimum
  ) {
    errors.push(
      `${field} must contain at least ${minimum} item(s).`,
    );
  }
}

export function requireObject(
  value: unknown,
  field: string,
  errors: string[],
): void {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    errors.push(
      `${field} is required.`,
    );
  }
}