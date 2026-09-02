export type CustomerAiLanguage =
  | "en"
  | "ha";

export type CustomerAiAction =
  | "follow_up"
  | "diagnosis";

export type CustomerAiRole =
  | "user"
  | "assistant";

export interface CustomerAiMessage {
  role: CustomerAiRole;
  content: string;
}

export interface CustomerAiRequest {
  conversationId?: string;
  language?: CustomerAiLanguage;
  messages: CustomerAiMessage[];
}

export interface CustomerAiCost {
  min: number;
  max: number;
  currency: "NGN";
}

export interface CustomerAiFollowUp {
  question: string;
  reason: string;
}

export interface CustomerAiDiagnosis {
  response: string;

  /*
   * This is intentionally empty until
   * the backend resolves the real service.
   */
  matchedServiceId: string;

  /*
   * Human-readable service name only.
   */
  matchedService: string;

  confidence: number;

  causes: string[];

  steps: string[];

  estimatedCost: CustomerAiCost;

  estimatedTime: string;

  safety: string;

  professionalRequired: boolean;

  emergency: boolean;
}

export interface CustomerAiResult {
  completed: boolean;

  message: string;

  followUp:
    | CustomerAiFollowUp
    | null;

  diagnosis:
    | CustomerAiDiagnosis
    | null;
}

export interface CustomerAiServiceMatch {
  matchedServiceId: string;

  matchedService: string;
}