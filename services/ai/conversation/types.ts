import { Timestamp } from "firebase/firestore";

export type ConversationStatus =
  | "active"
  | "closed"
  | "archived";

export interface Conversation {
  id: string;
  title: string;
  language?: string;
  status: ConversationStatus;

  createdAt: Timestamp;
  updatedAt: Timestamp;

  lastMessage: string;
  lastMessageRole: "user" | "assistant";

  serviceCategory?: string;
}

export interface ConversationMessage {
  id: string;

  role: "user" | "assistant" | "system";

  content: string;

  createdAt: Timestamp;

  status:
    | "sending"
    | "sent"
    | "failed";

  attachments?: string[];

  metadata?: Record<string, unknown>;
}