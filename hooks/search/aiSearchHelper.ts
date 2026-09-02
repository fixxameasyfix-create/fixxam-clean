import { httpsCallable } from "firebase/functions";

import { functions } from "@/firebase/config";

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
};

export type AiSearchHelperResult = {
  serviceId: string | null;
  confidence: number;
  language: AiSearchLanguage;
};

type AiSearchHelperRequest = {
  query: string;
  services: AiSearchService[];
};

const aiSearchHelperFunction = httpsCallable<
  AiSearchHelperRequest,
  AiSearchHelperResult
>(functions, "aiSearchHelper");

export async function aiSearchHelper(
  query: string,
  services: AiSearchService[],
): Promise<AiSearchHelperResult> {
  const cleanedQuery = query.trim();

  if (!cleanedQuery || services.length === 0) {
    return {
      serviceId: null,
      confidence: 0,
      language: "unknown",
    };
  }

  try {
    const response =
      await aiSearchHelperFunction({
        query: cleanedQuery,
        services: services.map((service) => ({
          id: service.id,
          name: service.name,
          description:
            service.description ?? "",
          category:
            service.category ?? "",
          subcategory:
            service.subcategory ?? "",
        })),
      });

    const result = response.data;

    const serviceExists =
      result.serviceId === null ||
      services.some(
        (service) =>
          service.id === result.serviceId,
      );

    if (!serviceExists) {
      return {
        serviceId: null,
        confidence: 0,
        language:
          result.language ?? "unknown",
      };
    }

    return {
      serviceId:
        result.serviceId,
      confidence:
        Math.max(
          0,
          Math.min(
            1,
            Number(
              result.confidence ?? 0,
            ),
          ),
        ),
      language:
        result.language ?? "unknown",
    };
  } catch (error) {
    console.error(
      "AI Search Helper Error:",
      error,
    );

    return {
      serviceId: null,
      confidence: 0,
      language: "unknown",
    };
  }
}