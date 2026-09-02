import { CONTEXT_PROMPT } from "./context";
import { CONTINUITY_PROMPT } from "./continuity";
import { CONVERSATION_PROMPT } from "./conversation";
import { FOLLOWUP_PROMPT } from "./followup";

export const MEMORY_PROMPT = [
  CONTEXT_PROMPT,
  CONTINUITY_PROMPT,
  CONVERSATION_PROMPT,
  FOLLOWUP_PROMPT,
].join("\n\n");