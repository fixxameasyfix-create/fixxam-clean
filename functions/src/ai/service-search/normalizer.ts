const NON_ALPHANUMERIC_REGEX =
  /[^\p{L}\p{N}\s]/gu;

const MULTIPLE_SPACES_REGEX =
  /\s+/g;

export function normalizeText(
  text: string,
): string {
  if (!text) {
    return "";
  }

  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(
      NON_ALPHANUMERIC_REGEX,
      " ",
    )
    .replace(
      MULTIPLE_SPACES_REGEX,
      " ",
    )
    .trim();
}

export function normalizeWords(
  words: string[],
): string[] {
  const normalized =
    new Set<string>();

  for (const word of words) {
    const value =
      normalizeText(word);

    if (value.length > 0) {
      normalized.add(value);
    }
  }

  return [...normalized];
}