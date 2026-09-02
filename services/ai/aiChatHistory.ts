import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  AiConversation,
  AiMessage,
} from "@/components/ai/types";

/* ==============================================================
   CONSTANTS
============================================================== */

const HISTORY_STORAGE_KEY =
  "@fixxam/ai-chat-history";

const MAX_HISTORY = 5;

/* ==============================================================
   HELPERS
============================================================== */

function createConversationTitle(
  messages: AiMessage[],
): string {
  const firstUserMessage =
    messages.find(
      (message) =>
        message.role === "user" &&
        message.content.trim().length > 0,
    );

  if (!firstUserMessage) {
    return "New Chat";
  }

  const title =
    firstUserMessage.content
      .trim()
      .replace(/\s+/g, " ");

  if (title.length <= 45) {
    return title;
  }

  return `${title.slice(0, 45).trim()}…`;
}

/* ==============================================================
   VALIDATE MESSAGE
============================================================== */

function isValidMessage(
  value: unknown,
): value is AiMessage {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const message =
    value as Partial<AiMessage>;

  return (
    typeof message.id === "string" &&
    typeof message.role === "string" &&
    typeof message.content === "string" &&
    typeof message.createdAt === "number"
  );
}

/* ==============================================================
   VALIDATE CONVERSATION
============================================================== */

function isValidConversation(
  value: unknown,
): value is AiConversation {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const conversation =
    value as Partial<AiConversation>;

  return (
    typeof conversation.id === "string" &&
    typeof conversation.createdAt ===
      "number" &&
    typeof conversation.updatedAt ===
      "number" &&
    Array.isArray(
      conversation.messages,
    ) &&
    conversation.messages.every(
      isValidMessage,
    )
  );
}

/* ==============================================================
   GET HISTORY
============================================================== */

export async function getAiChatHistory(): Promise<
  AiConversation[]
> {
  try {
    const stored =
      await AsyncStorage.getItem(
        HISTORY_STORAGE_KEY,
      );

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isValidConversation)
      .sort(
        (a, b) =>
          b.updatedAt -
          a.updatedAt,
      )
      .slice(0, MAX_HISTORY);
  } catch (error) {
    console.error(
      "GET_AI_CHAT_HISTORY_ERROR:",
      error,
    );

    return [];
  }
}

/* ==============================================================
   SAVE CHAT
============================================================== */

export async function saveAiChat(
  messages: AiMessage[],
): Promise<AiConversation | null> {
  const validMessages =
    messages.filter(
      (message) =>
        message.role === "user" ||
        message.role === "assistant",
    );

  if (validMessages.length === 0) {
    return null;
  }

  try {
    const history =
      await getAiChatHistory();

    const now = Date.now();

    const conversation: AiConversation =
      {
        id: `chat_${now}_${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        title:
          createConversationTitle(
            validMessages,
          ),

        messages:
          validMessages,

        createdAt:
          validMessages[0]
            ?.createdAt ?? now,

        updatedAt: now,
      };

    const nextHistory = [
      conversation,
      ...history,
    ].slice(0, MAX_HISTORY);

    await AsyncStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(
        nextHistory,
      ),
    );

    return conversation;
  } catch (error) {
    console.error(
      "SAVE_AI_CHAT_ERROR:",
      error,
    );

    throw error;
  }
}

/* ==============================================================
   DELETE CHAT
============================================================== */

export async function deleteAiChat(
  conversationId: string,
): Promise<void> {
  const id =
    conversationId.trim();

  if (!id) {
    return;
  }

  try {
    const history =
      await getAiChatHistory();

    const nextHistory =
      history.filter(
        (conversation) =>
          conversation.id !== id,
      );

    await AsyncStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(
        nextHistory,
      ),
    );
  } catch (error) {
    console.error(
      "DELETE_AI_CHAT_ERROR:",
      error,
    );

    throw error;
  }
}

/* ==============================================================
   CLEAR ALL HISTORY
============================================================== */

export async function clearAiChatHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      HISTORY_STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "CLEAR_AI_CHAT_HISTORY_ERROR:",
      error,
    );

    throw error;
  }
}

/* ==============================================================
   GET SINGLE CHAT
============================================================== */

export async function getAiChatById(
  conversationId: string,
): Promise<AiConversation | null> {
  const id =
    conversationId.trim();

  if (!id) {
    return null;
  }

  const history =
    await getAiChatHistory();

  return (
    history.find(
      (conversation) =>
        conversation.id === id,
    ) ?? null
  );
}