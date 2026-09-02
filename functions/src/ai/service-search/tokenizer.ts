import { expandAbbreviations } from "./abbreviations";
import { normalizeText } from "./normalizer";
import { SearchToken } from "./types";

const MIN_TOKEN_LENGTH = 2;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "of",
  "for",
  "to",
  "in",
  "on",
  "at",
  "with",
  "my",
  "your",
  "our",
  "his",
  "her",
  "their",

  // Hausa
  "na",
  "da",
  "ne",
  "ce",
  "ta",
  "ya",
  "ina",
  "mai",
  "akan",

  // Yoruba
  "ati",
  "ni",
  "si",

  // Igbo
  "na",
  "ndi",

  // Pidgin
  "de",
  "wey",
]);

export function tokenize(
  text: string,
): SearchToken[] {
  const normalized =
    normalizeText(text);

  if (!normalized) {
    return [];
  }

  const words = normalized
    .split(" ")
    .map((word) => word.trim())
    .filter(
      (word) =>
        word.length >=
          MIN_TOKEN_LENGTH &&
        !STOP_WORDS.has(word),
    );

  const expanded =
    expandAbbreviations(
      words,
    );

  const unique = [
    ...new Set(expanded),
  ];

  return unique.map(
    (word) => ({
      value: word,
      normalized: word,
    }),
  );
}

export function extractTokenValues(
  tokens: SearchToken[],
): string[] {
  return tokens.map(
    (token) =>
      token.normalized,
  );
}