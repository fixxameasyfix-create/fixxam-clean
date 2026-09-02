import { Schema } from "./schema";

export type AiRole =
  | "system"
  | "user"
  | "assistant";

export interface ChatImage {
  mimeType: string;

  data: string;
}

export interface ChatMessage {
  role: AiRole;

  content: string;

  image?: ChatImage;
}

export interface CustomerAiRequest {
  conversationId?: string;

  userId: string;

  language?: string;

  messages: ChatMessage[];
}

export interface CustomerAiResponse {
  message: string;

  serviceCategory?: string;

  estimatedPrice?: string;

  estimatedTime?: string;

  repairDifficulty?:
    | "Easy"
    | "Medium"
    | "Hard";

  professionalRequired?: boolean;

  materials?: string[];

  tools?: string[];

  followUpQuestions?: string[];
}

export interface GeminiRequest {
  systemPrompt: string;

  messages: ChatMessage[];

  responseSchema?: Schema;

  responseMimeType?:
    | "application/json"
    | "text/plain";

  temperature?: number;

  topP?: number;

  topK?: number;

  maxOutputTokens?: number;
}

export interface GeminiResponse {
  text: string;
}