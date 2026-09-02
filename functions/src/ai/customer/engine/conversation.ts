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

export function saveUserAnswer(
  memory: ConversationMemory,
  answer: string,
): ConversationMemory {
  return addUserMessage(
    memory,
    answer,
  );
}

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

export function canContinueConversation(
  memory: ConversationMemory,
): boolean {
  return !hasReachedLimit(
    memory,
  );
}

export function getConversationMessages(
  memory: ConversationMemory,
): ChatMessage[] {
  return getHistory(memory);
}

export function getLatestCustomerReply(
  memory: ConversationMemory,
): string {
  return getLatestUserMessage(
    memory,
  );
}