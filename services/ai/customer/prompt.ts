import { buildPrompt } from "../../../functions/src/ai/customer/builder";

import { DEFAULT_PROMPT_SECTIONS } from "../../../functions/src/ai/customer/builder/sections";

export const SYSTEM_PROMPT = buildPrompt({
  sections: DEFAULT_PROMPT_SECTIONS,
});