import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  GoogleGenAI,
} from "@google/genai";

type ServiceInput = {
  id: string;
  name: string;
  description: string;
};

type SearchServiceRequest = {
  query?: unknown;
  services?: unknown;
};

type GeminiSearchResult = {
  matched?: unknown;
  serviceId?: unknown;
  serviceName?: unknown;
  confidence?: unknown;
};

const MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  "gemini-3.6-flash";

const MAX_QUERY_LENGTH = 300;

const MAX_SERVICES = 300;

const GEMINI_TIMEOUT_MS = 12_000;

const MIN_CONFIDENCE = 0.65;

/*
 * -------------------------------------------------------
 * HELPERS
 * -------------------------------------------------------
 */

function cleanText(
  value: unknown,
  maxLength: number,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(0, maxLength);
}

function normalize(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timer:
    | ReturnType<typeof setTimeout>
    | undefined;

  const timeout =
    new Promise<never>(
      (_, reject) => {
        timer = setTimeout(
          () => {
            reject(
              new Error(
                "AI search timed out.",
              ),
            );
          },
          timeoutMs,
        );
      },
    );

  try {
    return await Promise.race([
      promise,
      timeout,
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

function parseGeminiJson(
  value: string,
): GeminiSearchResult {
  const cleaned =
    value
      .trim()
      .replace(
        /^```json\s*/i,
        "",
      )
      .replace(
        /^```\s*/i,
        "",
      )
      .replace(
        /\s*```$/i,
        "",
      )
      .trim();

  try {
    const parsed =
      JSON.parse(cleaned);

    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      throw new Error(
        "Invalid AI response.",
      );
    }

    return parsed as GeminiSearchResult;
  } catch {
    throw new Error(
      "AI returned invalid search data.",
    );
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

/*
 * -------------------------------------------------------
 * FUNCTION
 * -------------------------------------------------------
 */

export const searchServiceWithAi =
  onCall(
    {
      region:
        "us-central1",

      timeoutSeconds:
        30,

      memory:
        "256MiB",

      enforceAppCheck:
        false,
    },

    async (request) => {
      try {
        const data =
          request.data as
            | SearchServiceRequest
            | undefined;

        const query =
          cleanText(
            data?.query,
            MAX_QUERY_LENGTH,
          );

        if (!query) {
          return {
            success: true,
            matched: false,
            serviceId: "",
            serviceName: "",
            confidence: 0,
          };
        }

        /*
         * ------------------------------------------------
         * SERVICE CATALOG VALIDATION
         * ------------------------------------------------
         */

        if (
          !Array.isArray(
            data?.services,
          )
        ) {
          throw new HttpsError(
            "invalid-argument",
            "Service catalog is required.",
          );
        }

        const services: ServiceInput[] =
          data.services
            .slice(
              0,
              MAX_SERVICES,
            )
            .map((item) => {
              if (
                !item ||
                typeof item !==
                  "object"
              ) {
                return null;
              }

              const service =
                item as Record<
                  string,
                  unknown
                >;

              const id =
                cleanText(
                  service.id,
                  200,
                );

              const name =
                cleanText(
                  service.name,
                  300,
                );

              const description =
                cleanText(
                  service.description,
                  500,
                );

              if (
                !id ||
                !name
              ) {
                return null;
              }

              return {
                id,
                name,
                description,
              };
            })
            .filter(
              (
                service,
              ): service is ServiceInput =>
                service !== null,
            );

        if (
          services.length === 0
        ) {
          return {
            success: true,
            matched: false,
            serviceId: "",
            serviceName: "",
            confidence: 0,
          };
        }

        /*
         * ------------------------------------------------
         * LOCAL EXACT MATCH
         * ------------------------------------------------
         *
         * Do not spend AI tokens when
         * the customer already typed
         * the exact service name.
         */

        const normalizedQuery =
          normalize(query);

        const exactMatch =
          services.find(
            (service) =>
              normalize(
                service.name,
              ) ===
              normalizedQuery,
          );

        if (exactMatch) {
          return {
            success: true,

            matched: true,

            serviceId:
              exactMatch.id,

            serviceName:
              exactMatch.name,

            confidence: 1,
          };
        }

        /*
         * ------------------------------------------------
         * SERVICE CATALOG
         * ------------------------------------------------
         */

        const catalog =
          services
            .map(
              (service) =>
                [
                  `ID: ${service.id}`,
                  `NAME: ${service.name}`,
                  `DESCRIPTION: ${
                    service.description ||
                    "No description"
                  }`,
                ].join(" | "),
            )
            .join("\n");

        /*
         * ------------------------------------------------
         * GEMINI
         * ------------------------------------------------
         */

        const ai =
          getGeminiClient();

        const prompt = `
You are Fixxam's service search assistant.

The customer is searching for a service.

Your job is ONLY to understand the customer's search
and select the closest matching service from the
provided Fixxam service catalog.

IMPORTANT RULES:

1. Understand natural language.
2. Understand Hausa, English, Nigerian English,
   mixed language, spelling mistakes, short phrases,
   and informal descriptions.
3. Translate the customer's meaning internally when
   necessary.
4. NEVER invent a service.
5. NEVER create a service ID.
6. NEVER return a service that is not in the catalog.
7. Return ONLY one service when there is a confident match.
8. If there is no confident match, return matched=false.
9. Confidence must be between 0 and 1.
10. The returned serviceId MUST exactly match an ID
    from the catalog.
11. The returned serviceName MUST exactly match the
    corresponding NAME from the catalog.
12. Do not explain the translation to the customer.
13. Do not return multiple services.
14. Do not return JSON markdown.
15. Return JSON only.

Examples:

Customer:
"gyaran gida"

Meaning:
Home Service

Customer:
"gyaran ac"

Meaning:
AC Repair

Customer:
"ac dina baya sanyi"

Meaning:
AC Repair

Customer:
"matsalar ruwa a kitchen"

Meaning:
Plumbing

Customer:
"ina son a gyara fan"

Meaning:
Fan Repair

Customer:
"my television is showing no picture"

Meaning:
TV Repair

These are examples of understanding meaning.
Do NOT assume these services exist unless they appear
in the catalog.

CUSTOMER SEARCH:

${query}

FIX XAM SERVICE CATALOG:

${catalog}

If a confident match exists, return:

{
  "matched": true,
  "serviceId": "EXACT CATALOG ID",
  "serviceName": "EXACT CATALOG NAME",
  "confidence": 0.95
}

If there is no confident match, return:

{
  "matched": false,
  "serviceId": "",
  "serviceName": "",
  "confidence": 0
}
`;

        const response =
          await withTimeout(
            ai.models.generateContent(
              {
                model: MODEL,

                contents: [
                  {
                    role:
                      "user",

                    parts: [
                      {
                        text:
                          prompt,
                      },
                    ],
                  },
                ],

                config: {
                  responseMimeType:
                    "application/json",

                  maxOutputTokens:
                    256,
                },
              },
            ),
            GEMINI_TIMEOUT_MS,
          );

        const text =
          response.text?.trim();

        if (!text) {
          return {
            success: true,
            matched: false,
            serviceId: "",
            serviceName: "",
            confidence: 0,
          };
        }

        const parsed =
          parseGeminiJson(text);

        const confidence =
          typeof parsed.confidence ===
          "number"
            ? Math.max(
                0,
                Math.min(
                  1,
                  parsed.confidence,
                ),
              )
            : 0;

        const matched =
          parsed.matched ===
          true;

        const serviceId =
          cleanText(
            parsed.serviceId,
            200,
          );

        /*
         * ------------------------------------------------
         * NEVER TRUST AI SERVICE ID
         * ------------------------------------------------
         */

        const trustedService =
          services.find(
            (service) =>
              service.id ===
              serviceId,
          );

        if (
          !matched ||
          confidence <
            MIN_CONFIDENCE ||
          !trustedService
        ) {
          return {
            success: true,

            matched: false,

            serviceId: "",

            serviceName: "",

            confidence: 0,
          };
        }

        /*
         * ------------------------------------------------
         * FINAL TRUSTED RESPONSE
         * ------------------------------------------------
         */

        console.log(
          "[AI SERVICE SEARCH]",
          {
            query,

            serviceId:
              trustedService.id,

            serviceName:
              trustedService.name,

            confidence,
          },
        );

        return {
          success: true,

          matched: true,

          serviceId:
            trustedService.id,

          serviceName:
            trustedService.name,

          confidence,
        };
      } catch (error) {
        console.error(
          "[AI SERVICE SEARCH ERROR]",
          error,
        );

        /*
         * Search must remain usable
         * even if AI temporarily fails.
         */

        return {
          success: true,

          matched: false,

          serviceId: "",

          serviceName: "",

          confidence: 0,
        };
      }
    },
  );