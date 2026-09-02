import { ChatMessage } from "./types";

export function trimConversation(
  messages: ChatMessage[],
  limit: number,
): ChatMessage[] {
  if (messages.length <= limit) {
    return messages;
  }

  return messages.slice(-limit);
}

export function hasUserMessage(
  messages: ChatMessage[],
): boolean {
  return messages.some(
    (message) => message.role === "user",
  );
}