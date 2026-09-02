import {
  generateCustomerAIResponse,
} from "./gemini";

import {
  parseCustomerAIResponse,
} from "./parser";

import {
  matchCustomerService,
} from "./service-matcher";

import type {
  CustomerAiRequest,
  CustomerAiResult,
} from "./types";

const MAX_MESSAGES = 20;

const MAX_MESSAGE_LENGTH = 4000;

function normalizeMessages(
  messages: CustomerAiRequest["messages"],
): CustomerAiRequest["messages"] {
  return messages
    .filter(
      (message) =>
        message &&
        (
          message.role === "user" ||
          message.role === "assistant"
        ) &&
        typeof message.content ===
          "string",
    )
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content:
        message.content
          .trim()
          .slice(
            0,
            MAX_MESSAGE_LENGTH,
          ),
    }))
    .filter(
      (message) =>
        message.content.length > 0,
    );
}

function getLatestUserMessage(
  messages: CustomerAiRequest["messages"],
): string {
  for (
    let index = messages.length - 1;
    index >= 0;
    index -= 1
  ) {
    const message =
      messages[index];

    if (
      message.role === "user" &&
      message.content.trim()
    ) {
      return message.content
        .trim()
        .slice(
          0,
          MAX_MESSAGE_LENGTH,
        );
    }
  }

  return "";
}

export async function processCustomerAI(
  request: CustomerAiRequest,
): Promise<CustomerAiResult> {
  if (
    !request ||
    !Array.isArray(request.messages)
  ) {
    throw new Error(
      "Customer AI messages are required.",
    );
  }

  const messages =
    normalizeMessages(
      request.messages,
    );

  if (
    messages.length === 0
  ) {
    throw new Error(
      "At least one valid message is required.",
    );
  }

  const problem =
    getLatestUserMessage(
      messages,
    );

  if (!problem) {
    throw new Error(
      "A customer message is required.",
    );
  }

  const rawResponse =
    await generateCustomerAIResponse({
      problem,

      language:
        request.language,

      messages,
    });

  const result =
    parseCustomerAIResponse(
      rawResponse,
    );

  /*
   * Follow-up response:
   *
   * There is no service matching
   * until Gemini has completed the
   * diagnosis.
   */
  if (
    !result.completed ||
    !result.diagnosis
  ) {
    return result;
  }

  /*
   * Gemini only provides a human-readable
   * service name.
   *
   * The backend resolves the real
   * Firestore document ID.
   */
  const serviceMatch =
    await matchCustomerService(
      result.diagnosis,
    );

  return {
    ...result,

    diagnosis: {
      ...result.diagnosis,

      matchedServiceId:
        serviceMatch.matchedServiceId,

      matchedService:
        serviceMatch.matchedService ||
        result.diagnosis.matchedService,
    },
  };
}