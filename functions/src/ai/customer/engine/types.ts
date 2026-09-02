import type {
  AvailableService,
  ChatMessage,
} from "../types";

import type {
  EstimatedCost,
  FixYourselfEngineResponse,
  FixYourselfResult,
  FollowUpQuestion,
} from "../fix-yourself.types";

/*
|--------------------------------------------------------------------------
| Re-export shared customer types
|--------------------------------------------------------------------------
*/

export type {
  AvailableService,
  ChatMessage,
  EstimatedCost,
};

export type DiagnosisResult =
  FixYourselfResult;

export type PlannerResponse =
  FixYourselfEngineResponse;

/*
|--------------------------------------------------------------------------
| Conversation
|--------------------------------------------------------------------------
*/

export interface ConversationMemory {
  problem: string;

  history: ChatMessage[];

  followUpCount: number;

  completed: boolean;
}

/*
|--------------------------------------------------------------------------
| Reasoning
|--------------------------------------------------------------------------
*/

export interface ReasoningRequest {
  problem: string;

  services: AvailableService[];

  messages: ChatMessage[];

  followUpCount?: number;

  forceDiagnosis?: boolean;
}

/*
|--------------------------------------------------------------------------
| Diagnosis
|--------------------------------------------------------------------------
*/

export interface DiagnosisResponse {
  completed: boolean;

  followUp?: FollowUpQuestion | null;

  diagnosis?: FixYourselfResult | null;
}

/*
|--------------------------------------------------------------------------
| Planner
|--------------------------------------------------------------------------
*/

export interface PlannerRequest {
  problem: string;

  services: AvailableService[];

  history?: ChatMessage[];

  followUpCount?: number;

  forceDiagnosis?: boolean;
}