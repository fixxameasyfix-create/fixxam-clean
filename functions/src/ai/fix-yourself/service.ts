import { runPlanner } from "./engine";

import type {
  AvailableService,
  ChatMessage,
  FixYourselfEngineResponse,
  FixYourselfRequest,
} from "./types";

/* ============================================================
   PROCESS REQUEST
============================================================ */

export async function processFixYourselfRequest(
  request: FixYourselfRequest,
): Promise<FixYourselfEngineResponse> {
  if (
    !request.problem ||
    !request.problem.trim()
  ) {
    throw new Error(
      "Problem description is required.",
    );
  }

  if (
    !Array.isArray(
      request.services,
    )
  ) {
    throw new Error(
      "Available services are required.",
    );
  }

  return runPlanner({
    problem:
      request.problem.trim(),

    services:
      request.services,

    history:
      request.messages ?? [],

    followUpCount:
      request.followUpCount ?? 0,

    forceDiagnosis:
      request.forceDiagnosis ?? false,
  });
}

/* ============================================================
   ANALYZE FIX YOURSELF
============================================================ */

export async function analyzeFixYourself(
  problem: string,
  services: AvailableService[],
  messages: ChatMessage[] = [],
  followUpCount = 0,
  forceDiagnosis = false,
): Promise<FixYourselfEngineResponse> {
  return processFixYourselfRequest({
    problem,

    services,

    messages,

    followUpCount,

    forceDiagnosis,
  });
}