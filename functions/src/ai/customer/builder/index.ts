import {
  PromptBuilderOptions,
} from "./types";

import {
  filterSections,
  normalizePrompt,
} from "./utils";

export function buildPrompt({
  sections,
  separator = "\n\n",
}: PromptBuilderOptions): string {
  return filterSections(sections)
    .map((section) =>
      normalizePrompt(section.content),
    )
    .join(separator)
    .trim();
}