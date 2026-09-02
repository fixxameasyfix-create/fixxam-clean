import { httpsCallable } from "firebase/functions";

import { functions } from "@/firebase/config";

/* ============================================================
   CHAT MESSAGE
============================================================ */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
   FIX YOURSELF ENGINE RESPONSE
============================================================ */

export interface FixYourselfEngineResponse {
  status: DiagnosisStatus;

  completed: boolean;

  message: string;

  followUp:
    | FollowUpQuestion
    | null;

  diagnosis:
    | FixYourselfResult
    | null;

  understandingFailed:
    | UnderstandingFailed
    | null;
}

/* ============================================================
   REQUEST
============================================================ */

interface FixYourselfRequest {
  problem: string;

  messages?: ChatMessage[];

  language?: string;

  followUpCount?: number;

  forceDiagnosis?: boolean;
}

/* ============================================================
   FIREBASE CALLABLE
============================================================ */

const fixYourselfCallable =
  httpsCallable<
    FixYourselfRequest,
    FixYourselfEngineResponse
  >(
    functions,
    "fixYourselfAi",
  );

/* ============================================================
   ANALYZE PROBLEM
============================================================ */

export async function analyzeProblem(
  problem: string,
  messages: ChatMessage[] = [],
  followUpCount = 0,
  forceDiagnosis = false,
): Promise<FixYourselfEngineResponse> {
  const query = problem.trim();

  if (!query) {
    throw new Error(
      "Problem description is required.",
    );
  }

  const normalizedFollowUpCount =
    Number.isFinite(
      followUpCount,
    ) &&
    followUpCount >= 0
      ? Math.floor(
          followUpCount,
        )
      : 0;

  const normalizedForceDiagnosis =
    forceDiagnosis === true;

  try {
    /* ========================================================
       DEBUG REQUEST
    ======================================================== */

    console.log(
      "===== REQUEST TO FIREBASE =====",
    );

    console.log(
      "Problem:",
      query,
    );

    console.log(
      "Type:",
      typeof query,
    );

    console.log(
      "Messages:",
    );

    console.dir(
      messages,
      {
        depth: null,
      },
    );

    messages.forEach(
      (message, index) => {
        console.log(
          `Message ${index}`,
        );

        console.log(
          "role:",
          message.role,
        );

        console.log(
          "content type:",
          typeof message.content,
        );

        console.log(
          "content:",
          message.content,
        );
      },
    );

    console.log(
      "FollowUpCount:",
      normalizedFollowUpCount,
    );

    console.log(
      "ForceDiagnosis:",
      normalizedForceDiagnosis,
    );

    /* ========================================================
       FIREBASE CALL
    ======================================================== */

    const response =
      await fixYourselfCallable({
        problem: query,

        messages,

        followUpCount:
          normalizedFollowUpCount,

        forceDiagnosis:
          normalizedForceDiagnosis,
      });

    /* ========================================================
       RESPONSE
    ======================================================== */

    const data =
      response.data;

    console.log(
      "===== RESPONSE FROM FIREBASE =====",
    );

    console.log(
      JSON.stringify(
        data,
        null,
        2,
      ),
    );

    console.log(
      "==================================",
    );

    return data;
  } catch (error: unknown) {
    /* ========================================================
       FIREBASE ERROR
    ======================================================== */

    console.log(
      "========== FIX YOURSELF ERROR ==========",
    );

    if (
      error &&
      typeof error === "object"
    ) {
      const firebaseError =
        error as {
          code?: unknown;
          message?: unknown;
          details?: unknown;
        };

      console.log(
        "Code:",
        firebaseError.code,
      );

      console.log(
        "Message:",
        firebaseError.message,
      );

      console.log(
        "Details:",
        firebaseError.details,
      );
    }

    console.error(
      error,
    );

    console.log(
      "========================================",
    );

    throw error;
  }
}