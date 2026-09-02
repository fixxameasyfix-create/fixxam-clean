import { VertexAI } from "@google-cloud/vertexai";

import { GEMINI_CONFIG } from "../../config/gemini";

import type { ChatMessage } from "./types";

const LOCATION = "us-central1";

/* ============================================================
   GENERATE FIX YOURSELF CONTENT
============================================================ */

export async function generateFixYourselfContent(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  /* ==========================================================
     VALIDATION
  ========================================================== */

  const projectId =
    process.env.GCLOUD_PROJECT ??
    process.env.GCP_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT;

  if (!projectId) {
    throw new Error(
      "Google Cloud project ID is not configured.",
    );
  }

  if (!systemPrompt.trim()) {
    throw new Error(
      "Fix Yourself system prompt is empty.",
    );
  }

  if (messages.length === 0) {
    throw new Error(
      "Fix Yourself conversation is empty.",
    );
  }

  /* ==========================================================
     VERTEX AI
  ========================================================== */

  const vertexAI =
    new VertexAI({
      project: projectId,
      location: LOCATION,
    });

  const model =
    vertexAI.getGenerativeModel({
      model: GEMINI_CONFIG.model,
    });

  /* ==========================================================
     BUILD CONVERSATION
  ========================================================== */

  const contents =
    messages
      .filter(
        (message) =>
          (
            message.role === "user" ||
            message.role === "assistant"
          ) &&
          typeof message.content === "string" &&
          message.content.trim().length > 0,
      )
      .map((message) => ({
        role:
          message.role === "assistant"
            ? ("model" as const)
            : ("user" as const),

        parts: [
          {
            text:
              message.content.trim(),
          },
        ],
      }));

  if (contents.length === 0) {
    throw new Error(
      "Fix Yourself conversation contains no usable messages.",
    );
  }

  /* ==========================================================
     DEBUG REQUEST
  ========================================================== */

  console.log(
    "========== FIX YOURSELF GEMINI START ==========",
  );

  console.log(
    "Model:",
    GEMINI_CONFIG.model,
  );

  console.log(
    "Location:",
    LOCATION,
  );

  console.log(
    "Messages:",
    contents.length,
  );

  console.log(
    "System prompt length:",
    systemPrompt.length,
  );

  /* ==========================================================
     GENERATE
  ========================================================== */

  try {
    const result =
      await model.generateContent({
        systemInstruction: {
          role: "system",

          parts: [
            {
              text: systemPrompt.trim(),
            },
          ],
        },

        contents,

        generationConfig: {
          temperature: 0,

          topP: 0.8,

          topK: 20,

          maxOutputTokens: 1800,

          /*
           * We intentionally do NOT use
           * responseSchema here.
           *
           * Gemini will return JSON because
           * the response MIME type is JSON
           * and the system prompt requires
           * the exact response structure.
           */
          responseMimeType:
            "application/json",
        },
      });

    /* ========================================================
       CANDIDATES
    ======================================================== */

    const candidates =
      result.response.candidates ?? [];

    console.log(
      "Candidates:",
      candidates.length,
    );

    console.log(
      "Finish reason:",
      candidates[0]?.finishReason ??
        "UNKNOWN",
    );

    /* ========================================================
       EXTRACT TEXT
    ======================================================== */

    const textParts: string[] = [];

    for (
      const candidate of candidates
    ) {
      const parts =
        candidate.content?.parts ?? [];

      for (
        const part of parts
      ) {
        if (
          "text" in part &&
          typeof part.text === "string" &&
          part.text.trim()
        ) {
          textParts.push(
            part.text.trim(),
          );
        }
      }
    }

    const text =
      textParts
        .join("\n")
        .trim();

    console.log(
      "Response length:",
      text.length,
    );

    /* ========================================================
       EMPTY RESPONSE
    ======================================================== */

    if (!text) {
      const finishReason =
        candidates[0]?.finishReason;

      throw new Error(
        `Fix Yourself Gemini returned an empty response${
          finishReason
            ? ` (${finishReason})`
            : ""
        }.`,
      );
    }

    /* ========================================================
       RAW RESPONSE
    ======================================================== */

    console.log(
      "========== FIX YOURSELF GEMINI RESPONSE ==========",
    );

    console.log(text);

    console.log(
      "===================================================",
    );

    return text;
  } catch (
    error: unknown
  ) {
    /* ========================================================
       ERROR
    ======================================================== */

    console.error(
      "========== FIX YOURSELF GEMINI ERROR ==========",
    );

    if (
      error instanceof Error
    ) {
      console.error(
        "Message:",
        error.message,
      );

      console.error(
        "Stack:",
        error.stack,
      );
    } else {
      console.error(error);
    }

    console.error(
      "================================================",
    );

    throw error;
  }
}