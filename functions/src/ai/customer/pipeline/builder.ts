import { SYSTEM_PROMPT } from "../prompt";

import { ConversationContext } from "./context";

export interface GeminiPipelineRequest {
  systemPrompt: string;
  messages: ConversationContext["messages"];
}

export function buildGeminiRequest(
  context: ConversationContext,
  systemPrompt = SYSTEM_PROMPT,
): GeminiPipelineRequest {
  return {
    systemPrompt,
    messages: context.messages,
  };
}