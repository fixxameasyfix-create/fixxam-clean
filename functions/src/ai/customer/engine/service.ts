import {
  planHelpMeFix,
} from "./planner";

import {
  generateHelpMeFixDiagnosis,
} from "./diagnosis";

import {
  formatDiagnosisResponse,
} from "../../shared/diagnosis/formatter";

import {
  matchService,
} from "../../shared/diagnosis/matcher";

import type {
  AvailableService,
  ChatMessage,
} from "../types";

import type {
  DiagnosisResponse,
} from "../../shared/diagnosis/models";

/* ============================================================
   REQUEST
============================================================ */

export interface HelpMeFixRequest {
  problem: string;

  language?: string;

  services: AvailableService[];

  messages?: ChatMessage[];

  followUpCount?: number;

  forceDiagnosis?: boolean;
}

/* ============================================================
   SAFE SERVICE ID
============================================================ */

function safeServiceId(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  const normalized =
    value.trim();

  if (
    !normalized ||
    normalized ===
      "[object Object]" ||
    normalized.toLowerCase() ===
      "object-object"
  ) {
    return "";
  }

  return normalized;
}

/* ============================================================
   SAFE SERVICE NAME
============================================================ */

function safeServiceName(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  const normalized =
    value.trim();

  if (
    !normalized ||
    normalized ===
      "[object Object]" ||
    normalized.toLowerCase() ===
      "object-object"
  ) {
    return "";
  }

  return normalized;
}

/* ============================================================
   PROCESS HELP ME FIX
============================================================ */

export async function processHelpMeFixRequest(
  request: HelpMeFixRequest,
): Promise<DiagnosisResponse> {
  /*
   * ----------------------------------------------------------
   * PLAN
   * ----------------------------------------------------------
   */

  const plan =
    planHelpMeFix({
      problem:
        request.problem,

      services:
        request.services,

      messages:
        request.messages ?? [],

      followUpCount:
        request.followUpCount ?? 0,

      forceDiagnosis:
        request.forceDiagnosis === true,
    });

  /*
   * ----------------------------------------------------------
   * FOLLOW-UP REQUIRED
   * ----------------------------------------------------------
   */

  if (
    !plan.enoughInformation
  ) {
    const question =
      plan.nextQuestion?.trim() ||
      "Please provide more information about the problem.";

    const reason =
      plan.reason?.trim() ||
      "More information is needed to improve the diagnosis.";

    return {
      status: "follow_up",

      completed: false,

      message:
        "I need one more detail before I can diagnose the problem.",

      followUp: {
        question,

        reason,
      },

      diagnosis: null,

      understandingFailed:
        null,
    };
  }

  /*
   * ----------------------------------------------------------
   * GENERATE DIAGNOSIS
   * ----------------------------------------------------------
   */

  const rawDiagnosis =
    await generateHelpMeFixDiagnosis({
      problem:
        request.problem,

      language:
        request.language,

      messages:
        request.messages ?? [],
    });

  /*
   * ----------------------------------------------------------
   * FORMAT DIAGNOSIS
   * ----------------------------------------------------------
   */

  const diagnosis =
    formatDiagnosisResponse(
      rawDiagnosis,
    );

  console.log(
    "========== DIAGNOSIS BEFORE MATCH ==========",
  );

  console.log(
    JSON.stringify(
      diagnosis,
      null,
      2,
    ),
  );

  /*
   * ----------------------------------------------------------
   * MATCH SERVICE
   * ----------------------------------------------------------
   */

  const matched =
    matchService(
      diagnosis,
      request.services,
    );

  console.log(
    "========== SERVICE MATCH ==========",
  );

  console.log(
    JSON.stringify(
      {
        found:
          matched.found,

        serviceId:
          matched.service?.id,

        serviceName:
          matched.service?.name,

        confidence:
          matched.confidence,
      },
      null,
      2,
    ),
  );

  /*
   * ----------------------------------------------------------
   * SAFE MATCHED SERVICE
   * ----------------------------------------------------------
   */

  const matchedServiceId =
    safeServiceId(
      matched.service?.id,
    );

  const matchedService =
    safeServiceName(
      matched.service?.name,
    ) ||
    safeServiceName(
      diagnosis.matchedService,
    );

  console.log(
    "========== FINAL SERVICE ==========",
  );

  console.log(
    JSON.stringify(
      {
        matchedServiceId,

        matchedService,
      },
      null,
      2,
    ),
  );

  /*
   * ----------------------------------------------------------
   * COMPLETED RESPONSE
   * ----------------------------------------------------------
   */

  return {
    status: "completed",

    completed: true,

    message:
      diagnosis.response,

    followUp: null,

    diagnosis: {
      ...diagnosis,

      matchedServiceId,

      matchedService,
    },

    understandingFailed:
      null,
  };
}