import {
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";

import { GoogleGenAI } from "@google/genai";

type ServiceInput = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  aliases?: string[];
  keywords?: string[];
  tags?: string[];
};

type RequestData = {
  query: string;
  services: ServiceInput[];
};

type Language =
  | "english"
  | "hausa"
  | "yoruba"
  | "igbo"
  | "pidgin"
  | "unknown";

type AiResult = {
  serviceId: string | null;
  confidence: number;
  language: Language;
};

const SUPPORTED_LANGUAGES: Language[] = [
  "english",
  "hausa",
  "yoruba",
  "igbo",
  "pidgin",
  "unknown",
];

function normalize(
  value: unknown,
): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function clampConfidence(
  value: unknown,
): number {
  const number =
    typeof value === "number"
      ? value
      : Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, number),
  );
}

function normalizeLanguage(
  value: unknown,
): Language {
  if (
    typeof value === "string" &&
    SUPPORTED_LANGUAGES.includes(
      value as Language,
    )
  ) {
    return value as Language;
  }

  return "unknown";
}

function isQuotaError(
  error: unknown,
): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const normalized =
    message.toLowerCase();

  return (
    normalized.includes("429") ||
    normalized.includes(
      "resource_exhausted",
    ) ||
    normalized.includes(
      "quota exceeded",
    ) ||
    normalized.includes(
      "rate limit",
    ) ||
    normalized.includes(
      "free_tier",
    )
  );
}

function fallbackResult(
  language: Language = "unknown",
): AiResult {
  return {
    serviceId: null,
    confidence: 0,
    language,
  };
}

function cleanJsonResponse(
  text: string,
): string {
  return text
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
}

