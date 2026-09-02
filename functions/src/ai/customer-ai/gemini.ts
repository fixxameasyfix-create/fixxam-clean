import {
  GoogleGenAI,
} from "@google/genai";

import {
  CUSTOMER_AI_SYSTEM_PROMPT,
} from "./prompt";

import type {
  CustomerAiMessage,
} from "./types";

const MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  "gemini-3.5-flash";

const MAX_MESSAGES = 20;

const MAX_MESSAGE_LENGTH = 4000;

export interface GenerateCustomerAIRequest {
  problem: string;

  language?: string;

  messages?: CustomerAiMessage[];
}

/**
 * Creates the Gemini client lazily.
 *
 * Important:
 * Do not initialize Gemini at module-load time.
 * Firebase needs to load/discover functions before
 * the function is actually invoked.
 */
function getGeminiClient(): GoogleGenAI {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function cleanText(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function cleanMessages(
  messages: CustomerAiMessage[] = [],
): CustomerAiMessage[] {
  return messages
    .filter(
      (message) =>
        message &&
        (
          message.role ===
            "user" ||
          message.role ===
            "assistant"
        ) &&
        typeof message.content ===
          "string",
    )
    .slice(-MAX_MESSAGES)
    .map(
      (message) => ({
        role: message.role,

        content:
          message.content
            .trim()
            .slice(
              0,
              MAX_MESSAGE_LENGTH,
            ),
      }),
    )
    .filter(
      (message) =>
        message.content.length > 0,
    );
}

function buildConversation(
  request: GenerateCustomerAIRequest,
): string {
  const messages =
    cleanMessages(
      request.messages,
    );

  const language =
    cleanText(
      request.language,
    ) || "English";

  const history =
    messages
      .map(
        (message) =>
          `${message.role.toUpperCase()}: ${message.content}`,
      )
      .join("\n");

  return [
    `CUSTOMER LANGUAGE: ${language}`,

    "",

    "CONVERSATION:",

    history,

    "",

    "CURRENT CUSTOMER PROBLEM:",

    request.problem
      .trim()
      .slice(
        0,
        MAX_MESSAGE_LENGTH,
      ),
  ].join("\n");
}

export async function generateCustomerAIResponse(
  request: GenerateCustomerAIRequest,
): Promise<string> {
  const problem =
    cleanText(
      request.problem,
    );

  if (!problem) {
    throw new Error(
      "Customer problem is required.",
    );
  }

  const contents =
    buildConversation({
      ...request,
      problem,
    });

  try {
    const ai =
      getGeminiClient();

    const response =
      await ai.models.generateContent({
        model: MODEL,

        contents,

        config: {
          systemInstruction:
            CUSTOMER_AI_SYSTEM_PROMPT,

          temperature: 0.2,

          responseMimeType:
            "application/json",

          maxOutputTokens: 2048,
        },
      });

    const text =
      cleanText(
        response.text,
      );

    if (!text) {
      throw new Error(
        "Gemini returned an empty response.",
      );
    }

    return text;
  } catch (error) {
    console.error(
      "========== CUSTOMER AI GEMINI ERROR ==========",
    );

    console.error(error);

    console.error(
      "===============================================",
    );

    throw new Error(
      "Unable to generate customer AI response.",
    );
  }
}