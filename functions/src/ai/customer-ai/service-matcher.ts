import {
  getFirestore,
} from "firebase-admin/firestore";

import type {
  CustomerAiDiagnosis,
  CustomerAiServiceMatch,
} from "./types";

const SERVICES_COLLECTION =
  "services";

const MINIMUM_MATCH_SCORE = 0.5;

interface ServiceRecord {
  id: string;
  name: string;
}

function normalize(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function tokenize(
  value: string,
): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

function calculateScore(
  query: string,
  serviceName: string,
): number {
  const normalizedQuery =
    normalize(query);

  const normalizedService =
    normalize(serviceName);

  if (
    !normalizedQuery ||
    !normalizedService
  ) {
    return 0;
  }

  if (
    normalizedQuery ===
    normalizedService
  ) {
    return 1;
  }

  if (
    normalizedService.includes(
      normalizedQuery,
    ) ||
    normalizedQuery.includes(
      normalizedService,
    )
  ) {
    return 0.9;
  }

  const queryTokens =
    new Set(
      tokenize(normalizedQuery),
    );

  const serviceTokens =
    new Set(
      tokenize(normalizedService),
    );

  if (
    queryTokens.size === 0 ||
    serviceTokens.size === 0
  ) {
    return 0;
  }

  let matchedTokens = 0;

  for (
    const token of queryTokens
  ) {
    if (
      serviceTokens.has(token)
    ) {
      matchedTokens += 1;
    }
  }

  return (
    matchedTokens /
    Math.max(
      queryTokens.size,
      serviceTokens.size,
    )
  );
}

async function getActiveServices(): Promise<
  ServiceRecord[]
> {
  const snapshot =
    await getFirestore()
      .collection(
        SERVICES_COLLECTION,
      )
      .where(
        "active",
        "==",
        true,
      )
      .get();

  return snapshot.docs
    .map((doc) => {
      const data =
        doc.data();

      return {
        id: doc.id,

        name:
          typeof data.name ===
          "string"
            ? data.name.trim()
            : "",
      };
    })
    .filter(
      (service) =>
        service.id.length > 0 &&
        service.name.length > 0,
    );
}

export async function matchCustomerService(
  diagnosis: CustomerAiDiagnosis,
): Promise<CustomerAiServiceMatch> {
  const requestedService =
    diagnosis.matchedService.trim();

  if (!requestedService) {
    return {
      matchedServiceId: "",
      matchedService: "",
    };
  }

  const services =
    await getActiveServices();

  if (services.length === 0) {
    return {
      matchedServiceId: "",
      matchedService: "",
    };
  }

  let bestService:
    | ServiceRecord
    | null = null;

  let bestScore = 0;

  for (
    const service of services
  ) {
    const score =
      calculateScore(
        requestedService,
        service.name,
      );

    if (
      score > bestScore
    ) {
      bestScore = score;
      bestService = service;
    }
  }

  if (
    !bestService ||
    bestScore <
      MINIMUM_MATCH_SCORE
  ) {
    return {
      matchedServiceId: "",
      matchedService: "",
    };
  }

  return {
    matchedServiceId:
      bestService.id,

    matchedService:
      bestService.name,
  };
}