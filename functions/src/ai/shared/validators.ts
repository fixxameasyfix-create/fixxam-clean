import {
  CustomerAiRequest,
  ChatMessage,
} from "./types";


export function validateMessage(
  message: ChatMessage,
): void {
  const hasText =
    message.content.trim().length > 0;

  const hasImage =
    !!message.image;

  if (!hasText && !hasImage) {
    throw new Error(
      "Message must contain text or image.",
    );
  }

  if (message.content.length > 2000) {
    throw new Error(
      "Message is too long.",
    );
  }
}

export function validateRequest(
  request: CustomerAiRequest,
): void {
  if (!request.userId) {
    throw new Error("User ID is required.");
  }

  if (!request.messages.length) {
    throw new Error("At least one message is required.");
  }

  request.messages.forEach(validateMessage);
}