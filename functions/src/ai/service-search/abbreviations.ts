import { normalizeText } from "./normalizer";

const ABBREVIATIONS: Record<string, string> = {
  ac: "air conditioner",
  "a/c": "air conditioner",

  gen: "generator",
  genset: "generator",

  tv: "television",
  smarttv: "smart television",

  fridge: "refrigerator",
  freezer: "refrigerator",

  wc: "toilet",

  pop: "plaster of paris",

  dstv: "satellite television",

  inverter: "power inverter",

  borehole: "water borehole",

  pvc: "pvc pipe",

  ups: "uninterruptible power supply",
};

export function expandAbbreviations(
  words: string[],
): string[] {
  const expanded = new Set<string>();

  for (const word of words) {
    const normalized = normalizeText(word);

    if (!normalized) {
      continue;
    }

    expanded.add(normalized);

    const replacement =
      ABBREVIATIONS[normalized];

    if (replacement) {
      expanded.add(
        normalizeText(replacement),
      );
    }
  }

  return [...expanded];
}