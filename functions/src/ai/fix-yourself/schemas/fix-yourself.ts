import {
  SchemaBuilder,
  array,
  boolean,
  number,
  object,
  string,
  nullable,
} from "../../shared/schema";

/* ============================================================
   DIAGNOSIS SCHEMA
============================================================ */

const diagnosisSchema = object(
  {
    response: string(
      "Short, natural repair explanation written in the customer's language.",
    ),

    matchedServiceId: string(
      "Exact service ID selected from the available services.",
    ),

    matchedService: string(
      "Exact service name selected from the available services.",
    ),

    confidence: number(
      "Diagnosis confidence from 0 to 100.",
    ),

    causes: array(
      string(
        "A realistic possible cause.",
      ),
      "List of likely causes, ordered from most likely to least likely.",
    ),

    steps: array(
      string(
        "A safe troubleshooting step.",
      ),
      "Safe troubleshooting instructions only.",
    ),

    estimatedCost: object(
      {
        min: number(
          "Minimum estimated repair cost in NGN. Must be greater than 0.",
        ),

        max: number(
          "Maximum estimated repair cost in NGN. Must be greater than min.",
        ),

        currency: string(
          "Always NGN.",
        ),
      },
      [
        "min",
        "max",
        "currency",
      ],
      "Estimated repair cost.",
    ),

    estimatedTime: string(
      "Practical estimated repair time.",
    ),

    safety: string(
      "Safety instructions relevant to the diagnosis.",
    ),

    professionalRequired: boolean(
      "True when professional technical work is required.",
    ),

    emergency: boolean(
      "True only when there is immediate danger.",
    ),
  },
  [
    "response",
    "matchedServiceId",
    "matchedService",
    "confidence",
    "causes",
    "steps",
    "estimatedCost",
    "estimatedTime",
    "safety",
    "professionalRequired",
    "emergency",
  ],
);

/* ============================================================
   FOLLOW-UP SCHEMA
============================================================ */

const followUpSchema = object(
  {
    question: string(
      "One important diagnostic question.",
    ),

    reason: string(
      "Why the answer is needed for the diagnosis.",
    ),
  },
  [
    "question",
    "reason",
  ],
);

/* ============================================================
   COMPLETE RESPONSE SCHEMA
============================================================ */

export const FIX_YOURSELF_SCHEMA =
  SchemaBuilder.create(
    object(
      {
        completed: boolean(
          "True when a diagnosis is ready. False only when another important question is required.",
        ),

        followUp:
          nullable(
            followUpSchema,
          ),

        diagnosis:
          nullable(
            diagnosisSchema,
          ),
      },
      [
        "completed",
        "followUp",
        "diagnosis",
      ],
      "Fixxam Smart Repair AI response.",
    ),
  ).build();