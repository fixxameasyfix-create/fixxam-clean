export type AiRole =
  | "system"
  | "user"
  | "assistant";

export interface ChatMessage {
  role: AiRole;

  content: string;

  image?: {
    mimeType: string;

    data: string;
  };
}

export interface ChatConversation {
  id?: string;

  language?: string;

  messages: ChatMessage[];
}

export type AiAction =
  | "find_service"
  | "fix_yourself"
  | "book_service"
  | "track_booking"
  | "emergency"
  | "general_chat";

export type AiUrgency =
  | "low"
  | "normal"
  | "high";

export type RepairDifficulty =
  | "Easy"
  | "Medium"
  | "Hard";

export interface AiEstimate {
  minimumPrice?: number;

  maximumPrice?: number;

  currency: "NGN";

  estimatedTime?: string;

  difficulty?: RepairDifficulty;

  confidence?: number;
}

export interface AiRecommendation {
  professionalRequired: boolean;

  serviceCategory?: string;

  materials: string[];

  tools: string[];

  maintenanceTips: string[];

  marketplaceItems: string[];
}

export interface AiFollowUpQuestion {
  id: string;

  question: string;
}

export interface AiResponse {
  action: AiAction;

  response: string;

  normalizedQuery: string;

  language: string;

  categoryId: string | null;

  subcategoryId: string | null;

  urgency: AiUrgency;

  estimate: AiEstimate;

  recommendation: AiRecommendation;

  followUpRequired: boolean;

  followUpQuestions: AiFollowUpQuestion[];

  showWorkerButton: boolean;

  buttonLabel: string;
}

export const DEFAULT_AI_RESPONSE: AiResponse = {
  action: "general_chat",

  response: "",

  normalizedQuery: "",

  language: "en",

  categoryId: null,

  subcategoryId: null,

  urgency: "normal",

  estimate: {
    minimumPrice: undefined,
    maximumPrice: undefined,
    currency: "NGN",
    estimatedTime: undefined,
    difficulty: undefined,
    confidence: undefined,
  },

  recommendation: {
    professionalRequired: false,
    serviceCategory: undefined,
    materials: [],
    tools: [],
    maintenanceTips: [],
    marketplaceItems: [],
  },

  followUpRequired: false,

  followUpQuestions: [],

  showWorkerButton: false,

  buttonLabel: "",
};