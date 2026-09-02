
import type {
  HelpMeFixPlannerResult,
} from "./contracts";

import type {
  AvailableService,
  ChatMessage,
} from "../types";

export interface HelpMeFixPlannerRequest {
  problem: string;

  services: AvailableService[];

  messages?: ChatMessage[];

  followUpCount?: number;

  forceDiagnosis?: boolean;
}


const MAX_FOLLOW_UPS = 2;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function wordCount(value: string): number {
  return normalize(value)
    .split(/\s+/)
    .filter(Boolean).length;
}

export function planHelpMeFix(
  request: HelpMeFixPlannerRequest,
): HelpMeFixPlannerResult {
  if (request.forceDiagnosis) {
    return {
      enoughInformation: true,
      confidence: 100,
      reason: "Diagnosis forced.",
      nextQuestion: "",
    };
  }

  const followUps =
    request.followUpCount ?? 0;

  if (followUps >= MAX_FOLLOW_UPS) {
    return {
      enoughInformation: true,
      confidence: 80,
      reason:
        "Maximum follow-up questions reached.",
      nextQuestion: "",
    };
  }

  const latest =
    request.messages?.at(-1)?.content ??
    request.problem;

  if (wordCount(latest) < 5) {
    return {
      enoughInformation: false,
      confidence: 25,
      reason:
        "Not enough information.",
      nextQuestion:
        "Can you describe the problem in more detail? What exactly is happening?",
    };
  }

  return {
    enoughInformation: true,
    confidence: 90,
    reason:
      "Enough information collected.",
    nextQuestion: "",
  };
}