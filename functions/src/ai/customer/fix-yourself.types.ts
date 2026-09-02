import type {
  EstimatedCost,
  FixYourselfResult,
  FollowUpQuestion,
  UnderstandingFailed,
  DiagnosisResponse,
  FixYourselfEngineResponse,
  DiagnosisStatus,
} from "../shared/diagnosis/models";

export type {
  EstimatedCost,
  FixYourselfResult,
  FollowUpQuestion,
  UnderstandingFailed,
  DiagnosisResponse,
  FixYourselfEngineResponse,
  DiagnosisStatus,
};

/* ============================================================
   FIX YOURSELF RESPONSE SCHEMA
============================================================ */

export const FIX_YOURSELF_RESPONSE_SCHEMA = `
RESPONSE FORMAT

Return ONLY one valid JSON object.

The response MUST contain these fields:

{
  "status": "follow_up" | "completed" | "understanding_failed",
  "completed": boolean,
  "message": "string",
  "followUp": object | null,
  "diagnosis": object | null,
  "understandingFailed": object | null
}

============================================================
STATUS: follow_up
============================================================

Use this status ONLY when one additional piece of information
is genuinely required before a safe diagnosis can be made.

Required structure:

{
  "status": "follow_up",
  "completed": false,
  "message": "Short customer-facing message",
  "followUp": {
    "question": "One clear question",
    "reason": "Why this information is needed"
  },
  "diagnosis": null,
  "understandingFailed": null
}

Rules:

- completed MUST be false.
- Ask ONLY ONE question.
- followUp MUST contain exactly one question.
- diagnosis MUST be null.
- understandingFailed MUST be null.
- Do not provide a diagnosis yet.

============================================================
STATUS: completed
============================================================

Use this status when enough information exists to provide
a safe and useful diagnosis.

Required structure:

{
  "status": "completed",
  "completed": true,
  "message": "Customer-facing diagnosis summary",
  "followUp": null,
  "diagnosis": {
    "response": "Actual diagnosis explanation",
    "matchedServiceId": "",
    "matchedService": "Actual human-readable service name",
    "confidence": 0,
    "causes": [],
    "steps": [],
    "estimatedCost": {
      "min": 1,
      "max": 2,
      "currency": "NGN"
    },
    "estimatedTime": "Short human-readable estimate",
    "safety": "Actual safety guidance",
    "professionalRequired": false,
    "emergency": false
  },
  "understandingFailed": null
}

Rules:

- completed MUST be true.
- followUp MUST be null.
- understandingFailed MUST be null.
- diagnosis MUST contain the complete diagnosis.
- message MUST be a useful customer-facing summary.
- Generate real values from the customer's conversation.
- Do not copy placeholder values.

============================================================
STATUS: understanding_failed
============================================================

Use this status when the customer's message does not
describe a recognizable repair, maintenance, installation,
service, or troubleshooting problem clearly enough to proceed.

Required structure:

{
  "status": "understanding_failed",
  "completed": false,
  "message": "Explain that the problem could not be understood",
  "followUp": null,
  "diagnosis": null,
  "understandingFailed": {
    "message": "Clear customer-facing explanation",
    "reason": "Why the problem could not be understood"
  }
}

Rules:

- completed MUST be false.
- followUp MUST be null.
- diagnosis MUST be null.
- understandingFailed MUST contain message and reason.
- Do not invent symptoms.
- Do not invent a service.
- Do not fabricate a diagnosis.

============================================================
DIAGNOSIS FIELD RULES
============================================================

matchedServiceId:

MUST ALWAYS be "".

Never generate or guess a Firebase service ID.

Never return:

- Firebase ID
- service object
- category ID
- subcategory ID
- generated identifier
- array
- object

The application will perform service matching separately.

------------------------------------------------------------

matchedService:

MUST be a plain human-readable service name.

Examples:

"TV Repair"
"Plumber"
"Electrician"
"Washing Machine Repair"
"Air Conditioner Repair"
"Auto Mechanic"

Only use a service that is supported by the customer's
problem and available service context.

Never invent a service.

------------------------------------------------------------

confidence:

MUST be an integer from 0 to 100.

It represents confidence in the diagnosis.

------------------------------------------------------------

causes:

MUST be an array of useful strings.

Only include causes supported by the customer's information.

Never fabricate symptoms or technical evidence.

------------------------------------------------------------

steps:

MUST be an array of safe practical troubleshooting steps.

Steps must be appropriate for the customer's situation.

Never provide dangerous instructions.

------------------------------------------------------------

estimatedCost:

MUST contain:

{
  "min": number,
  "max": number,
  "currency": "NGN"
}

Rules:

- min MUST be greater than 0.
- max MUST be greater than min.
- currency MUST be "NGN".
- Do not return negative values.
- Do not return impossible or fabricated precision.

------------------------------------------------------------

estimatedTime:

MUST be a short human-readable string.

Examples:

"30–60 minutes"
"1–2 hours"
"Same day"
"1–2 days"

Use a reasonable estimate only when the conversation
provides enough information.

------------------------------------------------------------

safety:

MUST contain appropriate safety guidance.

If there is no significant hazard, still provide concise
appropriate guidance.

------------------------------------------------------------

professionalRequired:

MUST be boolean.

Set true when professional tools, internal repair,
electrical work, gas work, high voltage, structural work,
dangerous machinery, fuel systems, or unsafe DIY work
is involved.

Set false only when the recommended troubleshooting is
reasonably safe for a customer to perform.

------------------------------------------------------------

emergency:

MUST be boolean.

Set true only when there is immediate or potentially
severe danger.

Otherwise set false.

============================================================
SAFETY RULES
============================================================

If electricity, gas, fire, high voltage, fuel,
dangerous machinery, structural instability, or another
serious hazard is involved:

- professionalRequired MUST be true.
- safety MUST clearly explain the danger.
- Never provide dangerous DIY instructions.
- Recommend stopping use when appropriate.
- Recommend contacting a qualified professional when needed.

============================================================
FOLLOW-UP RULES
============================================================

- Ask ONLY ONE question at a time.
- Never ask multiple questions in one follow-up.
- followUpCount >= 2 means no more questions.
- forceDiagnosis=true means no more questions.
- If forceDiagnosis=true, provide the safest possible
  diagnosis using the available information.
- If followUpCount >= 2, provide the safest possible
  diagnosis or understanding_failed result.
- Never repeatedly ask the same question.
- Only ask for information that materially improves
  diagnosis or safety.

============================================================
LANGUAGE
============================================================

Respond in the customer's language whenever possible.

Keep the language simple, natural, professional, and clear.

============================================================
IMPORTANT
============================================================

The customer's conversation is the source of truth.

Do not fabricate:

- symptoms
- measurements
- test results
- device models
- causes
- service IDs
- repair history
- parts
- prices
- technical observations

Use only information supported by the conversation and
available service context.

============================================================
FINAL OUTPUT
============================================================

Return ONLY valid JSON.

Do NOT return Markdown.

Do NOT use code fences.

Do NOT add text before the JSON.

Do NOT add text after the JSON.

The JSON MUST contain:

status
completed
message
followUp
diagnosis
understandingFailed

Exactly ONE of these states must be active:

1. follow_up
2. completed
3. understanding_failed
`.trim();