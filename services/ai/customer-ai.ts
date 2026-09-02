import { getFunctions, httpsCallable } from "firebase/functions";

import { app } from "@/firebase/config";

export type CustomerAiMessage = {
  role: "user" | "assistant";
  content: string;
  image?: {
    mimeType: string;
    data: string;
  };
};

export type CustomerAiRequest = {
  messages: CustomerAiMessage[];
  language?: string;
};

export type CustomerAiFollowUp = {
  question: string;
  reason: string;
};

export type CustomerAiDiagnosis = {
  response: string;
  matchedServiceId: string;
  matchedService: string;
  confidence: number;
  causes: string[];
  steps: string[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  estimatedTime: string;
  safety: string;
  professionalRequired: boolean;
  emergency: boolean;
};

export type CustomerAiResult = {
  completed: boolean;
  message: string;
  followUp: CustomerAiFollowUp | null;
  diagnosis: CustomerAiDiagnosis | null;
};

const functions = getFunctions(app);

const customerAiV2 = httpsCallable<
  CustomerAiRequest,
  CustomerAiResult
>(
  functions,
  "customerAiV2",
);

export async function askCustomerAiV2(
  request: CustomerAiRequest,
): Promise<CustomerAiResult> {
  if (
    !request.messages.length
  ) {
    throw new Error(
      "At least one message is required.",
    );
  }

  const result =
    await customerAiV2(request);

  return result.data;
}