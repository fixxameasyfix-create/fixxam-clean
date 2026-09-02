import { HttpsError, onCall } from "firebase-functions/v2/https";

import { processCustomerAiRequest } from "./service";

export const customerAi = onCall(
  {
    timeoutSeconds: 60,
    memory: "512MiB",
    cors: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Authentication is required.",
      );
    }

    const data = request.data;

    if (!data) {
      throw new HttpsError(
        "invalid-argument",
        "Request data is required.",
      );
    }

    try {
      return await processCustomerAiRequest({
        userId: request.auth.uid,
        conversationId: data.conversationId,
        language: data.language,
        messages: data.messages,
      });
    } catch (error: any) {
      console.error("========== CUSTOMER AI ERROR ==========");
      console.error(error);
      console.error("MESSAGE:", error?.message);
      console.error("STACK:", error?.stack);
      console.error("======================================");

      throw new HttpsError(
        "internal",
        error?.message ?? "Failed to process AI request.",
      );
    }
  },
);