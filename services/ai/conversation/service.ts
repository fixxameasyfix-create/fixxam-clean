import { ChatMessage } from "@/services/ai/shared/types";
import { askCustomerAi } from "@/services/ai/customer";

import {
  createConversation,
  getConversation,
  loadMessages,
  saveMessage,
} from "./repository";

import { ConversationMessage } from "./types";

export interface SendMessageInput {
  userId: string;
  conversationId?: string;
  content: string;
  language?: string;
}

export interface SendMessageResult {
  conversationId: string;
  reply: string;
}

export async function sendAiMessage({
  userId,
  conversationId,
  content,
  language,
}: SendMessageInput): Promise<SendMessageResult> {
  let id = conversationId;

  if (!id) {
    id = await createConversation(
      userId,
      content.substring(0, 40),
    );
  }

  const conversation = await getConversation(
    userId,
    id,
  );

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const userMessage: ConversationMessage = {
    id: Date.now().toString(),
    role: "user",
    content,
    createdAt: conversation.createdAt,
    status: "sent",
  };

  await saveMessage(
    userId,
    id,
    userMessage,
  );

  const history = await loadMessages(
    userId,
    id,
  );

  const messages: ChatMessage[] = history.map(
    (message) => ({
      role: message.role,
      content: message.content,
    }),
  );

  const response = await askCustomerAi({
    id,
    language,
    messages,
  });

  const assistantMessage: ConversationMessage = {
  id: (Date.now() + 1).toString(),
  role: "assistant",
  content: response.response,
  createdAt: conversation.createdAt,
  status: "sent",
};

return {
  conversationId: id,
  reply: response.response,
};
}