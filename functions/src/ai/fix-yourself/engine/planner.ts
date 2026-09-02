import type {
  PlannerRequest,
  PlannerResponse,
  DiagnosisResult,
  DiagnosisResponse,
} from "./types";

import { runDiagnosis } from "./diagnosis";
import { formatDiagnosis } from "./formatter";
import { matchService } from "./matcher";
import { applySafetyRules } from "./safety";

import { retryAI } from "../../shared/retry";

import {
  validateFixYourselfResult,
} from "../validator";

import {
  buildFixYourselfFallback,
} from "../fallback";

/* ============================================================
   RUN PLANNER
============================================================ */

export async function runPlanner(
  request: PlannerRequest,
): Promise<PlannerResponse> {
  const history =
    request.history ?? [];

  const followUpCount =
    request.followUpCount ?? 0;

  const forceDiagnosis =
    request.forceDiagnosis ?? false;

  console.log(
    "========== RUN PLANNER ==========",
  );

  console.log(
    "Problem:",
    request.problem,
  );

  console.log(
    "FollowUpCount:",
    followUpCount,
  );

  console.log(
    "ForceDiagnosis:",
    forceDiagnosis,
  );

  /* ==========================================================
     AI EXECUTION + RETRY
  ========================================================== */

  const aiResult =
    await retryAI<DiagnosisResponse>({
      maxAttempts: 2,

      /* ========================================================
         EXECUTE
      ======================================================== */

      execute: async (): Promise<DiagnosisResponse> => {
        return runDiagnosis({
          problem:
            request.problem,

          services:
            request.services,

          messages:
            history,

          followUpCount,

          forceDiagnosis,
        });
      },

      /* ========================================================
         VALIDATE AI RESULT
      ======================================================== */

      validate: (
        result: DiagnosisResponse,
      ) => {
        /* ------------------------------------------------------
           UNDERSTANDING FAILED
           
           This is a valid customer-facing state.
           
           It must NOT trigger retry.
        ------------------------------------------------------ */

        if (
          result.status ===
          "understanding_failed"
        ) {
          return {
            valid: true,

            errors: [],
          };
        }

        /* ------------------------------------------------------
           FOLLOW-UP
        ------------------------------------------------------ */

        if (
          result.status ===
          "follow_up"
        ) {
          if (
            result.completed === false &&
            result.followUp &&
            typeof result.followUp.question ===
              "string" &&
            result.followUp.question.trim()
          ) {
            return {
              valid: true,

              errors: [],
            };
          }

          return {
            valid: false,

            errors: [
              "Follow-up response is invalid.",
            ],
          };
        }

        /* ------------------------------------------------------
           COMPLETED DIAGNOSIS
        ------------------------------------------------------ */

        if (
          result.status ===
          "completed"
        ) {
          if (
            result.completed !==
            true
          ) {
            return {
              valid: false,

              errors: [
                "Completed response has completed=false.",
              ],
            };
          }

          if (
            !result.diagnosis
          ) {
            return {
              valid: false,

              errors: [
                "Completed response has no diagnosis.",
              ],
            };
          }

          return validateFixYourselfResult(
            result.diagnosis,
          );
        }

        /* ------------------------------------------------------
           UNKNOWN STATUS
        ------------------------------------------------------ */

        return {
          valid: false,

          errors: [
            "Unknown Fix Yourself response status.",
          ],
        };
      },

      /* ========================================================
         FALLBACK
      ======================================================== */

      fallback:
        (): DiagnosisResponse => ({
          status: "completed",

          completed: true,

          message:
            "Fixxam was unable to complete the diagnosis.",

          followUp: null,

          diagnosis:
            buildFixYourselfFallback(),

          understandingFailed:
            null,
        }),
    });

  const aiResponse =
    aiResult.result;

  console.log(
    "AI ATTEMPTS:",
    aiResult.attempts,
  );

  console.log(
    "AI STATUS:",
    aiResponse.status,
  );

  /* ==========================================================
     UNDERSTANDING FAILED
     
     IMPORTANT:
     
     This is a normal customer-facing
     state, NOT an application error.
     
     The frontend can show:
     
     1. Analyze Again
     2. Try Help Me Fix
  ========================================================== */

  if (
    aiResponse.status ===
    "understanding_failed"
  ) {
    const understandingFailed =
      aiResponse.understandingFailed;

    const message =
      understandingFailed?.message ??
      "Yi haƙuri, Fixxam bai gane matsalar ba. Ka sake bayyana abin da ba ya aiki da abin da ya faru.";

    console.log(
      "========== UNDERSTANDING FAILED ==========",
    );

    console.log(
      "Message:",
      message,
    );

    console.log(
      "Reason:",
      understandingFailed?.reason,
    );

    console.log(
      "==========================================",
    );

    return {
      status:
        "understanding_failed",

      completed: false,

      message,

      followUp: null,

      diagnosis: null,

      understandingFailed:
        understandingFailed ?? {
          message,

          reason:
            "The customer problem could not be understood.",
        },
    };
  }

  /* ==========================================================
     FOLLOW-UP
  ========================================================== */

  if (
    aiResponse.status ===
      "follow_up" &&
    aiResponse.followUp
  ) {
    console.log(
      "========== RETURNING FOLLOW-UP ==========",
    );

    console.log(
      "Question:",
      aiResponse
        .followUp.question,
    );

    console.log(
      "==========================================",
    );

    return {
      status:
        "follow_up",

      completed: false,

      message:
        "I need one more detail before I can diagnose the problem.",

      followUp:
        aiResponse.followUp,

      diagnosis: null,

      understandingFailed:
        null,
    };
  }

  /* ==========================================================
     COMPLETED CHECK
  ========================================================== */

  if (
    aiResponse.status !==
    "completed"
  ) {
    throw new Error(
      "Invalid Fix Yourself response state.",
    );
  }

  if (
    !aiResponse.diagnosis
  ) {
    throw new Error(
      "Diagnosis was not returned by AI or fallback.",
    );
  }

  /* ==========================================================
     DIAGNOSIS
  ========================================================== */

  let diagnosis: DiagnosisResult =
    aiResponse.diagnosis;

  /* ==========================================================
     MATCH SERVICE
  ========================================================== */

  console.log(
    "========== MATCH SERVICE ==========",
  );

  const match =
    matchService(
      diagnosis,
      request.services,
    );

  /* ==========================================================
     APPLY SERVICE MATCH
  ========================================================== */

  if (
    match.found &&
    match.service
  ) {
    diagnosis = {
      ...diagnosis,

      matchedServiceId:
        match.service.id,

      matchedService:
        match.service.name,

      confidence:
        Math.max(
          diagnosis.confidence,
          match.confidence,
        ),
    };
  }

  /* ==========================================================
     FORMAT DIAGNOSIS
  ========================================================== */

  diagnosis =
    formatDiagnosis(
      diagnosis,
    );

  /* ==========================================================
     APPLY SAFETY RULES
  ========================================================== */

  diagnosis =
    applySafetyRules(
      request.problem,
      diagnosis,
    );

  /* ==========================================================
     PLANNER COMPLETED
  ========================================================== */

  console.log(
    "========== PLANNER COMPLETED ==========",
  );

  console.log(
    "Service:",
    diagnosis.matchedService,
  );

  console.log(
    "Service ID:",
    diagnosis.matchedServiceId,
  );

  console.log(
    "Confidence:",
    diagnosis.confidence,
  );

  console.log(
    "Emergency:",
    diagnosis.emergency,
  );

  console.log(
    "Professional:",
    diagnosis.professionalRequired,
  );

  /* ==========================================================
     FINAL RESPONSE
  ========================================================== */

  return {
    status:
      "completed",

    completed: true,

    message:
      diagnosis.response,

    followUp: null,

    diagnosis,

    understandingFailed:
      null,
  };
}