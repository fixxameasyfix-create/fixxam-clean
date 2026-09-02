import { AiMessage } from "@/components/ai/types";

import { ConversationMessage } from "./types";

export function toAiMessage(
  message: ConversationMessage,
): AiMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toMillis(),
    status: message.status,
  };
}

export function toConversationMessage(
  message: AiMessage,
): ConversationMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt as never,
    status: message.status ?? "sent",
    attachments: [],
    metadata: {},
  };
}