import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {
  defineSecret,
} from "firebase-functions/params";

import {
  GoogleGenAI,
  Type,
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
   SERVICE FULFILLMENT
============================================================== */

type ServiceFulfillmentMode =
  | "worker_visits_customer"
  | "customer_visits_worker"
  | "flexible"
  | "remote"
  | "needs_review";

const SERVICE_FULFILLMENT_MODES =
  [
    "worker_visits_customer",
    "customer_visits_worker",
    "flexible",
    "remote",
    "needs_review",
  ] as const satisfies readonly ServiceFulfillmentMode[];

function isServiceFulfillmentMode(
  value: unknown,
): value is ServiceFulfillmentMode {
  return (
    typeof value === "string" &&
    SERVICE_FULFILLMENT_MODES.some(
      (mode) =>
        mode === value,
    )
  );
}

/* ==============================================================
   TYPES
============================================================== */

type ServiceRecord = {
  id: string;

  name: string;

  fulfillmentMode:
    ServiceFulfillmentMode;
};

type AiBookingRequest = {
  description?: unknown;

  imageBase64?: unknown;

  mimeType?: unknown;

  latitude?: unknown;

  longitude?: unknown;

  address?: unknown;
};

type AiBookingReason =
  | "unclear_request"
  | "unsupported_service"
  | "unclear_image"
  | "no_worker"
  | null;

type GeminiReason =
  | "success"
  | "unclear_request"
  | "unsupported_service"
  | "unclear_image";

type GeminiResult = {
  completed?: unknown;

  rejected?: unknown;

  message?: unknown;

  reason?: unknown;

  serviceId?: unknown;

  serviceName?: unknown;

  confidence?: unknown;

  customerDescription?: unknown;
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

  latitude:
    | number
    | null;

  longitude:
    | number
    | null;

  address: string;
};

type WorkerWithDistance = {
  worker:
    WorkerRecord;

  distanceKm:
    | number
    | null;
};

type AiBookingServiceResponse = {
  id: string;

  name: string;

  fulfillmentMode:
    ServiceFulfillmentMode;

  confidence: number;
};

type AiBookingWorkerResponse = {
  id: string;

  name: string;

  photoUrl: string;

  rating: number;

  completedJobs: number;

  verified: boolean;

  distanceKm:
    | number
    | null;
};

type AiBookingPreview = {
  serviceId: string;

  serviceName: string;

  fulfillmentMode:
    ServiceFulfillmentMode;

  workerId: string;

  workerName: string;

  workerPhoto: string;

  description: string;

  photos: string[];

  address: string;

  latitude:
    | number
    | null;

  longitude:
    | number
    | null;

  bookingDate: string;

  bookingTime: string;

  amount: number;

  urgent: boolean;

  urgentFee: number;

  estimatePending: boolean;

  aiGenerated: boolean;

  aiConfidence: number;
};

type AiBookingResponse = {
  success: boolean;

  completed: boolean;

  rejected: boolean;

  message: string;

  reason:
    AiBookingReason;

  customerDescription:
    string;

  service:
    | AiBookingServiceResponse
    | null;

  worker:
    | AiBookingWorkerResponse
    | null;

  booking:
    | AiBookingPreview
    | null;
};

/* ==============================================================
   CONFIG
============================================================== */

const MODEL =
  process.env.GEMINI_MODEL?.trim() ||
  "gemini-3.8-flash";

const MAX_DESCRIPTION_LENGTH =
  4000;

const MAX_CUSTOMER_DESCRIPTION_LENGTH =
  700;

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

const ALLOWED_IMAGE_TYPES =
  [
    "image/jpeg",
    "image/png",
    "image/webp",
  ] as const;

/* ==============================================================
   GEMINI RESPONSE SCHEMA
============================================================== */

const GEMINI_RESPONSE_SCHEMA = {
  type:
    Type.OBJECT,

  properties: {
    completed: {
      type:
        Type.BOOLEAN,
    },

    rejected: {
      type:
        Type.BOOLEAN,
    },

    reason: {
      type:
        Type.STRING,
    },

    message: {
      type:
        Type.STRING,
    },

    serviceId: {
      type:
        Type.STRING,
    },

    serviceName: {
      type:
        Type.STRING,
    },

    confidence: {
      type:
        Type.NUMBER,
    },

    customerDescription: {
      type:
        Type.STRING,
    },
  },

  required: [
    "completed",
    "rejected",
    "reason",
    "message",
    "serviceId",
    "serviceName",
    "confidence",
    "customerDescription",
  ],
};

/* ==============================================================
   TIMEOUT ERROR
============================================================== */

class OperationTimeoutError extends Error {
  readonly operation:
    string;

  constructor(
    operation: string,
    timeoutMs: number,
  ) {
    super(
      `${operation} timed out after ${timeoutMs}ms.`,
    );

    this.name =
      "OperationTimeoutError";

    this.operation =
      operation;
  }
}

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
    | ReturnType<
        typeof setTimeout
      >
    | undefined;

  const timeoutPromise =
    new Promise<never>(
      (
        _,
        reject,
      ) => {
        timer =
          setTimeout(
            () => {
              reject(
                new OperationTimeoutError(
                  label,
                  timeoutMs,
                ),
              );
            },
            timeoutMs,
          );
      },
    );

  try {
    return await Promise.race(
      [
        promise,
        timeoutPromise,
      ],
    );
  } finally {
    if (timer) {
      clearTimeout(
        timer,
      );
    }
  }
}

