/* ============================================================
   ESTIMATED COST
============================================================ */

export interface EstimatedCost {
  min: number;
  max: number;
  currency: "NGN";
}

/* ============================================================
   FIX YOURSELF RESULT
============================================================ */

export interface FixYourselfResult {
  response: string;

  matchedServiceId: string;

  matchedService: string;

  confidence: number;

  causes: string[];

  steps: string[];

  estimatedCost: EstimatedCost;

  estimatedTime: string;

  safety: string;

  professionalRequired: boolean;

  emergency: boolean;
}

/*
 * Backward-compatible name.
 *
 * Existing formatter, matcher, planner, or safety files
 * may still import DiagnosisResult.
 *
 * Keep ONE actual diagnosis model.
 */
export type DiagnosisResult =
  FixYourselfResult;

/* ============================================================
   FOLLOW-UP QUESTION
============================================================ */

export interface FollowUpQuestion {
  question: string;

  reason: string;
}

/* ============================================================
   UNDERSTANDING FAILED
============================================================ */

export interface UnderstandingFailed {
  message: string;

  reason: string;
}

/* ============================================================
   DIAGNOSIS STATUS
============================================================ */

export type DiagnosisStatus =
  | "follow_up"
  | "completed"
  | "understanding_failed";

/* ============================================================
   DIAGNOSIS RESPONSE
============================================================ */

export interface DiagnosisResponse {
  status: DiagnosisStatus;

  completed: boolean;

  /*
   * Always required.
   *
   * follow_up:
   *   Customer-facing follow-up message.
   *
   * completed:
   *   Customer-facing diagnosis summary.
   *
   * understanding_failed:
   *   Customer-facing explanation.
   */
  message: string;

  /*
   * Only populated when status === "follow_up".
   */
  followUp:
    | FollowUpQuestion
    | null;

  /*
   * Only populated when status === "completed".
   */
  diagnosis:
    | FixYourselfResult
    | null;

  /*
   * Only populated when status === "understanding_failed".
   */
  understandingFailed:
    | UnderstandingFailed
    | null;
}

/* ============================================================
   FIX YOURSELF ENGINE RESPONSE
============================================================ */

export type FixYourselfEngineResponse =
  DiagnosisResponse;