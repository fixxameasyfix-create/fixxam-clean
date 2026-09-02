import {
  GoogleGenAI,
} from "@google/genai";

import {
  AI_BOOKING_SYSTEM_PROMPT,
} from "./prompt";

import type {
  AiBookingRequest,
} from "./types";

const MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  "gemini-2.5-flash";

const MAX_DESCRIPTION_LENGTH = 4000;

const MAX_IMAGE_BASE64_LENGTH =
  6_000_000;

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

function cleanText(
  value: unknown,
): string {
  if (
    typeof value !== "string"
  ) {
    return "";
  }

  return value.trim();
}

function cleanJson(
  text: string,
): string {
  const cleaned =
    text
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

export async function generateAiBookingResponse(
  request: AiBookingRequest,
): Promise<string> {
  const description =
    cleanText(
      request.description,
    ).slice(
      0,
      MAX_DESCRIPTION_LENGTH,
    );

  const imageBase64 =
    cleanText(
      request.imageBase64,
    );

  if (
    !description &&
    !imageBase64
  ) {
    throw new Error(
      "Description or image is required.",
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

  const ai =
    getGeminiClient();

  const parts: Array<
    Record<string, unknown>
  > = [];

  if (description) {
    parts.push({
      text:
        `CUSTOMER REQUEST:\n${description}`,
    });
  }

  if (imageBase64) {
    const mimeType =
      cleanText(
        request.mimeType,
      ) || "image/jpeg";

    parts.push({
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    });
  }

  try {
    const response =
      await ai.models.generateContent({
        model: MODEL,

        contents: [
          {
            role: "user",
            parts,
          },
        ],

        config: {
          systemInstruction:
            AI_BOOKING_SYSTEM_PROMPT,

          temperature: 0.1,

          responseMimeType:
            "application/json",

          maxOutputTokens: 1024,
        },
      });

    const text =
      cleanText(
        response.text,
      );

    if (!text) {
      throw new Error(
        "Gemini returned an empty response.",
      );
    }

    return cleanJson(text);
  } catch (error) {
    console.error(
      "AI BOOKING GEMINI ERROR",
      error,
    );

    throw new Error(
      "Unable to analyze the booking request.",
    );
  }
}