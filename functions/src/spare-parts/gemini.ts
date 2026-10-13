import {
  GoogleGenAI,
  Type,
} from "@google/genai";

import {
  SPARE_PART_SYSTEM_PROMPT,
} from "./prompt";

import type {
  SparePartIdentifyRequest,
} from "./types";

/* ==============================================================
   CONFIG
============================================================== */

const MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  "gemini-2.5-flash";

const MAX_IMAGE_BASE64_LENGTH =
  6_000_000;

const GEMINI_TIMEOUT_MS =
  45_000;

/* ==============================================================
   RESPONSE SCHEMA
============================================================== */

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,

  properties: {
    identified: {
      type: Type.BOOLEAN,
    },

    rejected: {
      type: Type.BOOLEAN,
    },

    reason: {
      type: Type.STRING,
    },

    message: {
      type: Type.STRING,
    },

    partName: {
      type: Type.STRING,
    },

    equipmentName: {
      type: Type.STRING,
    },

    brandName: {
      type: Type.STRING,
    },

    category: {
      type: Type.STRING,
    },

    searchQuery: {
      type: Type.STRING,
    },

    keywords: {
      type: Type.ARRAY,

      items: {
        type: Type.STRING,
      },
    },

    confidence: {
      type: Type.NUMBER,
    },
  },

  required: [
    "identified",
    "rejected",
    "reason",
    "message",
    "partName",
    "equipmentName",
    "brandName",
    "category",
    "searchQuery",
    "keywords",
    "confidence",
  ],
};

/* ==============================================================
   TIMEOUT
============================================================== */

export class SparePartAiTimeoutError
  extends Error {
  constructor() {
    super(
      "Spare-part AI request timed out.",
    );

    this.name =
      "SparePartAiTimeoutError";
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
): Promise<T> {
  let timer:
    | ReturnType<typeof setTimeout>
    | undefined;

  const timeoutPromise =
    new Promise<never>(
      (_, reject) => {
        timer =
          setTimeout(
            () => {
              reject(
                new SparePartAiTimeoutError(),
              );
            },
            GEMINI_TIMEOUT_MS,
          );
      },
    );

  try {
    return await Promise.race([
      promise,
      timeoutPromise,
    ]);
  } finally {
    if (timer) {
      clearTimeout(
        timer,
      );
    }
  }
}

/* ==============================================================
   HELPERS
============================================================== */

function cleanText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function cleanJson(
  value: string,
): string {
  const cleaned =
    value
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

  const start =
    cleaned.indexOf("{");

  const end =
    cleaned.lastIndexOf("}");

  if (
    start === -1 ||
    end === -1 ||
    end <= start
  ) {
    throw new Error(
      "Gemini returned invalid JSON.",
    );
  }

  return cleaned.slice(
    start,
    end + 1,
  );
}

/* ==============================================================
   CLIENT
============================================================== */

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

/* ==============================================================
   GENERATE
============================================================== */

export async function generateSparePartAnalysis(
  request: SparePartIdentifyRequest,
): Promise<string> {
  const imageBase64 =
    cleanText(
      request.imageBase64,
    );

  const mimeType =
    cleanText(
      request.mimeType,
    ) ||
    "image/jpeg";

  const description =
    cleanText(
      request.description,
    );

  const equipmentId =
    cleanText(
      request.equipmentId,
    );

  const equipmentName =
    cleanText(
      request.equipmentName,
    );

  const brandId =
    cleanText(
      request.brandId,
    );

  const brandName =
    cleanText(
      request.brandName,
    );

  const hasEquipmentContext =
    Boolean(
      equipmentId ||
      equipmentName ||
      brandId ||
      brandName,
    );

  if (
    !imageBase64 &&
    !description &&
    !hasEquipmentContext
  ) {
    throw new Error(
      "Spare-part search input is required.",
    );
  }

  if (
    imageBase64.length >
    MAX_IMAGE_BASE64_LENGTH
  ) {
    throw new Error(
      "Image is too large.",
    );
  }

  const parts: Array<
    | {
        text: string;
      }
    | {
        inlineData: {
          mimeType: string;
          data: string;
        };
      }
  > = [];

  /* ============================================================
     TRUSTED CONTEXT
  ============================================================ */

  const contextLines: string[] =
    [];

  if (description) {
    contextLines.push(
      `CUSTOMER DESCRIPTION: ${description}`,
    );
  }

  if (equipmentId) {
    contextLines.push(
      `KNOWN EQUIPMENT ID: ${equipmentId}`,
    );
  }

  if (equipmentName) {
    contextLines.push(
      `KNOWN EQUIPMENT: ${equipmentName}`,
    );
  }

  if (brandId) {
    contextLines.push(
      `KNOWN BRAND ID: ${brandId}`,
    );
  }

  if (brandName) {
    contextLines.push(
      `KNOWN BRAND: ${brandName}`,
    );
  }

  if (
    contextLines.length >
    0
  ) {
    parts.push({
      text:
        contextLines.join(
          "\n",
        ),
    });
  }

  /* ============================================================
     IMAGE
  ============================================================ */

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType,

        data:
          imageBase64,
      },
    });
  }

  /* ============================================================
     TASK
  ============================================================ */

  parts.push({
    text: `
Identify the most likely physical spare part the customer is looking for.

If trusted equipment or brand information is provided,
keep it as the authoritative context.

Return product-search metadata only.
`,
  });

  const ai =
    getGeminiClient();

  const response =
    await withTimeout(
      ai.models.generateContent({
        model: MODEL,

        contents: [
          {
            role: "user",

            parts,
          },
        ],

        config: {
          systemInstruction:
            SPARE_PART_SYSTEM_PROMPT,

          responseMimeType:
            "application/json",

          responseSchema:
            RESPONSE_SCHEMA,

          temperature: 0.1,

          maxOutputTokens:
            700,
        },
      }),
    );

  const text =
    cleanText(
      response.text,
    );

  if (!text) {
    throw new Error(
      "Gemini returned an empty response.",
    );
  }

  return cleanJson(
    text,
  );
}