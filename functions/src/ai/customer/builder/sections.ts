import { PromptSection } from "./types";

import { KNOWLEDGE_PROMPT } from "../prompts/knowledge";
import { LANGUAGE_PROMPT } from "../prompts/language";
import { MEMORY_PROMPT } from "../prompts/memory";
import { MISSION_PROMPT } from "../prompts/mission";
import { NIGERIA_PROMPT } from "../prompts/nigeria";
import { OUTPUT_PROMPT } from "../prompts/output";
import { PERSONALITY_PROMPT } from "../prompts/personality";
import { REASONING_PROMPT } from "../prompts/reasoning";
import { RESPONSE_PROMPT } from "../prompts/response";
import { SAFETY_PROMPT } from "../prompts/safety";

export const DEFAULT_PROMPT_SECTIONS: PromptSection[] =
  [
    {
      name: "personality",
      content: PERSONALITY_PROMPT,
    },
    {
      name: "mission",
      content: MISSION_PROMPT,
    },
    {
      name: "nigeria",
      content: NIGERIA_PROMPT,
    },
    {
      name: "language",
      content: LANGUAGE_PROMPT,
    },
    {
      name: "safety",
      content: SAFETY_PROMPT,
    },
    {
      name: "knowledge",
      content: KNOWLEDGE_PROMPT,
    },
    {
      name: "memory",
      content: MEMORY_PROMPT,
    },
    {
      name: "reasoning",
      content: REASONING_PROMPT,
    },
    {
      name: "response",
      content: RESPONSE_PROMPT,
    },
    {
      name: "output",
      content: OUTPUT_PROMPT,
    },
  ];