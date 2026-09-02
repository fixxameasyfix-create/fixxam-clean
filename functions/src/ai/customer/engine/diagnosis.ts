import { generateContent } from "../../shared/gemini";

import {
  buildConversationContext,
  buildGeminiRequest,
} from "../pipeline";

import {
  HELP_ME_FIX_PROMPT,
} from "../prompts/help-me-fix";

import {
  parseDiagnosisResponse,
} from "../../shared/diagnosis/parser";

import {
  isValidDiagnosisResponse,
} from "../../shared/diagnosis/validator";

import {
  formatDiagnosisResponse,
} from "../../shared/diagnosis/formatter";

import type {
  ChatMessage,
} from "../types";

export interface HelpMeFixDiagnosisRequest {
  problem: string;

  language?: string;

  messages?: ChatMessage[];
}

export async function generateHelpMeFixDiagnosis(
  request: HelpMeFixDiagnosisRequest,
) {
  const messages =
    request.messages?.length
      ? request.messages
      : [
          {
            role: "user" as const,
            content: request.problem,
          },
        ];

  const context =
    buildConversationContext(messages);

  const geminiRequest =
    buildGeminiRequest(
      context,
      HELP_ME_FIX_PROMPT,
    );

  console.log("========== GEMINI REQUEST ==========");
  console.log(JSON.stringify(geminiRequest, null, 2));

  const geminiResponse =
    await generateContent(
      geminiRequest,
    );

  console.log("========== GEMINI RAW ==========");
  console.log(geminiResponse);

  console.log("========== GEMINI TEXT ==========");
  console.log(geminiResponse.text);

  const diagnosis =
    parseDiagnosisResponse(
      geminiResponse.text,
    );

  console.log("========== PARSED DIAGNOSIS ==========");
  console.log(
    JSON.stringify(
      diagnosis,
      null,
      2,
    ),
  );

  if (
    !isValidDiagnosisResponse(
      diagnosis,
    )
  ) {
    throw new Error(
      "Invalid diagnosis response returned by AI.",
    );
  }

  const formatted =
    formatDiagnosisResponse(
      diagnosis,
    );

  console.log("========== FORMATTED DIAGNOSIS ==========");
  console.log(
    JSON.stringify(
      formatted,
      null,
      2,
    ),
  );

  console.log("================================");

  return formatted;
}