import {
  AIEngineOptions,
  AIRetryResult,
} from "./types";

import { retryAI } from "./retry";

import {
  logParsedResponse,
  logRawResponse,
} from "./logger";

export async function executeAI<T>(
  options: AIEngineOptions<T>,
): Promise<AIRetryResult<T>> {
  return retryAI({
    maxAttempts:
      options.maxAttempts,

    fallback:
      options.fallback,

    validate:
      options.validate,

    execute: async () => {
      const result =
        await options.execute();

      logRawResponse(
        result,
      );

      logParsedResponse(
        result,
      );

      return result;
    },
  });
}