import type {
  AvailableService,
  ChatMessage,
  EstimatedCost,
  FixYourselfEngineResponse,
  FixYourselfResult,
  FollowUpQuestion,
} from "../types";

/* ============================================================
   RE-EXPORT SHARED TYPES
============================================================ */

export type {
  AvailableService,
  ChatMessage,
  EstimatedCost,
  FixYourselfEngineResponse,
  FixYourselfResult,
  FollowUpQuestion,
};

/* ============================================================
   DIAGNOSIS RESULT
============================================================ */

/**
 * Internal engine alias.
 *
 * Keeps formatter, matcher, safety and planner
 * using one consistent diagnosis type.
 */
export type DiagnosisResult =
  FixYourselfResult;

/* ============================================================
   CONVERSATION MEMORY
============================================================ */

export interface ConversationMemory {
  problem: string;

  history: ChatMessage[];

  followUpCount: number;

  completed: boolean;
}

/* ============================================================
   REASONING REQUEST
============================================================ */

export interface ReasoningRequest {
  problem: string;

  services: AvailableService[];

  messages: ChatMessage[];

  followUpCount?: number;

  forceDiagnosis?: boolean;
}

/* ============================================================
   REASONING RESULT
============================================================ */

export interface ReasoningResult {
  enoughInformation: boolean;

  confidence: number;

  reason: string;

  nextQuestion: string;
}

/* ============================================================
   DIAGNOSIS RESPONSE
============================================================ */

export interface DiagnosisResponse {
  status:
    | "follow_up"
    | "completed"
    | "understanding_failed";

  completed: boolean;

  message: string;

  followUp:
    | FollowUpQuestion
    | null;

  diagnosis:
    | FixYourselfResult
    | null;

  understandingFailed:
    | {
        message: string;
        reason: string;
      }
    | null;
}

/* ============================================================
   PLANNER REQUEST
============================================================ */

export interface PlannerRequest {
  problem: string;

  services: AvailableService[];

  history?: ChatMessage[];

  followUpCount?: number;

  forceDiagnosis?: boolean;
}

/* ============================================================
   PLANNER RESPONSE
============================================================ */

export type PlannerResponse =
  FixYourselfEngineResponse;