export const aiSearchHelper =
  onCall<RequestData>(
    async (
      request,
    ): Promise<AiResult> => {
      /*
       * --------------------------------
       * AUTHENTICATION
       * --------------------------------
       */

      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "Authentication is required.",
        );
      }

      /*
       * --------------------------------
       * REQUEST VALIDATION
       * --------------------------------
       */

      const data =
        request.data;

      if (
        !data ||
        typeof data.query !==
          "string" ||
        !Array.isArray(
          data.services,
        )
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Invalid search request.",
        );
      }

      const query =
        normalize(data.query);

      if (!query) {
        return fallbackResult();
      }

      /*
       * Prevent unnecessarily large
       * AI requests.
       */

      if (query.length > 200) {
        return fallbackResult();
      }

      /*
       * --------------------------------
       * VALIDATE SERVICE CATALOG
       * --------------------------------
       */

      const validServices =
        data.services
          .filter(
            (service) =>
              service &&
              typeof service.id ===
                "string" &&
              service.id.trim()
                .length > 0 &&
              typeof service.name ===
                "string" &&
              service.name.trim()
                .length > 0,
          )
          .slice(0, 200);

      if (
        validServices.length === 0
      ) {
        return fallbackResult();
      }

      /*
       * --------------------------------
       * GEMINI API KEY
       * --------------------------------
       */

      const apiKey =
        process.env.GEMINI_API_KEY?.trim();

      if (!apiKey) {
        console.error(
          "GEMINI_API_KEY is not configured.",
        );

        return fallbackResult();
      }

      /*
       * --------------------------------
       * COMPACT SERVICE CATALOG
       * --------------------------------
       */

      const catalog =
        validServices.map(
          (service) => ({
            id: service.id,

            name:
              service.name,

            description:
              service.description ??
              "",

            category:
              service.category ??
              "",

            subcategory:
              service.subcategory ??
              "",

            aliases:
              Array.isArray(
                service.aliases,
              )
                ? service.aliases.slice(
                    0,
                    30,
                  )
                : [],

            keywords:
              Array.isArray(
                service.keywords,
              )
                ? service.keywords.slice(
                    0,
                    30,
                  )
                : [],

            tags:
              Array.isArray(
                service.tags,
              )
                ? service.tags.slice(
                    0,
                    20,
                  )
                : [],
          }),
        );

      /*
       * --------------------------------
       * GEMINI CLIENT
       * --------------------------------
       */

      const ai =
        new GoogleGenAI({
          apiKey,
        });

      /*
       * --------------------------------
       * PROMPT
       * --------------------------------
       */

      const prompt = `
You are Fixxam's background
multilingual service matcher.

Your ONLY job is to understand the
customer's request and select the
ONE BEST EXISTING SERVICE from the
provided catalog.

SUPPORTED LANGUAGES:

English
Hausa
Yoruba
Igbo
Nigerian Pidgin

You must understand:

- normal sentences
- short phrases
- slang
- spelling mistakes
- phonetic spelling
- informal Nigerian English
- Hausa expressions
- Yoruba expressions
- Igbo expressions
- Nigerian Pidgin
- mixed languages
- synonyms
- different descriptions of the same job

The customer does NOT need to use
the exact service name.

Examples:

"aski"
"yin aski"
"gyaran gashi"
"yanke gashi"
"barbing"
"haircut"
"hair cut"

can refer to a haircut/barbing
service when such a service exists.

Examples:

"gyaran ac"
"ac dina ya lalace"
"air conditioner baya aiki"
"fix my AC"
"abeg fix my AC"

can refer to AC repair when such
a service exists.

Examples:

"gyaran waya"
"wayata ta lalace"
"phone repair"
"fix my phone"

can refer to phone repair when such
a service exists.

IMPORTANT RULES:

1. ONLY select an ID that exists in
   the supplied service catalog.

2. NEVER invent a service.

3. NEVER invent a service ID.

4. NEVER select a worker.

5. NEVER create a booking.

6. NEVER return a service that is
   not in the catalog.

7. Use aliases, keywords and tags
   when understanding the request.

8. The customer's exact words do not
   need to match the service name.

9. If the relationship is weak,
   return null.

10. Confidence must be between 0
    and 1.

11. Return ONLY JSON.

CUSTOMER QUERY:

${JSON.stringify(query)}

SERVICE CATALOG:

${JSON.stringify(catalog)}

Return exactly this structure:

{
  "serviceId": "existing-id-or-null",
  "confidence": 0.0,
  "language": "english"
}

Allowed language values:

english
hausa
yoruba
igbo
pidgin
unknown
`;

      /*
       * --------------------------------
       * CALL GEMINI
       * --------------------------------
       */

      try {
        const response =
          await ai.models.generateContent(
            {
              model:
                "gemini-2.5-flash",

              contents:
                prompt,

              config: {
                temperature: 0,

                responseMimeType:
                  "application/json",
              },
            },
          );

        const rawText =
          response.text?.trim() ??
          "";

        if (!rawText) {
          console.warn(
            "AI returned empty response.",
          );

          return fallbackResult();
        }

        /*
         * --------------------------------
         * CLEAN JSON
         * --------------------------------
         */

        const cleanedText =
          cleanJsonResponse(
            rawText,
          );

        let parsed: Partial<AiResult>;

        try {
          parsed =
            JSON.parse(
              cleanedText,
            ) as Partial<AiResult>;
        } catch (
          parseError
        ) {
          console.error(
            "AI JSON parse error:",
            parseError,
          );

          console.error(
            "AI raw response:",
            rawText,
          );

          return fallbackResult();
        }

        /*
         * --------------------------------
         * LANGUAGE
         * --------------------------------
         */

        const language =
          normalizeLanguage(
            parsed.language,
          );

        /*
         * --------------------------------
         * VERIFY SERVICE ID
         * --------------------------------
         *
         * Never trust an AI-generated ID.
         */

        const serviceId =
          typeof parsed.serviceId ===
            "string"
            ? parsed.serviceId.trim()
            : null;

        const matchedService =
          serviceId
            ? validServices.find(
                (service) =>
                  service.id ===
                  serviceId,
              )
            : undefined;

        /*
         * AI did not return a valid
         * Firebase service.
         */

        if (!matchedService) {
          console.log(
            "AI returned no valid service match.",
            {
              query,
              serviceId,
              language,
            },
          );

          return {
            serviceId: null,
            confidence: 0,
            language,
          };
        }

        /*
         * --------------------------------
         * CONFIDENCE
         * --------------------------------
         */

        const confidence =
          clampConfidence(
            parsed.confidence,
          );

        /*
         * Reject weak matches.
         *
         * Local search remains primary.
         */

        if (
          confidence < 0.55
        ) {
          console.log(
            "AI match confidence too low.",
            {
              query,
              serviceId:
                matchedService.id,
              confidence,
              language,
            },
          );

          return {
            serviceId: null,
            confidence,
            language,
          };
        }

        /*
         * --------------------------------
         * SUCCESS
         * --------------------------------
         */

        console.log(
          "AI SERVICE MATCH:",
          {
            query,
            serviceId:
              matchedService.id,
            confidence,
            language,
          },
        );

        return {
          serviceId:
            matchedService.id,

          confidence,

          language,
        };
      } catch (error) {
        /*
         * --------------------------------
         * QUOTA / RATE LIMIT
         * --------------------------------
         */

        if (
          isQuotaError(error)
        ) {
          console.warn(
            "Gemini quota/rate limit reached. Using local search fallback.",
          );

          return fallbackResult();
        }

        /*
         * --------------------------------
         * OTHER AI ERROR
         * --------------------------------
         */

        console.error(
          "AI search helper failed:",
          error,
        );

        /*
         * IMPORTANT:
         *
         * Do not break customer search
         * because AI failed.
         */

        return fallbackResult();
      }
    },
  );