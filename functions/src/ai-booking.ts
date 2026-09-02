import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  defineSecret,
} from "firebase-functions/params";

import {
  GoogleGenAI,
} from "@google/genai";

import {
  getFirestore,
} from "firebase-admin/firestore";

/* ==============================================================
   SECRET
============================================================== */

const GEMINI_API_KEY =
  defineSecret("GEMINI_API_KEY");

/* ==============================================================
   TYPES
============================================================== */

type ServiceRecord = {
  id: string;
  name: string;
};

type AiBookingRequest = {
  description?: unknown;
  imageBase64?: unknown;
  mimeType?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  address?: unknown;
};

type AiBookingRejectionReason =
  | ""
  | "unclear_request"
  | "unsupported_service"
  | "unclear_image"
  | "no_worker";

type GeminiResult = {
  completed?: unknown;
  rejected?: unknown;
  message?: unknown;
  reason?: unknown;
  serviceId?: unknown;
  serviceName?: unknown;
  confidence?: unknown;
};

type WorkerRecord = {
  id: string;

  firstName: string;
  surname: string;

  photoUrl: string;

  rating: number;
  completedJobs: number;

  verified: boolean;
  available: boolean;
  online: boolean;

  latitude: number | null;
  longitude: number | null;

  address: string;
};

type WorkerWithDistance = {
  worker: WorkerRecord;
  distanceKm: number | null;
};

/* ==============================================================
   CONFIG
============================================================== */

const MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  "gemini-3.6-flash";

const MAX_DESCRIPTION_LENGTH =
  4000;

const MAX_IMAGE_BASE64_LENGTH =
  8_000_000;

const MAX_ADDRESS_LENGTH =
  500;

const MIN_CONFIDENCE =
  0.65;

const MAX_WORKERS_TO_CHECK =
  100;

const GEMINI_TIMEOUT_MS =
  45_000;

const FIRESTORE_TIMEOUT_MS =
  15_000;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/* ==============================================================
   LOGGING
============================================================== */

function logStep(
  step: string,
  data?: unknown,
): void {
  console.log(
    `[AI_BOOKING] ${new Date().toISOString()} | ${step}`,
    data ?? "",
  );
}