/* ==============================================================
   TEXT
============================================================== */

function cleanText(
  value: unknown,
  maxLength =
    MAX_DESCRIPTION_LENGTH,
): string {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .trim()
    .slice(
      0,
      maxLength,
    );
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
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  ) {
    return value;
  }

  return null;
}

/* ==============================================================
   COORDINATES
============================================================== */

function isValidLatitude(
  value:
    | number
    | null,
): value is number {
  return (
    value !== null &&
    Number.isFinite(
      value,
    ) &&
    value >= -90 &&
    value <= 90
  );
}

function isValidLongitude(
  value:
    | number
    | null,
): value is number {
  return (
    value !== null &&
    Number.isFinite(
      value,
    ) &&
    value >= -180 &&
    value <= 180
  );
}

function hasValidCoordinates(
  latitude:
    | number
    | null,
  longitude:
    | number
    | null,
): boolean {
  return (
    isValidLatitude(
      latitude,
    ) &&
    isValidLongitude(
      longitude,
    )
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
    ((latitude2 -
      latitude1) *
      Math.PI) /
    180;

  const longitudeDifference =
    ((longitude2 -
      longitude1) *
      Math.PI) /
    180;

  const a =
    Math.sin(
      latitudeDifference /
        2,
    ) **
      2 +
    Math.cos(
      (latitude1 *
        Math.PI) /
        180,
    ) *
      Math.cos(
        (latitude2 *
          Math.PI) /
          180,
      ) *
      Math.sin(
        longitudeDifference /
          2,
      ) **
        2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(
        a,
      ),
      Math.sqrt(
        1 - a,
      ),
    );

  return (
    earthRadiusKm *
    c
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
        .collection(
          "services",
        )
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
      .map(
        (
          doc,
        ): ServiceRecord | null => {
          const data =
            doc.data();

          const name =
            typeof data.name ===
            "string"
              ? data.name.trim()
              : "";

          if (
            !doc.id ||
            !name
          ) {
            return null;
          }

          const fulfillmentMode =
            isServiceFulfillmentMode(
              data.fulfillmentMode,
            )
              ? data.fulfillmentMode
              : "needs_review";

          return {
            id:
              doc.id,

            name,

            fulfillmentMode,
          };
        },
      )
      .filter(
        (
          service,
        ): service is ServiceRecord =>
          service !==
          null,
      );

  logStep(
    "SERVICES QUERY COMPLETE",
    {
      count:
        services.length,

      needsReview:
        services.filter(
          (service) =>
            service.fulfillmentMode ===
            "needs_review",
        ).length,
    },
  );

  return services;
}

/* ==============================================================
   SERVICE MATCH
============================================================== */

function findService(
  services:
    ServiceRecord[],
  aiId: string,
  aiName: string,
): ServiceRecord | null {
  /* ============================================================
     EXACT ID
  ============================================================ */

  if (aiId) {
    const exactId =
      services.find(
        (
          service,
        ) =>
          service.id ===
          aiId,
      );

    if (exactId) {
      return exactId;
    }
  }

  /* ============================================================
     EXACT NAME
  ============================================================ */

  const normalizedName =
    normalize(
      aiName,
    );

  if (
    !normalizedName
  ) {
    return null;
  }

  const exactName =
    services.find(
      (
        service,
      ) =>
        normalize(
          service.name,
        ) ===
        normalizedName,
    );

  if (exactName) {
    return exactName;
  }

  /* ============================================================
     CONTROLLED PARTIAL MATCH
  ============================================================ */

  const partial =
    services.find(
      (
        service,
      ) => {
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

  return (
    partial ??
    null
  );
}

/* ==============================================================
   WORKERS
============================================================== */

async function getAvailableWorkersByService(
  serviceId: string,
): Promise<
  WorkerRecord[]
> {
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
        .collection(
          "users",
        )
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
      .map(
        (
          doc,
        ) => {
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
            id:
              doc.id,

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
              data.verified ===
              true,

            available:
              data.available ===
              true,

            online:
              data.online ===
              true,

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
          } satisfies WorkerRecord;
        },
      )
      .filter(
        (
          worker,
        ): worker is WorkerRecord =>
          worker !==
          null,
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
  workers:
    WorkerRecord[],
  customerLatitude:
    | number
    | null,
  customerLongitude:
    | number
    | null,
): WorkerWithDistance | null {
  logStep(
    "WORKER SELECTION START",
    {
      workers:
        workers.length,
    },
  );

  if (
    workers.length ===
    0
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
      (
        worker,
      ) => {
        let distanceKm:
          | number
          | null =
          null;

        const workerHasLocation =
          hasValidCoordinates(
            worker.latitude,
            worker.longitude,
          );

        if (
          customerHasLocation &&
          workerHasLocation &&
          customerLatitude !==
            null &&
          customerLongitude !==
            null &&
          worker.latitude !==
            null &&
          worker.longitude !==
            null
        ) {
          distanceKm =
            calculateDistanceKm(
              customerLatitude,
              customerLongitude,
              worker.latitude,
              worker.longitude,
            );
        }

        return {
          worker,
          distanceKm,
        };
      },
    );

  /*
   * Priority:
   *
   * 1. nearest
   * 2. online
   * 3. verified
   * 4. rating
   * 5. completed jobs
   */

  results.sort(
    (
      a,
      b,
    ) => {
      if (
        a.distanceKm !==
          null &&
        b.distanceKm !==
          null &&
        a.distanceKm !==
          b.distanceKm
      ) {
        return (
          a.distanceKm -
          b.distanceKm
        );
      }

      if (
        a.distanceKm !==
          null &&
        b.distanceKm ===
          null
      ) {
        return -1;
      }

      if (
        a.distanceKm ===
          null &&
        b.distanceKm !==
          null
      ) {
        return 1;
      }

      if (
        a.worker.online !==
        b.worker.online
      ) {
        return a.worker
          .online
          ? -1
          : 1;
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
        b.worker
          .completedJobs -
        a.worker
          .completedJobs
      );
    },
  );

  const selected =
    results[0] ??
    null;

  logStep(
    "WORKER SELECTION COMPLETE",
    selected
      ? {
          workerId:
            selected.worker.id,

          distanceKm:
            selected.distanceKm,

          online:
            selected.worker.online,

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
      Array.isArray(
        parsed,
      )
    ) {
      throw new Error(
        "Gemini returned invalid JSON object.",
      );
    }

    return (
      parsed as GeminiResult
    );
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
   ERROR HELPERS
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

  if (
    error &&
    typeof error ===
      "object"
  ) {
    const message =
      (
        error as {
          message?: unknown;
        }
      ).message;

    if (
      typeof message ===
        "string" &&
      message.trim()
    ) {
      return message.trim();
    }
  }

  return "Unknown server error.";
}

function getErrorStatus(
  error: unknown,
): number | null {
  if (
    !error ||
    typeof error !==
      "object"
  ) {
    return null;
  }

  const status =
    (
      error as {
        status?: unknown;
      }
    ).status;

  if (
    typeof status ===
      "number" &&
    Number.isFinite(
      status,
    )
  ) {
    return status;
  }

  const code =
    (
      error as {
        code?: unknown;
      }
    ).code;

  if (
    typeof code ===
      "number" &&
    Number.isFinite(
      code,
    )
  ) {
    return code;
  }

  return null;
}

/* ==============================================================
   REJECTION RESPONSE
============================================================== */

function createRejectedResponse({
  message,
  reason,
  customerDescription,
  service = null,
}: {
  message: string;

  reason:
    Exclude<
      AiBookingReason,
      null
    >;

  customerDescription:
    string;

  service?:
    | AiBookingServiceResponse
    | null;
}): AiBookingResponse {
  return {
    success: true,

    completed: false,

    rejected: true,

    message,

    reason,

    customerDescription,

    service,

    worker: null,

    booking: null,
  };
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
    ): Promise<AiBookingResponse> => {
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

        logStep(
          "AUTHENTICATED",
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
          typeof data
            ?.imageBase64 ===
          "string"
            ? data.imageBase64.trim()
            : "";

        const mimeType =
          typeof data
            ?.mimeType ===
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
            "The selected image is too large.",
          );
        }

        if (
          imageBase64 &&
          !mimeType
        ) {
          throw new HttpsError(
            "invalid-argument",
            "The image type is missing.",
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

            mimeType:
              mimeType ||
              null,

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
           SERVICES
        ====================================================== */

        const services =
          await getActiveServices();

        if (
          services.length ===
          0
        ) {
          throw new HttpsError(
            "failed-precondition",
            "No active Fixxam services are available.",
          );
        }

        /*
         * Gemini only needs ID and name.
         *
         * fulfillmentMode remains trusted server-side data.
         */
        const serviceCatalog =
          services
            .map(
              (
                service,
              ) =>
                `ID: ${service.id} | NAME: ${service.name}`,
            )
            .join(
              "\n",
            );

        /* ======================================================
           GEMINI
        ====================================================== */

        logStep(
          "GEMINI START",
          {
            model:
              MODEL,

            serviceCount:
              services.length,

            imageOnly:
              Boolean(
                imageBase64 &&
                !description,
              ),
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

        /* ======================================================
           CUSTOMER TEXT
        ====================================================== */

        if (
          description
        ) {
          parts.push({
            text:
              `CUSTOMER DESCRIPTION:\n${description}`,
          });
        }

        /* ======================================================
           CUSTOMER IMAGE
        ====================================================== */

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

        /* ======================================================
           INSTRUCTIONS
        ====================================================== */

        parts.push({
          text: `
You are Fixxam's automatic booking assistant.

Your job is to understand a customer's repair problem from their written description, photo, or both.

You must then:
1. Identify exactly one Fixxam service from the supplied service catalog.
2. Create a short, natural, booking-ready customer description.
3. Return only structured data matching the required schema.

IMPORTANT SAFETY AND ACCURACY RULES:

- Never invent damage that is not visible or described.
- Never invent urgency.
- Never add words such as "urgent", "immediately", "now", or "emergency" unless the customer explicitly requested urgency.
- Never invent a price.
- Never invent a worker.
- Never invent a location.
- Never invent a service.
- Never invent a service ID.
- Never choose or invent a fulfillment mode.
- Never decide whether the worker visits the customer or the customer visits the provider.
- Never claim an exact technical diagnosis unless the evidence clearly supports it.
- If uncertain, use cautious language such as "appears damaged", "appears loose", or "may need repair".
- Never mention Gemini, AI, Firebase, API, backend, JSON, prompts, or technical implementation details to the customer.

IMAGE RULES:

- Carefully inspect the supplied image when one is provided.
- If the photo clearly shows a repair or maintenance problem, use the visible evidence.
- If the photo does not clearly show what needs repair, reject with reason "unclear_image".
- If the image is unrelated to repair or maintenance, reject with reason "unclear_image".
- Do not guess a hidden fault that cannot be seen.

CUSTOMER DESCRIPTION RULES:

- Produce one concise first-person booking description.
- The description must sound like something the customer could naturally send to a professional.
- If the customer supplied text, preserve the meaning and use the same language where possible.
- If only a photo was provided, write a clear simple English description of the visible problem.
- The description should explain what appears wrong and that the customer wants a professional to inspect or repair it.
- Keep it concise.
- Do not mention that the description came from a photo.

Example for a visibly damaged car tyre:

"My car tyre appears damaged and I need a professional to inspect and repair it."

SERVICE RULES:

- Select ONLY from SERVICE CATALOG.
- Return the exact service ID.
- Return the exact service name.
- Never create a service that is not in the catalog.
- Confidence must be between 0 and 1.
- Do not infer booking fulfillment rules from the service name.
- Fixxam will apply the authoritative booking rules after service selection.

REASON VALUES:

"success"
= The problem is clear and a supported service has been identified.

"unclear_request"
= The written request is too vague and no image resolves it.

"unclear_image"
= The supplied photo does not clearly show a repair problem.

"unsupported_service"
= The requested or visible problem requires a service Fixxam does not currently offer.

SERVICE CATALOG:

${serviceCatalog}

For success:
- completed = true
- rejected = false
- reason = "success"
- serviceId = exact catalog ID
- serviceName = exact catalog name
- confidence = value from 0 to 1
- customerDescription = useful booking-ready description

For rejection:
- completed = false
- rejected = true
- serviceId = ""
- serviceName = ""
- confidence = 0
- customerDescription may be empty
`,
        });

        /* ======================================================
           GENERATE
        ====================================================== */

        const geminiResponse =
          await withTimeout(
            ai.models.generateContent(
              {
                model:
                  MODEL,

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

                  responseSchema:
                    GEMINI_RESPONSE_SCHEMA,

                  temperature:
                    0.2,

                  maxOutputTokens:
                    700,
                },
              },
            ),

            GEMINI_TIMEOUT_MS,

            "Gemini request",
          );

        logStep(
          "GEMINI COMPLETE",
        );

        /* ======================================================
           RESPONSE TEXT
        ====================================================== */

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

        /* ======================================================
           PARSE
        ====================================================== */

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

        const generatedCustomerDescription =
          cleanText(
            parsed.customerDescription,
            MAX_CUSTOMER_DESCRIPTION_LENGTH,
          );

        const geminiReason:
          GeminiReason =
          parsed.reason ===
            "success" ||
          parsed.reason ===
            "unclear_image" ||
          parsed.reason ===
            "unsupported_service" ||
          parsed.reason ===
            "unclear_request"
            ? parsed.reason
            : "unclear_request";

        const reason:
          AiBookingReason =
          geminiReason ===
          "success"
            ? null
            : geminiReason;

        logStep(
          "GEMINI RESULT",
          {
            completed,

            rejected,

            reason,

            serviceId,

            serviceName,

            confidence,

            hasGeneratedDescription:
              Boolean(
                generatedCustomerDescription,
              ),
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
          const fallbackReason:
            Exclude<
              AiBookingReason,
              "no_worker" | null
            > =
            imageBase64 &&
            !description
              ? "unclear_image"
              : "unclear_request";

          return createRejectedResponse(
            {
              message:
                message ||
                (
                  fallbackReason ===
                  "unclear_image"
                    ? "We couldn't clearly see the problem in the photo. Please take a clearer photo and try again."
                    : "We couldn't clearly understand what needs fixing. Please provide a little more detail."
                ),

              reason:
                reason ??
                fallbackReason,

              customerDescription:
                generatedCustomerDescription ||
                description,
            },
          );
        }

        /* ======================================================
           PHOTO-ONLY DESCRIPTION VALIDATION
        ====================================================== */

        if (
          imageBase64 &&
          !description &&
          !generatedCustomerDescription
        ) {
          return createRejectedResponse(
            {
              message:
                "We could see the photo, but couldn't clearly describe the repair problem. Please take a clearer photo and try again.",

              reason:
                "unclear_image",

              customerDescription:
                "",
            },
          );
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
          matchedService
            ? {
                id:
                  matchedService.id,

                name:
                  matchedService.name,

                fulfillmentMode:
                  matchedService.fulfillmentMode,
              }
            : null,
        );

        if (
          !matchedService
        ) {
          return createRejectedResponse(
            {
              message:
                "Sorry, Fixxam does not currently offer this service. You can choose a service manually from our available services.",

              reason:
                "unsupported_service",

              customerDescription:
                generatedCustomerDescription ||
                description,
            },
          );
        }

        /* ======================================================
           FULFILLMENT SAFETY

           A service that still needs review must not silently
           become a concrete booking.
        ====================================================== */

        if (
          matchedService.fulfillmentMode ===
          "needs_review"
        ) {
          logStep(
            "SERVICE REQUIRES FULFILLMENT REVIEW",
            {
              serviceId:
                matchedService.id,

              serviceName:
                matchedService.name,
            },
          );

          return createRejectedResponse(
            {
              message:
                "This service is still being configured for automatic booking. Please choose another service or book manually.",

              reason:
                "unsupported_service",

              customerDescription:
                generatedCustomerDescription ||
                description,

              service: {
                id:
                  matchedService.id,

                name:
                  matchedService.name,

                fulfillmentMode:
                  matchedService.fulfillmentMode,

                confidence,
              },
            },
          );
        }

        /* ======================================================
           FINAL CUSTOMER DESCRIPTION
        ====================================================== */

        const customerDescription =
          generatedCustomerDescription ||
          description ||
          `I need a professional to help with ${matchedService.name}.`;

        /* ======================================================
           WORKERS
        ====================================================== */

        const workers =
          await getAvailableWorkersByService(
            matchedService.id,
          );

        if (
          workers.length ===
          0
        ) {
          logStep(
            "NO WORKER FOUND",
            {
              serviceId:
                matchedService.id,
            },
          );

          return createRejectedResponse(
            {
              message:
                `We found the ${matchedService.name} service, but no professional is available right now. Please try again later.`,

              reason:
                "no_worker",

              customerDescription,

              service: {
                id:
                  matchedService.id,

                name:
                  matchedService.name,

                fulfillmentMode:
                  matchedService.fulfillmentMode,

                confidence,
              },
            },
          );
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
            .filter(
              Boolean,
            )
            .join(
              " ",
            )
            .trim() ||
          "Fixxam professional";

        /* ======================================================
           BOOKING PREVIEW LOCATION

           This remains a draft only.

           BookingScreen applies the final fulfillment-specific
           location rules before the customer submits.
        ====================================================== */

        const bookingAddress =
          matchedService.fulfillmentMode ===
          "remote"
            ? ""
            : customerAddress;

        const bookingLatitude =
          matchedService.fulfillmentMode ===
          "remote"
            ? null
            : customerLatitude;

        const bookingLongitude =
          matchedService.fulfillmentMode ===
          "remote"
            ? null
            : customerLongitude;

        /* ======================================================
           BOOKING DATE

           This is preview metadata only.
           The customer still chooses service priority/timing
           in the booking flow.
        ====================================================== */

        const bookingDate =
          new Date()
            .toISOString();

        /* ======================================================
           BOOKING PREVIEW

           IMPORTANT:
           Do NOT send imageBase64 back.

           The app already has photoUri and attaches the local
           URI to the preview.
        ====================================================== */

        const booking:
          AiBookingPreview =
          {
            serviceId:
              matchedService.id,

            serviceName:
              matchedService.name,

            fulfillmentMode:
              matchedService.fulfillmentMode,

            workerId:
              worker.id,

            workerName,

            workerPhoto:
              worker.photoUrl,

            description:
              customerDescription,

            photos: [],

            address:
              bookingAddress,

            latitude:
              bookingLatitude,

            longitude:
              bookingLongitude,

            bookingDate,

            bookingTime:
              bookingDate,

            amount: 0,

            /*
             * Gemini does not choose urgency.
             * Customer chooses it in BookingScreen.
             */
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
            totalMs:
              Date.now() -
              startedAt,

            serviceId:
              matchedService.id,

            fulfillmentMode:
              matchedService.fulfillmentMode,

            workerId:
              worker.id,

            hasCustomerDescription:
              Boolean(
                customerDescription,
              ),

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

          /*
           * Client expects null on success.
           */
          reason: null,

          customerDescription,

          service: {
            id:
              matchedService.id,

            name:
              matchedService.name,

            fulfillmentMode:
              matchedService.fulfillmentMode,

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

        const status =
          getErrorStatus(
            error,
          );

        logStep(
          "FATAL ERROR",
          {
            message:
              errorMessage,

            status,

            elapsedMs:
              Date.now() -
              startedAt,
          },
        );

        /* ======================================================
           PRESERVE FIREBASE ERRORS
        ====================================================== */

        if (
          error instanceof
          HttpsError
        ) {
          throw error;
        }

        /* ======================================================
           TIMEOUT
        ====================================================== */

        if (
          error instanceof
          OperationTimeoutError
        ) {
          throw new HttpsError(
            "deadline-exceeded",
            "Automatic booking took too long. Please try again.",
          );
        }

        const normalizedError =
          errorMessage.toLowerCase();

        /* ======================================================
           RATE LIMIT / GEMINI CREDIT / QUOTA
        ====================================================== */

        if (
          status === 429 ||
          normalizedError.includes(
            "429",
          ) ||
          normalizedError.includes(
            "resource exhausted",
          ) ||
          normalizedError.includes(
            "resource_exhausted",
          ) ||
          normalizedError.includes(
            "prepay credits",
          ) ||
          normalizedError.includes(
            "quota",
          )
        ) {
          throw new HttpsError(
            "resource-exhausted",
            "Automatic booking AI is temporarily unavailable. Please try again shortly.",
          );
        }

        /* ======================================================
           EXTERNAL SERVICE UNAVAILABLE
        ====================================================== */

        if (
          status === 502 ||
          status === 503 ||
          status === 504 ||
          normalizedError.includes(
            "service unavailable",
          )
        ) {
          throw new HttpsError(
            "unavailable",
            "Automatic booking is temporarily unavailable. Please try again.",
          );
        }

        /* ======================================================
           CONFIGURATION
        ====================================================== */

        if (
          normalizedError.includes(
            "gemini_api_key",
          )
        ) {
          throw new HttpsError(
            "internal",
            "Automatic booking is temporarily unavailable.",
          );
        }

        /*
         * Internal details remain in
         * server logs only.
         */
        console.error(
          "[AI_BOOKING] INTERNAL ERROR",
          {
            message:
              errorMessage,

            status,
          },
        );

        throw new HttpsError(
          "internal",
          "Unable to process automatic booking.",
        );
      }
    },
  );