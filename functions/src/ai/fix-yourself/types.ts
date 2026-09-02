/* ============================================================
   AVAILABLE SERVICE
============================================================ */

export interface AvailableService {
  id: string;
  name: string;
}

/* ============================================================
   CHAT MESSAGE
============================================================ */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ============================================================
   REQUEST
============================================================ */

export interface FixYourselfRequest {
  problem: string;

  services: AvailableService[];

  language?: string;

  messages?: ChatMessage[];

  followUpCount?: number;

  forceDiagnosis?: boolean;
}

/* ============================================================
   ESTIMATED COST
============================================================ */

export interface EstimatedCost {
  min: number;
  max: number;
  currency: "NGN";
}

/* ============================================================
   DIAGNOSIS RESULT
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
 * Compatibility alias.
 *
 * Existing formatter/matcher/planner files may import
 * DiagnosisResult. Keep this alias so those files do not
 * break while the canonical type remains FixYourselfResult.
 */
export type DiagnosisResult =
  FixYourselfResult;

/* ============================================================
   FOLLOW-UP
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
   STATUS
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
   * Always contains the customer-facing
   * top-level message.
   *
   * follow_up:
   *   The follow-up explanation/message.
   *
   * completed:
   *   Usually the diagnosis response.
   *
   * understanding_failed:
   *   Usually the understandingFailed.message.
   */
  message: string;

  followUp: FollowUpQuestion | null;

  diagnosis: FixYourselfResult | null;

  understandingFailed:
    | UnderstandingFailed
    | null;
}

/* ============================================================
   ENGINE RESPONSE
============================================================ */

export type FixYourselfEngineResponse =
  DiagnosisResponse;

/* ============================================================
   GEMINI RESPONSE SCHEMA
============================================================ */

export const FIX_YOURSELF_RESPONSE_SCHEMA = `
Return ONLY valid JSON.

The response must contain exactly one status:

"follow_up"
"completed"
"understanding_failed"

============================================================
FOLLOW-UP
============================================================

{
  "status": "follow_up",
  "completed": false,
  "message": "string",
  "followUp": {
    "question": "string",
    "reason": "string"
  },
  "diagnosis": null,
  "understandingFailed": null
}

============================================================
COMPLETED
============================================================

{
  "status": "completed",
  "completed": true,
  "message": "string",
  "followUp": null,
  "diagnosis": {
    "response": "string",
    "matchedServiceId": "string",
    "matchedService": "string",
    "confidence": 0,
    "causes": [],
    "steps": [],
    "estimatedCost": {
      "min": 1,
      "max": 2,
      "currency": "NGN"
    },
    "estimatedTime": "string",
    "safety": "string",
    "professionalRequired": false,
    "emergency": false
  },
  "understandingFailed": null
}

============================================================
UNDERSTANDING FAILED
============================================================

{
  "status": "understanding_failed",
  "completed": false,
  "message": "string",
  "followUp": null,
  "diagnosis": null,
  "understandingFailed": {
    "message": "string",
    "reason": "string"
  }
}

============================================================
RULES
============================================================

- Return JSON only.
- Never return markdown.
- Never invent a service.
- matchedServiceId must come from available services.
- matchedService must exactly match the service name.
- confidence must be between 0 and 100.
- currency must always be NGN.
- min must be greater than 0.
- max must be greater than min.
- Never ask more than one follow-up question.
- followUpCount >= 2 means no more questions.
- forceDiagnosis=true means no more questions.
- Never fabricate missing symptoms.
- Troubleshooting steps must be safe.
- Use the customer's language.
- message is always required.
- followUp must be null when status is completed.
- diagnosis must be null when status is follow_up.
- diagnosis must be null when status is understanding_failed.
- understandingFailed must be null when status is follow_up.
- understandingFailed must be null when status is completed.
`;