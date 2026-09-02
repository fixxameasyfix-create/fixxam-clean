export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  conversationId?: string;
  messages: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  conversationId?: string;
}

export interface DiagnoseImageRequest {
  imageUri: string;
  prompt?: string;
}

export interface DiagnoseImageResponse {
  message: string;
}