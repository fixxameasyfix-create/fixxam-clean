import { ChatMessage } from "../../shared/types";

export interface ConversationContext {
  language?: string;
  intent?: string;
  device?: string;
  categoryId?: string;
  subcategoryId?: string;
  urgency?: string;
  conversationId?: string;
  messages: ChatMessage[];
}

export function buildConversationContext(
  messages: ChatMessage[],
): ConversationContext {
  return {
    messages,
  };
}