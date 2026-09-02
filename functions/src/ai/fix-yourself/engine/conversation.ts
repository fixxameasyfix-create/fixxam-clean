import type {
  ChatMessage,
  ConversationMemory,
} from "../../shared/diagnosis/types";

import {
  addAssistantMessage,
  addUserMessage,
  createMemory,
  getHistory,
  getLatestUserMessage,
  hasReachedLimit,
  increaseFollowUp,
} from "../../shared/diagnosis/memory";
/**
 * Start or resume a conversation.
 */
export function startConversation(
  problem: string,
  history: ChatMessage[] = [],
  followUpCount = 0,
): ConversationMemory {
  return createMemory(
    problem,
    history,
    followUpCount,
  );
}

/**
 * Save the customer's latest answer.
 */
export function saveUserAnswer(
  memory: ConversationMemory,
  answer: string,
): ConversationMemory {
  return addUserMessage(
    memory,
    answer,
  );
}

/**
 * Save the AI follow-up question
 * and increase the follow-up counter.
 */
export function saveAssistantQuestion(
  memory: ConversationMemory,
  question: string,
): ConversationMemory {
  const updated =
    increaseFollowUp(memory);

  return addAssistantMessage(
    updated,
    question,
  );
}

/**
 * Can another follow-up question be asked?
 */
export function canContinueConversation(
  memory: ConversationMemory,
): boolean {
  return !hasReachedLimit(
    memory,
  );
}

/**
 * Full conversation history.
 */
export function getConversationMessages(
  memory: ConversationMemory,
): ChatMessage[] {
  return getHistory(memory);
}

/**
 * Latest customer reply.
 */
export function getLatestCustomerReply(
  memory: ConversationMemory,
): string {
  return getLatestUserMessage(
    memory,
  );
}