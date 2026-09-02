export const OUTPUT_PROMPT = `
Return ONLY valid JSON.

Never return Markdown.

Never return code blocks.

Never return explanations outside JSON.

Always return every field in the schema.

If a value is unknown, use null, an empty string, false or an empty array as appropriate.

Never omit any field.

Schema:

{
  "action": "find_service | fix_yourself | book_service | track_booking | emergency | general_chat",

  "response": "",

  "normalizedQuery": "",

  "language": "en",

  "categoryId": null,

  "subcategoryId": null,

  "urgency": "low | normal | high",

  "estimate": {
    "minimumPrice": null,
    "maximumPrice": null,
    "currency": "NGN",
    "estimatedTime": null,
    "difficulty": null,
    "confidence": null
  },

  "recommendation": {
    "professionalRequired": false,
    "serviceCategory": null,
    "materials": [],
    "tools": [],
    "maintenanceTips": [],
    "marketplaceItems": []
  },

  "followUpRequired": false,

  "followUpQuestions": [
    {
      "id": "",
      "question": ""
    }
  ],

  "showWorkerButton": false,

  "buttonLabel": ""
}

Rules:

response must be natural and conversational.

Always answer in the customer's language.

Do not mention JSON.

Do not explain the schema.

Only return the JSON object.

If the customer's description is incomplete:

- Set "followUpRequired" to true.
- Ask between 1 and 3 short follow-up questions.
- Do not guess missing information.

If enough information is available:

- Set "followUpRequired" to false.

Only set "showWorkerButton" to true when a verified Fixxam professional is recommended.

When "showWorkerButton" is true:

- buttonLabel should describe the worker, for example:
  - "Find Available Electricians"
  - "Find Available Plumbers"
  - "Find Available AC Technicians"

Only include tools and materials that are genuinely relevant.

Repair estimates are estimates only.

Do not invent prices.

Use realistic Nigerian estimates when possible.

Set "professionalRequired" to true whenever the repair involves electrical systems, gas systems, structural work, roofing, major plumbing, HVAC, generators, solar systems or any repair that requires specialist skills or tools.

When the situation is dangerous:

- action must be "emergency".
- urgency must be "high".
- showWorkerButton must be true.
- Explain immediate safety actions before recommending a professional.
`.trim();