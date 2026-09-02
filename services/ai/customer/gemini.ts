import { getFunctions, httpsCallable } from "firebase/functions";

import { app } from "@/firebase/config";

import {
  ChatConversation,
  AiResponse,
} from "../shared/types";

const functions = getFunctions(app);

const customerAi = httpsCallable<
  ChatConversation,
  AiResponse
>(
  functions,
  "customerAi",
);

export async function askCustomerAi(
  conversation: ChatConversation,
): Promise<AiResponse> {
  const result = await customerAi(conversation);

  return result.data;
}