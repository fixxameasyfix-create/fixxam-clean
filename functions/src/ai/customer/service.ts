import { generateContent } from "../shared/gemini";
import { validateRequest } from "../shared/validators";

import { searchServices } from "../service-search/search";

import { processHelpMeFixRequest } from "./engine/service";

import { SYSTEM_PROMPT } from "./prompt";
import { parseCustomerAiResponse } from "./parser";

import {
  buildConversationContext,
  buildGeminiRequest,
} from "./pipeline";

import {
  CustomerAIRequest,
  CustomerAIResponse,
} from "./types";

export async function processCustomerAiRequest(
  request: CustomerAIRequest,
): Promise<CustomerAIResponse> {
  validateRequest(request);

  const context =
  buildConversationContext(
    request.messages,
  );

const geminiRequest =
  buildGeminiRequest(
    context,
  );

const geminiResponse =
  await generateContent(
    geminiRequest,
  );

console.log(
  "GEMINI RESPONSE:",
  JSON.stringify(
    geminiResponse,
    null,
    2,
  ),
);


  const ai =
    parseCustomerAiResponse(
      geminiResponse,
    );

  switch (ai.action) {
    case "find_service": {
      const services =
        await searchServices(
          ai.normalizedQuery ?? "",
          {
            categoryId:
              ai.categoryId,
            subcategoryId:
              ai.subcategoryId,
          },
        );

      return {
        ...ai,
        services,
      };
    }

    case "fix_yourself": {
      const services =
        await searchServices(
          ai.normalizedQuery ?? "",
          {
            categoryId:
              ai.categoryId,
            subcategoryId:
              ai.subcategoryId,
          },
        );

     const lastFollowUps =
  request.messages.filter(
    (message) =>
      message.role === "assistant",
  ).length;

const engineResponse =
  await processHelpMeFixRequest({
    problem:
      ai.normalizedQuery ??
      request.messages.at(-1)?.content ??
      "",

    language: ai.language,

    services: services.map(
      (match) => ({
        id: match.service.id,
        name: match.service.name,
      }),
    ),

   messages: request.messages
  .filter(
    (
      message,
    ): message is {
      role: "user" | "assistant";
      content: string;
    } =>
      message.role !== "system",
  )
  .map((message) => ({
    role: message.role,
    content: message.content,
  })),

    followUpCount:
      Math.min(lastFollowUps, 2),
  });

return {
  ...ai,

  response:
    engineResponse.message,

  services,

  fixYourself:
    engineResponse,
}; 
}
    case "book_service":
    case "track_booking":
    case "emergency":
    case "general_chat":
    default:
      return ai;
  }
}