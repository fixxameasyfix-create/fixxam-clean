import { VertexAI } from "@google-cloud/vertexai";

import { GEMINI_CONFIG } from "../../config/gemini";

import type {
  GeminiRequest,
  GeminiResponse,
} from "./types";

/* ============================================================
   CONSTANTS
============================================================ */

const GEMINI_LOCATION =
  "us-central1";

/* ============================================================
   MODEL
============================================================ */

function getGeminiModel() {
  const projectId =
    process.env.GCLOUD_PROJECT ??
    process.env.GCP_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT;

  if (!projectId) {
    throw new Error(
      "Google Cloud project ID is not configured.",
    );
  }

  const vertexAI =
    new VertexAI({
      project: projectId,
      location:
        GEMINI_LOCATION,
    });

  return vertexAI.getGenerativeModel({
    model:
      GEMINI_CONFIG.model,
  });
}

/* ============================================================
   CONVERSATION
============================================================ */

function buildConversation(
  messages: GeminiRequest["messages"],
) {
  return messages
    .filter(
      (message) =>
        message.role === "user" ||
        message.role === "assistant",
    )
    .map((message) => {
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

      /* ------------------------------------------------------
         TEXT
      ------------------------------------------------------ */

      if (
        typeof message.content ===
          "string" &&
        message.content.trim()
      ) {
        parts.push({
          text:
            message.content.trim(),
        });
      }

      /* ------------------------------------------------------
         IMAGE
      ------------------------------------------------------ */

      if (
        message.image &&
        typeof message.image.mimeType ===
          "string" &&
        typeof message.image.data ===
          "string" &&
        message.image.mimeType.trim() &&
        message.image.data.trim()
      ) {
        parts.push({
          inlineData: {
            mimeType:
              message.image.mimeType,
            data:
              message.image.data,
          },
        });
      }

      /*
       * Ignore completely empty messages.
       */
      if (parts.length === 0) {
        return null;
      }

      return {
        role:
          message.role ===
          "assistant"
            ? "model"
            : "user",

        parts,
      };
    })
    .filter(
      (
        message,
      ): message is NonNullable<
        typeof message
      > =>
        message !== null,
    );
}

/* ============================================================
   RESPONSE TEXT
============================================================ */

function extractResponseText(
  result: Awaited<
    ReturnType<
      ReturnType<
        typeof getGeminiModel
      >["generateContent"]
    >
  >,
): string {
  const candidates =
    result.response
      .candidates ?? [];

  const textParts: string[] =
    [];

  for (
    const candidate of
      candidates
  ) {
    const parts =
      candidate.content
        ?.parts ?? [];

    for (
      const part of parts
    ) {
      if (
        "text" in part &&
        typeof part.text ===
          "string" &&
        part.text.trim()
      ) {
        textParts.push(
          part.text.trim(),
        );
      }
    }
  }

  return textParts.join("\n").trim();
}

/* ============================================================
   GENERATE CONTENT
============================================================ */

export async function generateContent(
  request: GeminiRequest,
): Promise<GeminiResponse> {
  /* ==========================================================
     VALIDATION
  ========================================================== */

  const systemPrompt =
    request.systemPrompt.trim();

  if (!systemPrompt) {
    throw new Error(
      "Gemini system prompt is required.",
    );
  }

  const conversation =
    buildConversation(
      request.messages ?? [],
    );

  if (
    conversation.length ===
    0
  ) {
    throw new Error(
      "Gemini conversation cannot be empty.",
    );
  }

  /* ==========================================================
     LOGGING
  ========================================================== */

  console.log(
    "========== GEMINI REQUEST ==========",
  );

  console.log(
    "Model:",
    GEMINI_CONFIG.model,
  );

  console.log(
    "Location:",
    GEMINI_LOCATION,
  );

  console.log(
    "Conversation messages:",
    conversation.length,
  );

  console.log(
    "Response MIME type:",
    request.responseMimeType ??
      "application/json",
  );

  console.log(
    "====================================",
  );

  try {
    /* ========================================================
       MODEL
    ======================================================== */

    const model =
      getGeminiModel();

    /* ========================================================
       GENERATION CONFIG
    ======================================================== */

    const generationConfig = {
      temperature:
        request.temperature ??
        GEMINI_CONFIG.temperature,

      topP:
        request.topP ??
        GEMINI_CONFIG.topP,

      topK:
        request.topK ??
        GEMINI_CONFIG.topK,

      maxOutputTokens:
        request.maxOutputTokens ??
        GEMINI_CONFIG.maxOutputTokens,

      responseMimeType:
        request.responseMimeType ??
        "application/json",

      ...(request.responseSchema
        ? {
            responseSchema:
              request.responseSchema,
          }
        : {}),
    };

    /* ========================================================
       GEMINI REQUEST
       
       IMPORTANT:
       
       systemPrompt belongs in systemInstruction.
       
       It must NOT be inserted into
       contents as a fake user message.
    ======================================================== */

    const result =
      await model.generateContent({
        systemInstruction: {
          role: "system",

          parts: [
            {
              text: systemPrompt,
            },
          ],
        },

        contents:
          conversation,

        generationConfig,
      });

    /* ========================================================
       RESPONSE
    ======================================================== */

    const text =
      extractResponseText(
        result,
      );

    console.log(
      "========== GEMINI RESPONSE ==========",
    );

    console.log(
      "Candidates:",
      result.response
        .candidates?.length ??
        0,
    );

    console.log(
      "Response length:",
      text.length,
    );

    console.log(
      "Finish reason:",
      result.response
        .candidates?.[0]
        ?.finishReason ??
        "UNKNOWN",
    );

    console.log(
      "======================================",
    );

    /* ========================================================
       EMPTY RESPONSE
    ======================================================== */

    if (!text) {
      const finishReason =
        result.response
          .candidates?.[0]
          ?.finishReason;

      throw new Error(
        `Gemini returned an empty response${
          finishReason
            ? ` (${finishReason})`
            : ""
        }.`,
      );
    }

    /* ========================================================
       DEVELOPMENT DEBUG
       
       Do not write customer/AI
       responses to disk in production.
    ======================================================== */

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.log(
        "========== GEMINI TEXT ==========",
      );

      console.log(text);

      console.log(
        "=================================",
      );
    }

    /* ========================================================
       RETURN
    ======================================================== */

    return {
      text,
    };
  } catch (error: unknown) {
    /* ========================================================
       ERROR
    ======================================================== */

    console.error(
      "========== VERTEX GEMINI ERROR ==========",
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
      console.error(
        error,
      );
    }

    console.error(
      "==========================================",
    );

    throw error;
  }
}