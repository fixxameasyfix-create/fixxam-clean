import type {
  CustomerAIResponse,
} from "../types";

export interface HelpMeFixPlannerResult {
  enoughInformation: boolean;

  confidence: number;

  reason: string;

  nextQuestion?: string;
}

export interface HelpMeFixDiagnosisResult {
  ai: CustomerAIResponse;
}

export interface HelpMeFixEngineResult {
  completed: boolean;

  response: string;

  confidence: number;

  followUpQuestion?: string;

  ai: CustomerAIResponse;
}