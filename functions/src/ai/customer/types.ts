import type {
  FixYourselfEngineResponse,
} from "./fix-yourself.types";

import type {
  ServiceMatch,
} from "../service-search/types";

export type CustomerAction =
  | "find_service"
  | "fix_yourself"
  | "book_service"
  | "track_booking"
  | "emergency"
  | "general_chat";

export type Urgency =
  | "low"
  | "normal"
  | "high"
  | "emergency";

export interface CustomerImage {
  mimeType: string;

  data: string;
}

export interface CustomerMessage {
  role:
    | "system"
    | "user"
    | "assistant";

  content: string;

  image?: CustomerImage;
}

export interface CustomerAIRequest {
  conversationId?: string;

  userId: string;

  language?: string;

  messages: CustomerMessage[];
}

export interface CustomerAIResponse {
  action: CustomerAction;

  response: string;

  normalizedQuery?: string;

  categoryId?: string;

  subcategoryId?: string;

  urgency: Urgency;

  language: string;

  services?: ServiceMatch[];

  fixYourself?: FixYourselfEngineResponse;
} // <-- Wannan ya ɓace

export interface AvailableService {
  id: string;
  name: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}