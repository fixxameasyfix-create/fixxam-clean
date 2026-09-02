import {
  CustomerAIResponse,
  CustomerAction,
  Urgency,
} from "./types";

import { GeminiResponse } from "../shared/types";

const DEFAULT_RESPONSE: CustomerAIResponse = {
  action: "general_chat",
  response:
    "Sorry, I couldn't understand your request.",
  urgency: "normal",
  language: "en",
};

export function parseCustomerAiResponse(
  response: GeminiResponse,
): CustomerAIResponse {
  try {
    const parsed = JSON.parse(
      response.text,
    ) as CustomerAIResponse;

    return {
      action:
        parsed.action ??
        ("general_chat" as CustomerAction),

      response:
        parsed.response ??
        DEFAULT_RESPONSE.response,

      normalizedQuery:
        parsed.normalizedQuery,

      categoryId:
        parsed.categoryId,

      subcategoryId:
        parsed.subcategoryId,

      urgency:
        parsed.urgency ??
        ("normal" as Urgency),

      language:
        parsed.language ??
        "en",
    };
  } catch {
    return DEFAULT_RESPONSE;
  }
}