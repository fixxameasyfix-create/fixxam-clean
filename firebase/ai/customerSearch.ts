import {
  httpsCallable,
  type HttpsCallableResult,
} from "firebase/functions";

import {
  functions,
} from "@/firebase/config";

export type AiSearchLanguage =
  | "english"
  | "hausa"
  | "yoruba"
  | "igbo"
  | "pidgin"
  | "unknown";

export type AiSearchService = {
  id: string;

  name: string;

  description?: string;

  category?: string;

  subcategory?: string;

  aliases?: string[];

  keywords?: string[];

  tags?: string[];
};

export type AiSearchResult = {
  serviceId: string | null;

  confidence: number;

  language: AiSearchLanguage;
};

type AiSearchRequest = {
  query: string;

  services: AiSearchService[];
};

const aiSearchHelper =
  httpsCallable<
    AiSearchRequest,
    AiSearchResult
  >(
    functions,
    "aiSearchHelper",
  );

export async function matchCustomerService(
  query: string,
  services: AiSearchService[],
): Promise<AiSearchResult> {
  const cleanedQuery =
    query.trim();

  if (
    !cleanedQuery ||
    services.length === 0
  ) {
    return {
      serviceId: null,
      confidence: 0,
      language: "unknown",
    };
  }

  try {
    const response:
      HttpsCallableResult<AiSearchResult> =
      await aiSearchHelper({
        query: cleanedQuery,
        services,
      });

    return response.data;
  } catch (error) {
    console.error(
      "Customer AI search error:",
      error,
    );

    throw error;
  }
}