import type {
  ChatMessage,
  ConversationMemory,
  DiagnosisResult,
} from "./types";

/**
 * Maximum number of follow-up questions
 * the planner should allow.
 */
export const MAX_FOLLOW_UPS = 2;

export function createMemory(
  problem: string,
  history: ChatMessage[] = [],
  followUpCount = 0,
): ConversationMemory {
  return {
    problem: problem.trim(),

    history: [...history],

    followUpCount,

    completed: false,
  };
}

export function addUserMessage(
  memory: ConversationMemory,
  content: string,
): ConversationMemory {
  return {
    ...memory,

    history: [
      ...memory.history,
      {
        role: "user",
        content: content.trim(),
      },
    ],
  };
}

export function addAssistantMessage(
  memory: ConversationMemory,
  content: string,
): ConversationMemory {
  return {
    ...memory,

    history: [
      ...memory.history,
      {
        role: "assistant",
        content: content.trim(),
      },
    ],
  };
}

export function increaseFollowUp(
  memory: ConversationMemory,
): ConversationMemory {
  return {
    ...memory,

    followUpCount:
      Math.min(
        memory.followUpCount + 1,
        MAX_FOLLOW_UPS,
      ),
  };
}

export function hasReachedLimit(
  memory: ConversationMemory,
): boolean {
  return (
    memory.followUpCount >=
    MAX_FOLLOW_UPS
  );
}

export function finishConversation(
  memory: ConversationMemory,
): ConversationMemory {
  return {
    ...memory,

    completed: true,
  };
}

export function getHistory(
  memory: ConversationMemory,
): ChatMessage[] {
  return memory.history;
}

export function getLatestUserMessage(
  memory: ConversationMemory,
): string {
  const message =
    [...memory.history]
      .reverse()
      .find(
        (item) =>
          item.role === "user",
      );

  return message?.content ?? "";
}

export function createCompletedMemory(
  problem: string,
  diagnosis: DiagnosisResult,
): ConversationMemory {
  return {
    problem: problem.trim(),

    history: [
      {
        role: "assistant",
        content:
          diagnosis.response,
      },
    ],

    followUpCount:
      MAX_FOLLOW_UPS,

    completed: true,
  };
}