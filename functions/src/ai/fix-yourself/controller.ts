import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  getFirestore,
} from "firebase-admin/firestore";

import {
  analyzeFixYourself,
} from "./service";

import type {
  AvailableService,
  ChatMessage,
  FixYourselfEngineResponse,
} from "./types";

let cachedServices: AvailableService[] =
  [];

let cacheExpires = 0;

async function getServices(): Promise<
  AvailableService[]
> {
  if (
    cachedServices.length > 0 &&
    Date.now() < cacheExpires
  ) {
    return cachedServices;
  }

  const snapshot =
    await getFirestore()
      .collection("services")
      .where(
        "active",
        "==",
        true,
      )
      .get();

  cachedServices =
    snapshot.docs.map((doc) => {
      const service =
        doc.data();

      return {
        id:
          typeof service.id ===
          "string"
            ? service.id
            : doc.id,

        name:
          typeof service.name ===
          "string"
            ? service.name
            : "",
      };
    });

  cacheExpires =
    Date.now() +
    10 * 60 * 1000;

  return cachedServices;
}

export const fixYourselfAi = onCall(
  {
    timeoutSeconds: 60,
    memory: "512MiB",
    cors: true,
  },
  async (
    request,
  ): Promise<FixYourselfEngineResponse> => {
    const data =
      request.data ?? {};

    console.log(
      "========== RAW REQUEST ==========",
    );

    console.dir(data, {
      depth: null,
    });

    console.log(
      "=================================",
    );

    const problem =
      typeof data.problem ===
      "string"
        ? data.problem.trim()
        : "";

    if (!problem) {
      throw new HttpsError(
        "invalid-argument",
        "Problem description is required.",
      );
    }

    try {
      console.log(
        "Loading services...",
      );

      const services =
        await getServices();

      console.log(
        "Services loaded:",
        services.length,
      );

      const messages: ChatMessage[] =
        Array.isArray(
          data.messages,
        )
          ? data.messages.map(
              (
                item: any,
                index: number,
              ) => {
                console.log(
                  `Message ${index}`,
                  item,
                );

                return {
                  role:
                    item?.role ===
                    "assistant"
                      ? "assistant"
                      : "user",

                  content:
                    typeof item?.content ===
                    "string"
                      ? item.content.trim()
                      : String(
                          item?.content ??
                            "",
                        ),
                };
              },
            )
          : [];

      console.log(
        "Normalized messages:",
      );

      console.dir(messages, {
        depth: null,
      });

      const followUpCount =
        typeof data.followUpCount ===
        "number"
          ? data.followUpCount
          : 0;

      const forceDiagnosis =
        data.forceDiagnosis ===
        true;

      console.log(
        "Calling analyzeFixYourself...",
      );

      const result =
        await analyzeFixYourself(
          problem,
          services,
          messages,
          followUpCount,
          forceDiagnosis,
        );

      console.log(
        "Analysis completed.",
      );

      console.dir(result, {
        depth: null,
      });

      return result;
    } catch (error: any) {
      console.error(
        "========== FIX YOURSELF AI ERROR ==========",
      );

      console.error(
        "MESSAGE:",
        error?.message,
      );

      console.error(
        "CODE:",
        error?.code,
      );

      console.error(
        "STACK:",
        error?.stack,
      );

      console.dir(error, {
        depth: null,
      });

      console.error(
        "===========================================",
      );

      throw new HttpsError(
        "internal",
        error?.message ??
          "Failed to analyze repair problem.",
      );
    }
  },
);