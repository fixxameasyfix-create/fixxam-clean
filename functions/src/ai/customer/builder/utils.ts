import { PromptSection } from "./types";

export function normalizePrompt(
  value: string,
): string {
  return value
    .replace(/\r\n/g, "\n")
    .trim();
}

export function filterSections(
  sections: PromptSection[],
): PromptSection[] {
  return sections.filter(
    (section) =>
      section.enabled !== false &&
      section.content.trim().length > 0,
  );
}