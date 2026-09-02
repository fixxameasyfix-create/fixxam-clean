export function extractJson(
  text: string,
): string {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const first =
    cleaned.indexOf("{");

  const last =
    cleaned.lastIndexOf("}");

  if (
    first === -1 ||
    last === -1
  ) {
    return cleaned;
  }

  return cleaned.substring(
    first,
    last + 1,
  );
}

export function safeParseJson<T>(
  text: string,
): T | null {
  try {
    return JSON.parse(
      extractJson(text),
    ) as T;
  } catch {
    return null;
  }
}