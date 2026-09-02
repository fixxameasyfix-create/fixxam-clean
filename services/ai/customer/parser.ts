import {
  AiResponse,
  DEFAULT_AI_RESPONSE,
} from "../shared/types";

export function parseCustomerAiResponse(
  response: AiResponse,
): AiResponse {
  return {
    ...DEFAULT_AI_RESPONSE,

    ...response,

    response: response.response.trim(),

    estimate: {
      ...DEFAULT_AI_RESPONSE.estimate,
      ...response.estimate,
    },

    recommendation: {
      ...DEFAULT_AI_RESPONSE.recommendation,
      ...response.recommendation,
    },

    followUpQuestions:
      response.followUpQuestions ?? [],
  };
}