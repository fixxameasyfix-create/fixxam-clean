export type AiRole =
  | "user"
  | "assistant"
  | "system";

export type AiMessageStatus =
  | "sending"
  | "sent"
  | "failed";

export interface AiMessage {
  id: string;

  role: AiRole;

  content: string;

  image?: string;

  createdAt: number;

  status?: AiMessageStatus;

  // ---------- UI ----------
  avatar?: string;

  displayName?: string;

  showAvatar?: boolean;

  showTimestamp?: boolean;

  typing?: boolean;
}

export interface QuickPrompt {
  id: string;

  title: string;

  prompt: string;

  icon: string;

  category?: string;
}

export interface AiConversation {
  id: string;

  title?: string;

  messages: AiMessage[];

  createdAt: number;

  updatedAt: number;
}