/* ==============================================================
   TIMEOUT
============================================================== */

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timer:
    | ReturnType<typeof setTimeout>
    | undefined;

  const timeoutPromise =
    new Promise<never>(
      (_, reject) => {
        timer = setTimeout(
          () => {
            reject(
              new Error(
                `${label} timed out after ${timeoutMs}ms.`,
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
      timeoutPromise,
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/* ==============================================================
   TEXT
============================================================== */

function cleanText(
  value: unknown,
  maxLength = MAX_DESCRIPTION_LENGTH,
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

/* ==============================================================
   NUMBERS
============================================================== */

function toNumberOrNull(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return null;
}

/* ==============================================================
   COORDINATE VALIDATION
============================================================== */

function isValidLatitude(
  value: number | null,
): value is number {
  return (
    value !== null &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value: number | null,
): value is number {
  return (
    value !== null &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

function hasValidCoordinates(
  latitude: number | null,
  longitude: number | null,
): boolean {
  return (
    isValidLatitude(latitude) &&
    isValidLongitude(longitude)
  );
}

/* ==============================================================
   DISTANCE
============================================================== */

function calculateDistanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const earthRadiusKm =
    6371;

  const latitudeDifference =
    ((latitude2 - latitude1) *
      Math.PI) /
    180;

  const longitudeDifference =
    ((longitude2 - longitude1) *
      Math.PI) /
    180;

  const a =
    Math.sin(
      latitudeDifference / 2,
    ) ** 2 +
    Math.cos(
      (latitude1 * Math.PI) /
        180,
    ) *
      Math.cos(
        (latitude2 * Math.PI) /
          180,
      ) *
      Math.sin(
        longitudeDifference / 2,
      ) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return (
    earthRadiusKm * c
  );
}

/* ==============================================================
   SERVICES
============================================================== */

async function getActiveServices(): Promise<
  ServiceRecord[]
> {
  logStep(
    "SERVICES QUERY START",
  );

  const firestore =
    getFirestore();

  const snapshot =
    await withTimeout(
      firestore
        .collection("services")
        .where(
          "active",
          "==",
          true,
        )
        .get(),
      FIRESTORE_TIMEOUT_MS,
      "Services Firestore query",
    );

  const services =
    snapshot.docs
      .map((doc) => {
        const data =
          doc.data();

        return {
          id: doc.id,

          name:
            typeof data.name ===
            "string"
              ? data.name.trim()
              : "",
        };
      })
      .filter(
        (service) =>
          service.id.length > 0 &&
          service.name.length > 0,
      );

  logStep(
    "SERVICES QUERY COMPLETE",
    {
      count:
        services.length,
    },
  );

  return services;
}

/* ==============================================================
   SERVICE MATCH
============================================================== */

function findService(
  services: ServiceRecord[],
  aiId: string,
  aiName: string,
): ServiceRecord | null {
  /*
   * First: exact service ID.
   */
  if (aiId) {
    const exactId =
      services.find(
        (service) =>
          service.id === aiId,
      );

    if (exactId) {
      return exactId;
    }
  }

  /*
   * Second: exact normalized name.
   */
  const normalizedName =
    normalize(aiName);

  if (!normalizedName) {
    return null;
  }

  const exactName =
    services.find(
      (service) =>
        normalize(
          service.name,
        ) === normalizedName,
    );

  if (exactName) {
    return exactName;
  }

  /*
   * Third: controlled partial match.
   */
  const partial =
    services.find(
      (service) => {
        const name =
          normalize(
            service.name,
          );

        return (
          name.includes(
            normalizedName,
          ) ||
          normalizedName.includes(
            name,
          )
        );
      },
    );

  return partial ?? null;
}

/* ==============================================================
   WORKERS
============================================================== */

async function getAvailableWorkersByService(
  serviceId: string,
): Promise<WorkerRecord[]> {
  logStep(
    "WORKER QUERY START",
    {
      serviceId,
    },
  );

  const firestore =
    getFirestore();

  const snapshot =
    await withTimeout(
      firestore
        .collection("users")
        .where(
          "workerProfile.selectedServices",
          "array-contains",
          serviceId,
        )
        .limit(
          MAX_WORKERS_TO_CHECK,
        )
        .get(),
      FIRESTORE_TIMEOUT_MS,
      "Worker Firestore query",
    );

  logStep(
    "WORKER QUERY COMPLETE",
    {
      documents:
        snapshot.size,
    },
  );

  const workers =
    snapshot.docs
      .map((doc) => {
        const data =
          doc.data();

        const roles =
          Array.isArray(
            data.roles,
          )
            ? data.roles
            : [];

        if (
          !roles.includes(
            "worker",
          )
        ) {
          return null;
        }

        if (
          data.available !==
          true
        ) {
          return null;
        }

        const workerProfile =
          data.workerProfile;

        if (
          !workerProfile ||
          typeof workerProfile !==
            "object"
        ) {
          return null;
        }

        const profile =
          workerProfile as Record<
            string,
            unknown
          >;

        return {
          id: doc.id,

          firstName:
            typeof data.firstName ===
            "string"
              ? data.firstName.trim()
              : "",

          surname:
            typeof data.surname ===
            "string"
              ? data.surname.trim()
              : "",

          photoUrl:
            typeof profile.photoUrl ===
            "string"
              ? profile.photoUrl.trim()
              : "",

          rating:
            typeof data.rating ===
              "number" &&
            Number.isFinite(
              data.rating,
            )
              ? data.rating
              : 0,

          completedJobs:
            typeof data.completedJobs ===
              "number" &&
            Number.isFinite(
              data.completedJobs,
            )
              ? data.completedJobs
              : 0,

          verified:
            data.verified === true,

          available:
            data.available === true,

          online:
            data.online === true,

          latitude:
            toNumberOrNull(
              profile.latitude,
            ),

          longitude:
            toNumberOrNull(
              profile.longitude,
            ),

          address:
            typeof profile.address ===
            "string"
              ? profile.address.trim()
              : "",
        };
      })
      .filter(
        (
          worker,
        ): worker is WorkerRecord =>
          worker !== null,
      );

  logStep(
    "WORKER FILTER COMPLETE",
    {
      availableWorkers:
        workers.length,
    },
  );

  return workers;
}

/* ==============================================================
   SELECT BEST WORKER
============================================================== */

function selectBestWorker(
  workers: WorkerRecord[],
  customerLatitude: number | null,
  customerLongitude: number | null,
): WorkerWithDistance | null {
  logStep(
    "WORKER SELECTION START",
    {
      workers:
        workers.length,
    },
  );

  if (
    workers.length === 0
  ) {
    return null;
  }

  const customerHasLocation =
    hasValidCoordinates(
      customerLatitude,
      customerLongitude,
    );

  const results =
    workers.map(
      (worker) => {
        let distanceKm:
          | number
          | null = null;

        const workerHasLocation =
          hasValidCoordinates(
            worker.latitude,
            worker.longitude,
          );

        /*
         * TypeScript-safe coordinate handling.
         *
         * We copy the values into local constants after
         * validation so there is no "number | null" error.
         */
        const workerLatitude =
          worker.latitude;

        const workerLongitude =
          worker.longitude;

        if (
          customerHasLocation &&
          workerHasLocation &&
          workerLatitude !== null &&
          workerLongitude !== null &&
          customerLatitude !== null &&
          customerLongitude !== null
        ) {
          distanceKm =
            calculateDistanceKm(
              customerLatitude,
              customerLongitude,
              workerLatitude,
              workerLongitude,
            );
        }

        return {
          worker,
          distanceKm,
        };
      },
    );

  /*
   * Sort priority:
   *
   * 1. Closest worker when location exists
   * 2. Verified worker
   * 3. Higher rating
   * 4. More completed jobs
   */
  results.sort(
    (a, b) => {
      if (
        a.distanceKm !== null &&
        b.distanceKm !== null
      ) {
        if (
          a.distanceKm !==
          b.distanceKm
        ) {
          return (
            a.distanceKm -
            b.distanceKm
          );
        }
      }

      if (
        a.distanceKm !== null &&
        b.distanceKm === null
      ) {
        return -1;
      }

      if (
        a.distanceKm === null &&
        b.distanceKm !== null
      ) {
        return 1;
      }

      if (
        a.worker.verified !==
        b.worker.verified
      ) {
        return a.worker
          .verified
          ? -1
          : 1;
      }

      if (
        a.worker.rating !==
        b.worker.rating
      ) {
        return (
          b.worker.rating -
          a.worker.rating
        );
      }

      return (
        b.worker.completedJobs -
        a.worker.completedJobs
      );
    },
  );

  const selected =
    results[0] ?? null;

  logStep(
    "WORKER SELECTION COMPLETE",
    selected
      ? {
          workerId:
            selected.worker.id,

          distanceKm:
            selected.distanceKm,

          verified:
            selected.worker
              .verified,

          rating:
            selected.worker
              .rating,
        }
      : null,
  );

  return selected;
}

/* ==============================================================
   GEMINI JSON PARSER
============================================================== */

function parseGeminiJson(
  value: string,
): GeminiResult {
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
      JSON.parse(
        cleaned,
      );

    if (
      !parsed ||
      typeof parsed !==
        "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "Gemini returned invalid JSON object.",
      );
    }

    return parsed as GeminiResult;
  } catch {
    throw new Error(
      "AI returned invalid JSON.",
    );
  }
}

/* ==============================================================
   GEMINI CLIENT
============================================================== */

function getGeminiClient(): GoogleGenAI {
  const apiKey =
    GEMINI_API_KEY
      .value()
      ?.trim();

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
   ERROR MESSAGE
============================================================== */

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  if (
    typeof error ===
      "string" &&
    error.trim()
  ) {
    return error.trim();
  }

  return "Unknown server error.";
}

/* ==============================================================
   MAIN FUNCTION
============================================================== */

export const aiBookingResolve =
  onCall(
    {
      region:
        "us-central1",

      timeoutSeconds:
        120,

      memory:
        "512MiB",

      secrets: [
        GEMINI_API_KEY,
      ],

      enforceAppCheck:
        false,
    },

    async (
      request,
    ) => {
      const startedAt =
        Date.now();

      logStep(
        "================ START ================",
      );

      try {
        /* ======================================================
           AUTHENTICATION
        ====================================================== */

        if (
          !request.auth?.uid
        ) {
          throw new HttpsError(
            "unauthenticated",
            "Please sign in before using automatic booking.",
          );
        }

        const uid =
          request.auth.uid;

        logStep(
          "AUTHENTICATED",
          {
            uid,
          },
        );

        /* ======================================================
           INPUT
        ====================================================== */

        const data =
          request.data as
            | AiBookingRequest
            | undefined;

        const description =
          cleanText(
            data?.description,
          );

        const imageBase64 =
          typeof data?.imageBase64 ===
          "string"
            ? data.imageBase64.trim()
            : "";

        const mimeType =
          typeof data?.mimeType ===
          "string"
            ? data.mimeType
                .trim()
                .toLowerCase()
            : "";

        const customerLatitude =
          toNumberOrNull(
            data?.latitude,
          );

        const customerLongitude =
          toNumberOrNull(
            data?.longitude,
          );

        const customerAddress =
          cleanText(
            data?.address,
            MAX_ADDRESS_LENGTH,
          );

        /* ======================================================
           INPUT VALIDATION
        ====================================================== */

        if (
          !description &&
          !imageBase64
        ) {
          throw new HttpsError(
            "invalid-argument",
            "A description or image is required.",
          );
        }

        if (
          imageBase64.length >
          MAX_IMAGE_BASE64_LENGTH
        ) {
          throw new HttpsError(
            "invalid-argument",
            "The image is too large.",
          );
        }

        if (
          imageBase64 &&
          !ALLOWED_IMAGE_TYPES.includes(
            mimeType as
              (typeof ALLOWED_IMAGE_TYPES)[number],
          )
        ) {
          throw new HttpsError(
            "invalid-argument",
            "Unsupported image format.",
          );
        }

        const hasLatitude =
          customerLatitude !==
          null;

        const hasLongitude =
          customerLongitude !==
          null;

        if (
          hasLatitude !==
          hasLongitude
        ) {
          throw new HttpsError(
            "invalid-argument",
            "Both latitude and longitude are required when location is provided.",
          );
        }

        if (
          hasLatitude &&
          hasLongitude &&
          !hasValidCoordinates(
            customerLatitude,
            customerLongitude,
          )
        ) {
          throw new HttpsError(
            "invalid-argument",
            "Invalid customer location.",
          );
        }

        logStep(
          "INPUT VALIDATED",
          {
            hasDescription:
              Boolean(
                description,
              ),

            hasImage:
              Boolean(
                imageBase64,
              ),

            hasLocation:
              hasValidCoordinates(
                customerLatitude,
                customerLongitude,
              ),

            hasAddress:
              Boolean(
                customerAddress,
              ),
          },
        );

        /* ======================================================
           GET ACTIVE SERVICES
        ====================================================== */

        const services =
          await getActiveServices();

        if (
          services.length === 0
        ) {
          throw new HttpsError(
            "failed-precondition",
            "No active Fixxam services are available.",
          );
        }

        const serviceCatalog =
          services
            .map(
              (service) =>
                `ID: ${service.id} | NAME: ${service.name}`,
            )
            .join("\n");

        /* ======================================================
           GEMINI
        ====================================================== */

        logStep(
          "GEMINI START",
          {
            model: MODEL,

            serviceCount:
              services.length,
          },
        );

        const ai =
          getGeminiClient();

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

        if (
          description
        ) {
          parts.push({
            text:
              `CUSTOMER DESCRIPTION:\n${description}`,
          });
        }

        if (
          imageBase64
        ) {
          parts.push({
            inlineData: {
              mimeType,
              data:
                imageBase64,
            },
          });
        }

        parts.push({
          text: `
You are Fixxam's service classification assistant.

Your ONLY task is to identify the correct Fixxam service.

RULES:

1. Select ONLY a service from the service catalog.
2. Never invent a service.
3. Never invent a service ID.
4. Never select a worker.
5. Never create a booking.
6. Never provide a price.
7. If the request is vague, reject it.
8. If the image is unclear, reject it.
9. If the requested service is not in the catalog, reject it.
10. Return JSON only.
11. Return the exact service ID and service name.
12. Confidence must be between 0 and 1.
13. Always return the reason field.
14. Keep the customer message short and friendly.
15. Never mention Gemini, AI, Firebase, backend, API, JSON, or technical details.

REASON VALUES:

"" = successful service identification

"unclear_request" = description is too vague

"unclear_image" = image does not clearly show the problem

"unsupported_service" = requested service is not available

SERVICE CATALOG:

${serviceCatalog}

SUCCESS RESPONSE:

{
  "completed": true,
  "rejected": false,
  "reason": "",
  "message": "We understand what you need.",
  "serviceId": "EXACT SERVICE ID",
  "serviceName": "EXACT SERVICE NAME",
  "confidence": 0.95
}

UNCLEAR REQUEST:

{
  "completed": false,
  "rejected": true,
  "reason": "unclear_request",
  "message": "We couldn't understand the service you need. Please describe the problem a little more clearly.",
  "serviceId": "",
  "serviceName": "",
  "confidence": 0
}

UNCLEAR IMAGE:

{
  "completed": false,
  "rejected": true,
  "reason": "unclear_image",
  "message": "We couldn't clearly see the problem in the photo. Please take a clearer photo and try again.",
  "serviceId": "",
  "serviceName": "",
  "confidence": 0
}

UNSUPPORTED SERVICE:

{
  "completed": false,
  "rejected": true,
  "reason": "unsupported_service",
  "message": "Sorry, Fixxam does not currently offer this service. You can choose a service manually from our available services.",
  "serviceId": "",
  "serviceName": "",
  "confidence": 0
}
`,
        });

        const geminiResponse =
          await withTimeout(
            ai.models.generateContent(
              {
                model: MODEL,

                contents: [
                  {
                    role:
                      "user",

                    parts,
                  },
                ],

                config: {
                  responseMimeType:
                    "application/json",

                  maxOutputTokens:
                    512,
                },
              },
            ),

            GEMINI_TIMEOUT_MS,

            "Gemini request",
          );

        logStep(
          "GEMINI COMPLETE",
        );

        const responseText =
          geminiResponse.text
            ?.trim();

        if (
          !responseText
        ) {
          throw new Error(
            "AI returned an empty response.",
          );
        }

        const parsed =
          parseGeminiJson(
            responseText,
          );

        const confidence =
          typeof parsed.confidence ===
            "number" &&
          Number.isFinite(
            parsed.confidence,
          )
            ? Math.max(
                0,
                Math.min(
                  1,
                  parsed.confidence,
                ),
              )
            : 0;

        const completed =
          parsed.completed ===
          true;

        const rejected =
          parsed.rejected ===
          true;

        const serviceId =
          cleanText(
            parsed.serviceId,
            200,
          );

        const serviceName =
          cleanText(
            parsed.serviceName,
            300,
          );

        const message =
          cleanText(
            parsed.message,
            500,
          );

        const reason: AiBookingRejectionReason =
          parsed.reason ===
            "" ||
          parsed.reason ===
            "unclear_image" ||
          parsed.reason ===
            "unsupported_service" ||
          parsed.reason ===
            "unclear_request"
            ? parsed.reason
            : "unclear_request";

        logStep(
          "GEMINI RESULT",
          {
            completed,

            rejected,

            reason,

            serviceId,

            serviceName,

            confidence,
          },
        );

        /* ======================================================
           AI REJECTION
        ====================================================== */

        if (
          rejected ||
          !completed ||
          confidence <
            MIN_CONFIDENCE
        ) {
          return {
            success: true,

            completed: false,

            rejected: true,

            message:
              message ||
              "We couldn't understand the service you need. Please try again.",

            reason,

            customerDescription:
              description,

            service: null,

            worker: null,

            booking: null,
          };
        }

        /* ======================================================
           TRUSTED SERVICE MATCH
        ====================================================== */

        logStep(
          "SERVICE MATCH START",
        );

        const matchedService =
          findService(
            services,
            serviceId,
            serviceName,
          );

        logStep(
          "SERVICE MATCH COMPLETE",
          matchedService,
        );

        if (
          !matchedService
        ) {
          return {
            success: true,

            completed: false,

            rejected: true,

            message:
              "Sorry, Fixxam does not currently offer this service. You can choose a service manually from our available services.",

            reason:
              "unsupported_service",

            customerDescription:
              description,

            service: null,

            worker: null,

            booking: null,
          };
        }

        /* ======================================================
           GET WORKERS
        ====================================================== */

        const workers =
          await getAvailableWorkersByService(
            matchedService.id,
          );

        if (
          workers.length === 0
        ) {
          logStep(
            "NO WORKER FOUND",
            {
              serviceId:
                matchedService.id,
            },
          );

          return {
            success: true,

            completed: false,

            rejected: true,

            message:
              `We found the ${matchedService.name} service, but no professional is available right now. You can try again later.`,

            reason:
              "no_worker",

            customerDescription:
              description,

            service: {
              id:
                matchedService.id,

              name:
                matchedService.name,

              confidence,
            },

            worker: null,

            booking: null,
          };
        }

        /* ======================================================
           SELECT WORKER
        ====================================================== */

        const selected =
          selectBestWorker(
            workers,
            customerLatitude,
            customerLongitude,
          );

        if (
          !selected
        ) {
          throw new Error(
            "Worker selection failed.",
          );
        }

        const worker =
          selected.worker;

        const workerName =
          [
            worker.firstName,
            worker.surname,
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          "Fixxam professional";

        /* ======================================================
           BOOKING PREVIEW
        ====================================================== */

        const customerDescription =
          description ||
          `I need help with ${matchedService.name}.`;

        const bookingDate =
          new Date()
            .toISOString();

        const booking = {
          serviceId:
            matchedService.id,

          serviceName:
            matchedService.name,

          workerId:
            worker.id,

          workerName,

          workerPhoto:
            worker.photoUrl,

          description:
            customerDescription,

          photos: [],

          address:
            customerAddress,

          latitude:
            customerLatitude,

          longitude:
            customerLongitude,

          bookingDate,

          bookingTime:
            bookingDate,

          amount: 0,

          urgent: false,

          urgentFee: 0,

          estimatePending:
            true,

          aiGenerated:
            true,

          aiConfidence:
            confidence,
        };

        /* ======================================================
           COMPLETE
        ====================================================== */

        logStep(
          "================ COMPLETE ================",
          {
            uid,

            totalMs:
              Date.now() -
              startedAt,

            serviceId:
              matchedService.id,

            serviceName:
              matchedService.name,

            workerId:
              worker.id,

            workerName,

            distanceKm:
              selected.distanceKm,
          },
        );

        return {
          success: true,

          completed: true,

          rejected: false,

          message:
            `We found ${workerName} for ${matchedService.name}.`,

          reason: "",

          customerDescription,

          service: {
            id:
              matchedService.id,

            name:
              matchedService.name,

            confidence,
          },

          worker: {
            id:
              worker.id,

            name:
              workerName,

            photoUrl:
              worker.photoUrl,

            rating:
              worker.rating,

            completedJobs:
              worker.completedJobs,

            verified:
              worker.verified,

            distanceKm:
              selected.distanceKm,
          },

          booking,
        };
      } catch (
        error: unknown
      ) {
        const errorMessage =
          getErrorMessage(
            error,
          );

        logStep(
          "FATAL ERROR",
          {
            message:
              errorMessage,

            elapsedMs:
              Date.now() -
              startedAt,
          },
        );

        console.error(
          "[AI_BOOKING] FULL ERROR",
          error,
        );

        /*
         * Preserve intentional Firebase errors.
         */
        if (
          error instanceof
          HttpsError
        ) {
          throw error;
        }

        /*
         * Never expose internal
         * implementation details
         * to customers.
         */
        throw new HttpsError(
          "internal",
          "Unable to process automatic booking.",
        );
      }
    },
  );