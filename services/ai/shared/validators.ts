import { ChatMessage } from "./types";

export function validateMessages(
  messages: ChatMessage[],
): boolean {
  return (
    Array.isArray(messages) &&
    messages.every(
      (message) =>
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
  );
}

export function validateLanguage(
  language?: string,
): boolean {
  if (!language) {
    return true;
  }

  return language.trim().length > 0;
}