import {
  serviceRegistry,
} from "@/constants/serviceRegistry";

import type {
  AiBookingResolution,
  ResolveAiBookingInput,
} from "./types";

type ServiceEntry = {
  id: string;
  name: string;
};

function normalize(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(
  value: string,
): string[] {
  return normalize(value)
    .split(" ")
    .filter(
      (token) => token.length >= 3,
    );
}

function getServices(): ServiceEntry[] {
  const services: ServiceEntry[] = [];

  Object.values(
    serviceRegistry,
  ).forEach((entries) => {
    if (!Array.isArray(entries)) {
      return;
    }

    entries.forEach((entry) => {
      if (
        !entry ||
        typeof entry !== "object"
      ) {
        return;
      }

      const service =
        entry as Partial<ServiceEntry>;

      if (
        typeof service.id !== "string" ||
        typeof service.name !== "string"
      ) {
        return;
      }

      services.push({
        id: service.id,
        name: service.name,
      });
    });
  });

  return services;
}

/**
 * Temporary deterministic resolver.
 *
 * IMPORTANT:
 * This is intentionally isolated from the UI.
 * The implementation can later be replaced
 * by a Firebase Function / Gemini / OpenAI
 * resolver without changing the booking screens.
 */
export async function resolveAiBooking(
  input: ResolveAiBookingInput,
): Promise<AiBookingResolution> {
  const description =
    input.description.trim();

  if (description.length < 5) {
    throw new Error(
      "Please provide more details about the problem.",
    );
  }

  const tokens =
    tokenize(description);

  const services =
    getServices();

  let best:
    | {
        service: ServiceEntry;
        score: number;
      }
    | undefined;

  for (const service of services) {
    const serviceName =
      normalize(service.name);

    const serviceTokens =
      tokenize(service.name);

    let score = 0;

    for (const token of tokens) {
      if (
        serviceTokens.includes(token)
      ) {
        score += 5;
      }

      if (
        serviceName.includes(token)
      ) {
        score += 2;
      }
    }

    if (
      normalize(description).includes(
        serviceName,
      )
    ) {
      score += 10;
    }

    if (
      !best ||
      score > best.score
    ) {
      best = {
        service,
        score,
      };
    }
  }

  if (
    !best ||
    best.score <= 0
  ) {
    throw new Error(
      "We could not identify the required service.",
    );
  }

  const confidence =
    Math.min(
      0.99,
      Math.max(
        0.5,
        best.score / 20,
      ),
    );

  return {
    serviceId:
      best.service.id,

    serviceName:
      best.service.name,

    confidence,

    reason:
      "Matched the customer's description with the most relevant service.",

    suggestedNote:
      description,
  };
}