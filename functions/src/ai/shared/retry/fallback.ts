export function createFallback<T>(
  fallback: T,
): () => T {
  return () =>
    structuredClone(fallback);
}

export function withFallback<T>(
  value: T | null | undefined,
  fallback: T,
): T {
  if (
    value === null ||
    value === undefined
  ) {
    return structuredClone(
      fallback,
    );
  }

  return value;
}

export function withArrayFallback<T>(
  value: T[] | null | undefined,
  fallback: T[],
): T[] {
  if (
    !Array.isArray(value) ||
    value.length === 0
  ) {
    return [
      ...fallback,
    ];
  }

  return value;
}

export function withStringFallback(
  value: unknown,
  fallback: string,
): string {
  if (typeof value !== "string") {
    console.error(
      "withStringFallback received:",
      value,
      typeof value,
    );

    return fallback;
  }

  const text = value.trim();

  return text.length > 0
    ? text
    : fallback;
}


export function withNumberFallback(
  value: number | null | undefined,
  fallback: number,
): number {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return fallback;
  }

  return value;
}

export function withBooleanFallback(
  value:
    | boolean
    | null
    | undefined,
  fallback: boolean,
): boolean {
  if (
    typeof value !== "boolean"
  ) {
    return fallback;
  }

  return value;
}